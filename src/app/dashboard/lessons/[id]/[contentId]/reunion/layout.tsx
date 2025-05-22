import type { Metadata } from "next";

// Metadados estáticos
export const metadata: Metadata = {
  title: "Reunião • Psicologia Católica Tomista",
  description: "Participe da reunião relacionada à aula do curso de Psicologia Católica Tomista."
};

export default function ReunionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
