"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        router.push("/"); // Redireciona para a página inicial após o logout
      } else {
        console.error("Erro ao deslogar");
      }
    };

    logout();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-base-200">
      <span className="loading loading-spinner"></span>
    </div>
  );
}