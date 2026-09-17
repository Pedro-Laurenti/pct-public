"use client";

import { useState, useEffect } from "react";
import { BiShow, BiHide } from "react-icons/bi";
import { FaGoogle } from "react-icons/fa";
import LoadingOrError from "@/components/LoadingOrError";

type ProfileData = {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
  auth_provider: "local" | "google";
};

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", phone_number: "" });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password reset
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetRequestSent, setResetRequestSent] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(data => {
        setUser(data.user);
        setFormData({
          name: data.user.name,
          email: data.user.email,
          phone_number: data.user.phone_number ?? "",
        });
      })
      .catch(() => setProfileError("Erro ao carregar perfil."))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setProfileError(null);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const data = await res.json();
      setProfileError(data.message ?? "Erro ao salvar.");
    } else {
      setUser(prev => prev ? { ...prev, ...formData } : null);
      setSubmitSuccess(true);
    }
    setIsSubmitting(false);
  };

  const handlePasswordResetRequest = async () => {
    setResetError(null);
    const res = await fetch("/api/profile/reset-password", { method: "POST" });
    if (!res.ok) {
      const data = await res.json();
      setResetError(data.message ?? "Erro ao solicitar redefinição.");
      return;
    }
    setResetRequestSent(true);
    setShowResetForm(true);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    if (newPassword !== confirmPassword) { setResetError("As senhas não coincidem."); return; }
    if (newPassword.length < 8) { setResetError("A senha deve ter pelo menos 8 caracteres."); return; }
    if (!/^\d{6}$/.test(resetToken)) { setResetError("O código deve ter 6 dígitos."); return; }

    const res = await fetch("/api/profile/confirm-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: resetToken, newPassword }),
    });

    if (!res.ok) {
      const data = await res.json();
      setResetError(data.message ?? "Erro ao redefinir senha.");
      return;
    }

    setResetSuccess(true);
    setShowResetForm(false);
    setResetToken(""); setNewPassword(""); setConfirmPassword("");
  };

  if (loading) return <LoadingOrError loading={true} error={null} />;

  const isGoogleUser = user?.auth_provider === "google";

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-10">

      <header>
        <h1 className="font-display text-3xl md:text-4xl leading-tight">Meu Perfil</h1>
        <p className="mt-2 text-sm text-base-content/50">
          Gerencie suas informações pessoais e credenciais de acesso.
        </p>
      </header>

      {/* Dados pessoais */}
      <section className="border border-base-content/8 p-6 space-y-5">
        <h2 className="font-serif text-lg">Informações pessoais</h2>

        {profileError && (
          <div className="alert alert-error border border-error/30 text-sm">{profileError}</div>
        )}
        {submitSuccess && (
          <div className="alert alert-success border border-success/30 text-sm">Perfil atualizado com sucesso.</div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-base-content/50 mb-1.5">
              Nome completo
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-base-content/50 mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              className="input input-bordered w-full"
              value={formData.email}
              onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
              required
              disabled={isGoogleUser}
            />
            {isGoogleUser && (
              <p className="text-xs text-base-content/40 mt-1.5">
                O e-mail é gerenciado pela sua conta Google e não pode ser alterado aqui.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-base-content/50 mb-1.5">
              Telefone / WhatsApp
            </label>
            <input
              type="tel"
              className="input input-bordered w-full"
              value={formData.phone_number}
              onChange={e => setFormData(p => ({ ...p, phone_number: e.target.value }))}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : "Salvar alterações"}
            </button>
          </div>
        </form>
      </section>

      {/* Segurança */}
      <section className="border border-base-content/8 p-6 space-y-5">
        <h2 className="font-serif text-lg">Segurança da conta</h2>

        {isGoogleUser ? (
          <div className="flex items-start gap-3 p-4 border border-base-content/8 bg-base-200/40">
            <FaGoogle className="text-base-content/40 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Conta vinculada ao Google</p>
              <p className="text-xs text-base-content/50 mt-1 leading-relaxed">
                Sua autenticação é gerenciada pelo Google. Não existe senha local associada a esta conta.
                Para alterar sua senha, acesse as configurações da sua conta Google.
              </p>
            </div>
          </div>
        ) : (
          <>
            {resetSuccess && (
              <div className="alert alert-success border border-success/30 text-sm">Senha redefinida com sucesso.</div>
            )}
            {resetError && (
              <div className="alert alert-error border border-error/30 text-sm">{resetError}</div>
            )}

            {!showResetForm ? (
              <div className="space-y-4">
                <p className="text-sm text-base-content/60">
                  Para redefinir sua senha, um código de 6 dígitos será enviado para o seu e-mail cadastrado.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className="btn btn-outline btn-sm" onClick={handlePasswordResetRequest}>
                    Enviar código de redefinição
                  </button>
                  {resetRequestSent && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowResetForm(true)}>
                      Já tenho o código
                    </button>
                  )}
                </div>
                {resetRequestSent && (
                  <p className="text-xs text-base-content/50">
                    Código enviado para <strong>{user?.email}</strong>. Verifique também o spam.
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-base-content/50 mb-1.5">
                    Código de verificação
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full font-mono text-center text-lg tracking-[0.3em]"
                    value={resetToken}
                    onChange={e => setResetToken(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    placeholder="000000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-base-content/50 mb-1.5">
                    Nova senha
                  </label>
                  <label className="input input-bordered flex items-center gap-2 w-full">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="grow"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                    <button type="button" onClick={() => setShowNewPassword(v => !v)}
                      className="text-base-content/40 hover:text-base-content" tabIndex={-1}>
                      {showNewPassword ? <BiHide /> : <BiShow />}
                    </button>
                  </label>
                  <p className="text-xs text-base-content/40 mt-1">Mínimo de 8 caracteres.</p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-base-content/50 mb-1.5">
                    Confirmar nova senha
                  </label>
                  <label className="input input-bordered flex items-center gap-2 w-full">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="grow"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(v => !v)}
                      className="text-base-content/40 hover:text-base-content" tabIndex={-1}>
                      {showConfirmPassword ? <BiHide /> : <BiShow />}
                    </button>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => {
                    setShowResetForm(false);
                    setResetToken(""); setNewPassword(""); setConfirmPassword("");
                  }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Redefinir senha
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </section>

    </div>
  );
}
