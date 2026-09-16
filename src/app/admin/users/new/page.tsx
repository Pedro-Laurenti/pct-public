"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/Alert";
import { FaCopy } from "react-icons/fa";
import { GrRefresh } from "react-icons/gr";
import { FaArrowLeft } from "react-icons/fa";

export default function CreateUserPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("student");
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [classes, setClasses] = useState<{ id: number; name: string; course: string }[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [hashUrl, setHashUrl] = useState("");
    const [token, setToken] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailStatus, setEmailStatus] = useState({ sent: true });
    const [bulkMode, setBulkMode] = useState(false);
    const [bulkUsers, setBulkUsers] = useState("");
    const [createdUsers, setCreatedUsers] = useState<Array<{name: string, email: string, hash_url: string, token: string, emailSent?: boolean}>>([]);
    const [showBulkResultModal, setShowBulkResultModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Fetch classes and courses from the API
        const fetchClasses = async () => {
            try {
                const response = await fetch("/api/admin/users/classes");
                const data = await response.json();
                setClasses(
                    (data.classes || []).map((cls: any) => ({
                        id: cls.class_id,
                        name: cls.class_name,
                        course: cls.course_name,
                    }))
                );
            } catch (error) {
            }
        };

        fetchClasses();

        // Generate a hash and token automatically when the page loads
        generateHashAndToken();
    }, []);

    // Generate a random hash of 30 alphanumeric characters and a 6-digit numeric token
    const generateHashAndToken = (type: "hash" | "token" | "both" = "both") => {
        if (type === "hash" || type === "both") {
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let hash = "";
            for (let i = 0; i < 30; i++) {
                hash += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            setHashUrl(hash);
        }

        if (type === "token" || type === "both") {
            const numericToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit token
            setToken(numericToken);
        }
    };

    const copyToClipboard = () => {
        const message = `${name}, sua conta foi criada com sucesso, acesse a URL abaixo e defina a sua senha:\n\nhttps://psicologiacatolicatradicional.com/pwd/${hashUrl}\n\nSeu token de acesso: ${token}\n\nEsse token e URL terão validade de 5 dias, após esse período o usuário não conseguirá acessar a página de redefinição de senha. Caso tenha dúvidas, entre em contato com o suporte.`;
        navigator.clipboard.writeText(message).then(() => {
            setAlert({ type: "success", message: "Mensagem copiada para a área de transferência!" });
        });
    };

    const handleClassChange = (classId: number) => {
        setSelectedClasses((prev) =>
            prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
        );
    };

    const handleSubmit = async () => {
        if (!name || !email || !hashUrl || !token) {
            setAlert({ type: "error", message: "Preencha todos os campos obrigatórios." });
            return;
        }

        setIsSubmitting(true); // Ativa o estado de carregamento

        try {
            const response = await fetch("/api/admin/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    role,
                    phone_number: phoneNumber,
                    hash_url: hashUrl,
                    token,
                    classes: selectedClasses,
                }),
            });

            if (!response.ok) {
                throw new Error("Erro ao criar o usuário.");
            }

            const data = await response.json();
            setEmailStatus({ sent: !!data.emailSent });
            setShowModal(true); // Exibe o modal ao criar o usuário com sucesso
        } catch (err) {
            setAlert({ type: "error", message: "Falha ao criar o usuário." });
            setIsSubmitting(false); // Desativa o estado de carregamento em caso de erro
        }
    };

    const handleCloseModal = () => {
        // First close the modal
        setShowModal(false);
        // Then redirect without setting isSubmitting
        router.push("/admin/users");
    };

    const formatPhoneNumber = (value: string) => {
        // Remove todos os caracteres que não são números
        const cleaned = value.replace(/\D/g, "");

        // Aplica a máscara
        if (cleaned.length <= 2) {
            return `+${cleaned}`;
        } else if (cleaned.length <= 4) {
            return `+${cleaned.slice(0, 2)} (${cleaned.slice(2)}`;
        } else if (cleaned.length <= 9) {
            return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4)}`;
        } else {
            return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 5)}${cleaned.slice(5, 9)}-${cleaned.slice(9, 13)}`;
        }
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedNumber = formatPhoneNumber(e.target.value);
        setPhoneNumber(formattedNumber);
    };

    // Função para processar a criação de usuários em massa
    const handleBulkSubmit = async () => {
        if (!bulkUsers.trim()) {
            setAlert({ type: "error", message: "Por favor, insira informações de usuários." });
            return;
        }

        try {
            setIsSubmitting(true);
            
            // Parse CSV data (Nome;Email;Telefone)
            const lines = bulkUsers.split('\n').filter(line => line.trim());
            const parsedUsers = lines.map(line => {
                const parts = line.split(';');
                const name = parts[0]?.trim() || '';
                const email = parts[1]?.trim() || '';
                const phone = parts[2]?.trim() || '';
                
                if (!name || !email) {
                    throw new Error(`Linha inválida: ${line}. Formato esperado: Nome;Email;Telefone(opcional)`);
                }
                
                return { name, email, phone };
            });

            // Array para armazenar resultados
            const results = [];
            const successfulUsers = [];

            // Processar cada usuário
            for (const user of parsedUsers) {
                // Gerar hash_url e token exclusivos para cada usuário
                const hash_url = generateRandomHash();
                const token = generateRandomToken();
                
                const response = await fetch("/api/admin/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: user.name,
                        email: user.email,
                        role: role,
                        phone_number: user.phone,
                        hash_url: hash_url,
                        token: token,
                        classes: selectedClasses,
                    }),
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    successfulUsers.push({
                        name: user.name, 
                        email: user.email, 
                        hash_url, 
                        token,
                        emailSent: result.emailSent
                    });
                } else {
                    results.push(`Erro ao criar ${user.name}: ${result.message || 'Erro desconhecido'}`);
                }
            }
            
            if (successfulUsers.length > 0) {
                setCreatedUsers(successfulUsers);
                setShowBulkResultModal(true);
            }
            
            if (results.length > 0) {
                setAlert({ 
                    type: "error", 
                    message: `Alguns usuários não puderam ser criados: ${results.join(', ')}` 
                });
            } else if (successfulUsers.length === parsedUsers.length) {
                setAlert({ 
                    type: "success", 
                    message: `${successfulUsers.length} usuários criados com sucesso!` 
                });
            }
        } catch (error: any) {
            setAlert({ 
                type: "error", 
                message: `Erro ao processar usuários: ${error.message}` 
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Funções auxiliares para gerar hash e token
    const generateRandomHash = () => {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let hash = "";
        for (let i = 0; i < 30; i++) {
            hash += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return hash;
    };
    
    const generateRandomToken = () => {
        return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit token
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
                            onClick={() => router.push("/admin/users")}
                        >
                            <FaArrowLeft />
                        </button>
                        <h1 className="card-title">Criar Novo Usuário</h1>
                    </div>
                    
                    <div className="form-control mt-4">
                        <label className="label cursor-pointer justify-start">
                            <span className="label-text mr-4">Modo de criação:</span>
                            <div className="flex items-center">
                                <span className={`mr-2 ${!bulkMode ? 'font-semibold' : ''}`}>Individual</span>
                                <input 
                                    type="checkbox" 
                                    className="toggle toggle-primary" 
                                    checked={bulkMode}
                                    onChange={() => setBulkMode(!bulkMode)}
                                />
                                <span className={`ml-2 ${bulkMode ? 'font-semibold' : ''}`}>Em massa</span>
                            </div>
                        </label>
                    </div>

                    {!bulkMode ? (
                    <div className="space-y-4">
                        <div className="fieldset">
                            <label className="label">
                                <span className="label-text">Nome</span>
                            </label>
                            <input
                                type="text"
                                className="input validator w-full"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Digite o nome"
                                required
                            />
                        </div>

                        <div className="fieldset">
                            <label className="label">
                                <span className="label-text">Número de Contato</span>
                            </label>
                            <input
                                type="tel"
                                className="input validator w-full"
                                value={phoneNumber}
                                onChange={handlePhoneNumberChange}
                                placeholder="+55 (00) 00000-0000"
                                title="Digite um número de telefone válido no formato +55 (00) 00000-0000"
                            />
                        </div>

                        <div className="fieldset">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                className="input validator w-full"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Digite o email"
                                required
                                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                                title="Digite um email válido"
                            />
                            <p className="validator-hint hidden">
                                Digite um email válido, como exemplo@dominio.com
                            </p>
                        </div>

                        <div className="fieldset">
                            <label className="label">
                                <span className="label-text">Papel</span>
                            </label>
                            <select
                                className="select select-bordered w-full"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="student">Estudante</option>
                                <option value="mentor">Mentor</option>
                            </select>
                        </div>

                        {role === "student" && (
                            <div className="fieldset">
                                <label className="label">
                                    <span className="label-text">Turmas</span>
                                </label>
                                <div className="relative">
                                    <div
                                        className="rounded-2xl border border-base-content/30 bg-base-100 p-2 w-full cursor-pointer max-w-full"
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                    >
                                        {selectedClasses.length > 0
                                            ? classes
                                                  .filter((cls) => selectedClasses.includes(cls.id))
                                                  .map((cls) => `${cls.name} (${cls.course})`)
                                                  .join(", ")
                                            : "Selecione turmas"}
                                    </div>
                                    {dropdownOpen && (
                                        <div className="absolute z-10 border rounded shadow-md w-full bg-base-100">
                                            {classes.map((cls) => (
                                                <label key={cls.id} className="flex items-center gap-2 p-2">
                                                    <input
                                                        type="checkbox"
                                                        className="checkbox checkbox-sm"
                                                        checked={selectedClasses.includes(cls.id)}
                                                        onChange={() => handleClassChange(cls.id)}
                                                    />
                                                    {cls.name} ({cls.course})
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="fieldset">
                            <label className="label">
                                <span className="label-text">URL para redefinição de senha</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    className="input validator w-full"
                                    value={hashUrl}
                                    readOnly
                                    placeholder="Clique para gerar o hash"
                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-square"
                                    onClick={() => generateHashAndToken("hash")}
                                >
                                    <GrRefresh />
                                </button>
                            </div>
                        </div>

                        <div className="fieldset">
                            <label className="label">
                                <span className="label-text">Token de Acesso</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    className="input validator w-full"
                                    value={token}
                                    readOnly
                                    placeholder="Clique para gerar o token"
                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-square"
                                    onClick={() => generateHashAndToken("token")}
                                >
                                    <GrRefresh />
                                </button>
                            </div>
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
                                    "Criar Usuário"
                                )}
                            </button>
                        </div>
                    </div>
                    ) : (
                        <>
                            <div className="fieldset">
                                <label className="label">
                                    <span className="label-text">Papel para todos os usuários</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="student">Estudante</option>
                                    <option value="mentor">Mentor</option>
                                </select>
                            </div>

                            {role === "student" && (
                                <div className="fieldset">
                                    <label className="label">
                                        <span className="label-text">Turmas</span>
                                    </label>
                                    <div className="relative">
                                        <div
                                            className="input input-bordered w-full cursor-pointer"
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                        >
                                            {selectedClasses.length > 0
                                                ? classes
                                                      .filter((cls) => selectedClasses.includes(cls.id))
                                                      .map((cls) => `${cls.name} (${cls.course})`)
                                                      .join(", ")
                                                : "Selecione turmas"}
                                        </div>
                                        {dropdownOpen && (
                                            <div className="absolute z-10 border rounded shadow-md w-full bg-base-100">
                                                {classes.map((cls) => (
                                                    <label key={cls.id} className="flex items-center gap-2 p-2">
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox checkbox-sm"
                                                            checked={selectedClasses.includes(cls.id)}
                                                            onChange={() => handleClassChange(cls.id)}
                                                        />
                                                        {cls.name} ({cls.course})
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="fieldset mt-4">
                                <label className="label">
                                    <span className="label-text">Lista de usuários</span>
                                </label>
                                <textarea
                                    className="textarea textarea-bordered w-full h-48"
                                    value={bulkUsers}
                                    onChange={(e) => setBulkUsers(e.target.value)}
                                    placeholder="Nome;Email;Telefone (opcional)"
                                ></textarea>
                                <label className="label">
                                    <span className="label-text-alt">
                                        Digite um usuário por linha no formato: Nome;Email;Telefone<br/>
                                        Exemplo:<br/>
                                        João Silva;joao@email.com;+55 (11) 98765-4321<br/>
                                        Maria Souza;maria@email.com<br/>
                                    </span>
                                </label>
                            </div>

                            <div className="fieldset mt-4">
                                <button
                                    type="button"
                                    className="btn btn-primary w-full"
                                    onClick={handleBulkSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="loading loading-spinner"></span>
                                            Processando...
                                        </>
                                    ) : (
                                        "Criar Usuários em Massa"
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal para usuário único */}
            {showModal && (
                <dialog id="success_modal" className="modal modal-bottom sm:modal-middle" open>
                    <div className="modal-box bg-base-200">
                        <h3 className="font-bold text-lg">Usuário Criado com Sucesso!</h3>
                        <p className="py-4">
                            {emailStatus.sent ? (
                                "Um email automático com instruções foi enviado para " + email + "."
                            ) : (
                                <span className="text-warning">
                                    O usuário foi criado, mas não foi possível enviar o email automaticamente.
                                    Por favor, copie e envie as instruções manualmente.
                                </span>
                            )}
                        </p>
                        <p className="pb-2">
                            Você pode copiar a mensagem abaixo:
                        </p>
                        <div className="mockup-code w-full break-words overflow-hidden whitespace-pre-wrap p-2">
                            <code>
                                {`${name}, sua conta foi criada com sucesso, acesse a URL abaixo e defina a sua senha:\n\nhttps://psicologiacatolicatradicional.com/pwd/`}
                                <span className="bg-primary/50 px-1 rounded-sm">{hashUrl}</span>
                                {`\n\nSeu token de acesso: `}
                                <span className="bg-primary/50 px-1 rounded-sm">{token}</span>
                                {`\n\nEsse token e URL terão validade de 5 dias, após esse período o usuário não conseguirá acessar a página de redefinição de senha. Caso tenha dúvidas, entre em contato com o suporte.`}
                            </code>
                        </div>
                        <div className="modal-action">
                            <button className="btn btn-outline btn-square" onClick={copyToClipboard}>
                                <FaCopy />
                            </button>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleCloseModal}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </dialog>
            )}

            {/* Modal para exibição dos resultados em massa */}
            {showBulkResultModal && (
                <dialog id="bulk_success_modal" className="modal modal-bottom sm:modal-middle" open>
                    <div className="modal-box bg-base-200 max-w-3xl w-full">
                        <h3 className="font-bold text-lg">Usuários Criados com Sucesso!</h3>
                        <p className="py-4">
                            {createdUsers.length} usuários foram criados. Abaixo estão os detalhes para cada um.
                        </p>

                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full text-sm">
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Email</th>
                                        <th>URL</th>
                                        <th>Token</th>
                                        <th>Email Enviado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {createdUsers.map((user, index) => (
                                        <tr key={index}>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className="text-xs">{user.hash_url}</span>
                                            </td>
                                            <td>{user.token}</td>
                                            <td>
                                                {user.emailSent ? 
                                                    <span className="text-success">Sim</span> : 
                                                    <span className="text-warning">Não</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4">
                            <button
                                className="btn btn-sm btn-outline"
                                onClick={() => {
                                    // Criar texto CSV para copiar
                                    const csvContent = createdUsers.map(user => 
                                        `${user.name};${user.email};https://psicologiacatolicatradicional.com/pwd/${user.hash_url};${user.token};${user.emailSent ? 'Email enviado' : 'Envio manual necessário'}`
                                    ).join('\n');
                                    
                                    navigator.clipboard.writeText(csvContent);
                                    setAlert({ type: "success", message: "Dados copiados para a área de transferência!" });
                                }}
                            >
                                <FaCopy /> Copiar Dados
                            </button>
                        </div>

                        <div className="modal-action">
                            <button 
                                className="btn btn-primary" 
                                onClick={() => {
                                    setShowBulkResultModal(false);
                                    router.push("/admin/users");
                                }}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
}