import React from "react";

interface LoadingOrErrorProps {
    loading: boolean;
    error: string | null;
}

const LoadingOrError: React.FC<LoadingOrErrorProps> = ({ loading, error }) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <span className="loading loading-ring loading-xl"></span>
                <p className="text-lg font-semibold ml-4">Carregando...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <p className="text-lg font-semibold text-error">Erro: {error}</p>
            </div>
        );
    }

    return null;
};

export default LoadingOrError;