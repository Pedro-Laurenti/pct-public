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
      <div className="flex justify-center items-center min-h-screen bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-base-100 py-12 px-4">
      <a
        href="/logout"
        className="absolute top-4 right-4 text-[0.6rem] text-base-content/25 hover:text-base-content/60 uppercase tracking-[0.15em] transition-colors"
      >
        Sair da conta
      </a>
      <div className="max-w-2xl mx-auto">

        {/* Cabeçalho */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <img src="/images/logo.svg" alt="" className="w-12 h-12 opacity-85" />
          </div>
          <h1 className="font-display text-4xl text-base-content leading-tight mb-2">
            Sua formação<br />
            <span className="text-accent">começa aqui</span>
          </h1>
          <p className="text-base-content/40 text-[0.65rem] tracking-[0.25em] uppercase mt-3">
            Psicologia Católica Tomista
          </p>
          <div className="flex items-center gap-3 mt-6 max-w-xs mx-auto">
            <div className="flex-1 border-t border-base-content/10" />
            <span className="text-accent/40 text-[0.6rem]">✦</span>
            <div className="flex-1 border-t border-base-content/10" />
          </div>
        </div>

        {/* Campo de cupom */}
        <div className="mb-6 p-4 border border-base-content/10 bg-base-200">
          <p className="text-[0.65rem] text-base-content/40 uppercase tracking-[0.15em] mb-3">
            Cupom de desconto
          </p>
          <div className="flex gap-2">
            <label className="input flex-1">
              <FaTag className="text-base-content/25" />
              <input
                type="text"
                placeholder="Código (opcional)"
                value={coupon}
                onChange={e => { setCoupon(e.target.value); setCouponData(null); setCouponError(null); }}
                onKeyDown={e => e.key === "Enter" && handleValidateCoupon()}
              />
            </label>
            <button
              className="btn btn-outline btn-sm h-full tracking-wider"
              onClick={handleValidateCoupon}
              disabled={checkingCoupon || !coupon.trim()}
            >
              {checkingCoupon ? <span className="loading loading-spinner loading-xs" /> : "Aplicar"}
            </button>
          </div>
          {couponData && (
            <p className="text-success text-xs flex items-center gap-1 mt-2">
              <FaCheck /> Cupom aplicado:{" "}
              {couponData.discount_type === "percent"
                ? `${couponData.discount_value}% de desconto`
                : `R$ ${couponData.discount_value.toFixed(2)} de desconto`}
              {couponData.course_id ? " (neste curso)" : " (todos os cursos)"}
            </p>
          )}
          {couponError && <p className="text-error text-xs mt-2">{couponError}</p>}
        </div>

        {/* Lista de cursos */}
        <div className="space-y-3">
          {courses.length === 0 && (
            <div className="text-center text-base-content/40 py-16">
              <p className="font-serif italic text-lg mb-2">Nenhum curso disponível</p>
              <p className="text-xs tracking-wider uppercase">Volte em breve</p>
            </div>
          )}

          {courses.map(course => {
            const original = course.price;
            const final = finalPrice(course);
            const discount = appliedDiscount(course);
            const isFree = final === 0;

            return (
              <div
                key={course.id}
                className="border border-base-content/10 bg-base-200 p-5 flex items-start justify-between gap-4 hover:border-accent/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif text-lg font-semibold text-base-content leading-tight">
                    {course.name}
                  </h2>
                  {course.description && (
                    <p className="text-sm text-base-content/50 mt-1 leading-relaxed">
                      {course.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {original === 0 ? (
                    <span className="text-success text-sm font-semibold tracking-wide uppercase">Grátis</span>
                  ) : (
                    <div className="text-right">
                      {discount > 0 && (
                        <p className="text-xs text-base-content/30 line-through">
                          R$ {original.toFixed(2)}
                        </p>
                      )}
                      <p className={`text-xl font-bold ${isFree ? "text-success" : "text-base-content"}`}>
                        {isFree ? "Grátis" : `R$ ${final.toFixed(2)}`}
                      </p>
                    </div>
                  )}
                  <button
                    className={`btn btn-sm tracking-wider ${isFree || original === 0 ? "btn-success" : "btn-primary"}`}
                    onClick={() => handleBuy(course)}
                    disabled={buying === course.id}
                  >
                    {buying === course.id ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : isFree || original === 0 ? (
                      "Acessar"
                    ) : (
                      <><FaLock className="w-3 h-3" /> Comprar</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[0.6rem] text-base-content/25 flex items-center justify-center gap-1.5 mt-10 tracking-wider uppercase">
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
