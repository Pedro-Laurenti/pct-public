"use client";

import { MdRocketLaunch, MdBuild, MdAutoAwesome } from "react-icons/md";

interface Change {
  type: "feat" | "fix" | "improvement";
  description: string;
}

interface Version {
  version: string;
  date: string;
  changes: Change[];
}

const CHANGELOG: Version[] = [
  {
    version: "1.0.0",
    date: "16 de setembro de 2026",
    changes: [
      { type: "feat", description: "Redesign visual completo: paleta dourada, tipografia Cormorant Garamond, tema claro/escuro." },
      { type: "feat", description: "Landing page reformulada com carrossel de cursos, seção editorial com numerais romanos e equipe de mentores." },
      { type: "feat", description: "Página de login split-screen com foto de Liliane Lopes e citação de Aristóteles." },
      { type: "feat", description: "Página de cadastro com mesma linguagem visual do login." },
      { type: "feat", description: "Checkout redesenhado com opção de logout discreto e botão de cupom." },
      { type: "feat", description: "Páginas de pagamento (sucesso/erro) com identidade visual da marca." },
      { type: "improvement", description: "Sidebars do aluno e do admin redesenhadas: sem bloco de usuário, estado colapsado limpo, versão integrada ao rodapé." },
      { type: "improvement", description: "Página inicial do dashboard e do admin com títulos em Cormorant Garamond." },
      { type: "feat", description: "Sistema de changelog e controle de versão implementado." },
      { type: "feat", description: "Botão 'Registrar Pagamento Manual' no admin para casos pontuais pós-deploy." },
      { type: "feat", description: "Script de backup automático do banco (backup.ps1 / backup.sh)." },
    ],
  },
  {
    version: "0.3.0",
    date: "agosto de 2026",
    changes: [
      { type: "feat", description: "Google OAuth SSO integrado via NextAuth (flag ENABLE_OAUTH)." },
      { type: "feat", description: "Integração com Mercado Pago Checkout Pro (flag ENABLE_PAYMENTS)." },
      { type: "feat", description: "Página /checkout: lista de cursos ativos, campo de cupom, acesso gratuito e compra paga." },
      { type: "feat", description: "Webhook de pagamentos com verificação HMAC." },
      { type: "feat", description: "CRUD de promoções e cupons no painel admin." },
      { type: "feat", description: "Matrícula automática via enrollment.ts com criação de turma." },
      { type: "improvement", description: "Proxy.ts atualizado com rotas /checkout e /pagamento/*." },
      { type: "fix", description: "Schema: colunas price e is_active em Courses, tabelas Payments e Promotions." },
    ],
  },
  {
    version: "0.2.0",
    date: "julho de 2026",
    changes: [
      { type: "feat", description: "Sidebar do admin: colapsável, 4 itens principais, Meu Perfil no rodapé." },
      { type: "feat", description: "CRUD de cursos, aulas e turmas via modais inline (sem páginas dedicadas)." },
      { type: "feat", description: "Sidebar do aluno: colapsável no desktop, botões do rodapé ícone-only com tooltip." },
      { type: "feat", description: "Modal de notificações fora do overflow da sidebar." },
      { type: "fix", description: "Correções de queries MySQL para ONLY_FULL_GROUP_BY em múltiplas rotas de API." },
      { type: "fix", description: "Chave React duplicada no dashboard admin." },
    ],
  },
  {
    version: "0.1.0",
    date: "junho de 2026",
    changes: [
      { type: "feat", description: "Portal do aluno: dashboard, agenda, aulas, atividades e perfil." },
      { type: "feat", description: "Portal admin: painel, usuários, cursos, aulas, conteúdos e turmas." },
      { type: "feat", description: "Autenticação JWT com httpOnly cookie e validação de sessão." },
      { type: "feat", description: "Calendário de reuniões com vista semanal e mensal." },
      { type: "feat", description: "Questionários interativos com múltipla escolha e modal de conclusão." },
    ],
  },
];

const TYPE_CONFIG = {
  feat:        { label: "Novidade", Icon: MdRocketLaunch, badge: "badge-success", icon: "text-success", row: "bg-success/5 border-l-2 border-success/40" },
  fix:         { label: "Correção", Icon: MdBuild,        badge: "badge-error",   icon: "text-error",   row: "bg-error/5 border-l-2 border-error/40"     },
  improvement: { label: "Melhoria", Icon: MdAutoAwesome,  badge: "badge-info",    icon: "text-info",    row: "bg-info/5 border-l-2 border-info/40"        },
};

const TYPE_ORDER = ["feat", "improvement", "fix"] as const;

export default function ChangelogContent() {
  const [latest, ...older] = CHANGELOG;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="font-display text-3xl text-base-content mb-1">Novidades</h1>
      <p className="text-xs text-base-content/40 tracking-wider mb-8">
        Histórico de versões e melhorias da plataforma PCT
      </p>

      {/* Versão atual */}
      <div className="mt-2 mb-10 p-5 rounded-2xl bg-primary/10 border border-primary/20">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="badge badge-primary font-mono font-bold">v{latest.version}</span>
          <span className="text-xs text-base-content/50">{latest.date}</span>
          <span className="badge badge-outline badge-xs">Versão atual</span>
        </div>
        <ul className="space-y-2">
          {latest.changes.map((change, i) => {
            const cfg = TYPE_CONFIG[change.type];
            return (
              <li key={i} className="flex items-start gap-2">
                <cfg.Icon className={`${cfg.icon} mt-0.5 shrink-0`} size={14} />
                <span className="text-sm text-base-content/80">{change.description}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Versões anteriores — timeline */}
      <div className="space-y-6">
        {older.map((ver) => {
          const grouped = TYPE_ORDER
            .map((type) => ({ type, cfg: TYPE_CONFIG[type], items: ver.changes.filter(c => c.type === type) }))
            .filter(g => g.items.length > 0);

          return (
            <div key={ver.version} className="flex gap-4">
              <div className="w-20 shrink-0 flex flex-col items-center pt-1">
                <span className="font-mono font-bold text-primary text-sm">v{ver.version}</span>
                <span className="text-[10px] text-base-content/40 text-center leading-tight mt-0.5">{ver.date}</span>
                <div className="w-px flex-1 bg-base-300 mt-3" />
              </div>

              <div className="flex-1 card bg-base-100 border border-base-200 shadow-sm mb-2 overflow-hidden">
                {grouped.map(({ type, cfg, items }) => (
                  <div key={type} className={`px-4 py-3 ${cfg.row}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <cfg.Icon className={cfg.icon} size={13} />
                      <span className={`badge badge-xs ${cfg.badge}`}>
                        {cfg.label}{items.length > 1 ? ` (${items.length})` : ""}
                      </span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 pl-1">
                      {items.map((item, i) => (
                        <li key={i} className="text-xs text-base-content/70 leading-relaxed">
                          {item.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
