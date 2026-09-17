import { redirect } from "next/navigation";

// Rota legada — redireciona para dentro do portal do aluno onde a sidebar está disponível
export default function ChangelogRedirect() {
  redirect("/dashboard/changelog");
}
