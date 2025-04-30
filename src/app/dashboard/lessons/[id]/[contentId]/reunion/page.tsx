"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LoadingOrError from "@/components/LoadingOrError";
import { FaArrowLeft, FaUsers, FaCalendarAlt, FaClock, FaExternalLinkAlt } from "react-icons/fa";

interface ReunionContent {
  id: number;
  reunion_id: number;
  lesson_content_id: number;
  reunion_title: string;
  reunion_url: string;
  reunion_description: string;
  schedule: ReunionSchedule[];
}

interface ReunionSchedule {
  id: number;
  reunion_id: number;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
}

interface Lesson {
  id: number;
  title: string;
  lesson_description: string;
  course_name: string;
}

export default function ReunionContentPage() {
  const params = useParams();
  const lessonId = params?.id as string | undefined;
  const contentId = params?.contentId as string | undefined;

  const [content, setContent] = useState<ReunionContent | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!lessonId || !contentId) {
    setError("Parâmetros inválidos.");
    setLoading(false);
    return null;
  }

  useEffect(() => {
    const fetchReunionContent = async () => {
      try {
        const response = await fetch(`/api/lessons/${lessonId}/${contentId}/reunion`);
        if (!response.ok) {
          throw new Error("Falha ao carregar o conteúdo da reunião");
        }
        
        const data = await response.json();
        setContent(data.content);
        setLesson(data.lesson);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId && contentId) {
      fetchReunionContent();
    }
  }, [lessonId, contentId]);

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(`${dateString.substring(0, 10)}T12:00:00`);
    return date.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      weekday: 'long'
    });
  };

  // Formatar hora para exibição
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  // Verificar se a reunião está programada para o futuro
  const isUpcoming = (schedule: ReunionSchedule) => {
    const now = new Date();
    const scheduleDate = new Date(`${schedule.scheduled_date}T${schedule.scheduled_time}`);
    return scheduleDate > now;
  };

  // Verificar se a reunião está acontecendo agora
  const isNow = (schedule: ReunionSchedule) => {
    const now = new Date();
    const scheduleDate = new Date(`${schedule.scheduled_date}T${schedule.scheduled_time}`);
    
    // Considera que está acontecendo agora se estiver dentro do período de duração
    const endTime = new Date(scheduleDate.getTime() + schedule.duration_minutes * 60000);
    return now >= scheduleDate && now <= endTime;
  };

  // Verificar se a reunião já passou
  const isPast = (schedule: ReunionSchedule) => {
    const now = new Date();
    const scheduleDate = new Date(`${schedule.scheduled_date}T${schedule.scheduled_time}`);
    const endTime = new Date(scheduleDate.getTime() + schedule.duration_minutes * 60000);
    return now > endTime;
  };

  if (loading || error) {
    return <LoadingOrError loading={loading} error={error} />;
  }

  if (!content || !lesson) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <div className="text-5xl mb-3 opacity-20">👥</div>
        <p className="text-xl font-medium">Reunião não encontrada</p>
        <p className="text-base-content/70 mt-2">A reunião solicitada não existe ou você não tem acesso a ela.</p>
        <Link href={`/dashboard/lessons/${lessonId}`} className="btn btn-primary mt-4">
          Voltar para a aula
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/dashboard/lessons/${lessonId}`} className="btn btn-ghost btn-sm gap-1">
          <FaArrowLeft size={12} /> Voltar para a aula
        </Link>
      </div>

      <div className="text-sm breadcrumbs mb-6">
        <ul>
          <li><Link href="/dashboard">Dashboard</Link></li>
          <li><Link href="/dashboard/lessons">Aulas</Link></li>
          <li><Link href={`/dashboard/lessons/${lessonId}`}>{lesson.title}</Link></li>
          <li>Reunião</li>
        </ul>
      </div>

      <div className="bg-base-100 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 rounded-full text-purple-600">
              <FaUsers size={20} />
            </div>
            <h1 className="text-2xl font-bold">{content.reunion_title}</h1>
          </div>

          {content.reunion_description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Descrição</h2>
              <div 
                className="prose max-w-none bg-base-200/50 p-4 rounded-lg"
                dangerouslySetInnerHTML={{ __html: content.reunion_description }}
              ></div>
            </div>
          )}

          {content.schedule && content.schedule.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold mb-3">Cronograma de Reuniões</h2>
              <div className="space-y-4">
                {content.schedule.map((schedule) => {
                  const upcoming = isUpcoming(schedule);
                  const happening = isNow(schedule);
                  const past = isPast(schedule);
                  
                  return (
                    <div 
                      key={schedule.id}
                      className={`border p-4 rounded-lg ${
                        happening ? 'border-success bg-success/10' : 
                        upcoming ? 'border-primary bg-primary/5' : 
                        'border-base-300 bg-base-200/30'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                        <div>
                          <div className="flex items-center gap-2 text-sm mb-1">
                            <FaCalendarAlt /> 
                            <span className="font-medium">{formatDate(schedule.scheduled_date)}</span>
                            
                            {happening && (
                              <span className="badge badge-success gap-1 ml-2">
                                Acontecendo agora
                              </span>
                            )}
                            {upcoming && !happening && (
                              <span className="badge badge-primary gap-1 ml-2">
                                Programada
                              </span>
                            )}
                            {past && (
                              <span className="badge badge-ghost gap-1 ml-2">
                                Concluída
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-sm">
                              <FaClock /> 
                              <span>{formatTime(schedule.scheduled_time)}</span>
                            </div>
                            
                            <div className="text-sm">
                              Duração: {schedule.duration_minutes} minutos
                            </div>
                          </div>
                        </div>
                        
                        {content.reunion_url && (happening || upcoming) && (
                          <a
                            href={content.reunion_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`btn ${happening ? 'btn-success' : 'btn-primary'} btn-sm md:btn-md gap-2`}
                          >
                            <FaExternalLinkAlt />
                            {happening ? 'Entrar na reunião agora' : 'Link da reunião'}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-base-200/30 rounded-lg">
              <p className="text-base-content/70">
                Nenhum horário de reunião foi agendado para este conteúdo.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-sm text-base-content/70">
        <p>Caso tenha problemas para acessar a reunião, entre em contato com o suporte.</p>
      </div>
    </div>
  );
}