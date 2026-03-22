"use client";

import DotGrid from "@/components/reactbits/DotGrid";

export default function HeroParticlesClient() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden motion-reduce:hidden">
      <DotGrid
        dotSize={4}
        gap={28}
        baseColor="#F59E0B"
        activeColor="#FBBF24"
        proximity={120}
        shockRadius={200}
        shockStrength={3}
        returnSpeed={0.06}
        style={{ opacity: 0.35 }}
      />
    </div>
  );
}
