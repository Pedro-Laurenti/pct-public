import type { Metadata } from "next";

// Metadados estáticos
export const metadata: Metadata = {
  title: "Vídeo • Psicologia Católica Tomista",
  description: "Assista ao vídeo da aula do curso de Psicologia Católica Tomista."
};

export default function VideoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
