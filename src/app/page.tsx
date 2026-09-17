import Header from "@/components/header";
import { BsYoutube, BsWhatsapp, BsInstagram } from "react-icons/bs";
import type { Metadata } from "next";
import Logo from "@/components/logo";
import FadeIn from "@/components/FadeIn";
import Link from "next/link";
import pool from "@/lib/db";

export const metadata: Metadata = {
  title: "Psicologia Católica Tomista | Formação Integral da Alma",
  description: "Resgatando a sabedoria perene da psicologia tomista para o ordenamento da alma humana. Mentoria, cursos e formação na tradicional visão católica da pessoa.",
  keywords: "psicologia católica, psicologia tomista, são tomás de aquino, mentoria católica, desenvolvimento integral, alma humana",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

interface Course {
  id: number;
  name: string;
  description: string | null;
  price: number;
}

async function getActiveCourses(): Promise<Course[]> {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, description, price FROM Courses WHERE is_active = 1 ORDER BY id"
    );
    return (rows as Course[]).map(r => ({ ...r, price: parseFloat(String(r.price)) }));
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const courses = await getActiveCourses();

  return (
    <div className="min-h-screen bg-base-100" data-theme="mydark">
      <Header />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/2.jpg')" }}
        />
        <div className="absolute inset-0 bg-base-100/82" />

        <div className="relative z-10 flex flex-col items-center text-center px-6 py-32 max-w-3xl mx-auto">
          <FadeIn direction="down" duration={1.4} threshold={0.1}>
            <div className="w-20 h-20 mx-auto mb-10">
              <Logo />
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.2} duration={1.4} threshold={0.1}>
            <p className="text-[0.6rem] tracking-[0.4em] text-base-content/30 uppercase mb-6">
              Psicologia Católica Tomista
            </p>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-gold leading-[1.1] mb-6">
              Ordena a alma.<br />Ilumina a mente.
            </h1>
            <p className="font-serif text-base-content/50 text-lg italic leading-relaxed max-w-xl mx-auto mb-10">
              &ldquo;A perfeição cristã nada mais é do que ser o que Deus quer que sejamos.&rdquo;
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/login" className="btn btn-primary btn-lg tracking-wider">
                Começar agora
              </Link>
              <a href="#formacao" className="btn btn-outline btn-lg tracking-wider">
                Conhecer
              </a>
            </div>
          </FadeIn>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-base-content/20">
          <div className="w-px h-12 bg-base-content/15" />
          <span className="text-[0.5rem] tracking-[0.3em] uppercase">Descubra</span>
        </div>
      </section>

      {/* ── Três Pilares ── */}
      <section id="formacao" className="py-28 bg-base-100">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn direction="down" threshold={0.1}>
            <div className="text-center mb-20">
              <p className="text-[0.55rem] tracking-[0.35em] uppercase text-base-content/30 mb-4">
                Fundamentos
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-base-content">
                Fé e <span className="text-gold">Razão</span>
              </h2>
              <div className="flex items-center gap-3 mt-8 max-w-xs mx-auto">
                <div className="flex-1 border-t border-base-content/10" />
                <span className="text-primary/30 text-[0.5rem]">✦</span>
                <div className="flex-1 border-t border-base-content/10" />
              </div>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-0 border border-base-content/8">
            {[
              {
                numeral: "I",
                title: "Visão Integral",
                body: "Unidade substancial de corpo e alma, considerando todas as dimensões da pessoa humana segundo Santo Tomás.",
                image: "3.jpg",
              },
              {
                numeral: "II",
                title: "Método Eficaz",
                body: "Ordenamento das potências da alma para alcançar a perfeição cristã e a verdadeira felicidade.",
                image: "4.jpg",
              },
              {
                numeral: "III",
                title: "Formação Contínua",
                body: "Acompanhamento personalizado com acesso vitalício às aulas e materiais de formação.",
                image: "5.jpg",
              },
            ].map((pillar, i) => (
              <FadeIn key={i} direction="up" delay={i * 0.12} threshold={0.1}>
                <div className="border-r border-base-content/8 last:border-r-0 p-10 group hover:bg-base-200/60 transition-colors duration-500">
                  <p className="font-display text-7xl text-primary/10 leading-none mb-6 select-none group-hover:text-primary/18 transition-colors">
                    {pillar.numeral}
                  </p>
                  <div
                    className="w-full h-40 bg-cover bg-center mb-6 opacity-60 group-hover:opacity-75 transition-opacity"
                    style={{ backgroundImage: `url('/images/${pillar.image}')` }}
                  />
                  <h3 className="font-serif text-lg text-base-content mb-3 tracking-wide">{pillar.title}</h3>
                  <p className="text-sm text-base-content/50 leading-relaxed">{pillar.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Equipe ── */}
      <section className="py-28 bg-base-200">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn direction="down" threshold={0.1}>
            <div className="mb-16">
              <p className="text-[0.55rem] tracking-[0.35em] uppercase text-base-content/30 mb-4">
                Mentores
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-base-content">
                Quem ensina a <span className="text-gold">doutrina</span>
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-0">
            {/* Liliane */}
            <FadeIn direction="left" threshold={0.1}>
              <div className="flex flex-col md:flex-row border border-base-content/8">
                <div
                  className="md:w-2/5 h-72 md:h-auto bg-cover bg-center"
                  style={{ backgroundImage: "url('/images/liliane-lopes.jpg')" }}
                />
                <div className="md:w-3/5 p-10 flex flex-col justify-center">
                  <p className="text-[0.55rem] tracking-[0.3em] uppercase text-primary/50 mb-3">
                    Psicóloga Tomista
                  </p>
                  <h3 className="font-display text-3xl text-base-content mb-4">Liliane Lopes</h3>
                  <blockquote className="font-serif italic text-base-content/50 text-sm border-l-2 border-primary/25 pl-4 mb-6 leading-relaxed">
                    &ldquo;Este trabalho é tanto um apostolado quanto um modo de fazer o bem.&rdquo;
                  </blockquote>
                  <ul className="space-y-1.5 text-sm text-base-content/50">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary/50 shrink-0" />
                      Especialista em Bioética
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary/50 shrink-0" />
                      10 anos de dedicação à Psicologia Tomista
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary/50 shrink-0" />
                      Mentora especializada
                    </li>
                  </ul>
                </div>
              </div>
            </FadeIn>

            {/* Jean */}
            <FadeIn direction="right" threshold={0.1}>
              <div className="flex flex-col md:flex-row-reverse border border-base-content/8 border-t-0">
                <div
                  className="md:w-2/5 h-72 md:h-auto bg-cover bg-center"
                  style={{ backgroundImage: "url('/images/jean-lopes.jpg')" }}
                />
                <div className="md:w-3/5 p-10 flex flex-col justify-center">
                  <p className="text-[0.55rem] tracking-[0.3em] uppercase text-primary/50 mb-3">
                    Terapeuta Tomista · Filósofo
                  </p>
                  <h3 className="font-display text-3xl text-base-content mb-4">Jean Carlos Lopes</h3>
                  <blockquote className="font-serif italic text-base-content/50 text-sm border-l-2 border-primary/25 pl-4 mb-6 leading-relaxed">
                    &ldquo;A verdade é a medida da alma. Quando a alma encontra a verdade, reencontra a si mesma.&rdquo;
                  </blockquote>
                  <ul className="space-y-1.5 text-sm text-base-content/50">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary/50 shrink-0" />
                      Formado em Filosofia
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary/50 shrink-0" />
                      Pós-graduado em Psicologia Tomista
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary/50 shrink-0" />
                      Especialista em Educação Clássica
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary/50 shrink-0" />
                      Atendimento individual e familiar
                    </li>
                  </ul>
                  <a
                    href="mailto:psicologiacatolicatradicional@gmail.com"
                    className="mt-6 text-xs text-base-content/35 hover:text-base-content/60 transition-colors tracking-wider"
                  >
                    psicologiacatolicatradicional@gmail.com
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Carrossel de Cursos ── */}
      {courses.length > 0 && (
        <section className="py-28 bg-base-100 overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 mb-12">
            <FadeIn direction="down" threshold={0.1}>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <p className="text-[0.55rem] tracking-[0.35em] uppercase text-base-content/30 mb-4">
                    Formação
                  </p>
                  <h2 className="font-display text-4xl md:text-5xl text-base-content">
                    Cursos <span className="text-gold">disponíveis</span>
                  </h2>
                </div>
                <Link
                  href="/login"
                  className="btn btn-outline btn-sm tracking-wider self-start md:self-auto shrink-0"
                >
                  Ver todos
                </Link>
              </div>
            </FadeIn>
          </div>

          <FadeIn direction="up" delay={0.1} threshold={0.05}>
            <div className="carousel carousel-center gap-4 px-6 pb-4 max-w-5xl mx-auto w-full">
              {courses.map((course, i) => (
                <div
                  key={course.id}
                  className="carousel-item w-72 md:w-80 shrink-0"
                >
                  <div
                    className="w-full border border-base-content/10 bg-base-200 p-8 flex flex-col hover:border-primary/30 transition-colors duration-300 group"
                  >
                    <p className="font-display text-6xl text-primary/10 leading-none mb-6 select-none group-hover:text-primary/18 transition-colors">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="font-serif text-lg text-base-content mb-3 leading-snug">
                      {course.name}
                    </h3>
                    {course.description && (
                      <p className="text-sm text-base-content/45 leading-relaxed mb-6 line-clamp-3">
                        {course.description}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-base-content/40 text-sm">
                        {course.price === 0 ? (
                          <span className="text-success font-semibold text-xs tracking-widest uppercase">Gratuito</span>
                        ) : (
                          <span className="font-semibold text-base-content">R$ {course.price.toFixed(2)}</span>
                        )}
                      </span>
                      <Link
                        href="/login"
                        className="btn btn-primary btn-xs tracking-wider"
                      >
                        Acessar
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </section>
      )}

      {/* ── Programa de Mentoria ── */}
      <section className="py-28 bg-base-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <FadeIn direction="left" threshold={0.1} className="md:w-5/12">
              <div className="border border-base-content/8 p-10 flex items-center justify-center aspect-square">
                <div className="w-48 h-48">
                  <Logo />
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={0.15} threshold={0.1} className="md:w-7/12">
              <p className="text-[0.55rem] tracking-[0.35em] uppercase text-base-content/30 mb-4">
                Programa
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-base-content mb-2">
                Mentoria <span className="text-gold">Tomista</span>
              </h2>
              <div className="flex items-center gap-3 mb-8">
                <div className="flex-1 border-t border-base-content/10" />
                <span className="text-primary/30 text-[0.5rem]">✦</span>
                <div className="flex-1 border-t border-base-content/10" />
              </div>

              <div className="space-y-6">
                {[
                  "Seis encontros por módulo com interação ao vivo",
                  "Temas selecionados para iluminar a inteligência e orientar a vontade",
                  "Aplicável a qualquer pessoa com desejo de autodesenvolvimento integral",
                  "Ferramenta para viver de forma plena e feliz mesmo nas dificuldades",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="font-display text-2xl text-primary/30 leading-none mt-0.5 shrink-0 w-6">
                      {i + 1}
                    </span>
                    <p className="text-sm text-base-content/60 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link href="/login" className="btn btn-primary tracking-wider">
                  Acessar a formação
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-36 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/8.jpg')" }}
        />
        <div className="absolute inset-0 bg-base-100/88" />

        <FadeIn direction="up" threshold={0.1}>
          <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
            <div className="w-12 h-12 mx-auto mb-8">
              <Logo />
            </div>

            <h2 className="font-display text-5xl md:text-6xl text-gold mb-6 leading-[1.1]">
              Comece sua<br />formação hoje
            </h2>

            <p className="font-serif italic text-base-content/45 mb-10 leading-relaxed">
              Acesso vitalício — módulos contínuos — acompanhamento ao vivo
            </p>

            <Link href="/login" className="btn btn-primary btn-lg tracking-wider">
              Acessar a plataforma
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-base-300 border-t border-base-content/8">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
            <div>
              <div className="w-8 h-8 mb-4">
                <Logo />
              </div>
              <p className="font-serif text-base-content/60 text-sm mb-1">Psicologia Católica Tomista</p>
              <p className="text-[0.6rem] tracking-[0.2em] uppercase text-base-content/25">
                Restaurando a verdadeira psicologia à luz do Tomismo
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-5">
              {/* Botão de contato — único ponto de entrada via WhatsApp */}
              <a
                href="https://wa.me/5562821377"
                className="btn btn-outline gap-2 tracking-wider"
              >
                <BsWhatsapp size={16} />
                Fale conosco
              </a>

              {/* Redes sociais */}
              <div className="flex gap-3">
                <a
                  href="https://www.youtube.com/c/PSICOLOGIACAT%C3%93LICATRADICIONAL"
                  className="btn btn-circle btn-ghost btn-sm text-base-content/35 hover:text-base-content/70"
                  aria-label="YouTube"
                >
                  <BsYoutube size={15} />
                </a>
                <a
                  href="https://www.instagram.com/psicologia_catolica/"
                  className="btn btn-circle btn-ghost btn-sm text-base-content/35 hover:text-base-content/70"
                  aria-label="Instagram"
                >
                  <BsInstagram size={15} />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-base-content/8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[0.6rem] text-base-content/25 tracking-wider">
              © {new Date().getFullYear()} Psicologia Católica Tomista — Todos os direitos reservados
            </p>
            <div className="flex gap-6">
              <a href="/termos" className="text-[0.6rem] text-base-content/25 hover:text-base-content/50 tracking-wider transition-colors">
                Termos de uso
              </a>
              <a href="/privacidade" className="text-[0.6rem] text-base-content/25 hover:text-base-content/50 tracking-wider transition-colors">
                Privacidade
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
