import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil • Psicologia Católica Tomista",
  description: "Gerencie seu perfil e configurações pessoais na plataforma da Psicologia Católica Tomista."
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
