// "use server";

const GOOGLE_URL =
  "https://translate.googleapis.com/translate_a/single?client=gtx&dt=t";

const toGoogleCode: Record<string, string> = { es: "es", it: "it", en: "en" };

const memoryCache = new Map<string, string>();

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

// Traduce un único texto de español a `to` (it|en) usando el endpoint público
// de Google Translate. Sin API key. Se usa on-demand y el resultado se cachea.
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

  const url = `${GOOGLE_URL}&sl=es&tl=${code}&q=${encodeURIComponent(trimmed)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`translate ${res.status}`);
  const payload = await res.json();
  const translated = extractSegments(payload);

  // La API puede devolver la cadena sin espacios entre segmentos (idiomas sin
  // delimitadores). Para nuestros idiomas devuelve los espacios bien.
  const result = decodeHtmlEntities(translated.trim()) || trimmed;
  memoryCache.set(key, result);
  return result;
}

// Traduce en lote (paralelo) una lista de textos. Preserva orden y longitud.
export async function translateTexts(
  texts: string[],
  to: "it" | "en"
): Promise<string[]> {
  const unique = Array.from(new Set(texts.filter((t) => String(t).trim())));
  const results = await Promise.all(
    unique.map((t) =>
      translateText(t, to).catch(() => String(t))
    )
  );
  const map = new Map<string, string>();
  unique.forEach((t, i) => map.set(t, results[i]));
  return texts.map((t) => map.get(t) ?? t);
}
