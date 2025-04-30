"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LoadingOrError from "@/components/LoadingOrError";
import { FaArrowLeft, FaTasks, FaCheck, FaTimes } from "react-icons/fa";
import Alert from "@/components/Alert";

interface ActivityStatement {
  id: number;
  lesson_content_id: number;
  question_order: number;
  statement_text: string;
  options: ActivityOption[];
}

interface ActivityOption {
  id: number;
  statement_id: number;
  option_order: number;
  option_text: string;
  is_correct: boolean;
  selected?: boolean;
  answered?: boolean;
}

interface Lesson {
  id: number;
  title: string;
  lesson_description: string;
  course_name: string;
}

export default function ActivityContentPage() {
  const params = useParams();
  const lessonId = params?.id as string | undefined;
  const contentId = params?.contentId as string | undefined;

  const [statements, setStatements] = useState<ActivityStatement[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: number]: number }>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<{ [key: number]: boolean }>({});
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  if (!lessonId || !contentId) {
    setError("Parâmetros inválidos ou ausentes.");
    return null;
  }

  useEffect(() => {
    const fetchActivityContent = async () => {
      try {
        const response = await fetch(`/api/lessons/${lessonId}/${contentId}/activity`);
        if (!response.ok) {
          throw new Error("Falha ao carregar a atividade");
        }
        
        const data = await response.json();
        setStatements(data.statements || []);
        setLesson(data.lesson);
        setCompleted(data.completed || false);

        // Se já tiver respostas salvas, popular o estado
        if (data.userAnswers && data.userAnswers.length > 0) {
          const initialSelectedOptions: { [key: number]: number } = {};
          const initialSubmittedAnswers: { [key: number]: boolean } = {};
          
          data.userAnswers.forEach((answer: any) => {
            initialSelectedOptions[answer.statement_id] = answer.option_id;
            initialSubmittedAnswers[answer.statement_id] = true;
          });
          
          setSelectedOptions(initialSelectedOptions);
          setSubmittedAnswers(initialSubmittedAnswers);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId && contentId) {
      fetchActivityContent();
    }
  }, [lessonId, contentId]);

  // Manipular seleção de opção
  const handleOptionSelect = (statementId: number, optionId: number) => {
    // Não permitir mudar se já respondeu esta questão
    if (submittedAnswers[statementId]) return;
    
    setSelectedOptions({
      ...selectedOptions,
      [statementId]: optionId
    });
  };

  // Verificar resposta para um enunciado
  const handleCheckAnswer = async (statement: ActivityStatement) => {
    const selectedOptionId = selectedOptions[statement.id];
    
    // Se nenhuma opção selecionada
    if (!selectedOptionId) {
      setAlert({ type: "error", message: "Selecione uma opção antes de verificar a resposta" });
      return;
    }
    
    try {
      const response = await fetch(`/api/lessons/${lessonId}/${contentId}/activity/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          statement_id: statement.id,
          option_id: selectedOptionId
        })
      });

      if (!response.ok) {
        throw new Error("Falha ao enviar resposta");
      }
      
      const result = await response.json();
      
      // Marcar questão como respondida
      setSubmittedAnswers({
        ...submittedAnswers,
        [statement.id]: true
      });
      
      // Mostrar mensagem de sucesso ou erro
      if (result.correct) {
        setAlert({ type: "success", message: "Resposta correta!" });
      } else {
        setAlert({ type: "error", message: "Resposta incorreta. Tente novamente." });
      }

      // Verificar se todas as questões foram respondidas
      const allAnswered = statements.every(s => submittedAnswers[s.id] || s.id === statement.id);
      if (allAnswered) {
        setCompleted(true);
      }
    } catch (err: any) {
      setAlert({ type: "error", message: err.message });
    }
  };

  if (loading || error) {
    return <LoadingOrError loading={loading} error={error} />;
  }

  if (statements.length === 0 || !lesson) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <div className="text-5xl mb-3 opacity-20">📝</div>
        <p className="text-xl font-medium">Atividade não encontrada</p>
        <p className="text-base-content/70 mt-2">A atividade solicitada não existe ou você não tem acesso a ela.</p>
        <Link href={`/dashboard/lessons/${lessonId}`} className="btn btn-primary mt-4">
          Voltar para a aula
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

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
          <li>Atividade</li>
        </ul>
      </div>

      <div className="bg-base-100 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-full text-orange-600">
              <FaTasks size={20} />
            </div>
            <h1 className="text-2xl font-bold">Atividade</h1>
          </div>
          
          {completed && (
            <div className="badge badge-success gap-1">
              <FaCheck /> Concluída
            </div>
          )}
        </div>

        <div className="divider"></div>

        {/* Lista de enunciados e opções */}
        <div className="space-y-8">
          {statements.map((statement, index) => (
            <div 
              key={statement.id} 
              className={`p-5 rounded-lg ${
                submittedAnswers[statement.id] 
                ? 'bg-base-200' 
                : 'bg-base-100 border border-base-300'
              }`}
            >
              <h3 className="text-lg font-medium mb-4">
                {index + 1}. {statement.statement_text}
              </h3>
              
              <div className="space-y-2 ml-2">
                {statement.options.map((option) => {
                  const isSelected = selectedOptions[statement.id] === option.id;
                  const isAnswered = submittedAnswers[statement.id];
                  const isCorrect = isAnswered && option.is_correct;
                  const isWrong = isAnswered && isSelected && !option.is_correct;
                  
                  return (
                    <div 
                      key={option.id}
                      className={`flex items-center p-3 rounded-md cursor-pointer ${
                        isSelected 
                          ? (isAnswered 
                            ? (isCorrect ? 'bg-success/20' : 'bg-error/20') 
                            : 'bg-primary/20')
                          : (isAnswered && option.is_correct ? 'bg-success/20' : '')
                      } hover:bg-base-200 transition-colors`}
                      onClick={() => handleOptionSelect(statement.id, option.id)}
                    >
                      <div className={`w-5 h-5 rounded-full border ${
                        isSelected 
                          ? (isAnswered 
                            ? (isCorrect ? 'border-success bg-success' : 'border-error bg-error') 
                            : 'border-primary bg-primary')
                          : 'border-base-300'
                      } mr-3 flex items-center justify-center`}>
                        {isSelected && (
                          <span className="text-white text-xs">
                            {isAnswered ? (isCorrect ? '✓' : '✗') : '•'}
                          </span>
                        )}
                        {isAnswered && option.is_correct && !isSelected && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                      
                      <span className={`${
                        isCorrect ? 'text-success' : 
                        isWrong ? 'text-error' : ''
                      }`}>
                        {option.option_text}
                      </span>
                      
                      {isAnswered && (
                        <div className="ml-auto">
                          {option.is_correct && <FaCheck className="text-success" />}
                          {isWrong && <FaTimes className="text-error" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {!submittedAnswers[statement.id] && (
                <button 
                  className="btn btn-primary btn-sm mt-4"
                  onClick={() => handleCheckAnswer(statement)}
                  disabled={!selectedOptions[statement.id]}
                >
                  Verificar Resposta
                </button>
              )}
            </div>
          ))}
        </div>
        
        {completed && (
          <div className="mt-8 text-center">
            <div className="p-4 bg-success/20 rounded-lg">
              <h3 className="text-xl font-bold text-success flex items-center justify-center gap-2">
                <FaCheck /> Atividade Concluída
              </h3>
              <p className="text-base-content/80 mt-2">
                Parabéns! Você completou esta atividade com sucesso.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}