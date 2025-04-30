import type { Metadata } from "next";
import ClientDashboardLayout from "./ClientDashboardLayout";

export const metadata: Metadata = {
  title: "Dashboard • Psicologia Católica Tomista",
  description: "Onde você pode gerenciar cursos, usuários, configurações e acompanhar o desempenho da plataforma de aprendizado.",
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ClientDashboardLayout>{children}</ClientDashboardLayout>;
}
