import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aulas • Psicologia Católica Tomista",
  description: "Acesse todas as aulas e materiais didáticos da Psicologia Católica Tomista."
};

export default function LessonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
