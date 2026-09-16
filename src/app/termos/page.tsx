import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso | PCT",
  description: "Termos de uso da plataforma Psicologia Católica Tomista",
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="btn btn-ghost btn-sm">← Voltar</Link>
        </div>

        <h1 className="text-3xl font-bold font-serif mb-2">Termos de Uso</h1>
        <p className="text-sm text-base-content/60 mb-8">Última atualização: {new Date().getFullYear()}</p>

        <div className="prose max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar a plataforma PCT (Psicologia Católica Tomista), você concorda com estes
              Termos de Uso. Se não concordar com qualquer parte destes termos, não utilize nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Descrição do Serviço</h2>
            <p>
              A PCT é uma plataforma educacional que oferece cursos, aulas e mentorias baseados nos princípios
              da Psicologia Tomista. O acesso ao conteúdo é concedido mediante matrícula em turma específica,
              conforme condições acordadas no ato da inscrição.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Uso da Conta</h2>
            <p>
              Cada conta é pessoal e intransferível. Você é responsável pela confidencialidade de suas credenciais
              de acesso. Em caso de uso não autorizado, notifique-nos imediatamente. É proibido compartilhar
              credenciais ou permitir acesso de terceiros à sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo disponível na plataforma — incluindo textos, vídeos, atividades e materiais de apoio —
              é de propriedade da PCT ou de seus colaboradores, protegido pelas leis de direitos autorais.
              É vedada a reprodução, distribuição ou compartilhamento não autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Conduta do Usuário</h2>
            <p>O usuário compromete-se a:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Utilizar a plataforma somente para fins educacionais legítimos;</li>
              <li>Não tentar acessar áreas restritas ou sistemas não autorizados;</li>
              <li>Não reproduzir ou distribuir o conteúdo da plataforma sem autorização;</li>
              <li>Manter conduta respeitosa nas interações com a equipe e demais usuários.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Limitação de Responsabilidade</h2>
            <p>
              A PCT não se responsabiliza por danos decorrentes de interrupções no serviço, falhas técnicas ou
              uso indevido da plataforma. O conteúdo tem caráter educacional e não substitui atendimento
              profissional de saúde.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Alterações</h2>
            <p>
              Reservamo-nos o direito de alterar estes termos a qualquer momento. Alterações significativas
              serão comunicadas por e-mail. O uso continuado da plataforma após a notificação implica
              concordância com os novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Contato</h2>
            <p>
              Em caso de dúvidas sobre estes Termos de Uso, entre em contato conosco pelo WhatsApp ou pelo
              e-mail informado na página principal.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-base-300 flex gap-4">
          <Link href="/privacidade" className="link link-primary text-sm">Política de Privacidade</Link>
          <Link href="/" className="link text-sm">Página inicial</Link>
        </div>
      </div>
    </div>
  );
}
