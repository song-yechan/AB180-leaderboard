"use client";

import { useEffect, useRef } from "react";

interface LevelUpModalProps {
  level: number;
  name: string;
  icon: string;
  onClose: () => void;
}

export default function LevelUpModal({
  level,
  name,
  icon,
  onClose,
}: LevelUpModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative flex flex-col items-center gap-6 rounded-2xl border border-camp-border bg-camp-bg px-10 py-10 shadow-[0_0_60px_rgba(245,158,11,0.15)]"
        style={{ animation: "levelup-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}
      >
        {/* Pokemon icon */}
        <img
          src={icon}
          alt={name}
          width={120}
          height={120}
          className="size-[120px]"
          style={{ imageRendering: "pixelated" }}
        />

        {/* Level badge */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium uppercase tracking-[0.2em] text-camp-accent">
            Level Up!
          </span>
          <span className="text-3xl font-bold text-camp-text">
            Lv.{level} {name}
          </span>
        </div>

        {/* Message */}
        <p className="text-center text-sm leading-relaxed text-camp-text-secondary">
          축하합니다! 새로운 레벨에 도달했습니다.
        </p>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="mt-2 cursor-pointer rounded-lg bg-camp-accent px-8 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-camp-accent-hover"
        >
          확인
        </button>

        {/* Inline keyframes */}
        <style>{`
          @keyframes levelup-pop {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
