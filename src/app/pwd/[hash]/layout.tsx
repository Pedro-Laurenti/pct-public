import type { Metadata } from "next";

// Metadados estáticos
export const metadata: Metadata = {
  title: "Redefinição de Senha • Psicologia Católica Tomista",
  description: "Complete o processo de redefinição da sua senha de acesso à plataforma da Psicologia Católica Tomista."
};

export default function PwdHashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
