"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaChevronLeft, FaSave } from "react-icons/fa";
import Alert from "@/components/Alert";
import LoadingOrError from "@/components/LoadingOrError";
import RichTextEditor from "@/components/RichTextEditor";

interface LessonInfo {
  id: number;
  title: string;
  course_name: string;
}

export default function NewVideoContentPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params?.id as string;
  const contentType = 'video';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [lesson, setLesson] = useState<LessonInfo | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDescription, setVideoDescription] = useState("");

  useEffect(() => {
    async function fetchLessonInfo() {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/lessons/${lessonId}`);
        
        if (!response.ok) {
          throw new Error("Falha ao buscar informações da aula");
        }
        
        const { lesson } = await response.json();
        setLesson(lesson);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (lessonId) {
      fetchLessonInfo();
    }
  }, [lessonId]);

  const validateForm = () => {
    if (!title.trim()) {
      setAlert({ type: "error", message: "O título é obrigatório" });
      return false;
    }

    if (!videoUrl.trim()) {
      setAlert({ type: "error", message: "A URL do vídeo é obrigatória" });
      return false;
    }
    
    // Validação simples de URL
    try {
      new URL(videoUrl);
    } catch {
      setAlert({ type: "error", message: "URL do vídeo inválida" });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      // Criar primeiro o registro básico do conteúdo
      const contentResponse = await fetch(`/api/admin/lessons/contents/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId: Number(lessonId),
          contentType,
        }),
      });
      
      if (!contentResponse.ok) {
        throw new Error("Falha ao criar o conteúdo base");
      }
      
      const { contentId } = await contentResponse.json();
      
      const specificResponse = await fetch(`/api/admin/lessons/contents/video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonContentId: contentId,
          videoTitle: title,
          videoUrl,
          videoContent: videoDescription,
        }),
      });
      
      if (!specificResponse.ok) {
        throw new Error("Falha ao salvar detalhes do vídeo");
      }
      
      setAlert({
        type: "success",
        message: "Vídeo criado com sucesso!",
      });
      
      // Redirecionar para a página da aula após um curto delay
      setTimeout(() => {
        router.push(`/admin/lessons/${lessonId}`);
      }, 1500);
      
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err.message || "Erro ao criar vídeo",
      });
    // Apenas libera o botão em caso de erro
      setSaving(false);
    }
  };

  if (loading || error) {
    return <LoadingOrError loading={loading} error={error} />;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Novo Vídeo
          </h1>
          <p className="text-sm text-gray-500">
            Aula: {lesson?.title}
          </p>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => router.push(`/admin/lessons/${lessonId}`)}
        >
          <FaChevronLeft className="mr-2" /> Voltar
        </button>
      </div>

      <div className="space-y-6">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Título</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do vídeo"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">URL do Vídeo</span>
          </label>
          <input
            type="url"
            className="input input-bordered w-full"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            required
          />
          <label className="label">
            <span className="label-text-alt">Coloque o link do YouTube, Vimeo ou similar</span>
          </label>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Descrição (opcional)</span>
          </label>
          <RichTextEditor
            value={videoDescription}
            onChange={setVideoDescription}
            placeholder="Descreva o conteúdo do vídeo..."
            title="Descrição"
          />
        </div>

        <div className="form-control mt-8">
          <button
            type="button"
            className={`btn btn-primary ${saving ? "loading" : ""}`}
            disabled={saving}
            onClick={handleSubmit}
          >
            {!saving && <FaSave className="mr-2" />}
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}