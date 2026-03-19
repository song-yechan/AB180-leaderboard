"use client";

import dynamic from "next/dynamic";

const Antigravity = dynamic(
  () => import("@/components/reactbits/Antigravity"),
  { ssr: false },
);

export default function HeroParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-60 motion-reduce:hidden">
      <Antigravity
        className="h-full w-full"
        color="#F59E0B"
        count={200}
        particleSize={1.5}
        autoAnimate
      />
    </div>
  );
}
