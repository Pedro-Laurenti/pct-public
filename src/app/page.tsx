import Header from "@/components/header";
import { BsYoutube, BsWhatsapp, BsInstagram } from "react-icons/bs";
import { HiAcademicCap, HiClock, HiCheck, HiCheckCircle, HiHeart, HiTicket, HiDocument, HiQuestionMarkCircle, HiBookOpen, HiOfficeBuilding } from "react-icons/hi";
import type { Metadata } from "next";
import Logo from "@/components/logo";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "Psicologia Católica Tradicional | Visão Tomista da Alma Humana",
  description: "Resgatando a sabedoria perene da psicologia tomista para o ordenamento da alma humana. Mentoria, cursos e formação na tradicional visão católica da pessoa.",
  keywords: "psicologia católica, psicologia tomista, são tomás de aquino, mentoria católica, desenvolvimento integral, alma humana",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/favicon.ico',
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base-100">
      <Header />
        {/* Hero Section - More professional, cleaner design */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-primary/10 to-base-100 overflow-hidden py-16">
        {/* Background image overlay */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-[url('/images/2.jpg')] bg-cover bg-center bg-no-repeat opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-base-100/80 to-base-100/95"></div>
        </div>        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 flex flex-col-reverse md:flex-row items-center justify-center gap-12">
          {/* Left: Text */}
          <FadeIn direction="left" duration={1.5} threshold={0.2} className="w-full md:w-1/2">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 font-serif leading-tight">
                Psicologia Católica<br />
                <span className="text-primary">Tradicional</span>
              </h1>
              <p className="text-lg sm:text-xl mb-8 max-w-lg">
                <span className="font-semibold text-primary border-l-4 border-primary pl-3">
                  Resgatando a sabedoria perene para o ordenamento da alma humana.
                </span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center md:justify-start">
                <a href="https://wa.me/5562821377" className="btn btn-primary btn-lg gap-2">
                  <BsWhatsapp size={20} />
                  Faça parte
                </a>
                <a href="#sobre" className="btn btn-outline btn-lg">
                  Conhecer
                </a>
              </div>
              <div className="mt-8">
                <span className="badge badge-outline p-4 font-serif">In Nomine Domini</span>
              </div>
            </div>
          </FadeIn>
          {/* Right: Image */}
          <FadeIn direction="right" duration={1.5} delay={0.3} threshold={0.2} className="w-full md:w-1/2">
            <div className="flex justify-center items-center mb-8 md:mb-0">
              <div className="relative max-h-96 rounded-xl shadow-xl overflow-hidden">
                <img
                  src="/images/1.jpg"
                  alt="Psicologia Católica Tradicional"
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 rounded-xl ring-4 ring-primary/10 pointer-events-none"></div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
      {/* About Section - Professional and concise */}
      <section id="sobre" className="py-20 bg-base-200">
        <div className="container mx-auto px-4">
          <FadeIn direction="down" className="w-full" duration={1.5} threshold={0.15}>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif mb-3 text-primary">Fé e Razão</h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
              <p className="text-xl max-w-3xl mx-auto">A verdadeira psicologia baseada nos ensinamentos de Santo Tomás de Aquino</p>
            </div>
          </FadeIn>
            <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              {
                image: '3.jpg',
                title: 'Visão Integral',
                description: 'Unidade substancial de corpo e alma, considerando todas as dimensões da pessoa humana.'
              },
              {
                image: '4.jpg',
                title: 'Método Eficaz',
                description: 'Ordenamento das potências da alma para alcançar a perfeição cristã e a verdadeira felicidade.'
              },
              {
                image: '5.jpg',
                title: 'Mentoria Contínua',
                description: 'Acompanhamento personalizado com acesso vitalício às aulas e materiais de formação.'
              }
            ].map((card, index) => (
              <FadeIn key={index} direction="up" delay={index * 0.15} className="w-full">
                <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all h-full">
                  <figure className="px-6 pt-6">
                    <img 
                      src={`/images/${card.image}`}
                      alt={card.title}
                      className="h-48 w-full object-cover rounded-xl"
                    />
                  </figure>
                  <div className="card-body items-center text-center">
                    <h3 className="card-title font-serif text-primary">{card.title}</h3>
                    <p className="text-sm">{card.description}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>      {/* Mentorship Program Section - Concise and focused */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 w-full">
              <FadeIn direction="left">
                <div className="relative bg-base-300 p-8 rounded-lg shadow-xl flex items-center justify-center">
                  <div className="max-w-72">
                    <Logo />
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-primary text-white p-4 rounded shadow-lg">
                    <p className="text-xl font-serif">Acesso vitalício às aulas</p>
                  </div>
                </div>
              </FadeIn>
            </div>
            
            <div className="md:w-1/2">
              <FadeIn direction="right" delay={0.2}>
                <h2 className="text-4xl font-serif mb-6">Programa de <span className="text-primary">Mentoria</span></h2>
                <div className="divider mb-6"></div>
                <div className="space-y-6">
                {[
                  { 
                    icon: <HiAcademicCap className="w-6 h-6 text-primary" />, 
                    text: "Seis encontros por módulo com interação ao vivo" 
                  },
                  { 
                    icon: <HiClock className="w-6 h-6 text-primary" />, 
                    text: "Temas cuidadosamente selecionados para iluminar a inteligência e orientar a vontade" 
                  },
                  { 
                    icon: <HiCheckCircle className="w-6 h-6 text-primary" />, 
                    text: "Aplicável para qualquer pessoa com desejo de autodesenvolvimento integral" 
                  },
                  { 
                    icon: <HiHeart className="w-6 h-6 text-primary" />, 
                    text: "Ferramenta para viver de forma plena e feliz mesmo em meio às dificuldades da vida" 
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <p className="font-medium">{item.text}</p>
                  </div>
                ))}
                </div>
                  <div className="mt-8">
                  <a href="https://wa.me/5562821377" className="btn btn-primary">
                    <BsWhatsapp className="w-4 h-4" />
                    Faça parte
                  </a>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>      {/* Tomist Psychology Section - Professional and impactful */}
      <section className="py-24 bg-base-200 relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full opacity-30">
          <div className="w-full h-full bg-[url('/images/7.jpg')] bg-no-repeat bg-cover bg-center"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <FadeIn direction="left">
                <h2 className="text-4xl font-serif mb-6"><span className="text-primary">Psicologia</span> Tomista</h2>
                <div className="divider mb-6"></div>
                  <blockquote className="italic text-xl mb-8 border-l-4 border-primary pl-4 py-2">
                    "A perfeição cristã nada mais é do que ser o que Deus quer que sejamos."
                  </blockquote>
                  <div className="space-y-6">
                  {[
                    {
                      title: "Iluminação da Inteligência",
                      description: "Desenvolvimento da capacidade de discernimento e compreensão da realidade."
                    },
                    {
                      title: "Fortalecimento da Vontade",
                      description: "Disciplina interior para buscar o bem verdadeiro e perseverar no caminho virtuoso."
                    },
                    {
                      title: "Transformação Interior",
                      description: "Crescimento pessoal através do cultivo sistemático das virtudes cardeais e teologais."
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="p-3 bg-primary text-white rounded-lg mt-1">
                        <HiCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{item.title}</h3>
                        <p className="text-sm opacity-75">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section - Professional and elegant */}      <section className="py-20">
        <div className="container mx-auto px-4">
          <FadeIn direction="down">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif">Nossa <span className="text-primary">Mentora</span></h2>
              <div className="w-24 h-1 bg-primary mx-auto mt-3 mb-6"></div>
            </div>
          </FadeIn>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="md:w-1/3 w-full">
              <FadeIn direction="left">
                <div className="relative">
                  <div className="w-full h-80 bg-[url('/images/liliane-lopes.jpg')] bg-cover bg-center rounded-lg shadow-2xl"></div>
                  <div className="absolute -bottom-4 -right-4 bg-primary text-white p-3 rounded-lg shadow-lg">
                    <p className="font-serif">15 anos de experiência</p>
                  </div>
                </div>
              </FadeIn>
            </div>
              <div className="md:w-1/2">
              <FadeIn direction="right" delay={0.2}>
                <div className="bg-base-100 p-8 rounded-lg shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-1 bg-primary h-12"></div>
                    <div>
                      <h3 className="text-2xl font-serif">Liliane Lopes</h3>
                      <div className="badge badge-primary">Psicóloga Tomista</div>
                    </div>
                  </div>
                  
                  <p className="mb-6 italic border-l-4 border-primary/30 pl-4 py-1">
                    "Este trabalho é tanto um apostolado quanto um modo de fazer o bem, de retribuir um pouco a graça 
                    de poder conhecer e trabalhar com a Psicologia Tomista."
                  </p><ul className="space-y-2 mb-6">
                  {[
                    "Especialista em Bioética",
                    "10 anos de dedicação à Psicologia Tomista",
                    "Mentora especializada no desenvolvimento das potências da alma"
                  ].map((qualification, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <HiCheckCircle className="h-5 w-5 text-primary" />
                      <span>{qualification}</span>
                    </li>
                  ))}
                </ul><div className="flex items-center gap-3">
                  <a href="https://wa.me/5562821377" className="btn btn-primary btn-sm gap-2">
                    <BsWhatsapp size={16} />
                    Faça parte
                  </a>                </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Curso de Educação Católica dos Filhos Section */}      
      <section className="py-20 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <FadeIn direction="left">
                <h2 className="text-4xl font-serif mb-6"><span className="text-primary">Curso de Educação</span> Católica dos Filhos</h2>
                <div className="divider mb-6"></div>
                <div className="space-y-6">
                  <div className="bg-base-100 p-5 rounded-lg shadow-lg">
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                        <HiBookOpen className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <div className="badge badge-secondary mb-2">em breve</div>
                        <h3 className="text-xl font-medium">Formação completa para pais católicos</h3>
                      </div>
                    </div>
                    <p className="mt-4 text-base-content/80">
                      Um programa abrangente para auxiliar pais na educação de seus filhos segundo os princípios da tradição católica, formando jovens virtuosos prontos para enfrentar os desafios do mundo moderno.
                    </p>
                    <div className="mt-5">
                      <a href="https://wa.me/5562821377" className="btn btn-outline btn-sm">
                        Lista de espera
                      </a>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
            
            <div className="md:w-1/2">              <FadeIn direction="right" delay={0.2}>
                <div className="relative">
                  <div className="w-full h-80 bg-[url('/images/4.jpg')] bg-cover bg-center rounded-lg shadow-2xl"></div>
                  <div className="absolute -bottom-4 -right-4 bg-primary text-white p-3 rounded-lg shadow-lg">
                    <p className="font-serif">Educação integral</p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Virtus et Opus Section */}      
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="md:w-1/2">
              <FadeIn direction="right">
                <h2 className="text-4xl font-serif mb-6"><span className="text-primary">Virtus et Opus</span></h2>
                <h3 className="text-xl mb-4">Consultoria empresarial tomista - Avaliação psicossocial RN1</h3>
                <div className="divider mb-6"></div>
                <div className="space-y-6">
                  {[
                    { title: "Princípios tomistas", description: "Aplicação dos princípios da filosofia tomista no ambiente empresarial." },
                    { title: "Ordenamento corporativo", description: "Estruturação hierárquica e organizacional baseada no bem comum da empresa." },
                    { title: "Formação de líderes", description: "Desenvolvimento de lideranças virtuosas capazes de conduzir suas equipes com justiça e prudência." }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="p-3 bg-primary text-white rounded-lg mt-1">
                        <HiCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{item.title}</h3>
                        <p className="text-sm opacity-75">{item.description}</p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-6">
                    <a href="https://wa.me/5562821377" className="btn btn-primary">
                      <BsWhatsapp className="w-4 h-4" />
                      Solicitar consultoria
                    </a>
                  </div>
                </div>
              </FadeIn>
            </div>

            <div className="md:w-1/2">
              <FadeIn direction="left" delay={0.2}>
                <div className="relative bg-base-200 p-8 rounded-lg shadow-xl flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-base-300 flex items-center justify-center">
                    <HiOfficeBuilding className="w-16 h-16 text-primary" />
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-primary text-white p-4 rounded shadow-lg">
                    <p className="text-xl font-serif">Virtudes para o trabalho</p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Direct and professional */}      
      <section className="py-16 bg-gradient-to-b from-primary/5 to-base-100 relative">
        <div className="absolute inset-0 w-full h-full opacity-50">
          <div className="w-full h-full bg-[url('/images/8.jpg')] bg-no-repeat bg-cover opacity-50"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <FadeIn direction="up">
            <div className="max-w-5xl mx-auto bg-base-300 p-12 rounded-lg shadow-2xl">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-2/3">
                  <h2 className="text-4xl font-serif mb-6">Investimento para sua <span className="text-primary">Formação Integral</span></h2>
                  <div className="flex items-center gap-6 mb-6">
                  {[
                    { icon: <HiTicket className="w-10 h-10" />, text: "Acesso<br/>Vitalício" },
                    { icon: <HiDocument className="w-10 h-10" />, text: "Módulos<br/>Contínuos" },
                    { icon: <HiQuestionMarkCircle className="w-10 h-10" />, text: "Dúvidas<br/>Ao Vivo" }
                  ].map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                        {item.icon}
                      </div>
                      <p className="font-semibold text-sm" dangerouslySetInnerHTML={{ __html: item.text }}></p>
                    </div>
                  ))}
                </div>
                
                <p className="text-sm mb-6">Possibilidade de parcelamento via PIX. Entre em contato para saber mais.</p>
                  <a href="https://wa.me/5562821377" className="btn btn-primary btn-lg gap-2">
                  <BsWhatsapp size={20} />
                  Faça parte
                </a>
              </div>
              
              <div className="md:w-1/3">
                <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                  <div className="text-center mb-4">
                    <span className="font-serif text-2xl text-primary">"</span>
                    <p className="font-medium text-sm">
                      O próximo módulo já está pronto e está <span className="text-primary font-semibold">simplesmente maravilhoso</span>!
                    </p>
                  </div>
                  
                  <div className="divider my-4">Acesse agora</div>
                  
                  <div className="flex justify-center">
                    <img src="/images/qr-code.png" alt="QR Code WhatsApp" className="w-32 h-32 mb-2" />
                  </div>
                  <p className="text-center text-xs">Escaneie para contato</p>
                </div>
              </div>
            </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer - Elegant and simple */}
      <footer className="bg-neutral text-neutral-content">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-serif mb-2">Psicologia Católica Tradicional</h3>
              <p className="text-sm opacity-75">restaurando a verdadeira psicologia à luz do tomismo</p>
            </div>
            
            <div className="flex gap-6">              <a href="https://wa.me/5562821377" className="btn btn-circle btn-outline">
                <BsWhatsapp size={20} />
              </a>
              <a href="https://www.youtube.com/c/PSICOLOGIACAT%C3%93LICATRADICIONAL" className="btn btn-circle btn-outline">
                <BsYoutube className="w-5 h-5" />
              </a>              <a href="https://www.instagram.com/psicologia_catolica/" className="btn btn-circle btn-outline">
                <BsInstagram size={20} />
              </a>
            </div>
          </div>
          
          <div className="divider my-8"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm opacity-75">© {new Date().getFullYear()} - Todos os direitos reservados</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-xs opacity-75 hover:opacity-100">Termos de uso</a>
              <a href="#" className="text-xs opacity-75 hover:opacity-100">Política de privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}