"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";

function PagamentoSucessoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "approved" | "pending">("loading");

  useEffect(() => {
    const paymentStatus = searchParams.get("status");
    setStatus(paymentStatus === "approved" ? "approved" : "pending");

    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 5000);

    return () => clearTimeout(timer);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 px-4">
      <div className="w-full max-w-sm border border-base-content/10 bg-base-200 p-10 text-center">

        {/* Escudo */}
        <div className="flex justify-center mb-6">
          <img src="/images/logo.svg" alt="" className="w-10 h-10 opacity-80" />
        </div>

        {/* Divisor ornamental */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 border-t border-base-content/10" />
          <span className="text-accent/40 text-[0.6rem]">✦</span>
          <div className="flex-1 border-t border-base-content/10" />
        </div>

        {status === "loading" && (
          <div className="space-y-4">
            <FaSpinner className="text-4xl text-primary animate-spin mx-auto" />
            <p className="text-base-content/50 text-sm">Verificando pagamento...</p>
          </div>
        )}

        {status === "approved" && (
          <div className="space-y-4">
            <FaCheckCircle className="text-4xl text-success mx-auto" />
            <h1 className="font-display text-3xl text-base-content leading-tight">
              Pagamento<br />
              <span className="text-success">aprovado</span>
            </h1>
            <p className="text-sm text-base-content/50 leading-relaxed">
              Seu acesso ao curso foi liberado.<br />
              Você será redirecionado em instantes.
            </p>
          </div>
        )}

        {status === "pending" && (
          <div className="space-y-4">
            <FaSpinner className="text-4xl text-warning mx-auto" />
            <h1 className="font-display text-3xl text-base-content leading-tight">
              Em<br />
              <span className="text-warning">processamento</span>
            </h1>
            <p className="text-sm text-base-content/50 leading-relaxed">
              Seu pagamento está sendo processado.<br />
              Você receberá acesso assim que confirmado.
            </p>
          </div>
        )}

        <div className="mt-8">
          <Link href="/dashboard" className="btn btn-primary w-full tracking-wider">
            Ir para o Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PagamentoSucesso() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <FaSpinner className="text-4xl text-primary animate-spin" />
      </div>
    }>
      <PagamentoSucessoContent />
    </Suspense>
  );
}
