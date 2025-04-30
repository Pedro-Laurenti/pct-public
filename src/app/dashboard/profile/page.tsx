"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type ProfileData = {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
};

export default function ProfilePage() {
  // State for user data
  const [user, setUser] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
  });
  
  // Password reset states
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetRequestSent, setResetRequestSent] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  
  // Form submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const router = useRouter();

  // Fetch user data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const data = await response.json();
        setUser(data.user);
        setFormData({
          name: data.user.name,
          email: data.user.email,
          phone_number: data.user.phone_number || '',
        });
      } catch (err) {
        setError('Error loading profile. Please try again later.');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setError(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const result = await response.json();
      setUser(prev => prev ? { ...prev, ...formData } : null);
      setSubmitSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error updating profile. Please try again.');
      console.error('Error updating profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password reset request
  const handlePasswordResetRequest = async () => {
    setResetRequestSent(false);
    setResetError(null);
    
    try {
      const response = await fetch('/api/profile/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to request password reset');
      }
      
      setResetRequestSent(true);
      setShowResetForm(true);
    } catch (err: any) {
      setResetError(err.message || 'Error requesting password reset. Please try again.');
      console.error('Error requesting password reset:', err);
    }
  };

  // Handle password reset verification and change
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    
    // Validate password
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setResetError('Password must be at least 8 characters long');
      return;
    }
    
    // Validate token format (6 digits)
    if (!/^\d{6}$/.test(resetToken)) {
      setResetError('Token must be 6 digits');
      return;
    }
    
    try {
      const response = await fetch('/api/profile/confirm-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          newPassword,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }
      
      setResetSuccess(true);
      setShowResetForm(false);
      
      // Clear form fields
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setResetError(err.message || 'Error resetting password. Please try again.');
      console.error('Error resetting password:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-100">
        <div className="flex flex-col items-center space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content animate-pulse">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-base-100">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Meu Perfil</h1>
        <p className="text-base-content/70">Gerencie suas informações pessoais e credenciais de acesso</p>
      </div>
      
      {error && (
        <div className="alert alert-error shadow-lg mb-6 max-w-3xl mx-auto">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setError(null)}>✕</button>
        </div>
      )}
      
      {submitSuccess && (
        <div className="alert alert-success shadow-lg mb-6 max-w-3xl mx-auto animate-fadeIn">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Perfil atualizado com sucesso!</span>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setSubmitSuccess(false)}>✕</button>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information Card */}
        <div className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-all duration-300">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
              <h2 className="card-title text-2xl text-primary flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Informações Pessoais
              </h2>
              {submitSuccess && (
                <span className="badge badge-success">Atualizado</span>
              )}
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Nome Completo</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="input input-bordered focus:input-primary w-full"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">E-mail</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="input input-bordered focus:input-primary w-full"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu.email@exemplo.com"
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/70">Este e-mail será usado para comunicações importantes</span>
                </label>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Telefone</span>
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  className="input input-bordered focus:input-primary w-full"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/70">Opcional</span>
                </label>
              </div>
              
              <div className="card-actions justify-end mt-8">
                <button
                  type="submit"
                  className="btn btn-primary btn-md px-8"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Password Reset Card */}
        <div className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-all duration-300">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="card-title text-2xl text-primary flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Segurança da Conta
              </h2>
              {resetSuccess && (
                <span className="badge badge-success">Senha atualizada</span>
              )}
            </div>
            
            {resetSuccess && (
              <div className="alert alert-success shadow-lg mb-6 animate-fadeIn">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Senha redefinida com sucesso!</span>
                </div>
                <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setResetSuccess(false)}>✕</button>
              </div>
            )}
            
            {resetError && (
              <div className="alert alert-error shadow-lg mb-6 animate-fadeIn">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{resetError}</span>
                </div>
                <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setResetError(null)}>✕</button>
              </div>
            )}
            
            {!showResetForm ? (
              <div className="space-y-6">
                <div className="bg-base-200 p-4 rounded-lg border-l-4 border-info">
                  <p className="text-base-content">Para redefinir sua senha, um código de 6 dígitos será enviado para seu email cadastrado. Use esse código para confirmar a alteração.</p>
                </div>
                
                {resetRequestSent && (
                  <div className="alert alert-info shadow-lg animate-fadeIn">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div className="flex flex-col">
                      <span>Código enviado para: <strong>{user?.email}</strong></span>
                      <span className="text-xs opacity-70">Verifique também sua pasta de spam</span>
                    </div>
                  </div>
                )}
                
                <div className="card-actions flex flex-wrap gap-4 mt-8">
                  <button 
                    className="btn btn-primary flex-1 min-w-[200px]" 
                    onClick={handlePasswordResetRequest}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Enviar Código de Redefinição
                  </button>
                  
                  {resetRequestSent && (
                    <button 
                      className="btn btn-outline btn-secondary flex-1 min-w-[200px]" 
                      onClick={() => setShowResetForm(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Já tenho o código
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Código de Verificação</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered focus:input-primary w-full font-mono text-center text-lg tracking-wider"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value.replace(/[^0-9]/g, ''))}
                    pattern="\d{6}"
                    maxLength={6}
                    placeholder="000000"
                    required
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/70">Digite o código de 6 dígitos enviado para seu email</span>
                  </label>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Nova Senha</span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered focus:input-primary w-full"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/70">Mínimo de 8 caracteres</span>
                  </label>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Confirme a Nova Senha</span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered focus:input-primary w-full"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>
                
                <div className="card-actions justify-end gap-4 mt-8">
                  <button 
                    type="button" 
                    className="btn btn-ghost" 
                    onClick={() => {
                      setShowResetForm(false);
                      setResetToken('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Redefinir Senha
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}