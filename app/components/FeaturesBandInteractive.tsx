"use client";

import { useRef, useState, useCallback } from "react";

interface Feature {
  title: string;
  desc: string;
  icon: {
    label: string;
    path: string;
  };
}

function shuffleArray(arr: number[]): number[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (a.every((v, i) => v === arr[i]) && a.length > 1) {
    [a[0], a[1]] = [a[1], a[0]];
  }
  return a;
}

export default function FeaturesBandInteractive({
  sectionTitle,
  features,
}: {
  sectionTitle: string;
  features: Feature[];
}) {
  const [order, setOrder] = useState([0, 1, 2, 3]);
  const lastShuffleRef = useRef(0);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const triggerShuffle = useCallback(() => {
    const now = Date.now();
    if (now - lastShuffleRef.current < 600) return;
    lastShuffleRef.current = now;

    const oldRects = cardsRef.current.map((card) =>
      card?.getBoundingClientRect()
    );

    const newOrder = shuffleArray(order);
    setOrder(newOrder);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        newOrder.forEach((originalIndex, newPosition) => {
          const card = cardsRef.current[originalIndex];
          const oldRect = oldRects[originalIndex];
          if (!card || !oldRect) return;

          const newRect = card.getBoundingClientRect();
          const deltaX = oldRect.left - newRect.left;
          const deltaY = oldRect.top - newRect.top;

          if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return;

          card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
          card.style.transition = "none";

          card.getBoundingClientRect();

          card.style.transition =
            "transform 0.5s cubic-bezier(0.03, 0.98, 0.52, 0.99)";
          card.style.transform = "";

          const cleanup = () => {
            card.style.transition = "";
            card.removeEventListener("transitionend", cleanup);
          };
          card.addEventListener("transitionend", cleanup, { once: true });
        });
      });
    });
  }, [order]);

  return (
    <section className="bg-[#F9FAFB] py-20 lg:py-28">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-20">
        <h2 className="mb-12 text-center text-[32px] font-bold leading-tight text-ink">
          {sectionTitle}
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {order.map((originalIndex, position) => (
            <TiltCard
              key={features[originalIndex].title}
              feature={features[originalIndex]}
              ref={(el) => {
                cardsRef.current[originalIndex] = el;
              }}
              onMouseEnter={triggerShuffle}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

import { forwardRef } from "react";

const TiltCard = forwardRef<HTMLDivElement, {
  feature: Feature;
  onMouseEnter: () => void;
}>(function TiltCard({ feature, onMouseEnter }, ref) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({
    rotateX: 0,
    rotateY: 0,
    shadowX: 0,
    shadowY: 4,
    isHovering: false,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = tiltRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;
      const shadowX = -rotateY * 0.6;
      const shadowY = -rotateX * 0.6;

      setStyle({ rotateX, rotateY, shadowX, shadowY, isHovering: true });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setStyle({
      rotateX: 0,
      rotateY: 0,
      shadowX: 0,
      shadowY: 4,
      isHovering: false,
    });
  }, []);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      tiltRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  return (
    <div
      ref={setRefs}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={onMouseEnter}
      className="group relative rounded-2xl border border-[#E5E7EB] bg-white will-change-transform"
      style={{
        transform: `perspective(800px) rotateX(${style.rotateX}deg) rotateY(${style.rotateY}deg) scale(${style.isHovering ? 1.02 : 1})`,
        transformStyle: "preserve-3d",
        transition: style.isHovering
          ? "transform 0.15s ease-out, box-shadow 0.15s ease-out"
          : "transform 0.6s cubic-bezier(0.03, 0.98, 0.52, 0.99), box-shadow 0.6s cubic-bezier(0.03, 0.98, 0.52, 0.99)",
        boxShadow: style.isHovering
          ? `${style.shadowX}px ${style.shadowY}px 20px rgba(0,0,0,0.08), ${style.shadowX * 0.5}px ${style.shadowY * 0.5}px 6px rgba(0,0,0,0.04)`
          : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="relative z-10 p-6">
        <div
          className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300 ease-out group-hover:-translate-y-[3px]"
          style={{ transform: "translateZ(20px)" }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="#0066ff"
            aria-hidden="true"
          >
            <path d={feature.icon.path} />
          </svg>
        </div>
        <h3
          className="text-[18px] font-bold text-[#111827]"
          style={{ transform: "translateZ(15px)" }}
        >
          {feature.title}
        </h3>
        <p
          className="mt-2 text-[14px] leading-[1.6] text-[#4B5563]"
          style={{ transform: "translateZ(10px)" }}
        >
          {feature.desc}
        </p>
      </div>
    </div>
  );
});
