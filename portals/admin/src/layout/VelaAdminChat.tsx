"use client";

import dynamic from "next/dynamic";

const VelaChat = dynamic(
  () => import("@vxture/agent-studio-vela").then((m) => m.VelaChat),
  { ssr: false },
);

export function VelaAdminChat() {
  return <VelaChat surface="admin" position="float" />;
}
