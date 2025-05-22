import type { Metadata } from "next";

// Metadados dinâmicos para páginas de atividades
export async function generateMetadata({ 
  params 
}: { 
  params: { id: string, contentId: string } 
}): Promise<Metadata> {
  return {
    title: `Atividade ${params.contentId} • Aula ${params.id} • Psicologia Católica Tomista`,
    description: `Resolva a atividade ${params.contentId} da aula ${params.id} do curso de Psicologia Católica Tomista.`
  };
}

export default function ActivityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
