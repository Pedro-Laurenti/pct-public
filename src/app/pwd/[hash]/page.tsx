"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Alert from "@/components/Alert";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const hash = params?.hash as string || '';

  const [step, setStep] = useState<'token' | 'password'>('token');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [validHash, setValidHash] = useState(false);

  // Verificar se o hash é válido ao carregar a página
  useEffect(() => {
    async function verifyHash() {
      try {
        const response = await fetch(`/api/pwd/validate?hash=${hash}`);
        const data = await response.json();
        
        if (response.ok) {
          setValidHash(true);
        } else {
          setMessage({ type: 'error', text: data.message || 'Hash inválido ou expirado' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Erro ao verificar o link de redefinição' });
      }
    }

    verifyHash();
  }, [hash]);

  const validateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!token.match(/^\d{6}$/)) {
      setMessage({ type: 'error', text: 'O código deve conter 6 dígitos' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/pwd/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash, token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('password');
        setMessage({ type: 'success', text: 'Código verificado com sucesso! Defina sua nova senha.' });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ocorreu um erro ao validar o código' });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validações da senha
    if (password.length < 8) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 8 caracteres' });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/pwd/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash, token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Senha redefinida com sucesso!' });
        
        // Redirecionar para a página de login após 2 segundos
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ocorreu um erro ao redefinir sua senha' });
    } finally {
      setLoading(false);
    }
  };

  if (!validHash && !message?.text.includes('verificar')) {
    return (
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="card w-full max-w-md bg-base-100 shadow-xl">
            <div className="card-body">
              <h1 className="card-title text-2xl justify-center mb-4">Link inválido ou expirado</h1>
              <p className="mb-6">O link de redefinição de senha é inválido ou expirou.</p>
              <div className="card-actions justify-center">
                <button
                  onClick={() => router.push('/')}
                  className="btn btn-primary w-full"
                >
                  Voltar para o início
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-2xl justify-center mb-4">
              {step === 'token' ? 'Verificação de Segurança' : 'Defina uma Nova Senha'}
            </h1>

            {message && (
              <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
            )}

            {step === 'token' && (
              <form onSubmit={validateToken}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text mb-2">Digite o código de 6 dígitos enviado para seu e-mail</span>
                  </label>
                  <input
                    id="token"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input input-bordered w-full"
                    placeholder="Código de 6 dígitos"
                    maxLength={6}
                    required
                  />
                </div>
                <div className="form-control mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full"
                  >
                    {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Verificar Código'}
                  </button>
                </div>
              </form>
            )}

            {step === 'password' && (
              <form onSubmit={resetPassword}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Nova senha</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Digite sua nova senha"
                    required
                    minLength={8}
                  />
                </div>
                <div className="form-control mb-6">
                  <label className="label">
                    <span className="label-text">Confirme a senha</span>
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Confirme sua nova senha"
                    required
                  />
                </div>
                <div className="form-control mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full"
                  >
                    {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Redefinir Senha'}
                  </button>
                </div>
              </form>
            )}

            <div className="divider mt-4"></div>
            
            <div className="text-center">
              <button
                onClick={() => router.push('/')}
                className="btn btn-link"
              >
                Voltar para o início
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}