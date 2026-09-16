import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade | PCT",
  description: "Política de privacidade da plataforma Psicologia Católica Tomista",
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="btn btn-ghost btn-sm">← Voltar</Link>
        </div>

        <h1 className="text-3xl font-bold font-serif mb-2">Política de Privacidade</h1>
        <p className="text-sm text-base-content/60 mb-8">Última atualização: {new Date().getFullYear()}</p>

        <div className="prose max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold">1. Dados que Coletamos</h2>
            <p>Coletamos as seguintes informações para prestação dos nossos serviços:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nome completo;</li>
              <li>Endereço de e-mail;</li>
              <li>Número de telefone (opcional);</li>
              <li>Dados de uso da plataforma (aulas acessadas, atividades respondidas, progresso nos cursos).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Uso dos Dados</h2>
            <p>Os dados coletados são utilizados para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Autenticação e controle de acesso à plataforma;</li>
              <li>Registro do progresso educacional;</li>
              <li>Comunicações relacionadas aos cursos e à plataforma;</li>
              <li>Melhoria contínua dos serviços oferecidos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Armazenamento e Segurança</h2>
            <p>
              Seus dados são armazenados em servidores seguros com acesso restrito. Adotamos medidas técnicas
              para proteger as informações contra acesso não autorizado, incluindo criptografia de senhas e
              transmissão segura via HTTPS. Não armazenamos senhas em texto simples.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Compartilhamento de Dados</h2>
            <p>
              Não vendemos nem compartilhamos seus dados pessoais com terceiros, exceto quando necessário
              para operação dos serviços (como provedores de infraestrutura) ou quando exigido por lei.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Cookies</h2>
            <p>
              Utilizamos cookies estritamente necessários para manter sua sessão autenticada na plataforma.
              Esses cookies são removidos ao encerrar a sessão ou ao sair da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Seus Direitos</h2>
            <p>Nos termos da LGPD (Lei 13.709/2018), você tem direito a:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Acessar seus dados pessoais;</li>
              <li>Corrigir dados incompletos ou incorretos (disponível na área de Perfil);</li>
              <li>Solicitar a exclusão dos seus dados mediante contato com nossa equipe;</li>
              <li>Revogar o consentimento para tratamento dos dados.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Retenção de Dados</h2>
            <p>
              Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para a prestação
              dos serviços. Após o encerramento da conta, os dados poderão ser mantidos pelo período mínimo
              exigido pela legislação aplicável.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Contato</h2>
            <p>
              Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato pelo
              WhatsApp ou pelo e-mail informado na página principal.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-base-300 flex gap-4">
          <Link href="/termos" className="link link-primary text-sm">Termos de Uso</Link>
          <Link href="/" className="link text-sm">Página inicial</Link>
        </div>
      </div>
    </div>
  );
}
