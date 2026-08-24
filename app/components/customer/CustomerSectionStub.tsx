export default function CustomerSectionStub({ title, text }: { title: string; text: string }) {
  return (
    <div className="px-6 py-10 lg:px-10">
      <h1 className="font-[family-name:var(--font-figtree)] text-3xl font-semibold tracking-tight text-ink">
        {title}
      </h1>
      <p className="mt-2 rounded-2xl border border-line/20 bg-white p-8 text-sm text-muted">{text}</p>
    </div>
  );
}
