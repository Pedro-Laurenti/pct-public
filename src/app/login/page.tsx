"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Alert from "@/components/Alert";
import Link from "next/link";
import Image from "next/image";
import { BiKey, BiUser, BiShow, BiHide } from "react-icons/bi";
import { FaGoogle } from "react-icons/fa";

const OAUTH_ENABLED = process.env.NEXT_PUBLIC_ENABLE_OAUTH === "true";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/validate", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          router.push(data.user?.role === "mentor" ? "/admin" : "/dashboard");
        }
      } catch {}
    };
    checkAuth();
  }, [router]);

  const handleLogin = async () => {
    setError("");
    setShowAlert(false);
    if (!email || !password) {
      setError("Preencha todos os campos.");
      setShowAlert(true);
      return;
    }
    setLoading(true);
    const start = Date.now();
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const elapsed = Date.now() - start;
      if (elapsed < 1000) await new Promise(r => setTimeout(r, 1000 - elapsed));
      if (response.ok) {
        const data = await response.json();
        router.push(data.role === "mentor" ? "/admin" : "/api/auth/after-oauth");
      } else {
        setLoading(false);
        const data = await response.json();
        setError(data.message || "Credenciais inválidas.");
        setShowAlert(true);
      }
    } catch {
      setLoading(false);
      setError("Erro ao conectar ao servidor.");
      setShowAlert(true);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" data-theme="mydark">
      {showAlert && (
        <Alert type="error" message={error} onClose={() => setShowAlert(false)} />
      )}

      {/* Painel do formulário */}
      <div className="flex flex-col justify-center items-center w-full lg:w-5/12 bg-base-200 px-8 overflow-y-auto">
        <div className="w-full max-w-sm py-6">

          {/* Escudo */}
          <div className="flex justify-center mb-5">
            <img src="/images/logo.svg" alt="Psicologia Católica Tomista" className="w-10 h-10 opacity-90" />
          </div>

          {/* Título */}
          <h1 className="font-display text-[2.5rem] text-center text-base-content leading-[1.15] mb-1">
            Acesse sua<br />
            <span className="text-primary">formação</span>
          </h1>

          <p className="text-center text-base-content/40 text-[0.6rem] tracking-[0.25em] uppercase mb-5">
            Psicologia Católica Tomista
          </p>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 border-t border-base-content/10" />
            <span className="text-primary/40 text-[0.55rem]">✦</span>
            <div className="flex-1 border-t border-base-content/10" />
          </div>

          <form onSubmit={e => { e.preventDefault(); handleLogin(); }} className="space-y-3">
            <div className="space-y-1">
              <span className="text-[0.6rem] text-base-content/40 uppercase tracking-[0.15em]">Email</span>
              <label className="input w-full">
                <BiUser className="text-base-content/30" />
                <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </label>
            </div>

            <div className="space-y-1">
              <span className="text-[0.6rem] text-base-content/40 uppercase tracking-[0.15em]">Senha</span>
              <label className="input w-full">
                <BiKey className="text-base-content/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="text-base-content/30 hover:text-base-content/70 transition-colors" tabIndex={-1}>
                  {showPassword ? <BiHide /> : <BiShow />}
                </button>
              </label>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="checkbox checkbox-xs checkbox-primary" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                <span className="text-xs text-base-content/50">Lembrar de mim</span>
              </label>
              <Link href="/forgot-password" className="text-xs text-primary/70 hover:text-primary transition-colors">
                Esqueci minha senha
              </Link>
            </div>

            <button type="submit" className="btn btn-primary w-full tracking-wider" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Entrar"}
            </button>

            {OAUTH_ENABLED && (
              <>
                <div className="flex items-center gap-3 my-0.5">
                  <div className="flex-1 border-t border-base-content/10" />
                  <span className="text-[0.55rem] text-base-content/25 uppercase tracking-wider">ou</span>
                  <div className="flex-1 border-t border-base-content/10" />
                </div>
                <button type="button" className="btn btn-outline w-full gap-2" onClick={() => signIn("google")}>
                  <FaGoogle size={13} /> Entrar com Google
                </button>
                <p className="text-center text-xs text-base-content/35">
                  Ainda não tem conta?{" "}
                  <Link href="/register" className="text-primary/70 hover:text-primary transition-colors">Criar conta</Link>
                </p>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Painel da foto */}
      <div className="hidden lg:block lg:w-7/12 relative overflow-hidden">
        <Image src="/images/liliane-lopes.jpg" alt="Liliane Lopes" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-10 left-10 max-w-xs">
          <p className="font-serif text-white/65 text-lg italic font-light leading-relaxed">
            &ldquo;O conhecimento de si mesmo é o começo<br />de toda sabedoria.&rdquo;
          </p>
          <p className="text-white/35 text-[0.6rem] mt-3 tracking-[0.2em] uppercase">— Aristóteles</p>
        </div>
      </div>
    </div>
  );
}
