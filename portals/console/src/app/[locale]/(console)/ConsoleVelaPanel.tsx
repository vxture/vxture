"use client";

import dynamic from "next/dynamic";

const VelaChat = dynamic(
  () => import("@vxture/agent-studio-vela").then((module) => module.VelaChat),
  { ssr: false },
);

export function ConsoleVelaPanel() {
  return <VelaChat surface="console" position="sidebar" />;
}
