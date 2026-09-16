"use client";
import { useState } from "react";
import Link from "next/link";
import { BiUser } from "react-icons/bi";
import Alert from "@/components/Alert";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSent(true);
        setAlert({ type: "success", message: data.message });
      } else {
        setAlert({ type: "error", message: data.message || "Erro ao processar solicitacao." });
      }
    } catch {
      setAlert({ type: "error", message: "Erro ao conectar ao servidor." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-100">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="card bg-base-200 shadow-xl w-full max-w-sm">
        <div className="card-body">
          <h1 className="card-title text-2xl font-bold mb-2">Recuperar Senha</h1>

          {sent ? (
            <div className="space-y-4">
              <p className="text-base-content/70">
                Se o email informado existir em nosso sistema, voce recebera as instrucoes para redefinir sua senha em breve.
              </p>
              <p className="text-sm text-base-content/50">Verifique tambem sua pasta de spam.</p>
              <Link href="/login" className="btn btn-primary w-full">
                Voltar ao Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-base-content/70 text-sm">
                Informe seu email de cadastro e enviaremos as instrucoes para redefinir sua senha.
              </p>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <label className="input">
                  <BiUser />
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner" /> : "Enviar instrucoes"}
              </button>

              <div className="text-center">
                <Link href="/login" className="link link-hover text-sm">
                  Voltar ao login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
