"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Alert from "@/components/Alert";

interface Lesson {
  id: number;
  title: string;
  lesson_description: string | null;
  course_id: number;
  course_name: string;
}

export default function EditLessonPage() {
    const params = useParams();
    const lessonId = params?.id as string | undefined;

    const router = useRouter();

    useEffect(() => {
        if (!lessonId) {
            setNotFound(true);
        }
    }, [lessonId]);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
    const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // Fetch lesson data and courses when component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                setInitialLoading(true);
                
                // Fetch courses
                const coursesResponse = await fetch("/api/admin/courses");
                const coursesData = await coursesResponse.json();
                setCourses(coursesData.courses || []);
                
                // Fetch lesson details
                const lessonResponse = await fetch(`/api/admin/lessons/${lessonId}`);
                
                if (!lessonResponse.ok) {
                    if (lessonResponse.status === 404) {
                        setNotFound(true);
                    } else {
                        throw new Error("Erro ao buscar dados da aula");
                    }
                    return;
                }
                
                const lessonData = await lessonResponse.json();
                const lesson: Lesson = lessonData.lesson;
                
                // Set form values
                setTitle(lesson.title);
                setDescription(lesson.lesson_description || "");
                setSelectedCourses([lesson.course_id]); // Set the current course
            } catch (error) {
                setAlert({
                    type: "error",
                    message: "Não foi possível carregar os dados da aula. Por favor, tente novamente."
                });
            } finally {
                setInitialLoading(false);
            }
        };

        if (lessonId) {
            fetchData();
        }
    }, [lessonId]);
    
    const handleCourseChange = (courseId: number) => {
        // For edit, we'll only allow one course selection
        setSelectedCourses([courseId]);
    };

    const handleSubmit = async () => {
        if (!title || selectedCourses.length === 0) {
            setAlert({ type: "error", message: "Preencha todos os campos obrigatórios e selecione um curso." });
            return;
        }

        setLoading(true);
        
        try {
            // Update the lesson
            const response = await fetch(`/api/admin/lessons/${lessonId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    lesson_description: description,
                    course_id: selectedCourses[0], // Get first selected course
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erro ao atualizar a aula.");
            }
            
            setAlert({
                type: "success", 
                message: "Aula atualizada com sucesso!"
            });
            
            // Redirect after a short delay so user can see success message
            setTimeout(() => {
                router.push("/admin/lessons");
            }, 1500);
        } catch (err: any) {
            setAlert({ type: "error", message: err.message || "Falha ao atualizar a aula." });
        } finally {
            setLoading(false);
        }
    };

    if (notFound) {
        return (
            <div className="w-full min-h-screen flex flex-col items-center justify-center p-4">
                <div className="card bg-base-200 border border-base-300 shadow-sm w-full max-w-lg">
                    <div className="card-body">
                        <h1 className="card-title text-error">Aula não encontrada</h1>
                        <p className="text-base-content/70">
                            A aula que você está tentando editar não existe ou foi removida.
                        </p>
                        <div className="mt-4">
                            <button 
                                className="btn btn-primary" 
                                onClick={() => router.push("/admin/lessons")}
                            >
                                Voltar para lista de aulas
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                    <h1 className="card-title">Editar Aula</h1>
                    <p className="text-sm text-base-content/70 mb-4">
                        Altere as informações da aula conforme necessário.
                    </p>

                    {initialLoading ? (
                        <div className="flex justify-center py-8">
                            <span className="loading loading-spinner loading-lg"></span>
                        </div>
                    ) : (
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
                                    <span className="label-text">Curso <span className="text-error">*</span></span>
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
                                            : "Selecione um curso"}
                                    </div>
                                    {dropdownOpen && (
                                        <div className="absolute z-10 border rounded shadow-md w-full bg-base-100 max-h-60 overflow-y-auto">
                                            {courses.map((course) => (
                                                <label key={course.id} className="flex items-center gap-2 p-2 hover:bg-base-200">
                                                    <input
                                                        type="radio" // Changed to radio buttons for single selection
                                                        checked={selectedCourses.includes(course.id)}
                                                        onChange={() => handleCourseChange(course.id)}
                                                        className="radio radio-sm"
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
                                    {loading ? "Salvando..." : "Salvar Alterações"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}