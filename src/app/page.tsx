"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/Alert";
import { BiKey, BiUser } from "react-icons/bi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
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
          router.push("/dashboard"); // Redireciona para o dashboard
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
        body: JSON.stringify({ email, password }),
      });

      const elapsedTime = Date.now() - startTime;
      const remainingTime = MIN_LOADING_TIME - elapsedTime;

      // Aguarda o tempo mínimo de carregamento
      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      if (response.ok) {
        router.push("/dashboard");
      } else {
        const data = await response.json();
        setError(data.message || "Erro ao fazer login");
        setShowAlert(true);
      }
    } catch (err) {
      setLoading(false);
      setError("Erro ao conectar ao servidor.");
      setShowAlert(true);
    }
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
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button
          type="button"
          className="btn btn-primary w-full mt-4"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? <span className="loading loading-spinner"></span> : "Entrar"}
        </button>
      </fieldset>
    </div>
  );
}
