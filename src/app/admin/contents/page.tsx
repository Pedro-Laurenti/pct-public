"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Alert from "@/components/Alert";

interface ContentItem {
  content_id: number;
  content_type: 'video' | 'text' | 'activity' | 'reunion';
  lesson_id: number;
  lesson_title: string;
  class_names: string;
  title?: string;
  created_at: string;
}

export default function ContentsPage() {
  const router = useRouter();

  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentToDelete, setContentToDelete] = useState<ContentItem | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    async function fetchContents() {
      try {
        const response = await fetch('/api/admin/contents');
        
        if (!response.ok) {
          throw new Error("Falha ao buscar conteúdos");
        }

        const data = await response.json();
        setContents(data.contents);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchContents();
  }, []);

  const handleDeleteContent = async () => {
    if (!contentToDelete) return;

    try {
      const response = await fetch(`/api/admin/lessons/contents/content/${contentToDelete.content_id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir o conteúdo.");
      }

      setContents(contents.filter((content) => content.content_id !== contentToDelete.content_id));
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
        <h1 className="text-2xl font-bold">Todos os Conteúdos</h1>
      </div>

      {/* Header actions */}
      <div className="flex justify-between items-center">
        <button
          className="btn btn-primary"
          onClick={() => router.push('/admin/contents/new')}
        >
          <FaPlus className="mr-2" /> Criar Conteúdo
        </button>
      </div>
      
      {/* Contents table */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>ID do Conteúdo</th>
              <th>Título da Aula</th>
              <th>Turma</th>
              <th>Tipo de Conteúdo</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {contents.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Nenhum conteúdo encontrado.
                </td>
              </tr>
            ) : (
              contents.map((content) => (
                <tr key={content.content_id}>
                  <td>{content.content_id}</td>
                  <td>{content.lesson_title}</td>
                  <td>{content.class_names || "-"}</td>
                  <td>
                    <span className="badge badge-ghost">
                      {getContentTypeLabel(content.content_type)}
                    </span>
                  </td>
                  <td>{new Date(content.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="flex gap-2">
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => router.push(`/admin/contents/${content.content_id}/${content.content_type}`)}
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
              Tem certeza de que deseja excluir o conteúdo{" "}
              <strong>#{contentToDelete.content_id}</strong> da aula <strong>{contentToDelete.lesson_title}</strong>?
              {contentToDelete.content_type === 'activity' && (
                <span className="block mt-2 text-warning">
                  Atenção: Esta ação excluirá todas as perguntas e alternativas associadas.
                </span>
              )}
            </p>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setContentToDelete(null)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-error"
                onClick={handleDeleteContent}
              >
                Excluir
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}