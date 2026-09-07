// "use server";

const GOOGLE_URL =
  "https://translate.googleapis.com/translate_a/single?client=gtx&dt=t";

const toGoogleCode: Record<string, string> = { es: "es", it: "it", en: "en" };

const memoryCache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

// Semáforo global: pase lo que pase, nunca hay más de MAX_ACTIVE peticiones
// simultáneas a Google (las llamadas paralelas de distintas partes se suman).
const MAX_ACTIVE = 6;
let active = 0;
const waiters: Array<() => void> = [];

function releaseSlot() {
  const next = waiters.shift();
  if (next) next();
}

function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const run = () => {
      active++;
      fn().then(
        (v) => {
          active--;
          releaseSlot();
          resolve(v);
        },
        (e) => {
          active--;
          releaseSlot();
          reject(e);
        }
      );
    };
    if (active < MAX_ACTIVE) run();
    else waiters.push(run);
  });
}

function cacheKey(text: string, to: string) {
  return `${to}:${text}`;
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function extractSegments(payload: unknown): string {
  const top = Array.isArray(payload) ? payload[0] : [];
  let out = "";
  if (Array.isArray(top)) {
    for (const seg of top) {
      if (Array.isArray(seg) && typeof seg[0] === "string") {
        out += seg[0];
      }
    }
  }
  return out;
}

// Una sola petición a Google. Lanza si la respuesta no es utilizable para no
// dejar que el fallback (texto origen) parezca una traducción válida. Se
// ejecuta bajo el semáforo global para limitar la concurrencia total.
async function fetchTranslation(text: string, code: string): Promise<string> {
  return withSlot(async () => {
    const url = `${GOOGLE_URL}&sl=es&tl=${code}&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`translate ${res.status}`);
    const payload = await res.json();
    const translated = decodeHtmlEntities(extractSegments(payload).trim());
    if (!translated) throw new Error("translate empty");
    return translated;
  });
}

// Traduce un único texto de español a `to` (it|en) usando el endpoint público
// de Google Translate. Sin API key. Resultado cacheado en memoria y con
// single-flight para no repetir peticiones concurrentes de la misma cadena.
export async function translateText(
  text: string,
  to: "it" | "en"
): Promise<string> {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return trimmed;
  const code = toGoogleCode[to] ?? to;
  const key = cacheKey(trimmed, code);
  const cached = memoryCache.get(key);
  if (cached) return cached;

  const pending = inflight.get(key);
  if (pending) return pending;

  const promise = (async () => {
    let lastError: unknown;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const result = await fetchTranslation(trimmed, code);
        memoryCache.set(key, result);
        return result;
      } catch (err) {
        lastError = err;
        if (attempt < 4) {
          await new Promise((r) => setTimeout(r, 400 * attempt));
        }
      }
    }
    throw lastError;
  })();

  inflight.set(key, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(key);
  }
}

// Traduce en lote una lista de textos limitando la concurrencia para no
// saturar el endpoint (Google responde vacío/erróneo bajo ráfagas). Preserva
// orden y longitud. Las cadenas que fallen se devuelven en su idioma original.
export async function translateTexts(
  texts: string[],
  to: "it" | "en",
  { concurrency = 5 }: { concurrency?: number } = {}
): Promise<string[]> {
  const list = texts.map((t) => String(t ?? ""));
  const unique = Array.from(new Set(list.filter((t) => t.trim())));
  if (unique.length === 0) return list;

  const results: string[] = new Array(unique.length);
  let cursor = 0;

  async function worker() {
    while (true) {
      const idx = cursor++;
      if (idx >= unique.length) return;
      const text = unique[idx];
      try {
        results[idx] = await translateText(text, to);
      } catch {
        results[idx] = text;
      }
    }
  }

  const n = Math.max(1, Math.min(concurrency, unique.length));
  await Promise.all(Array.from({ length: n }, () => worker()));

  const map = new Map<string, string>();
  unique.forEach((t, i) => map.set(t, results[i]));
  return list.map((t) => map.get(t) ?? t);
}