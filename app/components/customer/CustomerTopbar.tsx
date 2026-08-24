export default function CustomerTopbar({ greeting, avatarLabel }: { greeting: string; avatarLabel: string }) {
  return (
    <header className="sticky top-0 z-20 hidden items-center justify-end gap-4 bg-canvas/80 backdrop-blur lg:flex lg:h-20 lg:px-10">
      <span className="text-sm font-medium text-steel">{greeting}</span>
      <span
        title={avatarLabel}
        className="grid size-9 place-items-center rounded-full bg-primary-dark text-sm font-semibold text-white"
      >
        L
      </span>
    </header>
  );
}
