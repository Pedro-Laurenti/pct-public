"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/Alert";
import Link from "next/link";
import { BiKey, BiUser, BiShow, BiHide } from "react-icons/bi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  // Verifica se o cookie de autenticação já existe
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/validate", {
          method: "GET",
          credentials: "include", // Inclui cookies na requisição
        });

        if (response.ok) {
          const data = await response.json();
          router.push(data.user?.role === "mentor" ? "/admin" : "/dashboard");
        }
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err);
      }
    };

    checkAuth();
  }, [router]);
  const handleLogin = async () => {
    setError("");
    setShowAlert(false);

    // Validação local
    if (!email || !password) {
      setError("Preencha todos os campos.");
      setShowAlert(true);
      return;
    }

    setLoading(true);

    const MIN_LOADING_TIME = 1000; // 1 segundo
    const startTime = Date.now();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const elapsedTime = Date.now() - startTime;
      const remainingTime = MIN_LOADING_TIME - elapsedTime;

      // Aguarda o tempo mínimo de carregamento
      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      if (response.ok) {
        const data = await response.json();
        router.push(data.role === "mentor" ? "/admin" : "/dashboard");
      } else {
        // Desativa o loading apenas em caso de erro
        setLoading(false);
        const data = await response.json();
        setError(data.message || "Erro ao fazer login");
        setShowAlert(true);
      }
    } catch (err) {
      // Desativa o loading em caso de erro de conexão
      setLoading(false);
      setError("Erro ao conectar ao servidor.");
      setShowAlert(true);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="flex items-center justify-center h-screen bg-base-100">
      {showAlert && (
        <Alert
          type="error"
          message={error}
          onClose={() => setShowAlert(false)}
        />
      )}
      <form onSubmit={handleSubmit}>
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
          <legend className="fieldset-legend text-2xl font-bold">Login</legend>

          <label className="label">Email</label>
          <label className="input">
            <BiUser />
            <input
              type="email"
              placeholder="Email"
              title="Insira um endereço de email válido"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-base-content/50 hover:text-base-content"
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
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
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="label-text">Lembrar de mim</span>
            </label>
            <Link href="/forgot-password" className="link link-hover text-sm text-primary">
              Esqueci minha senha
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full mt-4"
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner"></span> : "Entrar"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}
