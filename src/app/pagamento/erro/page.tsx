"use client";

import Link from "next/link";
import { FaTimesCircle } from "react-icons/fa";

export default function PagamentoErro() {
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

        <div className="space-y-4">
          <FaTimesCircle className="text-4xl text-error mx-auto" />
          <h1 className="font-display text-3xl text-base-content leading-tight">
            Pagamento não<br />
            <span className="text-error">realizado</span>
          </h1>
          <p className="text-sm text-base-content/50 leading-relaxed">
            Seu pagamento foi cancelado ou recusado.<br />
            Nenhum valor foi cobrado.
          </p>
        </div>

        <div className="mt-8 space-y-2">
          <Link href="/checkout" className="btn btn-primary w-full tracking-wider">
            Tentar novamente
          </Link>
          <Link href="/dashboard" className="btn btn-ghost w-full text-base-content/40 hover:text-base-content">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
