import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login • Psicologia Católica Tomista",
  description: "Faça login para acessar o conteúdo exclusivo da Psicologia Católica Tomista."
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
