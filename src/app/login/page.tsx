"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Alert from "@/components/Alert";
import Link from "next/link";
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
        // Mesmo fluxo que after-oauth: sem turma + payments → checkout
        if (data.role === "mentor") {
          router.push("/admin");
        } else {
          router.push("/api/auth/after-oauth");
        }
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
    <div className="flex items-center justify-center min-h-screen bg-base-100 px-4">
      {showAlert && (
        <Alert type="error" message={error} onClose={() => setShowAlert(false)} />
      )}

      <form onSubmit={e => { e.preventDefault(); handleLogin(); }}>
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 space-y-1">
          <legend className="fieldset-legend text-2xl font-bold">Login</legend>

          <label className="label">Email</label>
          <label className="input">
            <BiUser />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="label">Senha</label>
          <label className="input">
            <BiKey />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="text-base-content/50 hover:text-base-content"
              tabIndex={-1}
            >
              {showPassword ? <BiHide /> : <BiShow />}
            </button>
          </label>

          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-primary"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
              <span className="label-text">Lembrar de mim</span>
            </label>
            <Link href="/forgot-password" className="link link-hover text-sm text-primary">
              Esqueci minha senha
            </Link>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
            {loading ? <span className="loading loading-spinner" /> : "Entrar"}
          </button>

          {OAUTH_ENABLED && (
            <>
              <div className="divider text-xs text-base-content/40 my-1">ou</div>

              <button
                type="button"
                className="btn btn-outline w-full gap-2"
                onClick={() => signIn("google")}
              >
                <FaGoogle /> Entrar com Google
              </button>

              <p className="text-center text-sm text-base-content/60 mt-2">
                Ainda não tem conta?{" "}
                <Link href="/register" className="link link-primary">Criar conta</Link>
              </p>
            </>
          )}
        </fieldset>
      </form>
    </div>
  );
}
