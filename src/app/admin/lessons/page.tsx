"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaFilter, FaTimes, FaTrash, FaBook } from "react-icons/fa";
import { SlOptionsVertical } from "react-icons/sl";
import Alert from "@/components/Alert";
import { FaPencil } from "react-icons/fa6";
import LoadingOrError from "@/components/LoadingOrError";
import { useRouter } from "next/navigation";

interface Lesson {
    id: number;
    title: string;
    lesson_description: string | null;
    course_name: string;
}

interface SearchFilter {
    column: string;
    operator: "equals" | "contains" | "notEquals" | "startsWith";
    term: string;
}

export default function LessonsPage() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [sortColumn, setSortColumn] = useState<string>("id");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const router = useRouter();

    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchColumn, setSearchColumn] = useState<string>("title");
    const [searchOperator, setSearchOperator] = useState<"equals" | "contains" | "notEquals" | "startsWith">("contains");
    const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);

    useEffect(() => {
        async function fetchLessons() {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                    sortColumn,
                    sortDirection,
                });

                if (activeFilters.length > 0) {
                    queryParams.append("filters", JSON.stringify(activeFilters));
                }

                const response = await fetch(`/api/admin/lessons?${queryParams.toString()}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch lessons");
                }

                const data = await response.json();
                setLessons(data.lessons);
                setTotal(data.total);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchLessons();
    }, [page, limit, sortColumn, sortDirection, activeFilters]);

    const handleAddFilter = () => {
        if (searchTerm.trim()) {
            const newFilter: SearchFilter = {
                column: searchColumn,
                operator: searchOperator,
                term: searchTerm,
            };

            setActiveFilters([...activeFilters, newFilter]);
            setSearchTerm("");
            setPage(1);
        }
    };

    const handleRemoveFilter = (index: number) => {
        const newFilters = [...activeFilters];
        newFilters.splice(index, 1);
        setActiveFilters(newFilters);
        setPage(1);
    };

    const handleClearAllFilters = () => {
        setActiveFilters([]);
        setPage(1);
    };

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    const handleDeleteLesson = async () => {
        if (!lessonToDelete) return;

        try {
            const response = await fetch(`/api/admin/lessons/${lessonToDelete.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Erro ao excluir a aula.");
            }

            setLessons(lessons.filter((lesson) => lesson.id !== lessonToDelete.id));
            setAlert({ type: "success", message: "Aula excluída com sucesso!" });
        } catch (err) {
            setAlert({ type: "error", message: "Falha ao excluir a aula." });
        } finally {
            setLessonToDelete(null);
        }
    };

    const totalPages = Math.ceil(total / limit);

    if (loading || error) {
        return <LoadingOrError loading={loading} error={error} />;
    }

    return (
        <div className="p-6 space-y-8">
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            <h1 className="text-2xl font-bold mb-4">Aulas</h1>

            <div className="flex justify-between items-center mb-4">
                <button
                    className="btn btn-primary flex items-center gap-2"
                    onClick={() => router.push("/admin/lessons/new")}
                >
                    <FaPlus /> Nova Aula
                </button>

                <button
                    className="btn btn-outline flex items-center gap-2"
                    onClick={() => (document.getElementById("filter_modal") as HTMLDialogElement)?.showModal()}
                >
                    <FaFilter /> Filtrar
                </button>
            </div>

            {activeFilters.length > 0 && (
                <div className="my-4 w-full flex flex-row-reverse">
                    <div className="flex flex-wrap gap-2 items-center">
                        {activeFilters.map((filter, index) => (
                            <span
                                key={index}
                                className="badge badge-primary badge-outline py-3 px-3 flex items-center gap-2"
                            >
                                {filter.column} {filter.operator} "{filter.term}"
                                <button
                                    onClick={() => handleRemoveFilter(index)}
                                    className="ml-1"
                                >
                                    <FaTimes className="hover:cursor-pointer" />
                                </button>
                            </span>
                        ))}
                        {activeFilters.length > 1 && (
                            <button
                                className="btn btn-sm btn-ghost text-error"
                                onClick={handleClearAllFilters}
                            >
                                Limpar todos
                            </button>
                        )}
                    </div>
                </div>
            )}

            <dialog id="filter_modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h3 className="text-lg font-bold mb-4">Adicionar Filtro</h3>

                    <div className="form-control mb-2">
                        <label className="label">
                            <span className="label-text">Coluna</span>
                        </label>
                        <select
                            className="select select-bordered w-full"
                            value={searchColumn}
                            onChange={(e) => setSearchColumn(e.target.value)}
                        >
                            <option value="id">ID</option>
                            <option value="title">Título</option>
                            <option value="lesson_description">Descrição</option>
                            <option value="course_name">Curso</option>
                        </select>
                    </div>

                    <div className="form-control mb-2">
                        <label className="label">
                            <span className="label-text">Operador</span>
                        </label>
                        <select
                            className="select select-bordered w-full"
                            value={searchOperator}
                            onChange={(e) => setSearchOperator(e.target.value as any)}
                        >
                            <option value="contains">Contém</option>
                            <option value="equals">Igual a</option>
                            <option value="notEquals">Diferente de</option>
                            <option value="startsWith">Começa com</option>
                        </select>
                    </div>

                    <div className="form-control mb-4">
                        <label className="label">
                            <span className="label-text">Valor</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Digite o valor..."
                        />
                    </div>

                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Cancelar</button>
                        </form>
                        <button
                            className="btn btn-primary"
                            onClick={handleAddFilter}
                            disabled={!searchTerm.trim()}
                        >
                            Adicionar Filtro
                        </button>
                    </div>
                </div>
            </dialog>

            <div className="">
                <table className="table table-zebra w-full">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort("id")} className="cursor-pointer select-none">ID {sortColumn === "id" ? (sortDirection === "asc" ? "↑" : "↓") : ""}</th>
                            <th onClick={() => handleSort("title")} className="cursor-pointer select-none">Título {sortColumn === "title" ? (sortDirection === "asc" ? "↑" : "↓") : ""}</th>
                            <th onClick={() => handleSort("lesson_description")} className="cursor-pointer select-none">Descrição {sortColumn === "lesson_description" ? (sortDirection === "asc" ? "↑" : "↓") : ""}</th>
                            <th onClick={() => handleSort("course_name")} className="cursor-pointer select-none">Curso {sortColumn === "course_name" ? (sortDirection === "asc" ? "↑" : "↓") : ""}</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lessons.map((lesson, index) => (
                            <tr key={lesson.id}>
                                <td>{lesson.id}</td>
                                <td>{lesson.title}</td>
                                <td>{lesson.lesson_description || "Sem descrição"}</td>
                                <td>{lesson.course_name}</td>
                                <td>
                                    <div
                                        className={`dropdown ${
                                            index === lessons.length - 1 ? "dropdown-top dropdown-end" : "dropdown-left"
                                        }`}
                                    >
                                        <label tabIndex={0} className="btn btn-sm btn-square btn-ghost">
                                            <SlOptionsVertical />
                                        </label>
                                        <ul
                                            tabIndex={0}
                                            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10 absolute"
                                        >
                                            <li>
                                                <button
                                                    className="flex items-center gap-2"
                                                    onClick={() => router.push(`/admin/lessons/${lesson.id}`)}
                                                >
                                                    <FaBook /> Conteúdos
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className="flex items-center gap-2"
                                                    onClick={() => router.push(`/admin/lessons/${lesson.id}/edit`)}
                                                >
                                                    <FaPencil /> Editar
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className="flex items-center gap-2 text-error"
                                                    onClick={() => setLessonToDelete(lesson)}
                                                >
                                                    <FaTrash /> Excluir
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <div className="join">
                        <button className="join-item btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>«</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                            <button
                                key={pageNumber}
                                className={`join-item btn ${pageNumber === page ? "btn-active" : ""}`}
                                onClick={() => setPage(pageNumber)}
                            >
                                {pageNumber}
                            </button>
                        ))}
                        <button className="join-item btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>»</button>
                    </div>
                </div>
            )}

            {lessonToDelete && (
                <dialog id="delete_modal" className="modal modal-bottom sm:modal-middle" open>
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Confirmar Exclusão</h3>
                        <p className="py-4">
                            Tem certeza de que deseja excluir a aula{" "}
                            <strong>{lessonToDelete.title}</strong>?
                        </p>
                        <div className="modal-action">
                            <button
                                className="btn"
                                onClick={() => setLessonToDelete(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-error"
                                onClick={handleDeleteLesson}
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