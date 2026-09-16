"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LoadingOrError from "@/components/LoadingOrError";
import ContentNavigation from "@/components/ContentNavigation";
import { FaArrowLeft, FaVideo } from "react-icons/fa";
import { sanitize } from "@/lib/sanitize";

interface VideoContent {
  id: number;
  lesson_content_id: number;
  video_title: string;
  video_url: string;
  video_content: string;
  created_at: string;
}

interface Lesson {
  id: number;
  title: string;
  lesson_description: string;
  course_name: string;
}

interface AdjacentContent { id: number; content_type: string; }

export default function VideoContentPage() {
  const params = useParams();
  const lessonId = params?.id as string || "";
  const contentId = params?.contentId as string || "";

  const [content, setContent] = useState<VideoContent | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [prevContent, setPrevContent] = useState<AdjacentContent | null>(null);
  const [nextContent, setNextContent] = useState<AdjacentContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideoContent = async () => {
      try {
        const response = await fetch(`/api/lessons/${lessonId}/${contentId}/video`);
        if (!response.ok) {
          throw new Error("Falha ao carregar o conteúdo de vídeo");
        }
        
        const data = await response.json();
        setContent(data.content);
        setLesson(data.lesson);
        setPrevContent(data.prevContent);
        setNextContent(data.nextContent);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId && contentId) {
      fetchVideoContent();
    } else {
      setError("Parâmetros inválidos.");
      setLoading(false);
    }
  }, [lessonId, contentId]);

  // Função para extrair o ID do vídeo e converter para URL de embed
  const getVideoEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // Regex para Google Drive
    const googleDriveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    let match = url.match(googleDriveRegex);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    
    // Regex para lives do YouTube
    const youtubeLiveRegex = /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/;
    match = url.match(youtubeLiveRegex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    
    // Regex para vídeos normais do YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    match = url.match(youtubeRegex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    
    // Se não for do YouTube nem Google Drive, retornar a URL original
    return url;
  };

  if (loading || error) {
    return <LoadingOrError loading={loading} error={error} />;
  }

  if (!content || !lesson) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <p className="text-xl font-medium">Conteúdo não encontrado</p>
        <p className="text-base-content/70 mt-2">O conteúdo solicitado não existe ou você não tem acesso a ele.</p>
        <Link href={`/dashboard/lessons/${lessonId}`} className="btn btn-primary mt-4">
          Voltar para a aula
        </Link>
      </div>
    );
  }

  const embedUrl = getVideoEmbedUrl(content.video_url);

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
          <li>Vídeo</li>
        </ul>
      </div>

      <div className="bg-base-100 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <FaVideo size={20} />
            </div>
            <h1 className="text-2xl font-bold">{content.video_title}</h1>
          </div>
        </div>

        <div className="relative w-full aspect-video">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={content.video_title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            ></iframe>
          ) : (
            <div className="flex items-center justify-center h-full bg-base-200">
              <p className="text-base-content/70">URL do vídeo não disponível ou inválida</p>
            </div>
          )}
        </div>

        {content.video_content && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Descrição</h2>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitize(content.video_content) }}
            ></div>
          </div>
        )}
      </div>

      <ContentNavigation lessonId={lessonId} prevContent={prevContent} nextContent={nextContent} />
    </div>
  );
}