"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Alert from "@/components/Alert";
import { FaArrowLeft, FaPlus, FaTrash, FaBook } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import Link from "next/link";

interface Course {
    id: number;
    name: string;
    description: string | null;
}

interface Lesson {
    id: number;
    title: string;
    lesson_description: string | null;
    course_id: number;
}

type ModalMode = null | "create" | "edit";

export default function CourseDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();

    const [course, setCourse] = useState<Course | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);

    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [formTitle, setFormTitle] = useState("");
    const [formDesc, setFormDesc] = useState("");
    const [formSaving, setFormSaving] = useState(false);

    // edit course modal
    const [courseModal, setCourseModal] = useState(false);
    const [courseFormName, setCourseFormName] = useState("");
    const [courseFormDesc, setCourseFormDesc] = useState("");
    const [courseSaving, setCourseSaving] = useState(false);

    const fetchData = async () => {
        try {
            const [courseRes, lessonsRes] = await Promise.all([
                fetch(`/api/admin/courses/${id}`),
                fetch(`/api/admin/lessons?courseId=${id}&limit=100`),
            ]);
            if (!courseRes.ok) throw new Error("Curso não encontrado");
            const courseData = await courseRes.json();
            setCourse(courseData);
            if (lessonsRes.ok) {
                const lessonsData = await lessonsRes.json();
                setLessons(lessonsData.lessons || []);
            }
        } catch {
            setAlert({ type: "error", message: "Erro ao carregar dados do curso." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [id]);

    // lesson modals
    const openCreateLesson = () => {
        setEditingLesson(null);
        setFormTitle("");
        setFormDesc("");
        setModalMode("create");
    };

    const openEditLesson = (lesson: Lesson) => {
        setEditingLesson(lesson);
        setFormTitle(lesson.title);
        setFormDesc(lesson.lesson_description || "");
        setModalMode("edit");
    };

    const closeModal = () => { setModalMode(null); setEditingLesson(null); };

    const handleSaveLesson = async () => {
        if (!formTitle.trim()) {
            setAlert({ type: "error", message: "O título da aula é obrigatório." });
            return;
        }
        setFormSaving(true);
        try {
            const body = { title: formTitle.trim(), lesson_description: formDesc.trim() || null, course_id: Number(id) };
            const res = modalMode === "create"
                ? await fetch("/api/admin/lessons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
                : await fetch(`/api/admin/lessons/${editingLesson!.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error();
            setAlert({ type: "success", message: modalMode === "create" ? "Aula criada!" : "Aula atualizada!" });
            closeModal();
            fetchData();
        } catch {
            setAlert({ type: "error", message: "Falha ao salvar a aula." });
        } finally {
            setFormSaving(false);
        }
    };

    const handleDeleteLesson = async () => {
        if (!lessonToDelete) return;
        try {
            const res = await fetch(`/api/admin/lessons/${lessonToDelete.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            setLessons(prev => prev.filter(l => l.id !== lessonToDelete.id));
            setAlert({ type: "success", message: "Aula excluída!" });
        } catch {
            setAlert({ type: "error", message: "Falha ao excluir a aula." });
        } finally {
            setLessonToDelete(null);
        }
    };

    // course edit modal
    const openCourseEdit = () => {
        setCourseFormName(course?.name || "");
        setCourseFormDesc(course?.description || "");
        setCourseModal(true);
    };

    const handleSaveCourse = async () => {
        if (!courseFormName.trim()) {
            setAlert({ type: "error", message: "O nome do curso é obrigatório." });
            return;
        }
        setCourseSaving(true);
        try {
            const res = await fetch(`/api/admin/courses/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: courseFormName.trim(), description: courseFormDesc.trim() || null }),
            });
            if (!res.ok) throw new Error();
            setCourse(prev => prev ? { ...prev, name: courseFormName.trim(), description: courseFormDesc.trim() || null } : prev);
            setAlert({ type: "success", message: "Curso atualizado!" });
            setCourseModal(false);
        } catch {
            setAlert({ type: "error", message: "Falha ao atualizar o curso." });
        } finally {
            setCourseSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg" /></div>;

    return (
        <div className="p-6 space-y-6">
            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

            {/* Cabeçalho do curso */}
            <div className="flex items-start gap-4">
                <button className="btn btn-ghost btn-square mt-1" onClick={() => router.push("/admin/courses")}>
                    <FaArrowLeft />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{course?.name}</h1>
                        <button className="btn btn-ghost btn-sm" onClick={openCourseEdit} title="Editar curso">
                            <FaPencil />
                        </button>
                    </div>
                    {course?.description && <p className="text-base-content/60 mt-1">{course.description}</p>}
                </div>
            </div>

            {/* Seção de Aulas */}
            <div className="card bg-base-100 border border-base-200">
                <div className="card-body">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="card-title text-lg">Aulas ({lessons.length})</h2>
                        <button className="btn btn-primary btn-sm" onClick={openCreateLesson}>
                            <FaPlus /> Nova Aula
                        </button>
                    </div>

                    {lessons.length === 0 ? (
                        <div className="text-center py-10 text-base-content/50">
                            <FaBook className="mx-auto text-4xl mb-3 opacity-30" />
                            <p>Nenhuma aula cadastrada.</p>
                            <button className="btn btn-primary btn-sm mt-4" onClick={openCreateLesson}>Criar primeira aula</button>
                        </div>
                    ) : (
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Título</th>
                                    <th>Descrição</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lessons.map((lesson, i) => (
                                    <tr key={lesson.id} className="hover">
                                        <td className="text-base-content/40">{i + 1}</td>
                                        <td>
                                            <Link
                                                href={`/admin/lessons/${lesson.id}`}
                                                className="link link-hover font-medium"
                                            >
                                                {lesson.title}
                                            </Link>
                                        </td>
                                        <td className="text-sm text-base-content/60 max-w-xs truncate">
                                            {lesson.lesson_description || "—"}
                                        </td>
                                        <td>
                                            <div className="flex gap-1">
                                                <Link
                                                    href={`/admin/lessons/${lesson.id}`}
                                                    className="btn btn-xs btn-ghost"
                                                    title="Gerenciar conteúdos"
                                                >
                                                    Conteúdos
                                                </Link>
                                                <button
                                                    className="btn btn-xs btn-ghost"
                                                    onClick={() => openEditLesson(lesson)}
                                                    title="Editar aula"
                                                >
                                                    <FaPencil />
                                                </button>
                                                <button
                                                    className="btn btn-xs btn-ghost text-error"
                                                    onClick={() => setLessonToDelete(lesson)}
                                                    title="Excluir aula"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal create/edit aula */}
            {modalMode && (
                <dialog className="modal modal-open" onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">{modalMode === "create" ? "Nova Aula" : "Editar Aula"}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="label"><span className="label-text">Título *</span></label>
                                <input
                                    className="input input-bordered w-full"
                                    value={formTitle}
                                    onChange={e => setFormTitle(e.target.value)}
                                    placeholder="Título da aula"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="label"><span className="label-text">Descrição</span></label>
                                <textarea
                                    className="textarea textarea-bordered w-full"
                                    value={formDesc}
                                    onChange={e => setFormDesc(e.target.value)}
                                    placeholder="Descrição da aula (opcional)"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="modal-action">
                            <button className="btn" onClick={closeModal}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSaveLesson} disabled={formSaving}>
                                {formSaving ? <span className="loading loading-spinner loading-sm" /> : "Salvar"}
                            </button>
                        </div>
                    </div>
                </dialog>
            )}

            {/* Modal editar curso */}
            {courseModal && (
                <dialog className="modal modal-open" onClick={e => e.target === e.currentTarget && setCourseModal(false)}>
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">Editar Curso</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="label"><span className="label-text">Nome *</span></label>
                                <input
                                    className="input input-bordered w-full"
                                    value={courseFormName}
                                    onChange={e => setCourseFormName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="label"><span className="label-text">Descrição</span></label>
                                <textarea
                                    className="textarea textarea-bordered w-full"
                                    value={courseFormDesc}
                                    onChange={e => setCourseFormDesc(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="modal-action">
                            <button className="btn" onClick={() => setCourseModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSaveCourse} disabled={courseSaving}>
                                {courseSaving ? <span className="loading loading-spinner loading-sm" /> : "Salvar"}
                            </button>
                        </div>
                    </div>
                </dialog>
            )}

            {/* Modal delete aula */}
            {lessonToDelete && (
                <dialog className="modal modal-open" onClick={e => e.target === e.currentTarget && setLessonToDelete(null)}>
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Confirmar Exclusão</h3>
                        <p className="py-4">Tem certeza de que deseja excluir a aula <strong>{lessonToDelete.title}</strong>?</p>
                        <div className="modal-action">
                            <button className="btn" onClick={() => setLessonToDelete(null)}>Cancelar</button>
                            <button className="btn btn-error" onClick={handleDeleteLesson}>Excluir</button>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
}
