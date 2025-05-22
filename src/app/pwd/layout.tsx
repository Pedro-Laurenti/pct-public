import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperação de Senha • Psicologia Católica Tomista",
  description: "Redefina sua senha de acesso à plataforma da Psicologia Católica Tomista."
};

export default function PwdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
