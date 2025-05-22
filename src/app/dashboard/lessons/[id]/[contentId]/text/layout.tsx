import type { Metadata } from "next";

// Metadados estáticos
export const metadata: Metadata = {
  title: "Texto • Psicologia Católica Tomista",
  description: "Leia o material textual da aula do curso de Psicologia Católica Tomista."
};

export default function TextLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
