import type { Metadata } from "next";

// Metadados dinâmicos para páginas de reunião
export async function generateMetadata({ 
  params 
}: { 
  params: { id: string, contentId: string } 
}): Promise<Metadata> {
  return {
    title: `Reunião ${params.contentId} • Aula ${params.id} • Psicologia Católica Tomista`,
    description: `Participe da reunião ${params.contentId} relacionada à aula ${params.id} do curso de Psicologia Católica Tomista.`
  };
}

export default function ReunionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
