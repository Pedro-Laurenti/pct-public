"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FaPlus, 
  FaUser, 
  FaBook, 
  FaVideo, 
  FaUserGraduate, 
  FaCalendarAlt, 
  FaArrowRight,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaGraduationCap,
  FaBookReader,
  FaFileAlt,
  FaChalkboardTeacher
} from "react-icons/fa";
import { BiChalkboard, BiTask } from "react-icons/bi";
import { PiStudentBold } from "react-icons/pi";
import { HiOutlineDocumentText } from "react-icons/hi";
import LoadingOrError from "@/components/LoadingOrError";

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalClasses: number;
  totalLessons: number;
  totalContents: number;
}

interface Reunion {
  id: number;
  reunion_id: number;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  reunion_title: string;
  reunion_description: string;
  reunion_url: string;
  lesson_content_id: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'mentor';
  created_at: string;
}

interface Course {
  id: number;
  name: string;
  description: string;
  class_count: number;
  student_count: number;
}

interface Lesson {
  id: number;
  title: string;
  course_id: number;
  content_id: number;
  content_type: string;
  course_name: string;
  student_count: number;
}

interface Activity {
  id: number;
  created_at: string;
  user_name: string;
  user_id: number;
  statement_text: string;
  statement_id: number;
  lesson_title: string;
  lesson_id: number;
}

interface ContentTypeStats {
  video: number;
  text: number;
  activity: number;
  reunion: number;
}

interface ClassProgress {
  class_id: number;
  class_name: string;
  total_students: number;
  total_lessons: number;
  total_contents: number;
  completed_activities: number;
}

interface DetailedStats {
  recentUsers: User[];
  popularCourses: Course[];
  upcomingLessons: Lesson[];
  recentActivities: Activity[];
  contentTypeStats: ContentTypeStats;
}

interface ProgressStats {
  classProgress: ClassProgress[];
  contentProgress: any[];
  recentActivitiesPerformance: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(null);
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [upcomingReunions, setUpcomingReunions] = useState<Reunion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar estatísticas do dashboard e próximas reuniões
  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      try {
        const [statsRes, detailedRes, progressRes, reunionsRes] = await Promise.all([
          fetch('/api/admin/dashboard'),
          fetch('/api/admin/dashboard/stats'),
          fetch('/api/admin/dashboard/progress'),
          fetch(`/api/admin/reunions?month=${month}&year=${year}`),
        ]);

        if (!statsRes.ok) throw new Error("Falha ao buscar estatísticas do dashboard");
        if (!detailedRes.ok) throw new Error("Falha ao buscar estatísticas detalhadas");
        if (!reunionsRes.ok) throw new Error("Falha ao buscar reuniões");

        const [statsData, detailedData, reunionsData] = await Promise.all([
          statsRes.json(),
          detailedRes.json(),
          reunionsRes.json(),
        ]);

        setStats(statsData);
        setDetailedStats(detailedData);

        if (progressRes.ok) {
          setProgressStats(await progressRes.json());
        }

        const futureReunions = reunionsData.reunions
          .filter((reunion: Reunion) => {
            const reunionDate = new Date(`${reunion.scheduled_date.substring(0, 10)}T${reunion.scheduled_time}`);
            return reunionDate >= today;
          })
          .sort((a: Reunion, b: Reunion) => {
            const dateA = new Date(`${a.scheduled_date.substring(0, 10)}T${a.scheduled_time}`);
            const dateB = new Date(`${b.scheduled_date.substring(0, 10)}T${b.scheduled_time}`);
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 5);

        setUpcomingReunions(futureReunions);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Formatação de data para exibição
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(`${dateString.substring(0, 10)}T12:00:00`);
    return date.toLocaleDateString('pt-BR');
  };

  // Formatação de hora para exibição
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };
  
