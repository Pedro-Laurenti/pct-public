"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaChevronLeft, FaSave } from "react-icons/fa";
import Alert from "@/components/Alert";
import LoadingOrError from "@/components/LoadingOrError";

interface ActivityContentDetail {
  id: number;
  content_type: 'activity';
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

export default function EditActivityContentPage() {
  const router = useRouter();
  const params = useParams();
  const contentId = params?.contentId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [content, setContent] = useState<ActivityContentDetail | null>(null);

  // Form fields
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

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Buscar detalhes do conteúdo de atividade
        const contentResponse = await fetch(`/api/admin/lessons/contents/content/${contentId}?type=activity`);
        
        if (!contentResponse.ok) {
          throw new Error("Falha ao buscar detalhes do conteúdo");
        }
        
        const { content: contentData } = await contentResponse.json();
        setContent(contentData);
        
        // Preencher os dados do formulário
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
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      const response = await fetch(`/api/admin/lessons/contents/activity/${contentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questions: activityQuestions,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Falha ao atualizar a atividade");
      }
      
      setAlert({
        type: "success",
        message: "Atividade atualizada com sucesso!",
      });
      
      // O botão permanecerá em estado de carregamento/desabilitado até que o redirecionamento ocorra
      setTimeout(() => {
        router.push(`/admin/contents`);
      }, 1500);
      
      // Não definimos setSaving(false) em caso de sucesso, mantendo o botão em estado de carregamento
      
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err.message || "Erro ao atualizar atividade",
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
            Editar Atividade
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