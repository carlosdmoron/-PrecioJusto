"use client";

import Image from "next/image";
import { useRef } from "react";

export type CustomerService = {
  chip: string;
  caption: string;
  image: string;
};

export default function ServiceGallery({
  title,
  services,
  prevLabel,
  nextLabel,
}: {
  title: string;
  services: CustomerService[];
  prevLabel: string;
  nextLabel: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByCards(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("article");
    const step = card ? card.clientWidth + 24 : 324;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-[family-name:var(--font-figtree)] text-xl font-semibold tracking-tight text-ink">
          {title}
        </h2>
        <div className="flex gap-3">
          <button
            type="button"
            aria-label={prevLabel}
            onClick={() => scrollByCards(-1)}
            className="grid size-12 place-items-center rounded-full bg-cardimg text-steel transition hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10.5 2.5L5 8L10.5 13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={nextLabel}
            onClick={() => scrollByCards(1)}
            className="grid size-12 place-items-center rounded-full bg-white text-ink shadow-[0_8px_20px_-6px_rgba(19,27,46,0.18)] transition hover:text-primary-dark"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M5.5 2.5L11 8L5.5 13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {services.map((service) => (
          <article key={service.chip} className="w-[calc(100%-1rem)] shrink-0 snap-start sm:w-[320px]">
            <div className="relative h-56 overflow-hidden rounded-2xl bg-cardimg">
              <Image src={service.image} alt="" fill sizes="320px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent" />
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 text-xs font-semibold text-primary-dark backdrop-blur-sm">
                {service.chip}
              </span>
            </div>
            <p className="mt-3 text-sm font-medium text-steel">{service.caption}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
