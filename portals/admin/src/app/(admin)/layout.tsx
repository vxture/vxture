import type { ReactNode } from "react";
import { AdminShell } from "@/layout/AdminShell";
import { VelaAdminChat } from "@/layout/VelaAdminChat";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminShell>
      {children}
      <VelaAdminChat />
    </AdminShell>
  );
}
