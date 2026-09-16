"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaPlus, FaTrash, FaEye, FaUnlink } from "react-icons/fa";
import { SlOptionsVertical } from "react-icons/sl";
import Alert from "@/components/Alert";
import LoadingOrError from "@/components/LoadingOrError";

interface Class {
    id: number;
    name: string;
    student_count: number;
}

export default function CourseClassesPage() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [classToUnlink, setClassToUnlink] = useState<Class | null>(null);

    const router = useRouter();
    const params = useParams();
    const id = params?.id ?? "";

    useEffect(() => {
        async function fetchClasses() {
            setLoading(true);
            try {
                const response = await fetch(`/api/admin/courses/${id}/classes`);
                if (!response.ok) {
                    throw new Error("Erro ao buscar turmas.");
                }

                const data = await response.json();
                setClasses(data.classes);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchClasses();
    }, [id]);

    const handleUnlinkClass = async () => {
        if (!classToUnlink) return;

        try {
            const response = await fetch(`/api/admin/courses/${id}/classes/${classToUnlink.id}`, {
                method: "PATCH",
            });

            if (!response.ok) {
                throw new Error("Erro ao desvincular a turma.");
            }

            setClasses(classes.filter((cls) => cls.id !== classToUnlink.id));
            setAlert({ type: "success", message: "Turma desvinculada com sucesso!" });
        } catch (err) {
            setAlert({ type: "error", message: "Falha ao desvincular a turma." });
        } finally {
            setClassToUnlink(null);
        }
    };

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

            <h1 className="text-2xl font-bold mb-4">Turmas do Curso</h1>

            <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() => router.push(`/admin/courses/${id}/classes/add`)}
            >
                <FaPlus /> Vincular turmas
            </button>

            <div className="overflow-x-auto mt-4">
                <table className="table table-zebra w-full">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Alunos</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classes.map((cls) => (
                            <tr key={cls.id}>
                                <td>{cls.id}</td>
                                <td>{cls.name}</td>
                                <td>{cls.student_count}</td>
                                <td>
                                    <div className="dropdown dropdown-left">
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
                                                    onClick={() => router.push(`/admin/classes/${cls.id}/users`)}
                                                >
                                                    <FaEye /> Visualizar Alunos
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className="flex items-center gap-2 text-error"
                                                    onClick={() => setClassToUnlink(cls)}
                                                >
                                                    <FaUnlink /> Desvincular turma
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

            {classToUnlink && (
                <dialog id="unlink_modal" className="modal modal-bottom sm:modal-middle" open>
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Confirmar Desvinculação</h3>
                        <p className="py-4">
                            Tem certeza de que deseja desvincular a turma{" "}
                            <strong>{classToUnlink.name}</strong> do curso?
                        </p>
                        <div className="modal-action">
                            <button
                                className="btn"
                                onClick={() => setClassToUnlink(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-error"
                                onClick={handleUnlinkClass}
                            >
                                Desvincular
                            </button>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
}