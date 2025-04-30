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
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h1 className="text-2xl font-semibold text-center mb-6">Link inválido ou expirado</h1>
          <p className="text-center mb-4">O link de redefinição de senha é inválido ou expirou.</p>
          <div className="flex justify-center">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Voltar para o início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-center mb-6">
          {step === 'token' ? 'Verificação de Segurança' : 'Defina uma Nova Senha'}
        </h1>

        {message && (
          <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
        )}

        {step === 'token' && (
          <form onSubmit={validateToken}>
            <div className="mb-4">
              <label htmlFor="token" className="block mb-2 text-sm font-medium">
                Digite o código de 6 dígitos enviado para seu e-mail
              </label>
              <input
                id="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Digite o código de 6 dígitos"
                maxLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Verificar Código'}
            </button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={resetPassword}>
            <div className="mb-4">
              <label htmlFor="password" className="block mb-2 text-sm font-medium">
                Nova senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Digite sua nova senha"
                required
                minLength={8}
              />
            </div>
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium">
                Confirme a senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Confirme sua nova senha"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Redefinir Senha'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-blue-600 hover:underline"
          >
            Voltar para o início
          </button>
        </div>
      </div>
    </div>
  );
}