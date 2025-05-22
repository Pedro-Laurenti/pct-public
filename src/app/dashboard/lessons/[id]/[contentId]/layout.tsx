import type { Metadata } from "next";

// Metadados estáticos
export const metadata: Metadata = {
  title: "Conteúdo • Psicologia Católica Tomista",
  description: "Detalhes do conteúdo da aula do curso de Psicologia Católica Tomista."
};

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
