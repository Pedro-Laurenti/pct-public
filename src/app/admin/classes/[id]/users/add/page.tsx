"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LoadingOrError from "@/components/LoadingOrError";
import Alert from "@/components/Alert";
import { FaArrowLeft, FaFilter, FaTimes } from "react-icons/fa";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    phone_number: string | null;
}

interface SearchFilter {
    column: string;
    operator: "equals" | "contains" | "notEquals" | "startsWith";
    term: string;
}

export default function AddUsersToClassPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addAlert, setAddAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [sortColumn, setSortColumn] = useState<string>("id");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchColumn, setSearchColumn] = useState<string>("name");
    const [searchOperator, setSearchOperator] = useState<"equals" | "contains" | "notEquals" | "startsWith">("contains");
    const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);

    const router = useRouter();
    const params = useParams();
    const id = params?.id ?? "";

    useEffect(() => {
        async function fetchUsers() {
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

                const response = await fetch(`/api/admin/classes/${id}/users/add?${queryParams.toString()}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }

                const data = await response.json();
                setUsers(data.users);
                setTotal(data.total);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, [page, limit, sortColumn, sortDirection, activeFilters, id]);

    const handleSelectUser = (userId: number) => {
        setSelectedUsers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

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

    const handleAddUsers = async () => {
        try {
            const response = await fetch(`/api/admin/classes/${id}/users/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userIds: selectedUsers }),
            });

            if (!response.ok) {
                throw new Error("Erro ao adicionar usuários à turma.");
            }

            router.push(`/admin/classes/${id}/users`);
        } catch (err) {
            setAddAlert({ type: "error", message: "Falha ao adicionar usuários." });
        }
    };

    const totalPages = Math.ceil(total / limit);

    if (loading || error) {
        return <LoadingOrError loading={loading} error={error} />;
    }
    
    return (
        <div className="p-6 space-y-8">
            {addAlert && <Alert type={addAlert.type} message={addAlert.message} onClose={() => setAddAlert(null)} />}
            <div className="flex items-center">
                <button
                    className="btn btn-circle btn-ghost"
                    onClick={() => router.push(`/admin/classes/${id}/users`)}
                >
                    <FaArrowLeft />
                </button>
                <h1 className="text-2xl font-bold">Adicionar Alunos à Turma</h1>
            </div>
            <div className="flex justify-between items-center mb-4">
                <button
                    className="btn btn-primary"
                    onClick={handleAddUsers}
                    disabled={selectedUsers.length === 0}
                >
                    Adicionar na Turma ({selectedUsers.length} selecionados)
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
                            <option value="name">Nome</option>
                            <option value="email">Email</option>
                            <option value="role">Função</option>
                            <option value="phone_number">Telefone</option>
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

            <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-sm"
                                    onChange={(e) =>
                                        setSelectedUsers(
                                            e.target.checked ? users.map((user) => user.id) : []
                                        )
                                    }
                                    checked={selectedUsers.length === users.length && users.length > 0}
                                />
                            </th>
                            <th onClick={() => handleSort("id")}>ID</th>
                            <th onClick={() => handleSort("name")}>Nome</th>
                            <th onClick={() => handleSort("email")}>Email</th>
                            <th onClick={() => handleSort("role")}>Função</th>
                            <th onClick={() => handleSort("phone_number")}>Telefone</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-sm"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => handleSelectUser(user.id)}
                                    />
                                </td>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>{user.phone_number || "Não informado"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <div className="join">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                            <button
                                key={pageNumber}
                                className={`join-item btn ${pageNumber === page ? "btn-active" : ""}`}
                                onClick={() => setPage(pageNumber)}
                            >
                                {pageNumber}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}