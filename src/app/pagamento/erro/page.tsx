"use client";

import Link from "next/link";
import { FaTimesCircle } from "react-icons/fa";

export default function PagamentoErro() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 shadow-xl max-w-md w-full mx-4">
        <div className="card-body items-center text-center gap-4">
          <FaTimesCircle className="text-5xl text-error" />
          <h1 className="card-title text-2xl">Pagamento não realizado</h1>
          <p className="text-base-content/70">
            Seu pagamento foi cancelado ou recusado. Nenhum valor foi cobrado.
            Tente novamente ou entre em contato com o suporte.
          </p>
          <div className="card-actions w-full pt-2 flex-col gap-2">
            <Link href="/checkout" className="btn btn-primary w-full">
              Tentar novamente
            </Link>
            <Link href="/dashboard" className="btn btn-ghost w-full">
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
