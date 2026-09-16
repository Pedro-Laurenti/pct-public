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
  course_name: string;
}

interface TextContentDetail {
  id: number;
  content_type: 'text';
  title?: string;
  textContent?: string;
}

export default function EditTextContentPage() {
  const router = useRouter();
  const params = useParams();
  const contentId = params?.contentId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [content, setContent] = useState<TextContentDetail | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        
        // Buscar detalhes do conteúdo de texto
        const contentResponse = await fetch(`/api/admin/lessons/contents/content/${contentId}?type=text`);
        
        if (!contentResponse.ok) {
          throw new Error("Falha ao buscar detalhes do conteúdo");
        }
        
        const { content: contentData } = await contentResponse.json();
        setContent(contentData);
        
        // Preencher os dados do formulário
        setTitle(contentData.title || "");
        setTextContent(contentData.textContent || "");
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (contentId) {
      fetchData();
    }
  }, [contentId]);

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
      const response = await fetch(`/api/admin/lessons/contents/text/${contentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          textTitle: title,
          textContent,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Falha ao atualizar o texto");
      }
      
      setAlert({
        type: "success",
        message: "Texto atualizado com sucesso!",
      });
      
      // O botão permanecerá em estado de carregamento/desabilitado até que o redirecionamento ocorra
      setTimeout(() => {
        router.push(`/admin/contents`);
      }, 1500);
      
      // Não definimos setSaving(false) em caso de sucesso, mantendo o botão em estado de carregamento
      
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err.message || "Erro ao atualizar texto",
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
            Editar Texto
          </h1>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => router.push(`/admin/contents`)}
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