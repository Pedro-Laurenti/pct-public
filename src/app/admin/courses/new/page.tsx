"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/Alert";
import { FaArrowLeft } from "react-icons/fa";

export default function CreateCoursePage() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        if (!name) {
            setAlert({ type: "error", message: "O nome do curso é obrigatório." });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/admin/courses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    description,
                }),
            });

            if (!response.ok) {
                throw new Error("Erro ao criar o curso.");
            }

            setAlert({ type: "success", message: "Curso criado com sucesso!" });
            setTimeout(() => router.push("/admin/courses"), 2000); // Redireciona após sucesso
        } catch (err) {
            setAlert({ type: "error", message: "Falha ao criar o curso." });
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
                            onClick={() => router.push("/admin/courses")}
                        >
                            <FaArrowLeft />
                        </button>
                        <h1 className="card-title">Criar Novo Curso</h1>
                    </div>

                    <div className="space-y-4">
                        <div className="fieldset">
                            <label className="label">
                                <span className="label-text">Nome do Curso</span>
                            </label>
                            <input
                                type="text"
                                className="input validator w-full"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Digite o nome do curso"
                                required
                            />
                        </div>

                        <div className="fieldset">
                            <label className="label">
                                <span className="label-text">Descrição do Curso</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Digite a descrição do curso (opcional)"
                            />
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
                                        Criando...
                                    </>
                                ) : (
                                    "Criar Curso"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}