  // Formatar data e hora relativa para exibição
  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMillis = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMillis / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return formatDate(dateString);
  };

  if (loading || error) {
    return <LoadingOrError loading={loading} error={error} />;
  }

  return (
    <div className="p-6 space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
        
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/users/new" className="btn btn-sm btn-primary flex items-center gap-2">
            <FaPlus />
            <span>Usuário</span>
          </Link>
          <Link href="/admin/classes/new" className="btn btn-sm btn-success flex items-center gap-2">
            <FaPlus />
            <span>Classe</span>
          </Link>
          <Link href="/admin/courses/new" className="btn btn-sm btn-accent flex items-center gap-2">
            <FaPlus />
            <span>Curso</span>
          </Link>
          <Link href="/admin/lessons/new" className="btn btn-sm btn-info flex items-center gap-2">
            <FaPlus />
            <span>Aula</span>
          </Link>
          <Link href="/admin/contents/new" className="btn btn-sm btn-warning flex items-center gap-2">
            <FaPlus />
            <span>Conteúdo</span>
          </Link>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="card bg-primary text-primary-content shadow-md">
          <div className="card-body p-4">
            <div className="flex justify-between items-center">
              <h2 className="card-title text-lg">Usuários</h2>
              <FaUser className="text-2xl opacity-80" />
            </div>
            <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
            <Link href="/admin/users" className="text-xs flex items-center mt-2 hover:underline">
              Ver todos <FaArrowRight className="ml-1 text-xs" />
            </Link>
          </div>
        </div>

        <div className="card bg-secondary text-secondary-content shadow-md">
          <div className="card-body p-4">
            <div className="flex justify-between items-center">
              <h2 className="card-title text-lg">Classes</h2>
              <FaUserGraduate className="text-2xl opacity-80" />
            </div>
            <p className="text-3xl font-bold">{stats?.totalClasses || 0}</p>
            <Link href="/admin/classes" className="text-xs flex items-center mt-2 hover:underline">
              Ver todas <FaArrowRight className="ml-1 text-xs" />
            </Link>
          </div>
        </div>

        <div className="card bg-accent text-accent-content shadow-md">
          <div className="card-body p-4">
            <div className="flex justify-between items-center">
              <h2 className="card-title text-lg">Cursos</h2>
              <FaBook className="text-2xl opacity-80" />
            </div>
            <p className="text-3xl font-bold">{stats?.totalCourses || 0}</p>
            <Link href="/admin/courses" className="text-xs flex items-center mt-2 hover:underline">
              Ver todos <FaArrowRight className="ml-1 text-xs" />
            </Link>
          </div>
        </div>

        <div className="card bg-info text-info-content shadow-md">
          <div className="card-body p-4">
            <div className="flex justify-between items-center">
              <h2 className="card-title text-lg">Aulas</h2>
              <BiChalkboard className="text-2xl opacity-80" />
            </div>
            <p className="text-3xl font-bold">{stats?.totalLessons || 0}</p>
            <Link href="/admin/lessons" className="text-xs flex items-center mt-2 hover:underline">
              Ver todas <FaArrowRight className="ml-1 text-xs" />
            </Link>
          </div>
        </div>

        <div className="card bg-neutral text-neutral-content shadow-md">
          <div className="card-body p-4">
            <div className="flex justify-between items-center">
              <h2 className="card-title text-lg">Conteúdos</h2>
              <FaVideo className="text-2xl opacity-80" />
            </div>
            <p className="text-3xl font-bold">{stats?.totalContents || 0}</p>
            <Link href="/admin/contents" className="text-xs flex items-center mt-2 hover:underline">
              Ver todos <FaArrowRight className="ml-1 text-xs" />
            </Link>
          </div>
        </div>
      </div>

      {/* Seção Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Calendário e Próximas Reuniões */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tipos de Conteúdo */}
          {detailedStats?.contentTypeStats && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body p-4">
                <h2 className="card-title flex items-center mb-4">
                  <FaChartLine className="mr-2" /> Distribuição de Conteúdo
                </h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-primary/10 rounded-lg p-3 text-center">
                    <div className="text-primary text-3xl mb-1"><FaVideo /></div>
                    <div className="text-2xl font-bold">{detailedStats.contentTypeStats.video}</div>
                    <div className="text-sm text-base-content/70">Vídeos</div>
                  </div>
                  
                  <div className="bg-secondary/10 rounded-lg p-3 text-center">
                    <div className="text-secondary text-3xl mb-1"><HiOutlineDocumentText /></div>
                    <div className="text-2xl font-bold">{detailedStats.contentTypeStats.text}</div>
                    <div className="text-sm text-base-content/70">Textos</div>
                  </div>
                  
                  <div className="bg-accent/10 rounded-lg p-3 text-center">
                    <div className="text-accent text-3xl mb-1"><BiTask /></div>
                    <div className="text-2xl font-bold">{detailedStats.contentTypeStats.activity}</div>
                    <div className="text-sm text-base-content/70">Atividades</div>
                  </div>
                  
                  <div className="bg-info/10 rounded-lg p-3 text-center">
                    <div className="text-info text-3xl mb-1"><FaCalendarAlt /></div>
                    <div className="text-2xl font-bold">{detailedStats.contentTypeStats.reunion}</div>
                    <div className="text-sm text-base-content/70">Reuniões</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mini calendário de reuniões */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title flex items-center">
                  <FaCalendarAlt className="mr-2" /> Próximas Reuniões
                </h2>
                <Link href="/admin/reunions" className="btn btn-sm btn-outline">
                  Ver calendário completo
                </Link>
              </div>
              
              {upcomingReunions.length === 0 ? (
                <div className="text-center py-8 bg-base-200 rounded-lg">
                  <FaCalendarAlt className="mx-auto text-3xl text-base-content/30" />
                  <p className="mt-2 text-base-content/50">Não há reuniões agendadas para os próximos dias</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {upcomingReunions.map(reunion => (
                    <div 
                      key={reunion.id} 
                      className="p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{reunion.reunion_title}</h3>
                          <div className="flex items-center text-sm mt-1 text-base-content/70">
                            <FaCalendarAlt className="mr-1 text-xs" /> 
                            {formatDate(reunion.scheduled_date)} às {formatTime(reunion.scheduled_time)}
                          </div>
                          <div className="text-xs mt-1 text-base-content/60">
                            Duração: {reunion.duration_minutes} minutos
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {reunion.reunion_url && (
                            <a
                              href={reunion.reunion_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-xs btn-primary"
                            >
                              Participar
                            </a>
                          )}
                          <Link
                            href={`/admin/contents/${reunion.lesson_content_id}/reunion`}
                            className="btn btn-xs btn-ghost"
                          >
                            Editar
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Aulas Recentes */}
          {detailedStats?.upcomingLessons && detailedStats.upcomingLessons.length > 0 && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title flex items-center">
                    <FaBookReader className="mr-2" /> Aulas Recentes
                  </h2>
                  <Link href="/admin/lessons" className="btn btn-sm btn-outline">
                    Ver todas
                  </Link>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="table table-sm w-full">
                    <thead>
                      <tr>
                        <th>Aula</th>
                        <th>Curso</th>
                        <th>Alunos</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailedStats.upcomingLessons.map((lesson) => (
                        <tr key={lesson.id}>
                          <td>{lesson.title}</td>
                          <td>{lesson.course_name}</td>
                          <td>{lesson.student_count}</td>
                          <td>
                            <Link 
                              href={`/admin/lessons/${lesson.id}`}
                              className="btn btn-xs btn-ghost"
                            >
                              Ver
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      
        {/* Coluna 2: Painel Lateral */}
        <div className="space-y-6">
          {/* Cursos Populares */}
          {detailedStats?.popularCourses && detailedStats.popularCourses.length > 0 && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body p-4">
                <h2 className="card-title flex items-center mb-4">
                  <FaGraduationCap className="mr-2" /> Cursos Populares
                </h2>
                
                <div className="space-y-3">
                  {detailedStats.popularCourses.map((course) => (
                    <div key={course.id} className="border-b pb-3 last:border-0 last:pb-0">
                      <Link 
                        href={`/admin/courses/${course.id}`} 
                        className="font-medium hover:text-primary"
                      >
                        {course.name}
                      </Link>
                      <div className="flex justify-between mt-1 text-sm">
                        <span className="text-base-content/70">{course.student_count} alunos</span>
                        <span className="text-base-content/70">{course.class_count} classes</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-right">
                  <Link href="/admin/courses" className="text-sm text-primary hover:underline flex items-center justify-end">
                    Ver todos os cursos <FaArrowRight className="ml-1 text-xs" />
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* Últimos Usuários */}
          {detailedStats?.recentUsers && detailedStats.recentUsers.length > 0 && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body p-4">
                <h2 className="card-title flex items-center mb-4">
                  <FaUser className="mr-2" /> Usuários Recentes
                </h2>
                
                <div className="space-y-3">
                    {detailedStats.recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                      <div className="bg-neutral flex items-center justify-center text-neutral-content w-10 h-10 rounded-full">
                        <span className="text-lg font-bold w-fit">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div><Link 
                            href={`/admin/users/${user.id}`}
                            className="font-medium hover:text-primary"
                          >
                            {user.name}
                          </Link>
                          <div className="text-xs text-base-content/70 flex items-center gap-1">
                            <span className={user.role === 'student' ? "text-info" : "text-warning"}>
                              {user.role === 'student' ? 'Aluno' : 'Mentor'}
                            </span>
                            • <span>{formatRelativeTime(user.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Link 
                        href={`/admin/users/${user.id}`}
                        className="btn btn-xs btn-ghost"
                      >
                        Ver
                      </Link>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-right">
                  <Link href="/admin/users" className="text-sm text-primary hover:underline flex items-center justify-end">
                    Ver todos os usuários <FaArrowRight className="ml-1 text-xs" />
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* Progresso de Classes */}
          {progressStats?.classProgress && progressStats.classProgress.length > 0 && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body p-4">
                <h2 className="card-title flex items-center mb-4">
                  <FaChalkboardTeacher className="mr-2" /> Progresso por Classes
                </h2>
                
                <div className="space-y-4">
                  {progressStats.classProgress.map((progress) => {
                    // Calculando a porcentagem de conclusão
                    const totalPossibleActivities = progress.total_students * progress.total_contents;
                    const completionPercentage = totalPossibleActivities > 0 
                      ? Math.round((progress.completed_activities / totalPossibleActivities) * 100)
                      : 0;
                    
                    return (
                      <div key={progress.class_id}>
                        <div className="flex justify-between mb-1">
                          <Link 
                            href={`/admin/classes/${progress.class_id}`}
                            className="font-medium hover:text-primary"
                          >
                            {progress.class_name}
                          </Link>
                          <span className="text-xs">{completionPercentage}% completo</span>
                        </div>
                        <progress 
                          className={`progress ${completionPercentage > 75 ? 'progress-success' : 
                                              completionPercentage > 40 ? 'progress-info' : 
                                              'progress-warning'}`} 
                          value={completionPercentage} 
                          max="100"
                        />
                        <div className="flex justify-between mt-1 text-xs text-base-content/70">
                          <span>{progress.total_students} alunos</span>
                          <span>{progress.total_contents} conteúdos</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 text-right">
                  <Link href="/admin/classes" className="text-sm text-primary hover:underline flex items-center justify-end">
                    Ver todas as classes <FaArrowRight className="ml-1 text-xs" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}