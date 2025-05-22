import type { Metadata } from "next";

// Metadados estáticos 
export const metadata: Metadata = {
  title: "Atividade • Psicologia Católica Tomista",
  description: "Resolva a atividade da aula do curso de Psicologia Católica Tomista."
};

export default function ActivityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
