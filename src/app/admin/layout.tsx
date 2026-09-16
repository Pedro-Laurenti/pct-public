import type { Metadata } from "next";
import ClientAdminLayout from "./ClientAdminLayout";

export const metadata: Metadata = {
  title: "Admin • Psicologia Católica Tomista",
  description: "Painel de gerenciamento da plataforma PCT.",
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ClientAdminLayout>{children}</ClientAdminLayout>;
}
