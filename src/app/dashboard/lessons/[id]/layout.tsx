import type { Metadata } from "next";

// Metadados dinâmicos baseados no ID da aula
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Aqui você pode buscar informações sobre a aula usando o ID
  // Este é um exemplo simplificado; em produção, você buscaria os dados do backend
  const lessonId = params.id;
  
  return {
    title: `Aula ${lessonId} • Psicologia Católica Tomista`,
    description: `Conteúdo da aula ${lessonId} do curso de Psicologia Católica Tomista.`
  };
}

export default function LessonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
