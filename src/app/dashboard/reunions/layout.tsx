import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reuniões • Psicologia Católica Tomista",
  description: "Acompanhe e participe das reuniões ao vivo e gravadas da Psicologia Católica Tomista."
};

export default function ReunionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
