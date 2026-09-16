"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/Alert";

export default function CreateLessonPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
    const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Fetch courses from the API
        const fetchCourses = async () => {
            try {
                const response = await fetch("/api/admin/courses");
                const data = await response.json();
                setCourses(data.courses || []);
            } catch (error) {
                setAlert({
                    type: "error",
                    message: "Não foi possível carregar os cursos. Por favor, tente novamente."
                });
            }
        };

        fetchCourses();
    }, []);

    const handleCourseChange = (courseId: number) => {
        setSelectedCourses((prev) =>
            prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
        );
    };

    const handleSubmit = async () => {
        if (!title || selectedCourses.length === 0) {
            setAlert({ type: "error", message: "Preencha todos os campos obrigatórios e selecione pelo menos um curso." });
            return;
        }

        setLoading(true);
        
        try {
            // Cria uma aula para cada curso selecionado
            const createPromises = selectedCourses.map(courseId => 
                fetch("/api/admin/lessons", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title,
                        lesson_description: description,
                        course_id: courseId,
                    }),
                }).then(response => {
                    if (!response.ok) {
                        return response.json().then(data => {
                            throw new Error(data.message || "Erro ao criar uma aula.");
                        });
                    }
                    return response.json();
                })
            );
            
            await Promise.all(createPromises);
            
            // Redirecionar para a página de aulas
            router.push("/admin/lessons");
        } catch (err: any) {
            setAlert({ type: "error", message: err.message || "Falha ao criar a aula." });
        } finally {
            setLoading(false);
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
                    <h1 className="card-title">Criar Nova Aula</h1>
                    <p className="text-sm text-base-content/70 mb-4">
                        Preencha as informações abaixo para criar uma nova aula. Conteúdos podem ser adicionados depois.
                    </p>

                    <div className="space-y-4">
                        <div className="fieldset">
                            <label className="label">
                                <span className="label-text">Título da Aula <span className="text-error">*</span></span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Digite o título da aula"
                                required
                            />
                        </div>

                        <div className="fieldset">
                            <label className="label">
                                <span className="label-text">Descrição</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered w-full h-24"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Digite uma breve descrição da aula"
                            />
                        </div>

                        <div className="fieldset">
                            <label className="label">
                                <span className="label-text">Cursos <span className="text-error">*</span></span>
                            </label>
                            <div className="relative">
                                <div
                                    className="input input-bordered w-full cursor-pointer"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    {selectedCourses.length > 0
                                        ? courses
                                              .filter((course) => selectedCourses.includes(course.id))
                                              .map((course) => course.name)
                                              .join(", ")
                                        : "Selecione cursos"}
                                </div>
                                {dropdownOpen && (
                                    <div className="absolute z-10 border rounded shadow-md w-full bg-base-100 max-h-60 overflow-y-auto">
                                        {courses.map((course) => (
                                            <label key={course.id} className="flex items-center gap-2 p-2 hover:bg-base-200">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCourses.includes(course.id)}
                                                    onChange={() => handleCourseChange(course.id)}
                                                    className="checkbox checkbox-sm"
                                                />
                                                <span>{course.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {courses.length === 0 && (
                                <p className="text-sm text-error mt-1">
                                    Nenhum curso disponível. Por favor, crie um curso primeiro.
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                className="btn btn-outline flex-1"
                                onClick={() => router.push("/admin/lessons")}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className={`btn btn-primary flex-1`}
                                onClick={handleSubmit}
                                disabled={loading || courses.length === 0 || selectedCourses.length === 0}
                            >
                                {loading ? "Criando..." : "Criar Aula"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}