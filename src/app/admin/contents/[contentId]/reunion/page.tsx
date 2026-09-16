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

interface ReunionContentDetail {
  id: number;
  content_type: 'reunion';
  title?: string;
  description?: string;
  reunionDescription?: string;
  url?: string;
  date?: string;
  time?: string;
  duration?: number;
}

export default function EditReunionContentPage() {
  const router = useRouter();
  const params = useParams();
  const contentId = params?.contentId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [content, setContent] = useState<ReunionContentDetail | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [reunionUrl, setReunionUrl] = useState("");
  const [reunionDescription, setReunionDescription] = useState("");
  const [reunionDate, setReunionDate] = useState("");
  const [reunionTime, setReunionTime] = useState("");
  const [reunionDuration, setReunionDuration] = useState(60);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        
        // Buscar detalhes do conteúdo de reunião
        const contentResponse = await fetch(`/api/admin/lessons/contents/content/${contentId}?type=reunion`);
        
        if (!contentResponse.ok) {
          throw new Error("Falha ao buscar detalhes do conteúdo");
        }
        
        const { content: contentData } = await contentResponse.json();
        setContent(contentData);
        
        // Preencher os dados do formulário
        setTitle(contentData.title || "");
        setReunionUrl(contentData.url || "");
        setReunionDescription(contentData.description || contentData.reunionDescription || "");
        
        if (contentData.date) {
          const dateObj = new Date(contentData.date);
          setReunionDate(dateObj.toISOString().split('T')[0]);
          
          // Formato HH:MM
          const hours = dateObj.getHours().toString().padStart(2, '0');
          const minutes = dateObj.getMinutes().toString().padStart(2, '0');
          setReunionTime(`${hours}:${minutes}`);
        }
        
        setReunionDuration(contentData.duration || 60);
        
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

    if (!reunionUrl.trim()) {
      setAlert({ type: "error", message: "A URL da reunião é obrigatória" });
      return false;
    }
    
    if (!reunionDate.trim()) {
      setAlert({ type: "error", message: "A data da reunião é obrigatória" });
      return false;
    }
    
    if (!reunionTime.trim()) {
      setAlert({ type: "error", message: "O horário da reunião é obrigatório" });
      return false;
    }
    
    if (!reunionDuration || reunionDuration <= 0) {
      setAlert({ type: "error", message: "A duração da reunião deve ser positiva" });
      return false;
    }
    
    try {
      new URL(reunionUrl);
    } catch {
      setAlert({ type: "error", message: "URL da reunião inválida" });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      const dateTime = new Date(`${reunionDate}T${reunionTime}`);
      
      const response = await fetch(`/api/admin/lessons/contents/reunion/${contentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reunionTitle: title,
          reunionUrl,
          reunionDescription,
          date: dateTime.toISOString(),
          durationMinutes: reunionDuration,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Falha ao atualizar a reunião");
      }
      
      setAlert({
        type: "success",
        message: "Reunião atualizada com sucesso!",
      });
      
      // O botão permanecerá em estado de carregamento/desabilitado até que o redirecionamento ocorra
      setTimeout(() => {
        router.push(`/admin/contents/`);
      }, 1500);
      
      // Não definimos setSaving(false) em caso de sucesso, mantendo o botão em estado de carregamento
    
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err.message || "Erro ao atualizar reunião",
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
            Editar Reunião
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
            placeholder="Título da reunião"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">URL da Reunião</span>
          </label>
          <input
            type="url"
            className="input input-bordered w-full"
            value={reunionUrl}
            onChange={(e) => setReunionUrl(e.target.value)}
            placeholder="https://meet.google.com/..."
            required
          />
          <label className="label">
            <span className="label-text-alt">Link para Google Meet, Zoom, Microsoft Teams, etc.</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Data</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={reunionDate}
              onChange={(e) => setReunionDate(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Horário</span>
            </label>
            <input
              type="time"
              className="input input-bordered w-full"
              value={reunionTime}
              onChange={(e) => setReunionTime(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Duração (minutos)</span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={reunionDuration}
              onChange={(e) => setReunionDuration(Number(e.target.value))}
              min="1"
              required
            />
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Descrição (opcional)</span>
          </label>
          <RichTextEditor
            value={reunionDescription}
            onChange={setReunionDescription}
            placeholder="Descreva o propósito e pautas da reunião..."
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