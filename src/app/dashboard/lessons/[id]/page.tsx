"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import LoadingOrError from "@/components/LoadingOrError";
import { FaArrowLeft, FaVideo, FaFileAlt, FaTasks, FaUsers, FaChevronRight, FaCheck } from "react-icons/fa";
import { sanitize } from "@/lib/sanitize";

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

const TYPE_META: Record<string, { icon: JSX.Element; label: string }> = {
  video:    { icon: <FaVideo className="text-info" />,      label: "Vídeo"      },
  text:     { icon: <FaFileAlt className="text-success" />, label: "Texto"      },
  activity: { icon: <FaTasks className="text-warning" />,   label: "Atividade"  },
  reunion:  { icon: <FaUsers className="text-secondary" />, label: "Reunião"    },
};

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params?.id as string | undefined;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [contents, setContents] = useState<LessonContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({ videos: 0, texts: 0, activities: 0, reunions: 0 });

  useEffect(() => {
    if (!lessonId) { setError("Parâmetros inválidos."); setLoading(false); return; }

    fetch(`/api/lessons/${lessonId}`)
      .then(r => { if (!r.ok) throw new Error("Falha ao carregar aula"); return r.json(); })
      .then(data => {
        setLesson(data.lesson);
        setContents(data.contents || []);
        const s = { videos: 0, texts: 0, activities: 0, reunions: 0 };
        data.contents?.forEach((c: LessonContent) => {
          if (c.content_type === "video") s.videos++;
          else if (c.content_type === "text") s.texts++;
          else if (c.content_type === "activity") s.activities++;
          else if (c.content_type === "reunion") s.reunions++;
        });
        setSummary(s);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading || error) return <LoadingOrError loading={loading} error={error} />;

  if (!lesson) return (
    <div className="max-w-2xl mx-auto px-6 py-12 text-center">
      <p className="font-serif text-xl">Aula não encontrada</p>
      <p className="text-base-content/50 text-sm mt-2">A aula solicitada não existe ou você não tem acesso.</p>
      <Link href="/dashboard/lessons" className="btn btn-primary btn-sm mt-6">Ver todas as aulas</Link>
    </div>
  );

  const totalContents = summary.videos + summary.texts + summary.activities + summary.reunions;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">

      {/* Navegação */}
      <Link href="/dashboard/lessons" className="inline-flex items-center gap-1.5 text-xs text-base-content/40 hover:text-primary transition-colors mb-8">
        <FaArrowLeft className="text-[10px]" /> {lesson.course_name}
      </Link>

      {/* Cabeçalho */}
      <header className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl leading-tight">{lesson.title}</h1>
        {lesson.lesson_description && (
          <p className="mt-3 text-sm text-base-content/60 leading-relaxed">{lesson.lesson_description}</p>
        )}

        {/* Resumo de conteúdos */}
        {totalContents > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {summary.texts > 0 && (
              <span className="badge badge-outline gap-1">
                <FaFileAlt className="text-success text-[10px]" />
                {summary.texts} {summary.texts === 1 ? "texto" : "textos"}
              </span>
            )}
            {summary.videos > 0 && (
              <span className="badge badge-outline gap-1">
                <FaVideo className="text-info text-[10px]" />
                {summary.videos} {summary.videos === 1 ? "vídeo" : "vídeos"}
              </span>
            )}
            {summary.activities > 0 && (
              <span className="badge badge-outline gap-1">
                <FaTasks className="text-warning text-[10px]" />
                {summary.activities} {summary.activities === 1 ? "atividade" : "atividades"}
              </span>
            )}
            {summary.reunions > 0 && (
              <span className="badge badge-outline gap-1">
                <FaUsers className="text-secondary text-[10px]" />
                {summary.reunions} {summary.reunions === 1 ? "reunião" : "reuniões"}
              </span>
            )}
          </div>
        )}
      </header>

      {/* Lista de conteúdos */}
      {contents.length === 0 ? (
        <div className="border border-base-content/8 p-8 text-center">
          <p className="font-serif text-lg text-base-content/60">Esta aula ainda não possui conteúdos.</p>
          <p className="text-xs text-base-content/40 mt-2">Os conteúdos serão adicionados em breve.</p>
        </div>
      ) : (
        <div className="border border-base-content/8 divide-y divide-base-content/8">
          {contents.map((content) => {
            const meta = TYPE_META[content.content_type] ?? { icon: <FaFileAlt className="text-base-content/40" />, label: "Conteúdo" };
            return (
              <button
                key={content.id}
                className="w-full flex items-center gap-4 p-4 hover:bg-base-200/50 transition-colors text-left group"
                onClick={() => router.push(`/dashboard/lessons/${lessonId}/${content.id}/${content.content_type}`)}
              >
                <span className="shrink-0 text-base mt-0.5">{meta.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{content.title}</p>
                  {content.description && (
                    <div
                      className="text-xs text-base-content/50 line-clamp-1 mt-0.5"
                      dangerouslySetInnerHTML={{ __html: sanitize(content.description) }}
                    />
                  )}
                  <span className="text-[0.6rem] uppercase tracking-widest text-base-content/30 mt-1 block">
                    {meta.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {content.completed && (
                    <FaCheck className="text-success text-xs" title="Concluído" />
                  )}
                  <FaChevronRight className="text-base-content/20 group-hover:text-primary transition-colors text-xs" />
                </div>
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
}
