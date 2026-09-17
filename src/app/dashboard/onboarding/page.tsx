"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingOrError from "@/components/LoadingOrError";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/onboarding")
      .then(r => r.json())
      .then(data => {
        if (data.onboarding_complete) {
          router.replace("/dashboard");
          return;
        }
        setName(data.name ?? "");
        setPhone(data.phone_number ?? "");
      })
      .catch(() => setError("Erro ao carregar dados. Recarregue a página."))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/dashboard/onboarding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), phone_number: phone.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Erro ao salvar. Tente novamente.");
      setSubmitting(false);
      return;
    }

    router.push("/dashboard");
  };

  if (loading) return <LoadingOrError loading={true} error={null} />;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-base-100">
      <div className="w-full max-w-sm">

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-base-content/40 mb-2">
            Bem-vindo ao portal
          </p>
          <h1 className="font-display text-3xl md:text-4xl leading-tight">
            Complete seu cadastro
          </h1>
          <p className="mt-3 text-sm text-base-content/60 leading-relaxed">
            Precisamos de mais algumas informações antes de você acessar o portal.
          </p>
        </header>

        {error && (
          <div className="alert alert-error mb-6 border border-error/30 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-base-content/50 mb-1.5">
              Nome completo
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Seu nome completo"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-base-content/50 mb-1.5">
              Telefone / WhatsApp
            </label>
            <input
              type="tel"
              className="input input-bordered w-full"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              required
            />
            <p className="text-xs text-base-content/40 mt-1.5">
              Usado pela coordenação para contato via WhatsApp.
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full mt-2"
            disabled={submitting}
          >
            {submitting ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Acessar o portal"
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
