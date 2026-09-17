"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FaChevronLeft, FaSave } from "react-icons/fa";
import Alert from "@/components/Alert";
import LoadingOrError from "@/components/LoadingOrError";
import RichTextEditor from "@/components/RichTextEditor";

interface LessonInfo {
  id: number;
  title: string;
  course_name: string;
}

interface ContentDetail {
  id: number;
  content_type: 'video' | 'text' | 'activity' | 'reunion';
  title?: string;
  description?: string;
  url?: string;
  textContent?: string;
  videoContent?: string;
  reunionDescription?: string;
  date?: string;
  time?: string;
  duration?: number;
  questions?: {
    id: number;
    statement: string;
    options: {
      id: number;
      text: string;
      correct: boolean;
    }[];
  }[];
}

export default function EditContentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const lessonId = params?.id as string;
  const contentId = params?.contentId as string;
  const contentType = searchParams?.get('type') || 'text';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [lesson, setLesson] = useState<LessonInfo | null>(null);
  const [content, setContent] = useState<ContentDetail | null>(null);

  // Form fields common to all content types
  const [title, setTitle] = useState("");
  
  // Fields for text content
  const [textContent, setTextContent] = useState("");
  
  // Fields for video content
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  
  // Fields for activity content
  const [activityQuestions, setActivityQuestions] = useState<{
    id?: number;
    statement: string;
    options: {
      id?: number;
      text: string;
      correct: boolean;
    }[];
  }[]>([
    { statement: "", options: [{ text: "", correct: false }, { text: "", correct: false }] }
  ]);
  
  // Fields for reunion content
  const [reunionUrl, setReunionUrl] = useState("");
  const [reunionDescription, setReunionDescription] = useState("");
  const [reunionDate, setReunionDate] = useState("");
  const [reunionTime, setReunionTime] = useState("");
  const [reunionDuration, setReunionDuration] = useState(60);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Buscar informações da aula
        const lessonResponse = await fetch(`/api/admin/lessons/${lessonId}`);
        
        if (!lessonResponse.ok) {
          throw new Error("Falha ao buscar informações da aula");
        }
        
        const { lesson } = await lessonResponse.json();
        setLesson(lesson);
        
        // Buscar detalhes do conteúdo
        const contentResponse = await fetch(`/api/admin/lessons/contents/content/${contentId}?type=${contentType}`);
        
        if (!contentResponse.ok) {
          throw new Error("Falha ao buscar detalhes do conteúdo");
        }
        
        const { content: contentData } = await contentResponse.json();
        setContent(contentData);
        
        // Preencher os dados do formulário com base no tipo
        setTitle(contentData.title || "");
        
        switch (contentType) {
          case "text":
            setTextContent(contentData.textContent || "");
            break;
            
          case "video":
            setVideoUrl(contentData.url || "");
            setVideoDescription(contentData.description || contentData.videoContent || "");
            break;
            
          case "reunion":
            if (contentData.date) {
              const dateObj = new Date(contentData.date);
              setReunionDate(dateObj.toISOString().split('T')[0]);
              
              // Formato HH:MM
              const hours = dateObj.getHours().toString().padStart(2, '0');
              const minutes = dateObj.getMinutes().toString().padStart(2, '0');
              setReunionTime(`${hours}:${minutes}`);
            }
            
            setReunionDuration(contentData.duration || 60);
            break;
            
          case "activity":
            if (contentData.questions && contentData.questions.length > 0) {
              setActivityQuestions(contentData.questions.map((q: { id: any; statement: any; options: any[]; }) => ({
                id: q.id,
                statement: q.statement,
                options: q.options.map((opt: { id: any; text: any; correct: any; }) => ({
                  id: opt.id,
                  text: opt.text,
                  correct: opt.correct
                }))
              })));
            }
            break;
        }
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (lessonId && contentId) {
      fetchData();
    }
  }, [lessonId, contentId, contentType]);

  const getContentTypeLabel = (type: string): string => {
    switch (type) {
      case "video": return "Vídeo";
      case "text": return "Texto";
      case "activity": return "Atividade";
      case "reunion": return "Reunião";
      default: return type;
    }
  };

  const handleAddOption = (questionIndex: number) => {
    const newQuestions = [...activityQuestions];
    newQuestions[questionIndex].options.push({ text: "", correct: false });
    setActivityQuestions(newQuestions);
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...activityQuestions];
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    setActivityQuestions(newQuestions);
  };

  const handleAddQuestion = () => {
    setActivityQuestions([
      ...activityQuestions,
      { statement: "", options: [{ text: "", correct: false }, { text: "", correct: false }] }
    ]);
  };

  const handleRemoveQuestion = (questionIndex: number) => {
    const newQuestions = [...activityQuestions];
    newQuestions.splice(questionIndex, 1);
    setActivityQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, field: keyof typeof activityQuestions[number]['options'][number], value: string | boolean) => {
    const newQuestions = [...activityQuestions];
    newQuestions[questionIndex].options[optionIndex][field] = value as never;
    setActivityQuestions(newQuestions);
  };

  const handleStatementChange = (questionIndex: number, value: string) => {
    const newQuestions = [...activityQuestions];
    newQuestions[questionIndex].statement = value;
    setActivityQuestions(newQuestions);
  };

  const validateForm = () => {
    // Validação comum para todos os tipos
    if (!title.trim()) {
      setAlert({ type: "error", message: "O título é obrigatório" });
      return false;
    }

    // Validações específicas por tipo de conteúdo
    switch (contentType) {
      case "text":
        if (!textContent.trim()) {
          setAlert({ type: "error", message: "O conteúdo do texto é obrigatório" });
          return false;
        }
        break;
        
      case "video":
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
        break;
        
      case "activity":
        if (activityQuestions.length === 0) {
          setAlert({ type: "error", message: "Adicione pelo menos uma pergunta" });
          return false;
        }
        
        for (let i = 0; i < activityQuestions.length; i++) {
          const question = activityQuestions[i];
          
          if (!question.statement.trim()) {
            setAlert({ type: "error", message: `O enunciado da pergunta ${i + 1} é obrigatório` });
            return false;
          }
          
          if (question.options.length < 2) {
            setAlert({ type: "error", message: `Adicione pelo menos 2 opções para a pergunta ${i + 1}` });
            return false;
          }
          
          const hasCorrectOption = question.options.some(opt => opt.correct);
          if (!hasCorrectOption) {
            setAlert({ type: "error", message: `Selecione pelo menos uma opção correta para a pergunta ${i + 1}` });
            return false;
          }
          
          for (let j = 0; j < question.options.length; j++) {
            if (!question.options[j].text.trim()) {
              setAlert({ type: "error", message: `O texto da opção ${j + 1} na pergunta ${i + 1} é obrigatório` });
              return false;
            }
          }
        }
        break;
        
      case "reunion":
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
        break;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      // Dependendo do tipo, enviar para a endpoint específica
      let specificResponse;
      
      switch (contentType) {
        case "text":
          specificResponse = await fetch(`/api/admin/lessons/contents/text/${contentId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              textTitle: title,
              textContent,
            }),
          });
          break;
          
        case "video":
          specificResponse = await fetch(`/api/admin/lessons/contents/video/${contentId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              videoTitle: title,
              videoUrl,
              videoContent: videoDescription,
            }),
          });
          break;
          
        case "activity":
          specificResponse = await fetch(`/api/admin/lessons/contents/activity/${contentId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title,
              questions: activityQuestions,
            }),
          });
          break;
          
        case "reunion":
          const dateTime = new Date(`${reunionDate}T${reunionTime}`);
          
          specificResponse = await fetch(`/api/admin/lessons/contents/reunion/${contentId}`, {
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
          break;
      }
      
      if (!specificResponse || !specificResponse.ok) {
        throw new Error(`Falha ao atualizar o ${getContentTypeLabel(contentType).toLowerCase()}`);
      }
      
      setAlert({
        type: "success",
        message: `${getContentTypeLabel(contentType)} atualizado com sucesso!`,
      });
      
      // Redirecionar para a página da aula após um curto delay
      setTimeout(() => {
        router.push(`/admin/lessons/${lessonId}`);
      }, 1500);
      
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err.message || `Erro ao atualizar ${getContentTypeLabel(contentType).toLowerCase()}`,
      });
    } finally {
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
            Editar {getContentTypeLabel(contentType)}
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

      {/* Usamos div em vez de form para evitar submissão acidental */}
      <div className="space-y-6">
        {/* Título comum a todos os tipos */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Título</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`Título do ${getContentTypeLabel(contentType).toLowerCase()}`}
            required
          />
        </div>

        {/* Formulários específicos por tipo */}
        {contentType === "text" && (
          <div className="form-control">
            <label className="label">
              <span className="label-text">Conteúdo</span>
            </label>
            <RichTextEditor 
              value={textContent}
              onChange={setTextContent}
              placeholder="Digite o conteúdo de texto aqui..."
              title="Editor de Texto"
            />
          </div>
        )}

        {contentType === "video" && (
          <>
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
          </>
        )}

        {contentType === "activity" && (
          <div className="space-y-8">
            {activityQuestions.map((question, qIndex) => (
              <div key={qIndex} className="card bg-base-200 shadow-sm p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Pergunta {qIndex + 1}</h3>
                  {activityQuestions.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-error"
                      onClick={() => handleRemoveQuestion(qIndex)}
                    >
                      Remover Pergunta
                    </button>
                  )}
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Enunciado da pergunta</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24"
                    value={question.statement}
                    onChange={(e) => handleStatementChange(qIndex, e.target.value)}
                    placeholder="Digite o enunciado da pergunta..."
                    required
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Opções</h4>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-4">
                      <div className="form-control flex-1">
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={option.text}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, 'text', e.target.value)}
                          placeholder={`Opção ${oIndex + 1}`}
                          required
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="label cursor-pointer gap-2">
                          <span className="label-text">Correta</span>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary"
                            checked={option.correct}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, 'correct', e.target.checked)}
                          />
                        </label>

                        {question.options.length > 2 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline btn-error"
                            onClick={() => handleRemoveOption(qIndex, oIndex)}
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-sm btn-outline btn-success mt-2"
                    onClick={() => handleAddOption(qIndex)}
                  >
                    Adicionar Opção
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-outline w-full"
              onClick={handleAddQuestion}
            >
              Adicionar Nova Pergunta
            </button>
          </div>
        )}

        {contentType === "reunion" && (
          <>
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
          </>
        )}

        <div className="form-control mt-8">
          <button
            type="button" // Usamos type="button" em vez de "submit" para evitar submissão automática
            className={`btn btn-primary ${saving ? "loading" : ""}`}
            disabled={saving}
            onClick={handleSubmit} // Adicionamos onClick para controlar quando o formulário é enviado
          >
            {!saving && <FaSave className="mr-2" />}
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}