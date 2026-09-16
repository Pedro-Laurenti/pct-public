"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Alert from "@/components/Alert";
import { FaArrowLeft } from "react-icons/fa";

export default function EditClassPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();

    const [name, setName] = useState("");
    const [courseId, setCourseId] = useState<number | null>(null);
    const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
    const [students, setStudents] = useState<{ id: number; name: string; email: string }[]>([]);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchClassData = async () => {
            setIsLoading(true);
            try {
                // Buscar dados da turma
                const classResponse = await fetch(`/api/admin/classes/${id}`);
                const classData = await classResponse.json();

                if (classData && classData.name) {
                    setName(classData.name);
                    setCourseId(classData.course_id);
                    setStudents(classData.students || []);
                }

                // Buscar cursos disponíveis
                const coursesResponse = await fetch("/api/admin/courses");
                const coursesData = await coursesResponse.json();
                setCourses(coursesData.courses || []);
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
                setAlert({ type: "error", message: "Falha ao carregar dados da turma." });
            } finally {
                setIsLoading(false);
            }
        };

        fetchClassData();
    }, [id]);

    const handleSubmit = async () => {
        setIsSubmitting(true);

        if (!name || !courseId) {
            setAlert({ type: "error", message: "Preencha todos os campos obrigatórios." });
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(`/api/admin/classes/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    course_id: courseId,
                }),
            });

            if (!response.ok) {
                throw new Error("Erro ao atualizar a turma.");
            }

            setAlert({ type: "success", message: "Turma atualizada com sucesso!" });
            
            // Redireciona para a página de listagem de turmas após 2 segundos
            setTimeout(() => router.push("/admin/classes"), 2000);
        } catch (err) {
            setAlert({ type: "error", message: "Falha ao atualizar a turma." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center p-4">
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            <div className="card bg-base-200 border border-base-300 shadow-sm w-full max-w-lg">
                <div className="card-body">
                    <div className="flex items-center">
                        <button 
                            className="btn btn-circle btn-ghost"
                            onClick={() => router.push("/admin/classes")}
                        >
                            <FaArrowLeft />
                        </button>
                        <h1 className="card-title">Editar Turma</h1>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center my-4">
                            <span className="loading loading-spinner loading-lg"></span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="fieldset">
                                <label className="label">
                                    <span className="label-text">Nome da Turma</span>
                                </label>
                                <input
                                    type="text"
                                    className="input validator w-full"
                                    value={name || ""}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Digite o nome da turma"
                                    required
                                />
                            </div>

                            <div className="fieldset">
                                <label className="label">
                                    <span className="label-text">Curso</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={courseId || ""}
                                    onChange={(e) => setCourseId(Number(e.target.value))}
                                    required
                                >
                                    <option value="" disabled>
                                        Selecione um curso
                                    </option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {students.length > 0 && (
                                <div className="fieldset">
                                    <label className="label">
                                        <span className="label-text">Alunos Matriculados</span>
                                    </label>
                                    <div className="bg-base-100 p-3 rounded-md max-h-48 overflow-y-auto">
                                        <ul className="divide-y divide-base-200">
                                            {students.map((student) => (
                                                <li key={student.id} className="py-2">
                                                    <div className="font-medium">{student.name}</div>
                                                    <div className="text-xs opacity-70">{student.email}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            <div className="fieldset mt-4">
                                <button
                                    type="button"
                                    className="btn btn-primary w-full"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="loading loading-spinner"></span>
                                            Enviando...
                                        </>
                                    ) : (
                                        "Atualizar Turma"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}