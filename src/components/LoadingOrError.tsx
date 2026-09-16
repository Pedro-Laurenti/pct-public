import React from "react";

interface LoadingOrErrorProps {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  onBack?: () => void;
}

const LoadingOrError: React.FC<LoadingOrErrorProps> = ({ loading, error, onRetry, onBack }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-48 w-full">
        <span className="loading loading-ring loading-xl" />
        <p className="text-lg font-semibold ml-4">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-48 w-full gap-4 p-6">
        <p className="text-lg font-semibold text-error text-center">Erro: {error}</p>
        <div className="flex gap-2">
          {onRetry && (
            <button className="btn btn-primary btn-sm" onClick={onRetry}>
              Tentar novamente
            </button>
          )}
          {onBack && (
            <button className="btn btn-ghost btn-sm" onClick={onBack}>
              Voltar
            </button>
          )}
          {!onRetry && !onBack && (
            <button className="btn btn-ghost btn-sm" onClick={() => window.history.back()}>
              Voltar
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingOrError;
