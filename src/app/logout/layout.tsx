import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logout • Psicologia Católica Tomista",
  description: "Página de saída segura da plataforma da Psicologia Católica Tomista."
};

export default function LogoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
