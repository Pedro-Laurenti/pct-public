import type { Metadata } from "next";

// Metadados dinâmicos para páginas de vídeo
export async function generateMetadata({ 
  params 
}: { 
  params: { id: string, contentId: string } 
}): Promise<Metadata> {
  return {
    title: `Vídeo ${params.contentId} • Aula ${params.id} • Psicologia Católica Tomista`,
    description: `Assista ao vídeo ${params.contentId} da aula ${params.id} do curso de Psicologia Católica Tomista.`
  };
}

export default function VideoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
