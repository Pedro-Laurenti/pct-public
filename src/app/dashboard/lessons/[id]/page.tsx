"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import LoadingOrError from "@/components/LoadingOrError";
import { FaArrowLeft, FaVideo, FaFileAlt, FaTasks, FaUsers, FaChevronRight } from "react-icons/fa";

interface Lesson {
  id: number;
  title: string;
  lesson_description: string;
  course_id: number;
  course_name: string;
}

interface LessonContent {
  id: number;
  lesson_id: number;
  content_type: "video" | "text" | "activity" | "reunion";
  title: string; 
  description: string;
  completed: boolean;
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params?.id as string | undefined;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [contents, setContents] = useState<LessonContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para armazenar as contagens de cada tipo de conteúdo
  const [contentSummary, setContentSummary] = useState({
    videos: 0,
    texts: 0,
    activities: 0,
    reunions: 0
  });

  if (!lessonId) {
    setError("Parâmetros inválidos ou ausentes.");
    return null;
  }

  useEffect(() => {
    const fetchLessonDetails = async () => {
      try {
        const response = await fetch(`/api/lessons/${lessonId}`);
        if (!response.ok) {
          throw new Error("Falha ao carregar detalhes da aula");
        }
        
        const data = await response.json();
        setLesson(data.lesson);
        setContents(data.contents || []);
        
        // Calcular contagens de cada tipo de conteúdo
        const summary = {
          videos: 0,
          texts: 0,
          activities: 0,
          reunions: 0
        };
        
        data.contents?.forEach((content: LessonContent) => {
          if (content.content_type === 'video') summary.videos++;
          else if (content.content_type === 'text') summary.texts++;
          else if (content.content_type === 'activity') summary.activities++;
          else if (content.content_type === 'reunion') summary.reunions++;
        });
        
        setContentSummary(summary);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLessonDetails();
    }
  }, [lessonId]);

  // Função para retornar o ícone baseado no tipo de conteúdo
  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case "video":
        return <FaVideo className="text-blue-500" />;
      case "text":
        return <FaFileAlt className="text-green-500" />;
      case "activity":
        return <FaTasks className="text-orange-500" />;
      case "reunion":
        return <FaUsers className="text-purple-500" />;
      default:
        return <FaFileAlt className="text-gray-500" />;
    }
  };

  // Função para retornar o rótulo baseado no tipo de conteúdo
  const getContentTypeLabel = (contentType: string) => {
    switch (contentType) {
      case "video":
        return "Vídeo";
      case "text":
        return "Texto";
      case "activity":
        return "Atividade";
      case "reunion":
        return "Reunião";
      default:
        return "Conteúdo";
    }
  };

  // Função para navegar para o tipo específico de conteúdo
  const navigateToContent = (contentId: number, contentType: string) => {
    router.push(`/dashboard/lessons/${lessonId}/${contentId}/${contentType}`);
  };

  if (loading || error) {
    return <LoadingOrError loading={loading} error={error} />;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/lessons" className="btn btn-ghost btn-sm gap-1">
          <FaArrowLeft size={12} /> Voltar para Aulas
        </Link>
      </div>

      {lesson ? (
        <>
          <div className="mb-8">
            <div className="text-sm breadcrumbs">
              <ul>
                <li><Link href="/dashboard">Dashboard</Link></li>
                <li><Link href="/dashboard/lessons">Aulas</Link></li>
                <li>{lesson.course_name}</li>
              </ul>
            </div>

            <h1 className="text-2xl font-bold mt-4">{lesson.title}</h1>
            <p className="mt-2 text-base-content/80">{lesson.lesson_description}</p>
            
            {/* Resumo dos conteúdos */}
            <div className="mt-4 bg-base-200 p-3 rounded-lg">
              <div className="flex flex-wrap gap-3">
                {contentSummary.texts > 0 && (
                  <div className="badge badge-outline gap-1 py-3">
                    <FaFileAlt className="text-green-500" /> {contentSummary.texts} {contentSummary.texts === 1 ? 'texto' : 'textos'}
                  </div>
                )}
                {contentSummary.videos > 0 && (
                  <div className="badge badge-outline gap-1 py-3">
                    <FaVideo className="text-blue-500" /> {contentSummary.videos} {contentSummary.videos === 1 ? 'vídeo' : 'vídeos'}
                  </div>
                )}
                {contentSummary.activities > 0 && (
                  <div className="badge badge-outline gap-1 py-3">
                    <FaTasks className="text-orange-500" /> {contentSummary.activities} {contentSummary.activities === 1 ? 'atividade' : 'atividades'}
                  </div>
                )}
                {contentSummary.reunions > 0 && (
                  <div className="badge badge-outline gap-1 py-3">
                    <FaUsers className="text-purple-500" /> {contentSummary.reunions} {contentSummary.reunions === 1 ? 'reunião' : 'reuniões'}
                  </div>
                )}
                {(contentSummary.texts + contentSummary.videos + contentSummary.activities + contentSummary.reunions) === 0 && (
                  <span className="text-sm text-base-content/70">Nenhum conteúdo disponível</span>
                )}
              </div>
            </div>
          </div>

          <div className="divider">Conteúdos da Aula</div>

          {contents.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xl font-medium">Esta aula ainda não possui conteúdos.</p>
              <p className="text-base-content/70 mt-2">Os conteúdos serão adicionados em breve pelo professor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contents.map((content) => (
                <div
                  key={content.id}
                  className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigateToContent(content.id, content.content_type)}
                >
                  <div className="card-body p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getContentIcon(content.content_type)}
                        </div>
                        <div>
                          <h3 className="font-medium">{content.title}</h3>
                          <div 
                            className="text-sm text-base-content/70 line-clamp-2 my-3"
                            dangerouslySetInnerHTML={{ __html: content.description }}
                          ></div>
                          <span className="badge badge-sm mt-2">
                            {getContentTypeLabel(content.content_type)}
                          </span>
                          {content.completed && (
                            <span className="badge badge-sm badge-success ml-2">Concluído</span>
                          )}
                        </div>
                      </div>
                      <FaChevronRight className="text-primary/70" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10">
          <div className="text-5xl mb-3 opacity-20">🔍</div>
          <p className="text-xl font-medium">Aula não encontrada</p>
          <p className="text-base-content/70 mt-2">A aula solicitada não existe ou você não tem acesso a ela.</p>
          <Link href="/dashboard/lessons" className="btn btn-primary mt-4">
            Ver todas as aulas
          </Link>
        </div>
      )}
    </div>
  );
}