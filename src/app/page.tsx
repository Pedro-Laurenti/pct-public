import Header from "@/components/header";
import { BsYoutube, BsWhatsapp, BsInstagram } from "react-icons/bs";
import { HiAcademicCap, HiClock, HiCheck, HiCheckCircle, HiHeart, HiTicket, HiDocument, HiQuestionMarkCircle } from "react-icons/hi";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base-100">
      <Header />
        {/* Hero Section - More professional, cleaner design */}
      <section className="hero min-h-[90vh] bg-gradient-to-b from-primary/10 to-base-100 relative overflow-hidden flex items-center pt-20">
        <div className="absolute inset-0 opacity-10 z-0">
          <div className="h-full bg-[url('/images/thomas-aquinas-pattern.png')] bg-repeat opacity-20"></div>
        </div>
        <div className="container mx-auto z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-center md:text-left p-8">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 font-serif leading-tight">Psicologia Católica<br/><span className="text-primary">Tradicional</span></h1>
              <p className="text-xl mb-8 max-w-lg">
                <span className="font-semibold text-primary border-l-4 border-primary pl-3">Resgatando a sabedoria perene para o ordenamento da alma humana.</span>
              </p>              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://wa.me/5562821377" className="btn btn-primary btn-lg gap-2">
                  <BsWhatsapp size={20} />
                  Faça parte
                </a>
                <a href="#sobre" className="btn btn-outline btn-lg">
                  Conhecer
                </a>
              </div>
              <div className="mt-8 badge badge-outline p-4 font-serif">In Nomine Domini</div>
            </div>
            <div className="md:w-1/2 p-8 hidden md:block">
              <div className="relative h-96">
                <div className="absolute inset-0 rounded-lg shadow-2xl overflow-hidden bg-primary/5 flex items-center justify-center">
                  <div className="w-3/4 h-3/4 bg-[url('/images/st-thomas-aquinas.png')] bg-contain bg-center bg-no-repeat"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Professional and concise */}
      <section id="sobre" className="py-20 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif mb-3 text-primary">Fé e Razão</h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-xl max-w-3xl mx-auto">A verdadeira psicologia baseada nos ensinamentos de São Tomás de Aquino</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all">
              <figure className="px-6 pt-6">
                <div className="h-48 w-full bg-[url('/images/vision.jpg')] bg-cover bg-center rounded-xl"></div>
              </figure>
              <div className="card-body items-center text-center">
                <h3 className="card-title font-serif text-primary">Visão Integral</h3>
                <p className="text-sm">Unidade substancial de corpo e alma, considerando todas as dimensões da pessoa humana.</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all">
              <figure className="px-6 pt-6">
                <div className="h-48 w-full bg-[url('/images/method.jpg')] bg-cover bg-center rounded-xl"></div>
              </figure>
              <div className="card-body items-center text-center">
                <h3 className="card-title font-serif text-primary">Método Eficaz</h3>
                <p className="text-sm">Ordenamento das potências da alma para alcançar a perfeição cristã e a verdadeira felicidade.</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all">
              <figure className="px-6 pt-6">
                <div className="h-48 w-full bg-[url('/images/mentorship.jpg')] bg-cover bg-center rounded-xl"></div>
              </figure>
              <div className="card-body items-center text-center">
                <h3 className="card-title font-serif text-primary">Mentoria Contínua</h3>
                <p className="text-sm">Acompanhamento personalizado com acesso vitalício às aulas e materiais de formação.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mentorship Program Section - Concise and focused */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 relative">
              <div className="w-full h-96 bg-[url('/images/mentorship-program.jpg')] bg-cover bg-center rounded-lg shadow-2xl"></div>
              <div className="absolute -bottom-6 -right-6 bg-primary text-white p-4 rounded shadow-lg">
                <p className="text-xl font-serif">Acesso vitalício às aulas</p>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <h2 className="text-4xl font-serif mb-6">Programa de <span className="text-primary">Mentoria</span></h2>
              <div className="divider mb-6"></div>
              
              <div className="space-y-6">                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <HiAcademicCap className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-medium">Seis encontros por módulo com interação e tirada de dúvidas ao vivo</p>
                </div>
                  <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <HiClock className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-medium">Temas cuidadosamente selecionados para iluminar a inteligência e orientar a vontade</p>
                </div>
                  <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <HiCheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-medium">Aplicável para qualquer pessoa com desejo de autodesenvolvimento integral</p>
                </div>
                  <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <HiHeart className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-medium">Ferramenta para viver de forma plena e feliz mesmo em meio às dificuldades da vida</p>
                </div>
              </div>
                <div className="mt-8">
                <a href="https://wa.me/5562821377" className="btn btn-primary">
                  <BsWhatsapp className="w-4 h-4" />
                  Faça parte
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tomist Psychology Section - Professional and impactful */}
      <section className="py-24 bg-base-200 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="h-full bg-[url('/images/philosophy-pattern.png')] bg-repeat"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <h2 className="text-4xl font-serif mb-6"><span className="text-primary">Psicologia</span> Tomista</h2>
              <div className="divider mb-6"></div>
              
              <blockquote className="italic text-xl mb-8 border-l-4 border-primary pl-4 py-2">
                "A perfeição cristã nada mais é do que ser o que Deus quer que sejamos."
              </blockquote>
              
              <div className="space-y-6">                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary text-white rounded-lg mt-1">
                    <HiCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Iluminação da Inteligência</h3>
                    <p className="text-sm opacity-75">Desenvolvimento da capacidade de discernimento e compreensão da realidade.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary text-white rounded-lg mt-1">
                    <HiCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Fortalecimento da Vontade</h3>
                    <p className="text-sm opacity-75">Disciplina interior para buscar o bem verdadeiro e perseverar no caminho virtuoso.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary text-white rounded-lg mt-1">
                    <HiCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Transformação Interior</h3>
                    <p className="text-sm opacity-75">Crescimento pessoal através do cultivo sistemático das virtudes cardeais e teologais.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -top-6 -left-6 w-64 h-64 rounded-full bg-primary/10 z-0"></div>
                <div className="absolute -bottom-6 -right-6 w-64 h-64 rounded-full bg-primary/10 z-0"></div>
                <div className="relative z-10 bg-base-100 p-8 rounded-lg shadow-2xl">
                  <div className="text-center mb-6">
                    <span className="text-4xl font-serif text-primary">"</span>
                    <p className="text-lg font-medium">
                      NÃO DESANIME! NÃO PROCRASTINE! NÃO DESISTA!
                    </p>
                    <p className="mt-4 text-sm opacity-75">
                      Ao final de cada encontro saímos com os ânimos renovados e um desejo ardente de ser melhor.
                    </p>
                    <span className="text-4xl font-serif text-primary">"</span>
                  </div>
                  <div className="flex justify-center">
                    <a href="https://wa.me/5562821377" className="btn btn-sm btn-primary">Iniciar minha jornada</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section - Professional and elegant */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif">Nossa <span className="text-primary">Mentora</span></h2>
            <div className="w-24 h-1 bg-primary mx-auto mt-3 mb-6"></div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="md:w-1/3">
              <div className="relative">
                <div className="w-full h-80 bg-[url('/images/liliane-lopes.jpg')] bg-cover bg-center rounded-lg shadow-2xl"></div>
                <div className="absolute -bottom-4 -right-4 bg-primary text-white p-3 rounded-lg shadow-lg">
                  <p className="font-serif">15 anos de experiência</p>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2">
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
                </p>
                  <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <HiCheckCircle className="h-5 w-5 text-primary" />
                    <span>Especialista em Bioética</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <HiCheckCircle className="h-5 w-5 text-primary" />
                    <span>10 anos de dedicação à Psicologia Tomista</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <HiCheckCircle className="h-5 w-5 text-primary" />
                    <span>Mentora especializada no desenvolvimento das potências da alma</span>
                  </li>
                </ul>                <div className="flex items-center gap-3">
                  <a href="https://wa.me/5562821377" className="btn btn-primary btn-sm gap-2">
                    <BsWhatsapp size={16} />
                    Faça parte
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Direct and professional */}
      <section className="py-16 bg-gradient-to-b from-primary/5 to-base-100 relative">
        <div className="absolute inset-0 opacity-10">
          <div className="h-full bg-[url('/images/cta-pattern.png')] bg-repeat opacity-30"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto bg-base-300 p-12 rounded-lg shadow-2xl">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-2/3">
                <h2 className="text-4xl font-serif mb-6">Investimento para sua <span className="text-primary">Formação Integral</span></h2>
                
                <div className="flex items-center gap-6 mb-6">                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                      <HiTicket className="w-10 h-10" />
                    </div>
                    <p className="font-semibold text-sm">Acesso<br/>Vitalício</p>
                  </div>
                    <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                      <HiDocument className="w-10 h-10" />
                    </div>
                    <p className="font-semibold text-sm">Módulos<br/>Contínuos</p>
                  </div>
                    <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                      <HiQuestionMarkCircle className="w-10 h-10" />
                    </div>
                    <p className="font-semibold text-sm">Dúvidas<br/>Ao Vivo</p>
                  </div>
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
        </div>
      </section>

      {/* Footer - Elegant and simple */}
      <footer className="bg-neutral text-neutral-content">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-serif mb-2">Psicologia Católica Tradicional</h3>
              <p className="text-sm opacity-75">Restaurando a verdadeira psicologia à luz da doutrina católica</p>
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