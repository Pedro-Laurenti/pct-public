"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const logout = async () => {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          router.push("/");
        } else {
          setFailed(true);
        }
      } catch {
        setFailed(true);
      }
    };

    logout();
  }, [router]);

  if (failed) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Erro ao sair</h3>
            <p className="py-4">Nao foi possivel encerrar sua sessao. Tente novamente.</p>
            <div className="modal-action">
              <button className="btn btn-primary" onClick={() => router.push("/api/auth/logout")}>
                Tentar novamente
              </button>
              <button className="btn" onClick={() => router.push("/dashboard")}>
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        </dialog>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-base-200">
      <span className="loading loading-spinner" />
    </div>
  );
}
