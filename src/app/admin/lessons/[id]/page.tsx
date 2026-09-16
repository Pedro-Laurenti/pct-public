"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Alert from "@/components/Alert";

interface LessonInfo {
  id: number;
  title: string;
}

interface LessonContent {
  id: number;
  content_type: 'video' | 'text' | 'activity' | 'reunion';
  title?: string;
  url?: string;
  description?: string;
  created_at: string;
}

export default function LessonContentsPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params?.id as string;

  const [lesson, setLesson] = useState<LessonInfo | null>(null);
  const [contents, setContents] = useState<LessonContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentToDelete, setContentToDelete] = useState<LessonContent | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    async function fetchLessonContents() {
      try {
        const response = await fetch(`/api/admin/lessons/contents/${lessonId}`);
        
        if (!response.ok) {
          throw new Error(response.status === 404 
            ? "Aula não encontrada" 
            : "Falha ao buscar conteúdos da aula");
        }

        const data = await response.json();
        setLesson(data.lesson);
        setContents(data.contents);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (lessonId) {
      fetchLessonContents();
    }
  }, [lessonId]);

  const handleDeleteContent = async () => {
    if (!contentToDelete) return;

    try {
      const response = await fetch(`/api/admin/lessons/contents/content/${contentToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir o conteúdo.");
      }

      setContents(contents.filter((content) => content.id !== contentToDelete.id));
      setAlert({ type: "success", message: "Conteúdo excluído com sucesso!" });
    } catch (err: any) {
      setAlert({ type: "error", message: `Falha ao excluir o conteúdo: ${err.message}` });
    } finally {
      setContentToDelete(null);
    }
  };

  const getContentTypeLabel = (type: string): string => {
    switch (type) {
      case "video": return "Vídeo";
      case "text": return "Texto";
      case "activity": return "Atividade";
      case "reunion": return "Reunião";
      default: return type;
    }
  };

  if (loading) return <div className="text-center p-10">Carregando...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-8">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{lesson?.title} - Conteúdos</h1>
        <button
          className="btn btn-outline"
          onClick={() => router.push('/admin/lessons')}
        >
          Voltar
        </button>
      </div>

      {/* Header actions */}
      <div className="flex justify-between items-center">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-primary">
            <FaPlus className="mr-2" /> Novo Conteúdo
          </label>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10">
            <li><button onClick={() => router.push(`/admin/lessons/${lessonId}/new/text`)}>Texto</button></li>
            <li><button onClick={() => router.push(`/admin/lessons/${lessonId}/new/video`)}>Vídeo</button></li>
            <li><button onClick={() => router.push(`/admin/lessons/${lessonId}/new/activity`)}>Atividade</button></li>
            <li><button onClick={() => router.push(`/admin/lessons/${lessonId}/new/reunion`)}>Reunião</button></li>
          </ul>
        </div>
      </div>
      
      {/* Contents table */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Título</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {contents.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  Nenhum conteúdo encontrado para esta aula.
                </td>
              </tr>
            ) : (
              contents.map((content) => (
                <tr key={content.id}>
                  <td>{content.id}</td>
                  <td>
                    <span className="badge badge-ghost">
                      {getContentTypeLabel(content.content_type)}
                    </span>
                  </td>
                  <td>{content.title || "-"}</td>
                  <td>{new Date(content.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="flex gap-2">
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => router.push(`/admin/lessons/${lessonId}/edit/${content.content_type}/${content.id}`)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-ghost text-error"
                      onClick={() => setContentToDelete(content)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Delete confirmation modal */}
      {contentToDelete && (
        <dialog id="delete_modal" className="modal modal-bottom sm:modal-middle" open>
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirmar Exclusão</h3>
            <p className="py-4">
              Tem certeza de que deseja excluir{" "}
              <strong>{contentToDelete.title || `#${contentToDelete.id}`}</strong>?
              {contentToDelete.content_type === 'activity' && (
                <span className="block mt-2 text-warning">
                  Atenção: Esta ação excluirá todas as perguntas e alternativas associadas.
                </span>
              )}
            </p>
            <div className="modal-action">
              <button
                className="btn btn-error"
                onClick={handleDeleteContent}
              >
                Excluir
              </button>
              <button
                className="btn"
                onClick={() => setContentToDelete(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}