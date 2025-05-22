import type { Metadata } from "next";

// Metadados dinâmicos para páginas de texto
export async function generateMetadata({ 
  params 
}: { 
  params: { id: string, contentId: string } 
}): Promise<Metadata> {
  return {
    title: `Texto ${params.contentId} • Aula ${params.id} • Psicologia Católica Tomista`,
    description: `Leia o material textual ${params.contentId} da aula ${params.id} do curso de Psicologia Católica Tomista.`
  };
}

export default function TextLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
