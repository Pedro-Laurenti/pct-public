"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaFilter, FaTimes, FaTrash, FaUsers } from "react-icons/fa";
import { SlOptionsVertical } from "react-icons/sl";
import Alert from "@/components/Alert";
import { FaPencil } from "react-icons/fa6";
import LoadingOrError from "@/components/LoadingOrError";
import Link from "next/link";

interface Class {
    id: number;
    name: string;
    course_id: number | null;
    course_name: string | null;
    student_count: number;
}

interface Course {
    id: number;
    name: string;
}

interface SearchFilter {
    column: string;
    operator: "equals" | "contains" | "notEquals" | "startsWith";
    term: string;
}

type ModalMode = null | "create" | "edit";

export default function ClassesPage() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [classToDelete, setClassToDelete] = useState<Class | null>(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [sortColumn, setSortColumn] = useState("id");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    const [searchTerm, setSearchTerm] = useState("");
    const [searchColumn, setSearchColumn] = useState("name");
    const [searchOperator, setSearchOperator] = useState<"equals" | "contains" | "notEquals" | "startsWith">("contains");
    const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);

    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const [formName, setFormName] = useState("");
    const [formCourseId, setFormCourseId] = useState<string>("");
    const [formSaving, setFormSaving] = useState(false);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const qs = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sortColumn,
                sortDirection,
            });
            if (activeFilters.length > 0) qs.append("filters", JSON.stringify(activeFilters));
            const res = await fetch(`/api/admin/classes?${qs}`);
            if (!res.ok) throw new Error("Erro ao buscar turmas");
            const data = await res.json();
            setClasses(data.classes);
            setTotal(data.total);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await fetch("/api/admin/courses?limit=100");
            if (res.ok) {
                const data = await res.json();
                setCourses(data.courses || []);
            }
        } catch {}
    };

    useEffect(() => {
        fetchClasses();
        fetchCourses();
    }, [page, limit, sortColumn, sortDirection, activeFilters]);

    const handleSort = (col: string) => {
        if (sortColumn === col) setSortDirection(d => d === "asc" ? "desc" : "asc");
        else { setSortColumn(col); setSortDirection("asc"); }
    };

    const sortIndicator = (col: string) => sortColumn === col ? (sortDirection === "asc" ? " ↑" : " ↓") : "";

    const openCreate = () => {
        setEditingClass(null);
        setFormName("");
        setFormCourseId(courses[0]?.id?.toString() || "");
        setModalMode("create");
    };

    const openEdit = (cls: Class) => {
        setEditingClass(cls);
        setFormName(cls.name);
        setFormCourseId(cls.course_id?.toString() || "");
        setModalMode("edit");
    };

    const closeModal = () => { setModalMode(null); setEditingClass(null); };

    const handleSave = async () => {
        if (!formName.trim()) {
            setAlert({ type: "error", message: "O nome da turma é obrigatório." });
            return;
        }
        if (!formCourseId) {
            setAlert({ type: "error", message: "Selecione um curso." });
            return;
        }
        setFormSaving(true);
        try {
            const body = { name: formName.trim(), course_id: Number(formCourseId) };
            const res = modalMode === "create"
                ? await fetch("/api/admin/classes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
                : await fetch(`/api/admin/classes/${editingClass!.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error();
            setAlert({ type: "success", message: modalMode === "create" ? "Turma criada!" : "Turma atualizada!" });
            closeModal();
            fetchClasses();
        } catch {
            setAlert({ type: "error", message: "Falha ao salvar a turma." });
        } finally {
            setFormSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!classToDelete) return;
        try {
            const res = await fetch(`/api/admin/classes/${classToDelete.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            setClasses(prev => prev.filter(c => c.id !== classToDelete.id));
            setAlert({ type: "success", message: "Turma excluída!" });
        } catch {
            setAlert({ type: "error", message: "Falha ao excluir a turma." });
        } finally {
            setClassToDelete(null);
        }
    };

    const addFilter = () => {
        if (!searchTerm.trim()) return;
        setActiveFilters(prev => [...prev, { column: searchColumn, operator: searchOperator, term: searchTerm }]);
        setSearchTerm("");
        setPage(1);
    };

    const totalPages = Math.ceil(total / limit);

    if (loading || error) return <LoadingOrError loading={loading} error={error} />;

    return (
        <div className="p-6 space-y-6">
            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Turmas</h1>
                <div className="flex gap-2">
                    <button className="btn btn-outline btn-sm" onClick={() => (document.getElementById("filter_modal") as HTMLDialogElement)?.showModal()}>
                        <FaFilter /> Filtrar
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={openCreate}>
                        <FaPlus /> Nova Turma
                    </button>
                </div>
            </div>

            {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                    {activeFilters.map((f, i) => (
                        <span key={i} className="badge badge-primary badge-outline py-3 px-3 flex items-center gap-2">
                            {f.column} {f.operator} "{f.term}"
                            <button onClick={() => setActiveFilters(prev => prev.filter((_, j) => j !== i))}><FaTimes /></button>
                        </span>
                    ))}
                    {activeFilters.length > 1 && (
                        <button className="btn btn-sm btn-ghost text-error" onClick={() => setActiveFilters([])}>Limpar todos</button>
                    )}
                </div>
            )}

            <table className="table table-zebra w-full">
                <thead>
                    <tr>
                        <th className="cursor-pointer select-none" onClick={() => handleSort("id")}>ID{sortIndicator("id")}</th>
                        <th className="cursor-pointer select-none" onClick={() => handleSort("name")}>Nome{sortIndicator("name")}</th>
                        <th className="cursor-pointer select-none" onClick={() => handleSort("course_name")}>Curso{sortIndicator("course_name")}</th>
                        <th className="cursor-pointer select-none" onClick={() => handleSort("student_count")}>Alunos{sortIndicator("student_count")}</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {classes.map((cls, index) => (
                        <tr key={cls.id}>
                            <td>{cls.id}</td>
                            <td>
                                <Link href={`/admin/classes/${cls.id}/users`} className="link link-hover font-medium">
                                    {cls.name}
                                </Link>
                            </td>
                            <td>{cls.course_name || "—"}</td>
                            <td>{cls.student_count}</td>
                            <td>
                                <div className={`dropdown ${index >= classes.length - 2 ? "dropdown-top dropdown-end" : "dropdown-left"}`}>
                                    <label tabIndex={0} className="btn btn-sm btn-square btn-ghost"><SlOptionsVertical /></label>
                                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-44 z-10">
                                        <li>
                                            <Link href={`/admin/classes/${cls.id}/users`} className="flex items-center gap-2">
                                                <FaUsers /> Ver Alunos
                                            </Link>
                                        </li>
                                        <li>
                                            <button className="flex items-center gap-2" onClick={() => openEdit(cls)}>
                                                <FaPencil /> Editar
                                            </button>
                                        </li>
                                        <li>
                                            <button className="flex items-center gap-2 text-error" onClick={() => setClassToDelete(cls)}>
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

            {totalPages > 1 && (
                <div className="flex justify-center">
                    <div className="join">
                        <button className="join-item btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>«</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                            <button key={n} className={`join-item btn ${n === page ? "btn-active" : ""}`} onClick={() => setPage(n)}>{n}</button>
                        ))}
                        <button className="join-item btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>»</button>
                    </div>
                </div>
            )}

            {/* Modal create/edit */}
            {modalMode && (
                <dialog className="modal modal-open" onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">{modalMode === "create" ? "Nova Turma" : "Editar Turma"}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="label"><span className="label-text">Nome *</span></label>
                                <input
                                    className="input input-bordered w-full"
                                    value={formName}
                                    onChange={e => setFormName(e.target.value)}
                                    placeholder="Nome da turma"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="label"><span className="label-text">Curso *</span></label>
                                <select
                                    className="select select-bordered w-full"
                                    value={formCourseId}
                                    onChange={e => setFormCourseId(e.target.value)}
                                >
                                    <option value="">Selecione um curso...</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-action">
                            <button className="btn" onClick={closeModal}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={formSaving}>
                                {formSaving ? <span className="loading loading-spinner loading-sm" /> : "Salvar"}
                            </button>
                        </div>
                    </div>
                </dialog>
            )}

            {/* Modal filtro */}
            <dialog id="filter_modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h3 className="text-lg font-bold mb-4">Adicionar Filtro</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="label"><span className="label-text">Coluna</span></label>
                            <select className="select select-bordered w-full" value={searchColumn} onChange={e => setSearchColumn(e.target.value)}>
                                <option value="id">ID</option>
                                <option value="name">Nome</option>
                                <option value="course_name">Curso</option>
                            </select>
                        </div>
                        <div>
                            <label className="label"><span className="label-text">Operador</span></label>
                            <select className="select select-bordered w-full" value={searchOperator} onChange={e => setSearchOperator(e.target.value as any)}>
                                <option value="contains">Contém</option>
                                <option value="equals">Igual a</option>
                                <option value="notEquals">Diferente de</option>
                                <option value="startsWith">Começa com</option>
                            </select>
                        </div>
                        <div>
                            <label className="label"><span className="label-text">Valor</span></label>
                            <input className="input input-bordered w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Digite o valor..." />
                        </div>
                    </div>
                    <div className="modal-action">
                        <form method="dialog"><button className="btn">Cancelar</button></form>
                        <button className="btn btn-primary" onClick={addFilter} disabled={!searchTerm.trim()}>Adicionar</button>
                    </div>
                </div>
            </dialog>

            {/* Modal delete */}
            {classToDelete && (
                <dialog className="modal modal-open" onClick={e => e.target === e.currentTarget && setClassToDelete(null)}>
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Confirmar Exclusão</h3>
                        <p className="py-4">Tem certeza de que deseja excluir a turma <strong>{classToDelete.name}</strong>?</p>
                        <div className="modal-action">
                            <button className="btn" onClick={() => setClassToDelete(null)}>Cancelar</button>
                            <button className="btn btn-error" onClick={handleDelete}>Excluir</button>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
}
