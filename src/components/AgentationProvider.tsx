"use client";

import dynamic from "next/dynamic";

const Agentation = dynamic(
  () => import("agentation").then((m) => m.Agentation ?? m.default),
  { ssr: false }
);

export default function AgentationProvider() {
  if (process.env.NODE_ENV !== "development") return null;
  return <Agentation />;
}
