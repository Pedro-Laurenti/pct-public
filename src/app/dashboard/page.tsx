'use client';

import { useEffect, useState } from 'react';
import { FaBook, FaCalendarAlt, FaChartLine, FaClipboardCheck, FaGraduationCap, FaClock, FaTrophy, FaUserGraduate, FaChalkboardTeacher, FaCheck, FaInfo } from 'react-icons/fa';
import LoadingOrError from '@/components/LoadingOrError';
import { useRouter } from 'next/navigation';

// Interface definitions
interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'mentor';
}

interface Lesson {
  id: number;
  title: string;
  lesson_description: string;
}

interface CourseProgress {
  totalActivities: number;
  completedActivities: number;
  progressPercentage: number;
  totalContents: number;
}

interface Course {
  id: number;
  name: string;
  description: string;
  lessons: Lesson[];
  progress: CourseProgress;
}

interface Activity {
  content_id: number;
  content_type: string;
  lesson_id: number;
  lesson_title: string;
  course_id: number;
  course_name: string;
  statement_count: number;
  first_statement: string;
}

interface Reunion {
  id: number;
  reunion_title: string;
  reunion_url: string;
  reunion_description: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  lesson_id: number;
  lesson_title: string;
  course_id: number;
  course_name: string;
}

interface UserStats {
  completedActivities: number;
  pendingActivities: number;
  totalActivities: number;
  overallProgress: number;
}

