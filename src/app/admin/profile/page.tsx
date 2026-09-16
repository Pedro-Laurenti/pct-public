"use client";

import { useEffect, useState } from "react";
import { BiShow, BiHide } from "react-icons/bi";
import LoadingOrError from "@/components/LoadingOrError";

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Personal info form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [infoSubmitting, setInfoSubmitting] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState<string | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setFetchError(null);
      try {
        const response = await fetch("/api/admin/profile");
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Erro ao carregar perfil.");
        }
        const data = await response.json();
        setUser(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
      } catch (err: any) {
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoSuccess(null);
    setInfoError(null);

    if (!name.trim() || !email.trim()) {
      setInfoError("Nome e email sao obrigatorios.");
      return;
    }

    setInfoSubmitting(true);
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao atualizar perfil.");
      }

      setInfoSuccess(data.message || "Perfil atualizado com sucesso.");
      if (user) {
        setUser({ ...user, name, email });
      }
    } catch (err: any) {
      setInfoError(err.message);
    } finally {
      setInfoSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Todos os campos de senha sao obrigatorios.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("A nova senha e a confirmacao nao coincidem.");
      return;
    }

    setPasswordSubmitting(true);
    try {
      const response = await fetch("/api/admin/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao alterar senha.");
      }

      setPasswordSuccess(data.message || "Senha alterada com sucesso.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (loading || fetchError) {
    return (
      <div className="p-6">
        <LoadingOrError loading={loading} error={fetchError} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Meu Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Personal Info */}
        <div className="card bg-base-200 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg">Informacoes Pessoais</h2>

            <form onSubmit={handleInfoSubmit} className="space-y-4 mt-2">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nome</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                  required
                />
              </div>

              {infoSuccess && (
                <p className="text-success text-sm">{infoSuccess}</p>
              )}
              {infoError && (
                <p className="text-error text-sm">{infoError}</p>
              )}

              <div className="card-actions justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={infoSubmitting}
                >
                  {infoSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Salvando...
                    </>
                  ) : (
                    "Salvar alteracoes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Card 2: Change Password */}
        <div className="card bg-base-200 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg">Alterar Senha</h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-2">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Senha atual</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    className="input input-bordered w-full pr-10"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? <BiHide size={20} /> : <BiShow size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nova senha</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="input input-bordered w-full pr-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimo 8 caracteres"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                  >
                    {showNewPassword ? <BiHide size={20} /> : <BiShow size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirmar nova senha</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="input input-bordered w-full pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <BiHide size={20} /> : <BiShow size={20} />}
                  </button>
                </div>
              </div>

              {passwordSuccess && (
                <p className="text-success text-sm">{passwordSuccess}</p>
              )}
              {passwordError && (
                <p className="text-error text-sm">{passwordError}</p>
              )}

              <div className="card-actions justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={passwordSubmitting}
                >
                  {passwordSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Alterando...
                    </>
                  ) : (
                    "Alterar senha"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
