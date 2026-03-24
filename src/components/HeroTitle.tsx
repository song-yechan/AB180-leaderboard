"use client";

import DecryptedText from "@/components/reactbits/DecryptedText";

export default function HeroTitle() {
  return (
    <h1 className="text-3xl font-bold leading-[1.15] tracking-tight text-camp-text sm:text-4xl lg:text-5xl">
      <DecryptedText
        text="AI를 도구로 쓰는 사람과"
        speed={80}
        animateOn="view"
        sequential
        revealDirection="start"
        className="text-camp-text"
      />
      <br />
      <DecryptedText
        text="무기로 쓰는 사람의 차이"
        speed={80}
        animateOn="view"
        sequential
        revealDirection="start"
        className="text-camp-accent"
      />
    </h1>
  );
}
