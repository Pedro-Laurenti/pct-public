"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Alert from "@/components/Alert";
import LoadingOrError from "@/components/LoadingOrError";

interface Class {
    id: number;
    name: string;
}

export default function AddClassesToCoursePage() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const router = useRouter();
    const params = useParams();
    const id = params?.id ?? "";

    useEffect(() => {
        async function fetchClasses() {
            setLoading(true);
            try {
                const response = await fetch(`/api/admin/courses/${id}/classes/add`);
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

    const handleSelectClass = (classId: number) => {
        setSelectedClasses((prev) =>
            prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
        );
    };

    const handleAddClasses = async () => {
        try {
            const response = await fetch(`/api/admin/courses/${id}/classes/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ classIds: selectedClasses }),
            });

            if (!response.ok) {
                throw new Error("Erro ao vincular turmas.");
            }

            setAlert({ type: "success", message: "Turmas vinculadas com sucesso!" });
            setTimeout(() => router.push(`/admin/courses/${id}/classes`), 2000);
        } catch (err) {
            setAlert({ type: "error", message: "Falha ao vincular turmas." });
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

            <h1 className="text-2xl font-bold mb-4">Vincular Turmas ao Curso</h1>

            <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-sm"
                                    onChange={(e) =>
                                        setSelectedClasses(
                                            e.target.checked ? classes.map((cls) => cls.id) : []
                                        )
                                    }
                                    checked={selectedClasses.length === classes.length && classes.length > 0}
                                />
                            </th>
                            <th>ID</th>
                            <th>Nome</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classes.map((cls) => (
                            <tr key={cls.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-sm"
                                        checked={selectedClasses.includes(cls.id)}
                                        onChange={() => handleSelectClass(cls.id)}
                                    />
                                </td>
                                <td>{cls.id}</td>
                                <td>{cls.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button
                className="btn btn-primary mt-4"
                onClick={handleAddClasses}
                disabled={selectedClasses.length === 0}
            >
                Vincular Turmas
            </button>
        </div>
    );
}