interface DashboardData {
  user: User;
  courses: Course[];
  pendingActivities: Activity[];
  upcomingReunions: Reunion[];
  pastReunions: Reunion[];
  stats: UserStats;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeReunionTab, setActiveReunionTab] = useState('upcoming');
  const router = useRouter();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = '/';
            return;
          }
          throw new Error(`Erro ao carregar dados: ${response.statusText}`);
        }
        
        const dashboardData = await response.json();
        setData(dashboardData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || error) {
    return <LoadingOrError loading={loading} error={error} />;
  }

  // Utils
  const formatUtils = {
    date: (dateStr: string) => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) throw new Error('Data inválida');
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
      } catch (e) {
        return dateStr;
      }
    },
    
    time: (timeStr: string) => {
      if (!timeStr) return '';
      try {
        if (timeStr.includes('T')) {
          const date = new Date(timeStr);
          return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        }
        return timeStr.substring(0, 5);
      } catch (e) {
        return timeStr;
      }
    },
    
    dateTime: (dateStr: string, timeStr: string) => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T${timeStr}`);
        if (isNaN(date.getTime())) throw new Error('Data ou hora inválida');
        return new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }).format(date);
      } catch (e) {
        return `${formatUtils.date(dateStr)} ${formatUtils.time(timeStr)}`;
      }
    },
    
    timeRemaining: (dateStr: string, timeStr: string) => {
      if (!dateStr) return '';
      try {
        const now = new Date();
        const dateFormat = dateStr.includes('T') ? dateStr : `${dateStr}T${timeStr}`;
        let meetingDate = new Date(dateFormat);
        
        if (isNaN(meetingDate.getTime())) {
          const [year, month, day] = dateStr.split('-').map(Number);
          const [hours, minutes] = timeStr.split(':').map(Number);
          meetingDate = new Date(year, month - 1, day, hours, minutes);
        }
        
        const diffMs = meetingDate.getTime() - now.getTime();
        if (diffMs <= 0) return 'Agora!';
        
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffDays > 0) return `Em ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
        if (diffHours > 0) return `Em ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        return `Em ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
      } catch (e) {
        return 'Em breve';
      }
    }
  };

  // Dados principais
  const nextReunion = data?.upcomingReunions?.[0];
  const { completedActivities, pendingActivities, totalActivities, overallProgress } = data?.stats || {
    completedActivities: 0, pendingActivities: 0, totalActivities: 0, overallProgress: 0
  };
  
  const performance = (() => {
    if (overallProgress >= 80) return { level: 'Excelente', color: 'text-success' };
    if (overallProgress >= 60) return { level: 'Bom', color: 'text-accent' };
    if (overallProgress >= 40) return { level: 'Regular', color: 'text-warning' };
    return { level: 'Iniciante', color: 'text-info' };
  })();
  
  const filteredCourses = data?.courses.filter(course => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'in-progress') return course.progress.progressPercentage > 0 && course.progress.progressPercentage < 100;
    if (activeCategory === 'completed') return course.progress.progressPercentage === 100;
    return activeCategory === 'not-started' && course.progress.progressPercentage === 0;
  });
  
  // Componentes reutilizáveis
  const ProgressBar = ({ percentage, className = "" }: { percentage: number; className?: string }) => (
    <div className="w-full bg-base-300 rounded-full h-2">
      <div 
        className={`rounded-full h-2 ${className || 
          (percentage >= 80 ? 'bg-success' : 
           percentage >= 40 ? 'bg-primary' : 
           'bg-warning')}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );

  // Componentes das seções
  const UserHeader = () => (
    <div className="hero bg-base-100 mb-6 rounded-box shadow-sm">
      <div className="hero-content flex-col lg:flex-row py-4 md:py-8">
        <div className="lg:pr-12">
        <div className="bg-primary text-primary-content rounded-full w-20 aspect-square flex items-center justify-center font-bold text-3xl">
            {data?.user.name.charAt(0).toUpperCase()}
          </div>
        </div>
        
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold">Olá, {data?.user.name.split(' ')[0]}!</h1>
            <div className="badge badge-lg badge-primary">
              {data?.user.role === 'student' ? (
                <span className="flex items-center gap-1"><FaUserGraduate /> Aluno</span>
              ) : (
                <span className="flex items-center gap-1"><FaChalkboardTeacher /> Mentor</span>
              )}
            </div>
          </div>
          <p className="py-2 text-md md:text-lg text-base-content/80">
            Seja bem-vindo(a) à sua área de estudos. Continue acompanhando seus cursos e atividades.
          </p>
          
          <div className="stats stats-vertical md:stats-horizontal shadow mt-2">
            <div className="stat">
              <div className="stat-figure text-primary"><FaGraduationCap className="text-2xl" /></div>
              <div className="stat-title">Cursos</div>
              <div className="stat-value text-primary">{data?.courses.length || 0}</div>
              <div className="stat-desc">Matriculados</div>
            </div>
            
            <div className="stat">
              <div className="stat-figure text-secondary"><FaClipboardCheck className="text-2xl" /></div>
              <div className="stat-title">Atividades</div>
              <div className="stat-value text-secondary">{overallProgress}%</div>
              <div className="stat-desc">{completedActivities} de {totalActivities} concluídas</div>
            </div>
            
            <div className="stat">
              <div className={`stat-figure ${performance.color}`}><FaTrophy className="text-2xl" /></div>
              <div className="stat-title">Desempenho</div>
              <div className={`stat-value ${performance.color}`}>{performance.level}</div>
              <div className="stat-desc">Continue assim!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const NavigationTabs = () => (
    <div className="tabs tabs-boxed bg-base-100 mb-6 px-2 justify-center">
      {[
        { id: 'overview', label: 'Visão Geral' },
        { id: 'courses', label: 'Meus Cursos' },
        { id: 'activities', label: 'Atividades' }
      ].map(tab => (
        <a 
          key={tab.id}
          className={`tab tab-lg ${activeTab === tab.id ? 'tab-active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </a>
      ))}
    </div>
  );

  // Seções da Visão Geral
  const NextReunionAlert = () => (
    data?.upcomingReunions && data.upcomingReunions.length > 0 ? (
      <div className="card bg-primary text-primary-content shadow-xl mb-6 overflow-hidden">
        <div className="card-body p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="card-title text-xl flex items-center gap-2">
                <FaClock /> Próxima Reunião Agendada
              </h2>
              <div className="badge badge-outline badge-lg mt-2 mb-1">
                {formatUtils.timeRemaining(nextReunion?.scheduled_date || '', nextReunion?.scheduled_time || '')}
              </div>
              <p className="text-lg font-semibold mt-1">{nextReunion?.reunion_title}</p>
              <p className="opacity-90">{nextReunion?.course_name} - {nextReunion?.lesson_title}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="badge badge-outline">
                  {formatUtils.dateTime(nextReunion?.scheduled_date || '', nextReunion?.scheduled_time || '')}
                </span>
                <span className="badge badge-outline">
                  Duração: {nextReunion?.duration_minutes} min
                </span>
              </div>
            </div>
            
            {nextReunion?.reunion_url && (
              <a 
                href={nextReunion.reunion_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-outline glass mt-0 md:mt-0 w-full md:w-auto"
              >
                Acessar Reunião
              </a>
            )}
          </div>
        </div>
        <div className="bg-primary-focus text-primary-content p-2 text-center text-sm">
          <p>Prepare-se com antecedência e verifique sua conexão antes da reunião</p>
        </div>
      </div>
    ) : null
  );
  
  // Componentes das seções principais - visão geral, cursos e atividades
  const OverviewSection = () => (
    <div className="p-2 md:p-4">
      <NextReunionAlert />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Cursos */}
        <div className="md:col-span-8">
          <div className="card bg-base-100 shadow-xl h-full border border-base-200">
            <div className="card-body p-4">
              <h2 className="card-title flex items-center mb-4 gap-2">
                <FaBook className="text-primary" /> Seus Cursos
              </h2>
              
              {!data?.courses || data.courses.length === 0 ? (
                <div className="alert alert-info">
                  <FaInfo className="mr-2" />
                  <p>Você ainda não está matriculado em nenhum curso.</p>
                </div>
              ) : (
                <div className="w-full max-w-full p-2 space-x-4 flex overflow-x-auto">
                  {data.courses.map((course) => (
                    <div key={course.id} className="carousel-item w-full md:w-96">
                      <div className="card bg-base-100 shadow-sm w-full h-full border border-base-200">
                        <div className="card-body p-4">
                          <h3 className="card-title text-lg">{course.name}</h3>
                          <p className="line-clamp-2 text-sm text-base-content/80 mb-2">{course.description}</p>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <span className="badge badge-sm">{course.lessons.length} aulas</span>
                            <span className="badge badge-sm badge-primary">{course.progress.completedActivities} atividades</span>
                          </div>
                          
                          <div className="flex flex-col gap-1 mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progresso</span>
                              <span className="font-medium">{course.progress.progressPercentage}%</span>
                            </div>
                            <ProgressBar percentage={course.progress.progressPercentage} />
                          </div>
                          
                          {course.lessons.length > 0 && (
                            <div className="mt-3">
                              <div className="divider my-1 text-xs">Últimas aulas</div>
                              <ul className="space-y-1">
                                {course.lessons.slice(0, 2).map((lesson) => (
                                  <li key={lesson.id} className="truncate hover:text-primary">
                                    <a href={`/dashboard/lessons/${lesson.id}`} className="flex items-center text-sm">
                                      <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                                      {lesson.title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div className="card-actions justify-end mt-4">
                            <a href={`/dashboard/lessons`} className="btn btn-primary btn-sm">Acessar</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Atividades Pendentes */}
        <div className="md:col-span-4">
          <div className="card bg-base-100 shadow-xl h-full border border-base-200">
            <div className="card-body p-4">
              <h2 className="card-title flex items-center gap-2">
                <FaClipboardCheck className="text-accent" /> Atividades Pendentes
              </h2>
              
              {pendingActivities === 0 ? (
                <div className="alert alert-success mt-3">
                  <FaCheck />
                  <p>Todas as atividades foram concluídas!</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-center my-4 relative">
                    <div className="radial-progress text-accent absolute z-20" style={{"--value": overallProgress, "--size": "8rem", "--thickness": "0.8rem"} as any}>

                      <span className="text-2xl font-bold">{overallProgress}%</span>
                    </div>
                    <div className="radial-progress text-base-300" style={{"--value": 100, "--size": "8rem", "--thickness": "0.8rem"} as any}>
                    </div>
                  </div>

                  <div className="menu bg-base-100 rounded-box mt-4 w-full">
                    {data?.pendingActivities.slice(0, 2).map((activity) => (
                      <div key={activity.content_id} className='w-full'>
                        <div 
                          onClick={() => router.push(`/dashboard/lessons`)} 
                          className="hover:bg-base-300 w-full cursor-pointer p-2 rounded"
                        >
                          <div className="w-full flex items-center justify-between">
                            <p className="font-medium text-sm">{activity.lesson_title}</p>
                            <span className="badge badge-xs badge-primary">{activity.course_name}</span>
                          </div>
                          <p className="text-xs text-base-content/70 line-clamp-1 mt-1">
                            {activity.first_statement}
                          </p>
                          <div className="text-xs mt-1">
                            <span className="badge badge-sm badge-outline">
                            {activity.statement_count} {activity.statement_count > 1 ? 'questões' : 'questão'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="card-actions justify-center mt-4">
                    <a href="/dashboard/activities" className="btn btn-outline btn-accent btn-sm">
                      Ver todas as atividades
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
        {/* Progresso */}
        <div className="md:col-span-5">
          <div className="card bg-base-100 shadow-xl h-full border border-base-200">
            <div className="card-body p-4">
              <h2 className="card-title flex items-center gap-2 mb-4">
                <FaChartLine className="text-primary" /> Seu Progresso
              </h2>
              
              <div className="overflow-x-auto">
                <table className="table table-zebra table-sm">
                  <thead>
                    <tr>
                      <th>Curso</th>
                      <th>Progresso</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.courses.map((course) => (
                      <tr key={course.id}>
                        <td>{course.name}</td>
                        <td><ProgressBar percentage={course.progress.progressPercentage} /></td>
                        <td className="text-right">{course.progress.progressPercentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="stats bg-base-100 text-base-content mt-4">
                <div className="stat">
                  <div className="stat-title">Total</div>
                  <div className="stat-value text-primary">{totalActivities}</div>
                  <div className="stat-desc">{completedActivities} concluídas</div>
                </div>
                
                <div className="stat">
                  <div className="stat-title">Pendentes</div>
                  <div className="stat-value text-secondary">{pendingActivities}</div>
                  <div className="stat-desc">restantes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reuniões */}
        <div className="md:col-span-7">
          <div className="card bg-base-100 shadow-xl h-full border border-base-200">
            <div className="card-body p-4">
              <h2 className="card-title flex items-center gap-2 mb-4">
                <FaCalendarAlt className="text-secondary" /> Reuniões
              </h2>
              
              <div className="tabs tabs-boxed mb-4 justify-center">
                <a className={`tab ${activeReunionTab === 'upcoming' ? 'tab-active' : ''}`} 
                   onClick={() => setActiveReunionTab('upcoming')}>Próximas</a>
                <a className={`tab ${activeReunionTab === 'past' ? 'tab-active' : ''}`} 
                   onClick={() => setActiveReunionTab('past')}>Passadas</a>
              </div>
              
              {activeReunionTab === 'upcoming' ? (
                <>
                  {data?.upcomingReunions && data.upcomingReunions.length === 0 ? (
                    <div className="alert">
                      <FaInfo className="mr-2" />
                      <p>Não há reuniões futuras agendadas.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="table table-zebra">
                        <thead>
                          <tr>
                            <th>Status</th>
                            <th>Reunião</th>
                            <th className="hidden md:table-cell">Curso</th>
                            <th className="hidden md:table-cell">Data</th>
                            <th>Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data?.upcomingReunions.map((reunion, index) => (
                            <tr key={`upcoming-${reunion.id}-${index}`} className="hover">
                              <td>
                                <div className="badge badge-sm badge-outline badge-success" title="Tempo restante">
                                  {formatUtils.timeRemaining(reunion.scheduled_date, reunion.scheduled_time)}
                                </div>
                              </td>
                              <td>
                                <div className="font-medium">{reunion.reunion_title}</div>
                                <div className="text-xs text-base-content/70 md:hidden">
                                  {reunion.course_name} - {formatUtils.date(reunion.scheduled_date)}
                                </div>
                              </td>
                              <td className="hidden md:table-cell">{reunion.course_name}</td>
                              <td className="hidden md:table-cell">
                                <div>{formatUtils.date(reunion.scheduled_date)}</div>
                                <div className="text-xs">
                                  {formatUtils.time(reunion.scheduled_time)} ({reunion.duration_minutes} min)
                                </div>
                              </td>
                              <td>
                                {reunion.reunion_url && (
                                  <a href={reunion.reunion_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary">
                                    Acessar
                                  </a>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {!data?.pastReunions || data.pastReunions.length === 0 ? (
                    <div className="alert">
                      <FaInfo className="mr-2" />
                      <p>Nenhuma reunião passada encontrada.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="table table-zebra">
                        <thead>
                          <tr>
                            <th>Status</th>
                            <th>Reunião</th>
                            <th className="hidden md:table-cell">Curso</th>
                            <th className="hidden md:table-cell">Data</th>
                            <th>Link</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.pastReunions.map((reunion, index) => (
                            <tr key={`past-${reunion.id}-${index}`} className="hover opacity-70">
                              <td><div className="badge badge-sm badge-outline badge-primary">Concluída</div></td>
                              <td>
                                <div className="font-medium">{reunion.reunion_title}</div>
                                <div className="text-xs text-base-content/70 md:hidden">
                                  {reunion.course_name} - {formatUtils.date(reunion.scheduled_date)}
                                </div>
                              </td>
                              <td className="hidden md:table-cell">{reunion.course_name}</td>
                              <td className="hidden md:table-cell">
                                <div>{formatUtils.date(reunion.scheduled_date)}</div>
                                <div className="text-xs">{formatUtils.time(reunion.scheduled_time)}</div>
                              </td>
                              <td>
                                {reunion.reunion_url && (
                                  <a title="Ver gravação ou materiais" className="btn btn-sm btn-ghost btn-outline">
                                    Expirado
                                  </a>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const CoursesSection = () => (
    <div className="p-2 md:p-4">
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        <button 
          className={`btn btn-sm ${activeCategory === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveCategory('all')}
        >
          Todos ({data?.courses.length})
        </button>
        <button 
          className={`btn btn-sm ${activeCategory === 'in-progress' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveCategory('in-progress')}
        >
          Em Progresso
        </button>
        <button 
          className={`btn btn-sm ${activeCategory === 'completed' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveCategory('completed')}
        >
          Concluídos
        </button>
        <button 
          className={`btn btn-sm ${activeCategory === 'not-started' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveCategory('not-started')}
        >
          Não Iniciados
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses?.map((course) => (
          <div key={course.id} className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <div className="flex justify-between items-start">
                <h2 className="card-title">{course.name}</h2>
                <div className="badge badge-lg" style={{
                  backgroundColor: course.progress.progressPercentage === 100 ? 'var(--success)' :
                                  course.progress.progressPercentage > 0 ? 'var(--primary)' : 
                                  'var(--neutral)'
                }}>
                  {course.progress.progressPercentage}%
                </div>
              </div>
              <p className="mb-4 text-base-content/80">{course.description}</p>
              
              <div className="stats stats-vertical bg-base-100 shadow mb-2">
                <div className="stat place-items-center">
                  <div className="stat-title">Total Conteúdos</div>
                  <div className="stat-value">{course.progress.totalContents}</div>
                  <div className="stat-desc">Vídeos, textos e atividades</div>
                </div>
                
                <div className="stat place-items-center">
                  <div className="stat-title">Atividades</div>
                  <div className="stat-value">{course.progress.completedActivities}/{course.progress.totalActivities}</div>
                  <div className="stat-desc">Concluídas</div>
                </div>
              </div>

              <ProgressBar 
                percentage={course.progress.progressPercentage} 
                className={course.progress.progressPercentage >= 80 ? 'bg-success' : 
                         course.progress.progressPercentage >= 40 ? 'bg-primary' : 
                         'bg-warning'}
              />
              
              <div className="collapse collapse-arrow bg-base-100 mt-4">
                <input type="checkbox" /> 
                <div className="collapse-title font-medium">Conteúdo do curso</div>
                <div className="collapse-content"> 
                  {course.lessons.length > 0 ? (
                    <ul className="menu bg-base-100 rounded-box">
                      {course.lessons.map((lesson) => (
                        <li key={lesson.id}>
                          <a href={`/lesson`}>
                            <FaBook className="text-primary" />
                            {lesson.title}
                          </a>
                        </li>
                      ))}
                      {course.lessons.length > 5 && (
                        <li className="disabled">
                          <a>E mais aulas...</a>
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm">Nenhuma aula disponível ainda.</p>
                  )}
                </div>
              </div>
              
              <div className="card-actions justify-end mt-4">
                <a href={`/dashboard/lessons`} className="btn btn-primary">
                  Acessar curso
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredCourses?.length === 0 && (
        <div className="alert alert-info">
          <FaInfo className="mr-2" />
          <span>Nenhum curso encontrado.</span>
        </div>
      )}
    </div>
  );

  const ActivitiesSection = () => (
    <div className="p-2 md:p-4">
      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body p-4">
          <div className="flex justify-between items-center flex-wrap gap-2 mb-4">
            <h2 className="card-title">Atividades Pendentes</h2>
            
            <div className="stats bg-base-100 shadow stats-horizontal">
              <div className="stat p-2">
                <div className="stat-title text-xs">Concluídas</div>
                <div className="stat-value text-primary text-xl">{completedActivities}</div>
              </div>
              
              <div className="stat p-2">
                <div className="stat-title text-xs">Pendentes</div>
                <div className="stat-value text-secondary text-xl">{pendingActivities}</div>
              </div>
            </div>
          </div>
          
          {data?.pendingActivities.length === 0 ? (
            <div className="alert alert-success">
              <FaCheck />
              <span>Todas as atividades foram concluídas!</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Curso</th>
                    <th>Aula</th>
                    <th>Atividade</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.pendingActivities.map((activity) => (
                    <tr key={activity.content_id} className="hover">
                      <td className="font-medium">{activity.course_name}</td>
                      <td>{activity.lesson_title}</td>
                      <td className="max-w-md">
                        <div>
                          <div className="line-clamp-2">{activity.first_statement}</div>
                          <div className="text-xs mt-1">
                            <span className="badge badge-sm badge-outline">{activity.statement_count} {activity.statement_count > 1 ? 'questões' : 'questão'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <a 
                          href={`/dashboard/lessons/${activity.lesson_id}/${activity.content_id}`} 
                          className="btn btn-sm btn-accent"
                        >
                          Responder
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="w-full bg-base-100 rounded-full h-4 mt-6">
            <div 
              className="bg-primary text-xs font-medium text-primary-content text-center p-0.5 leading-none rounded-full"
              style={{ width: `${overallProgress}%` }}
            >
              {overallProgress}%
            </div>
          </div>
          
          <div className="card-actions justify-center mt-6">
            <div className="stats shadow stats-vertical md:stats-horizontal">
              <div className="stat">
                <div className="stat-figure text-success"><FaClipboardCheck className="text-3xl" /></div>
                <div className="stat-title">Concluídas</div>
                <div className="stat-value text-success">{completedActivities}</div>
                <div className="stat-desc">{overallProgress}% do total</div>
              </div>
              
              <div className="stat">
                <div className="stat-figure text-warning"><FaClipboardCheck className="text-3xl" /></div>
                <div className="stat-title">Pendentes</div>
                <div className="stat-value text-warning">{pendingActivities}</div>
                <div className="stat-desc">Continue estudando</div>
              </div>
              
              <div className="stat">
                <div className="stat-figure text-info"><FaGraduationCap className="text-3xl" /></div>
                <div className="stat-title">Total</div>
                <div className="stat-value text-info">{totalActivities}</div>
                <div className="stat-desc">Atividades</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col w-full">
      <UserHeader />
      <NavigationTabs />
      
      {activeTab === 'overview' && <OverviewSection />}
      {activeTab === 'courses' && <CoursesSection />}
      {activeTab === 'activities' && <ActivitiesSection />}
    </div>
  );
}