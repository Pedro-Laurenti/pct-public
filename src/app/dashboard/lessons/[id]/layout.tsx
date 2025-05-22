import type { Metadata } from "next";

// Metadados estáticos
export const metadata: Metadata = {
  title: "Aula • Psicologia Católica Tomista",
  description: "Conteúdo da aula do curso de Psicologia Católica Tomista."
};

export default function LessonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
