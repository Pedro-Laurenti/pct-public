"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";

const OAUTH_ENABLED = process.env.NEXT_PUBLIC_ENABLE_OAUTH === "true";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!OAUTH_ENABLED) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-base-content/60">Cadastro não disponível no momento.</p>
          <Link href="/login" className="btn btn-primary btn-sm">Ir para o Login</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Erro ao criar conta.");
        return;
      }

      // Redireciona via after-oauth para decidir checkout vs dashboard
      router.push("/api/auth/after-oauth");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card bg-base-100 shadow-md w-full max-w-md">
        <div className="card-body space-y-4">
          <h1 className="text-2xl font-bold text-center">Criar conta</h1>

          {error && (
            <div className="alert alert-error text-sm">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label"><span className="label-text">Nome completo</span></label>
              <input
                className="input input-bordered w-full"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label"><span className="label-text">E-mail</span></label>
              <input
                className="input input-bordered w-full"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="label"><span className="label-text">Senha</span></label>
              <div className="relative">
                <input
                  className="input input-bordered w-full pr-10"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50"
                  onClick={() => setShowPwd(!showPwd)}
                  tabIndex={-1}
                >
                  {showPwd ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="label"><span className="label-text">Confirmar senha</span></label>
              <input
                className="input input-bordered w-full"
                type={showPwd ? "text" : "password"}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repita a senha"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Criar conta"}
            </button>
          </form>

          <div className="divider text-xs text-base-content/40">ou</div>

          <button
            className="btn btn-outline w-full gap-2"
            onClick={() => signIn("google")}
          >
            <FaGoogle /> Continuar com Google
          </button>

          <p className="text-center text-sm text-base-content/60">
            Já tem conta?{" "}
            <Link href="/login" className="link link-primary">Fazer login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
