"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaChevronLeft, FaSave, FaEye, FaEdit } from "react-icons/fa";
import Alert from "@/components/Alert";
import LoadingOrError from "@/components/LoadingOrError";
import RichTextEditor from "@/components/RichTextEditor";

interface LessonInfo {
  id: number;
  title: string;
  class_name: string;
}

export default function NewTextContentPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params?.lessonId as string;
  const contentType = 'text';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [lessonInfo, setLessonInfo] = useState<LessonInfo | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");

  useEffect(() => {
    async function fetchLessonInfo() {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/lessons/${lessonId}`);
        
        if (!response.ok) {
          throw new Error("Falha ao buscar informações da lição");
        }
        
        const { lesson: lessonData } = await response.json();
        setLessonInfo(lessonData);
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

    if (!textContent.trim()) {
      setAlert({ type: "error", message: "O conteúdo do texto é obrigatório" });
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
      
      const specificResponse = await fetch(`/api/admin/lessons/contents/text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonContentId: contentId,
          textTitle: title,
          textContent,
        }),
      });
      
      if (!specificResponse.ok) {
        throw new Error("Falha ao salvar detalhes do texto");
      }
      
      setAlert({
        type: "success",
        message: "Texto criado com sucesso!",
      });
      
      // Redirecionar para a página da lição após um curto delay
      setTimeout(() => {
        router.push(`/admin/lessons/${lessonId}`);
      }, 1500);
      
      // Não definimos setSaving(false) em caso de sucesso, mantendo o botão em estado de carregamento
      
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err.message || "Erro ao criar texto",
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
            Novo Texto
          </h1>
          <p className="text-sm text-gray-500">
            Lição: {lessonInfo?.title}
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
            placeholder="Título do texto"
            required
          />
        </div>

        <div className="form-control">
          <div className="flex justify-between items-center mb-1">
            <label className="label-text label">Conteúdo</label>
            <button
              type="button"
              className="btn btn-sm btn-ghost gap-2"
              onClick={() => setIsPreview((v) => !v)}
            >
              {isPreview ? <><FaEdit /> Editar</> : <><FaEye /> Visualizar</>}
            </button>
          </div>
          {isPreview ? (
            <div className="prose max-w-none border border-base-300 rounded-lg p-4 min-h-50 bg-base-100" dangerouslySetInnerHTML={{ __html: textContent }} />
          ) : (
            <RichTextEditor
              value={textContent}
              onChange={setTextContent}
              placeholder="Digite o conteúdo de texto aqui..."
              title="Editor de Texto"
            />
          )}
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