import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section com design mais limpo */}
      <section className="hero min-h-[90vh] bg-gradient-to-b from-primary/10 to-base-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-7 h-full">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex justify-center">
                <div className="w-12 md:w-16 h-full bg-gradient-to-b from-neutral-content/30 to-transparent rounded-t-xl"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-content text-center flex-col">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-8 font-serif">Psicologia Católica Tradicional</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Fundamentada nos princípios da Psicologia Tomista e na sabedoria perene da Tradição Católica 
              para uma abordagem integral da pessoa humana.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="btn btn-primary btn-lg">
                Acessar Portal
              </Link>
              <a href="#sobre" className="btn btn-outline btn-lg">
                Saiba Mais
              </a>
            </div>
          </div>
          <div className="mt-12 badge badge-outline p-4 font-serif">In Nomine Domini</div>
        </div>
      </section>

      {/* About Section - Simplificada e mais elegante */}
      <section id="sobre" className="py-16 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-serif mb-6 border-l-4 border-primary pl-4">Sobre a Psicologia Católica Tradicional</h2>
              <div className="prose prose-lg max-w-none">
                <p className="mb-4">
                  A Psicologia Católica Tradicional é uma abordagem fundamentada na Psicologia Tomista, que se alicerça na antropologia 
                  filosófica de São Tomás de Aquino, evitando as limitações e contradições da psicologia moderna.
                </p>
                <p>
                  Nossa abordagem recupera a visão integral do ser humano como unidade substancial de alma e corpo, 
                  reconhecendo as potências da alma e a hierarquia das faculdades conforme ensinado por São Tomás. 
                  Oferecemos um caminho de autoconhecimento que visa a remoção dos vícios e o cultivo das virtudes, 
                  onde se encontra a verdadeira cura para os males da alma.
                </p>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title font-serif text-primary mb-2">Nossa Missão</h3>
                  <div className="divider my-1"></div>
                  <p className="mb-4">Restaurar o reinado social de Nosso Senhor Jesus Cristo através da reestruturação das famílias 
                     nos moldes da família Católica Tradicional.</p>
                  <p>Oferecemos formação integral que abrange os âmbitos físico, psíquico, intelectual, moral e sobrenatural, 
                     baseando-se na filosofia perene de São Tomás de Aquino.</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <div className="badge badge-outline">Tradição</div>
                    <div className="badge badge-outline">Virtude</div>
                    <div className="badge badge-outline">Fé</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Layout mais uniforme e objetiva */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif text-center mb-12 after:content-[''] after:block after:w-24 after:h-1 after:bg-primary after:mx-auto after:mt-4">Nossos Serviços</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Service 1 */}
            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all">
              <div className="card-body">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  <h3 className="card-title font-serif">Curso de Educação Católica dos Filhos</h3>
                </div>
                <div className="divider my-1"></div>
                <p className="mb-4">
                  Formação para pais educarem seus filhos segundo os princípios da filosofia tomista e Doutrina Católica, 
                  oferecendo desenvolvimento integral: físico, psíquico, intelectual, moral e sobrenatural.
                </p>
                <p>
                  Nosso objetivo é formar bons cidadãos que contribuam para o bem da sociedade 
                  e, acima de tudo, formar santos para povoar o céu.
                </p>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-primary btn-sm">Saber Mais</button>
                </div>
              </div>
            </div>
            
            {/* Service 2 */}
            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all">
              <div className="card-body">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                    </svg>
                  </div>
                  <h3 className="card-title font-serif">Atendimento Psicológico Tomista</h3>
                </div>
                <div className="divider my-1"></div>
                <p className="mb-4">
                  Atendimento fundamentado na Psicologia Tomista, ajudando a desenvolver as potências da alma,
                  ordenando-as conforme a hierarquia natural das faculdades humanas.
                </p>
                <p>
                  Um caminho de ordenamento interior que integra razão e fé, natureza e graça, levando ao verdadeiro equilíbrio
                  e à perfeição das virtudes intelectuais e morais.
                </p>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-primary btn-sm">Saber Mais</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tomist Psychology Section - Conteúdo mais conciso e visual mais limpo */}
      <section className="py-16 bg-base-200">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif text-center mb-12 after:content-[''] after:block after:w-24 after:h-1 after:bg-primary after:mx-auto after:mt-4">A Psicologia Tomista</h2>
          
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body p-8">
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="stat bg-primary/5 shadow-sm">
                  <div className="stat-figure text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                  </div>
                  <div className="stat-title font-medium">Visão Integral</div>
                  <div className="stat-desc text-sm">Corpo e alma como unidade substancial</div>
                </div>
                <div className="stat bg-primary/5 shadow-sm">
                  <div className="stat-figure text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                    </svg>
                  </div>
                  <div className="stat-title font-medium">Hierarquia Natural</div>
                  <div className="stat-desc text-sm">Das faculdades da alma humana</div>
                </div>
                <div className="stat bg-primary/5 shadow-sm">
                  <div className="stat-figure text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                    </svg>
                  </div>
                  <div className="stat-title font-medium">Cultivo das Virtudes</div>
                  <div className="stat-desc text-sm">Caminho para a plenitude humana</div>
                </div>
              </div>
            
              <div className="prose prose-lg max-w-none">
                <p className="mb-4">
                  A Psicologia Tomista, baseada nos ensinamentos de São Tomás de Aquino, representa uma compreensão profunda e sistemática 
                  da alma humana e suas operações. Diferentemente da psicologia moderna, que frequentemente fragmenta o ser humano, 
                  oferecemos uma visão holística da pessoa.
                </p>
                <p>
                  Esta cosmovisão reconhece a hierarquia das faculdades humanas: vegetativas, sensitivas e intelectivas, 
                  bem como suas interações. Ao cultivar as virtudes cardeais (prudência, justiça, fortaleza e temperança) 
                  e teologais (fé, esperança e caridade), o homem encontra sua plenitude na ordenação de todas as potências 
                  para seu fim último.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section - Simplificada e com estilo mais consistente */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif text-center mb-12 after:content-[''] after:block after:w-24 after:h-1 after:bg-primary after:mx-auto after:mt-4">Nossa Equipe</h2>
          
          <div className="flex flex-col md:flex-row justify-center gap-8">
            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all max-w-sm">
              <div className="card-body items-center text-center">
                <div className="avatar mb-4">
                  <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 bg-primary/10 flex items-center justify-center">
                    <span className="text-3xl font-serif text-primary">L</span>
                  </div>
                </div>
                <h3 className="card-title font-serif text-xl">Liliane Lopes</h3>
                <div className="badge badge-primary">Psicóloga - PUC Minas</div>
                <div className="divider my-2"></div>
                <p className="text-sm">Especialista em Bioética, Coach e Palestrante com foco em psicologia baseada nos princípios de São Tomás de Aquino.</p>
                <div className="card-actions mt-4">
                  <button className="btn btn-outline btn-sm btn-primary">Ver Currículo</button>
                </div>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all max-w-sm">
              <div className="card-body items-center text-center">
                <div className="avatar mb-4">
                  <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 bg-primary/10 flex items-center justify-center">
                    <span className="text-3xl font-serif text-primary">J</span>
                  </div>
                </div>
                <h3 className="card-title font-serif text-xl">Jean Lopes</h3>
                <div className="badge badge-primary">Co-fundador</div>
                <div className="divider my-2"></div>
                <p className="text-sm">Colaborador e gestor dos projetos da Psicologia Católica Tradicional, contribuindo com sua 
                  expertise para o desenvolvimento dos programas oferecidos.</p>
                <div className="card-actions mt-4">
                  <button className="btn btn-outline btn-sm btn-primary">Ver Currículo</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Simplificada e mais direta */}
      <section className="py-16 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-serif mb-6">Comece Sua Jornada</h2>
            <div className="divider"></div>
            <p className="mb-8">
              Descubra como a Psicologia Católica Tradicional pode ajudar no seu desenvolvimento pessoal, 
              familiar e espiritual através de nossos recursos e serviços.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link href="/login" className="btn btn-primary">
                Acessar Portal
              </Link>
              <button className="btn btn-outline">
                Materiais Gratuitos
              </button>
            </div>
            
            <div className="alert alert-info shadow-sm max-w-md mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <h3 className="font-bold">Nova turma em breve!</h3>
                <div className="text-xs">Inscreva-se na lista de espera para o próximo curso.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Simplificado */}
      <footer className="bg-neutral text-neutral-content">
        <div className="footer p-10 container mx-auto">
          <div>
            <span className="footer-title">Serviços</span> 
            <a className="link link-hover">Cursos</a> 
            <a className="link link-hover">Consultas</a> 
            <a className="link link-hover">Palestras</a> 
            <a className="link link-hover">Materiais</a>
          </div> 
          <div>
            <span className="footer-title">Informações</span> 
            <a className="link link-hover">Sobre nós</a> 
            <a className="link link-hover">Contato</a> 
            <a className="link link-hover">FAQ</a>
          </div> 
          <div>
            <span className="footer-title">Legal</span> 
            <a className="link link-hover">Termos de uso</a> 
            <a className="link link-hover">Política de privacidade</a>
          </div>
        </div>
        <div className="footer footer-center p-6 bg-neutral-focus text-neutral-content">
          <div>
            <div className="grid grid-flow-col gap-4 mb-4">
              <a className="btn btn-ghost btn-circle">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
              </a> 
              <a className="btn btn-ghost btn-circle">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg>
              </a>
              <a className="btn btn-ghost btn-circle">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>
              </a>
            </div>
            <p className="font-bold text-lg">Psicologia Católica Tradicional</p>
            <p>© {new Date().getFullYear()} - Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
}