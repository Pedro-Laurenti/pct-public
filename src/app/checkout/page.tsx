"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaTag, FaLock, FaCheck } from "react-icons/fa";


interface Course {
  id: number;
  name: string;
  description: string | null;
  price: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [couponData, setCouponData] = useState<{
    discount_type: "percent" | "fixed";
    discount_value: number;
    course_id: number | null;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [buying, setBuying] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/checkout/courses")
      .then(r => r.json())
      .then(d => setCourses(d.courses || []))
      .finally(() => setLoading(false));
  }, []);

  const appliedDiscount = (course: Course) => {
    if (!couponData) return 0;
    if (couponData.course_id && couponData.course_id !== course.id) return 0;
    if (couponData.discount_type === "percent") {
      return Math.min(course.price, (course.price * couponData.discount_value) / 100);
    }
    return Math.min(course.price, couponData.discount_value);
  };

  const finalPrice = (course: Course) =>
    Math.max(0, course.price - appliedDiscount(course));

  const handleValidateCoupon = async () => {
    if (!coupon.trim()) return;
    setCheckingCoupon(true);
    setCouponError(null);
    setCouponData(null);
    try {
      const res = await fetch(`/api/checkout/coupon?code=${encodeURIComponent(coupon.trim())}`);
      const data = await res.json();
      if (!res.ok) { setCouponError(data.message || "Cupom inválido."); return; }
      setCouponData(data);
    } catch {
      setCouponError("Erro ao validar cupom.");
    } finally {
      setCheckingCoupon(false);
    }
  };

  const handleBuy = async (course: Course) => {
    setBuying(course.id);
    try {
      const price = finalPrice(course);

      if (price === 0) {
        // Curso gratuito ou cupom de 100% — acesso direto
        const res = await fetch("/api/checkout/free", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId: course.id, couponCode: coupon.trim() || null }),
        });
        if (res.ok) {
          router.push("/dashboard");
        } else {
          const d = await res.json();
          setErrorMsg(d.message || "Erro ao liberar acesso.");
        }
        return;
      }

      // Cria preferência Mercado Pago
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id, couponCode: coupon.trim() || null }),
      });

      if (!res.ok) {
        const d = await res.json();
        setErrorMsg(d.message || "Erro ao iniciar pagamento.");
        return;
      }

      const { initPoint } = await res.json();
      window.location.href = initPoint;
    } finally {
      setBuying(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Escolha seu curso</h1>
          <p className="text-base-content/60">Selecione um curso para começar sua jornada.</p>
        </div>

        {/* Campo de cupom */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body py-4">
            <div className="flex gap-2">
              <label className="input flex-1">
                <FaTag className="text-base-content/40" />
                <input
                  type="text"
                  placeholder="Cupom de desconto (opcional)"
                  value={coupon}
                  onChange={e => { setCoupon(e.target.value); setCouponData(null); setCouponError(null); }}
                  onKeyDown={e => e.key === "Enter" && handleValidateCoupon()}
                />
              </label>
              <button
                className="btn btn-outline btn-sm h-full"
                onClick={handleValidateCoupon}
                disabled={checkingCoupon || !coupon.trim()}
              >
                {checkingCoupon ? <span className="loading loading-spinner loading-xs" /> : "Aplicar"}
              </button>
            </div>
            {couponData && (
              <p className="text-success text-sm flex items-center gap-1 mt-1">
                <FaCheck /> Cupom aplicado:{" "}
                {couponData.discount_type === "percent"
                  ? `${couponData.discount_value}% de desconto`
                  : `R$ ${couponData.discount_value.toFixed(2)} de desconto`}
                {couponData.course_id ? " (neste curso)" : " (todos os cursos)"}
              </p>
            )}
            {couponError && <p className="text-error text-sm mt-1">{couponError}</p>}
          </div>
        </div>

        {/* Lista de cursos */}
        <div className="space-y-4">
          {courses.length === 0 && (
            <div className="text-center text-base-content/50 py-12">
              Nenhum curso disponível no momento.
            </div>
          )}

          {courses.map(course => {
            const original = course.price;
            const final = finalPrice(course);
            const discount = appliedDiscount(course);
            const isFree = final === 0;

            return (
              <div key={course.id} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="card-body">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="card-title text-lg">{course.name}</h2>
                      {course.description && (
                        <p className="text-sm text-base-content/60 mt-1">{course.description}</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      {original === 0 ? (
                        <span className="badge badge-success badge-lg">Grátis</span>
                      ) : (
                        <div>
                          {discount > 0 && (
                            <p className="text-xs text-base-content/40 line-through">
                              R$ {original.toFixed(2)}
                            </p>
                          )}
                          <p className={`text-xl font-bold ${isFree ? "text-success" : ""}`}>
                            {isFree ? "Grátis" : `R$ ${final.toFixed(2)}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card-actions justify-end mt-2">
                    <button
                      className={`btn btn-sm ${isFree || original === 0 ? "btn-success" : "btn-primary"}`}
                      onClick={() => handleBuy(course)}
                      disabled={buying === course.id}
                    >
                      {buying === course.id ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : isFree || original === 0 ? (
                        "Acessar Grátis"
                      ) : (
                        <>
                          <FaLock className="w-3 h-3" /> Comprar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-base-content/40 flex items-center justify-center gap-1">
          <FaLock /> Pagamentos processados com segurança pelo Mercado Pago
        </p>
      </div>

      {/* Modal de erro */}
      {errorMsg && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Erro</h3>
            <p className="py-4">{errorMsg}</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setErrorMsg(null)}>Fechar</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setErrorMsg(null)} />
        </dialog>
      )}
    </div>
  );
}
