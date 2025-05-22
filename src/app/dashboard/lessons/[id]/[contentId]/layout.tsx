import type { Metadata } from "next";

// Metadados dinâmicos baseados no ID do conteúdo
export async function generateMetadata({ 
  params 
}: { 
  params: { id: string, contentId: string } 
}): Promise<Metadata> {
  // Aqui você pode buscar informações sobre o conteúdo específico
  const lessonId = params.id;
  const contentId = params.contentId;
  
  return {
    title: `Conteúdo ${contentId} • Aula ${lessonId} • Psicologia Católica Tomista`,
    description: `Detalhes do conteúdo ${contentId} da aula ${lessonId} do curso de Psicologia Católica Tomista.`
  };
}

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
