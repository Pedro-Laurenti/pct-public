"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
      <div className="h-screen flex flex-col items-center justify-center bg-base-200 px-4 overflow-hidden" data-theme="mydark">
        <img src="/images/logo.svg" alt="" className="w-12 h-12 mb-6 opacity-85" />
        <p className="font-display text-2xl text-center text-base-content mb-3">
          Cadastro indisponível
        </p>
        <p className="text-sm text-base-content/40 mb-8 text-center max-w-xs">
          O cadastro de novos usuários está desativado no momento.
        </p>
        <Link href="/login" className="btn btn-primary btn-sm tracking-wider">
          Ir para o Login
        </Link>
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

      router.push("/api/auth/after-oauth");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" data-theme="mydark">
      {/* Painel do formulário */}
      <div className="flex flex-col justify-center items-center w-full lg:w-5/12 bg-base-200 px-8 overflow-y-auto">
        <div className="w-full max-w-sm py-6">

          {/* Escudo */}
          <div className="flex justify-center mb-4">
            <img
              src="/images/logo.svg"
              alt="Psicologia Católica Tomista"
              className="w-10 h-10 opacity-85"
            />
          </div>

          {/* Título */}
          <h1 className="font-display text-[2.5rem] text-center text-base-content leading-[1.15] mb-1">
            Crie sua<br />
            <span className="text-primary">conta</span>
          </h1>

          <p className="text-center text-base-content/40 text-[0.6rem] tracking-[0.25em] uppercase mb-4">
            Psicologia Católica Tomista
          </p>

          {/* Divisor ornamental */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 border-t border-base-content/10" />
            <span className="text-primary/40 text-[0.55rem]">✦</span>
            <div className="flex-1 border-t border-base-content/10" />
          </div>

          {/* Erro */}
          {error && (
            <div className="alert alert-error text-sm mb-4 py-2">
              <span>{error}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <span className="text-[0.65rem] text-base-content/40 uppercase tracking-[0.15em]">Nome completo</span>
              <label className="input w-full">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  autoFocus
                />
              </label>
            </div>

            <div className="space-y-1">
              <span className="text-[0.65rem] text-base-content/40 uppercase tracking-[0.15em]">E-mail</span>
              <label className="input w-full">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </label>
            </div>

            <div className="space-y-1">
              <span className="text-[0.65rem] text-base-content/40 uppercase tracking-[0.15em]">Senha</span>
              <label className="input w-full">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="text-base-content/30 hover:text-base-content/70 transition-colors"
                  tabIndex={-1}
                >
                  {showPwd ? <FaEyeSlash /> : <FaEye />}
                </button>
              </label>
            </div>

            <div className="space-y-1">
              <span className="text-[0.65rem] text-base-content/40 uppercase tracking-[0.15em]">Confirmar senha</span>
              <label className="input w-full">
                <input
                  type={showPwd ? "text" : "password"}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repita a senha"
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full tracking-wider mt-2"
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Criar conta"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 border-t border-base-content/10" />
            <span className="text-[0.6rem] text-base-content/25 uppercase tracking-wider">ou</span>
            <div className="flex-1 border-t border-base-content/10" />
          </div>

          <button
            className="btn btn-outline w-full gap-2"
            onClick={() => signIn("google")}
          >
            <FaGoogle size={14} /> Continuar com Google
          </button>

          <p className="text-center text-xs text-base-content/35 mt-4">
            Já tem conta?{" "}
            <Link href="/login" className="text-accent/70 hover:text-accent transition-colors">
              Fazer login
            </Link>
          </p>
        </div>
      </div>

      {/* Painel da foto */}
      <div className="hidden lg:block lg:w-7/12 relative overflow-hidden">
        <Image
          src="/images/2.jpg"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-10 left-10 max-w-xs">
          <p className="font-serif text-white/65 text-lg italic font-light leading-relaxed">
            &ldquo;Conhece-te a ti mesmo e conhecerás<br />o universo e os deuses.&rdquo;
          </p>
          <p className="text-white/35 text-[0.6rem] mt-3 tracking-[0.2em] uppercase">
            — Sócrates
          </p>
        </div>
      </div>
    </div>
  );
}
