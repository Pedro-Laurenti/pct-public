import type { Metadata } from "next";

// Metadados dinâmicos para páginas de redefinição de senha
export async function generateMetadata({ 
  params 
}: { 
  params: { hash: string } 
}): Promise<Metadata> {
  return {
    title: "Redefinição de Senha • Psicologia Católica Tomista",
    description: "Complete o processo de redefinição da sua senha de acesso à plataforma da Psicologia Católica Tomista."
  };
}

export default function PwdHashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
