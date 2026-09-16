"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Alert from "@/components/Alert";
import { GrRefresh } from "react-icons/gr";
import { FaCopy } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa"; // Importando ícone de seta para a esquerda

export default function EditUserPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("student");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [classes, setClasses] = useState<{ id: number; name: string; course: string }[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [hashUrl, setHashUrl] = useState("");
    const [token, setToken] = useState("");
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetStep, setResetStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false); // Estado para controlar o carregamento
    const [sendResetEmail, setSendResetEmail] = useState(true); // Estado para controlar o envio do email de redefinição

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userResponse = await fetch(`/api/admin/users/${id}`);
                const userData = await userResponse.json();

                setName(userData.name);
                setEmail(userData.email);
                setRole(userData.role);
                setPhoneNumber(userData.phone_number || "");
                setSelectedClasses(userData.classes || []);
                setHashUrl(userData.hashUrl || ""); // Apenas para consulta
                setToken(userData.token || ""); // Apenas para consulta

                const classesResponse = await fetch("/api/admin/users/classes");
                const classesData = await classesResponse.json();

                // Map the API response to match your component's expected structure
                const formattedClasses = classesData.classes?.map((cls: { class_id: number; class_name: string; course_name: string; }) => ({
                    id: cls.class_id,
                    name: cls.class_name,
                    course: cls.course_name
                })) || [];

                setClasses(formattedClasses);
            } catch (error) {
            }
        };

        fetchUserData();
    }, [id]);

    const handleClassChange = (classId: number) => {
        setSelectedClasses((prev) =>
            prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
        );
    };

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
            const numericToken = Math.floor(100000 + Math.random() * 900000).toString();
            setToken(numericToken);
        }
    };

    const openResetModal = () => {
        generateHashAndToken(); // Gera os valores automaticamente
        setShowResetModal(true);
    };

    const handleResetPassword = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/admin/users/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    role,
                    phone_number: phoneNumber,
                    classes: selectedClasses,
                    hash_url: hashUrl,
                    token,
                    sendEmail: sendResetEmail
                }),
            });

            if (!response.ok) {
                throw new Error("Erro ao redefinir a senha.");
            }

            const result = await response.json();
            
            const successMessage = sendResetEmail 
                ? result.emailSent 
                    ? "Dados de redefinição de senha gerados e enviados por email com sucesso!" 
                    : "Dados gerados mas não foi possível enviar o email. O link está disponível para cópia."
                : "Dados de redefinição de senha gerados com sucesso!";
                
            setAlert({ type: "success", message: successMessage });
            setShowResetModal(false);
            router.push("/admin/users"); // Redirecionamento após sucesso
        } catch (err) {
            setAlert({ type: "error", message: "Falha ao redefinir a senha." });
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/admin/users/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    role,
                    phone_number: phoneNumber,
                    classes: selectedClasses,
                }),
            });

            if (!response.ok) {
                throw new Error("Erro ao atualizar o usuário.");
            }

            setAlert({ type: "success", message: "Usuário atualizado com sucesso!" });
            // Redirecionamento após o sucesso
            router.push("/admin/users");
        } catch (err) {
            setAlert({ type: "error", message: "Falha ao atualizar o usuário." });
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
                            onClick={() => router.push("/admin/users")}
                        >
                            <FaArrowLeft />
                        </button>
                        <h1 className="card-title">Editar Usuário</h1>
                    </div>

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
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+55 (00) 00000-0000"
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
                            />
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
                                                  .join(" - ")
                                            : "Selecione turmas"}
                                    </div>
                                    {dropdownOpen && (
                                        <div className="bg-base-200 absolute z-10 border border-base-300 rounded shadow-md mt-2 w-full">
                                            {classes.map((cls) => (
                                                <label
                                                    key={cls.id}
                                                    className="flex items-center gap-2 p-2"
                                                >
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

                        <div className="space-y-4">
                            {/* Outros campos do formulário */}
                            {hashUrl && token && (
                                <>
                                    <div className="divider">Token</div>
                                   
                                    <p>
                                    Este usuário já possui um token de redefinição de senha gerado.
                                    </p>

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
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-square"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(hashUrl).then(() => {
                                                        setAlert({ type: "success", message: "URL copiada para a área de transferência!" });
                                                    });
                                                }}
                                            >
                                                <FaCopy />
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
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-square"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(token).then(() => {
                                                        setAlert({ type: "success", message: "Token copiado para a área de transferência!" });
                                                    });
                                                }}
                                            >
                                                <FaCopy />
                                            </button>
                                        </div>
                                    </div>

                                    <p>Você pode gerar um novo token clicando no botão de redefinir abaixo.</p>

                                    <div className="divider"></div>
                                </>
                            )}
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
                                        Atualizando...
                                    </>
                                ) : (
                                    "Atualizar Usuário"
                                )}
                            </button>
                        </div>

                        <div className="fieldset mt-4">
                            <button
                                type="button"
                                className="btn btn-secondary w-full"
                                onClick={openResetModal}
                                disabled={isSubmitting}
                            >
                                Redefinir Senha
                            </button>
                        </div>

                        {/* Modal de Redefinição de Senha */}
                        {showResetModal && (
                            <dialog id="reset_modal" className="modal modal-bottom sm:modal-middle" open>
                                <div className="modal-box bg-base-200">
                                    {resetStep === 1 ? (
                                        <>
                                            <h3 className="font-bold text-lg">Redefinir Senha</h3>
                                            <p className="py-4">Gere os dados de redefinição de senha abaixo:</p>

                                            <div className="space-y-4">
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

                                                <div className="form-control mt-4">
                                                    <label className="label cursor-pointer">
                                                        <span className="label-text">Enviar por email</span>
                                                        <input
                                                            type="checkbox"
                                                            className="toggle toggle-primary"
                                                            checked={sendResetEmail}
                                                            onChange={() => setSendResetEmail(!sendResetEmail)}
                                                        />
                                                    </label>
                                                    {sendResetEmail && (
                                                        <p className="text-xs mt-1 text-info">
                                                            Um email será enviado para {email} com os dados de redefinição
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="modal-action">
                                                <button
                                                    className="btn btn-outline"
                                                    onClick={() => setShowResetModal(false)}
                                                    disabled={isSubmitting}
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => setResetStep(2)}
                                                    disabled={!hashUrl || !token || isSubmitting} // Desabilita o botão se os campos estiverem vazios
                                                >
                                                    Continuar
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="font-bold text-lg">Mensagem de Redefinição de Senha</h3>
                                            <p className="py-4">Copie a mensagem abaixo e envie para o usuário:</p>

                                            <div className="mockup-code w-full break-words overflow-hidden whitespace-pre-wrap p-2">
                                                <code>
                                                    {`Olá, redefina sua senha acessando a URL abaixo:\n\nhttps://psicologiacatolicatradicional.com/pwd/`}
                                                    <span className="bg-primary/50 px-1 rounded-sm">{hashUrl}</span>
                                                    {`\n\nSeu token de acesso: `}
                                                    <span className="bg-primary/50 px-1 rounded-sm">{token}</span>
                                                    {`\n\nEsse token e URL terão validade de 5 dias. Caso tenha dúvidas, entre em contato com o suporte.`}
                                                </code>
                                            </div>

                                            <div className="modal-action">
                                                <button
                                                    className="btn btn-outline btn-square"
                                                    onClick={() => {
                                                        const message = `Olá, redefina sua senha acessando a URL abaixo:\n\nhttps://psicologiacatolicatradicional.com/pwd/${hashUrl}\n\nSeu token de acesso: ${token}\n\nEsse token e URL terão validade de 5 dias. Caso tenha dúvidas, entre em contato com o suporte.`;
                                                        navigator.clipboard.writeText(message).then(() => {
                                                            setAlert({ type: "success", message: "Mensagem copiada para a área de transferência!" });
                                                        });
                                                    }}
                                                    disabled={isSubmitting}
                                                >
                                                    <FaCopy />
                                                </button>
                                                <button
                                                    className="btn btn-outline btn-error"
                                                    onClick={() => setShowResetModal(false)}
                                                    disabled={isSubmitting}
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={handleResetPassword}
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
                                        </>
                                    )}
                                </div>
                            </dialog>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}