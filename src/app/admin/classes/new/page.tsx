"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/Alert";
import { FaArrowLeft } from "react-icons/fa";

export default function CreateClassPage() {
    const [name, setName] = useState("");
    const [courseId, setCourseId] = useState<number | null>(null);
    const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Fetch available courses from the API
        const fetchCourses = async () => {
            try {
                const response = await fetch("/api/admin/courses");
                const data = await response.json();
                setCourses(data.courses || []);
            } catch (error) {
            }
        };

        fetchCourses();
    }, []);

    const handleSubmit = async () => {
        setIsSubmitting(true);

        if (!name || !courseId) {
            setAlert({ type: "error", message: "Preencha todos os campos obrigatórios." });
            return;
        }

        try {
            const response = await fetch("/api/admin/classes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    course_id: courseId,
                }),
            });

            if (!response.ok) {
                throw new Error("Erro ao criar a turma.");
            }

            setAlert({ type: "success", message: "Turma criada com sucesso!" });
            setTimeout(() => router.push("/admin/classes"), 2000); // Redireciona após sucesso
        } catch (err) {
            setAlert({ type: "error", message: "Falha ao criar a turma." });
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
                        <h1 className="card-title">Criar Nova Turma</h1>
                    </div>
                    

                    <div className="space-y-4">
                        <div className="fieldset">
                            <label className="label">
                                <span className="label-text">Nome da Turma</span>
                            </label>
                            <input
                                type="text"
                                className="input validator w-full"
                                value={name}
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
                                    "Enviar"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}