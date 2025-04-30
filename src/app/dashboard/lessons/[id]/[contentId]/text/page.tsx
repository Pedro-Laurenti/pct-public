"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LoadingOrError from "@/components/LoadingOrError";
import { FaArrowLeft, FaFileAlt } from "react-icons/fa";

interface TextContent {
  id: number;
  lesson_content_id: number;
  text_title: string;
  text_content: string;
  created_at: string;
}

interface Lesson {
  id: number;
  title: string;
  lesson_description: string;
  course_name: string;
}

export default function TextContentPage() {
  const params = useParams();
  const lessonId = params?.id as string | undefined;
  const contentId = params?.contentId as string | undefined;

  const [content, setContent] = useState<TextContent | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!lessonId || !contentId) {
    setError("Parâmetros inválidos.");
    setLoading(false);
    return null;
  }

  useEffect(() => {
    const fetchTextContent = async () => {
      try {
        const response = await fetch(`/api/lessons/${lessonId}/${contentId}/text`);
        if (!response.ok) {
          throw new Error("Falha ao carregar o conteúdo de texto");
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
      fetchTextContent();
    }
  }, [lessonId, contentId]);

  if (loading || error) {
    return <LoadingOrError loading={loading} error={error} />;
  }

  if (!content || !lesson) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <div className="text-5xl mb-3 opacity-20">📄</div>
        <p className="text-xl font-medium">Conteúdo não encontrado</p>
        <p className="text-base-content/70 mt-2">O conteúdo solicitado não existe ou você não tem acesso a ele.</p>
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
          <li>Conteúdo de Texto</li>
        </ul>
      </div>

      <div className="bg-base-100 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <FaFileAlt size={20} />
          </div>
          <h1 className="text-2xl font-bold">{content.text_title}</h1>
        </div>

        <div className="divider"></div>

        {/* Conteúdo de texto com suporte a HTML */}
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content.text_content }}
        ></div>
      </div>
    </div>
  );
}