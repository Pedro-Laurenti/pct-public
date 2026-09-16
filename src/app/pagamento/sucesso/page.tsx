"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";

export default function PagamentoSucesso() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "approved" | "pending">("loading");

  useEffect(() => {
    const paymentStatus = searchParams.get("status");
    if (paymentStatus === "approved") {
      setStatus("approved");
    } else {
      setStatus("pending");
    }

    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 5000);

    return () => clearTimeout(timer);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 shadow-xl max-w-md w-full mx-4">
        <div className="card-body items-center text-center gap-4">
          {status === "loading" ? (
            <FaSpinner className="text-5xl text-primary animate-spin" />
          ) : status === "approved" ? (
            <>
              <FaCheckCircle className="text-5xl text-success" />
              <h1 className="card-title text-2xl">Pagamento aprovado!</h1>
              <p className="text-base-content/70">
                Seu acesso ao curso foi liberado. Você será redirecionado em instantes.
              </p>
            </>
          ) : (
            <>
              <FaSpinner className="text-5xl text-warning" />
              <h1 className="card-title text-2xl">Pagamento em processamento</h1>
              <p className="text-base-content/70">
                Seu pagamento está sendo processado. Você receberá acesso assim que for confirmado.
              </p>
            </>
          )}

          <div className="card-actions w-full pt-2">
            <Link href="/dashboard" className="btn btn-primary w-full">
              Ir para o Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
