"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlus, FaTrash, FaPercent, FaDollarSign } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import Alert from "@/components/Alert";
import LoadingOrError from "@/components/LoadingOrError";

const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === "true";

interface Promotion {
  id: number;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  course_id: number | null;
  course_name: string | null;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: number;
}

interface Course {
  id: number;
  name: string;
}

type ModalMode = null | "create" | "edit";

const emptyForm = {
  code: "",
  discount_type: "percent" as "percent" | "fixed",
  discount_value: "",
  course_id: "",
  max_uses: "",
  expires_at: "",
  is_active: true,
};

export default function PromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);

  useEffect(() => {
    if (!PAYMENTS_ENABLED) { router.replace("/admin"); return; }
    fetchAll();
  }, [router]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch("/api/admin/promotions"),
        fetch("/api/admin/courses?limit=100"),
      ]);
      if (!pRes.ok) throw new Error("Erro ao buscar promoções");
      const pData = await pRes.json();
      const cData = cRes.ok ? await cRes.json() : { courses: [] };
      setPromotions(pData.promotions);
      setCourses(cData.courses);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalMode("create");
  };

  const openEdit = (p: Promotion) => {
    setEditingId(p.id);
    setForm({
      code: p.code,
      discount_type: p.discount_type,
      discount_value: String(p.discount_value),
      course_id: p.course_id ? String(p.course_id) : "",
      max_uses: p.max_uses ? String(p.max_uses) : "",
      expires_at: p.expires_at ? p.expires_at.slice(0, 16) : "",
      is_active: p.is_active === 1,
    });
    setModalMode("edit");
  };

  const closeModal = () => { setModalMode(null); setEditingId(null); };

  const handleSave = async () => {
    if (!form.code.trim() || !form.discount_value) {
      setAlert({ type: "error", message: "Preencha o código e o valor do desconto." });
      return;
    }
    setSaving(true);
    try {
      const body = {
        code: form.code.trim(),
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        course_id: form.course_id ? Number(form.course_id) : null,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        expires_at: form.expires_at || null,
        is_active: form.is_active ? 1 : 0,
      };

      const res = modalMode === "create"
        ? await fetch("/api/admin/promotions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch(`/api/admin/promotions/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

      if (!res.ok) {
        const d = await res.json();
        setAlert({ type: "error", message: d.message || "Falha ao salvar." });
        return;
      }
      setAlert({ type: "success", message: modalMode === "create" ? "Promoção criada!" : "Promoção atualizada!" });
      closeModal();
      fetchAll();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/promotions/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) { setAlert({ type: "error", message: "Falha ao excluir." }); return; }
      setAlert({ type: "success", message: "Promoção excluída!" });
      setPromotions(prev => prev.filter(p => p.id !== deleteTarget.id));
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading || error) return <LoadingOrError loading={loading} error={error} />;

  return (
    <div className="p-6 space-y-6">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Promoções</h1>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          <FaPlus /> Nova Promoção
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Código</th>
              <th>Desconto</th>
              <th>Curso</th>
              <th>Usos</th>
              <th>Expira</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {promotions.length === 0 && (
              <tr><td colSpan={7} className="text-center text-base-content/50 py-8">Nenhuma promoção cadastrada.</td></tr>
            )}
            {promotions.map(p => (
              <tr key={p.id}>
                <td className="font-mono font-bold">{p.code}</td>
                <td>
                  <span className="flex items-center gap-1">
                    {p.discount_type === "percent"
                      ? <><FaPercent className="text-xs" /> {p.discount_value}%</>
                      : <><FaDollarSign className="text-xs" /> R$ {Number(p.discount_value).toFixed(2)}</>
                    }
                  </span>
                </td>
                <td>{p.course_name ?? <span className="text-base-content/40">Todos</span>}</td>
                <td>
                  {p.current_uses}
                  {p.max_uses ? `/${p.max_uses}` : ""}
                </td>
                <td>
                  {p.expires_at
                    ? new Date(p.expires_at).toLocaleDateString("pt-BR")
                    : <span className="text-base-content/40">Sem limite</span>}
                </td>
                <td>
                  <span className={`badge badge-sm ${p.is_active ? "badge-success" : "badge-ghost"}`}>
                    {p.is_active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td>
                  <div className="flex gap-1">
                    <button className="btn btn-xs btn-ghost" onClick={() => openEdit(p)} title="Editar">
                      <FaPencil />
                    </button>
                    <button className="btn btn-xs btn-ghost text-error" onClick={() => setDeleteTarget(p)} title="Excluir">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal create/edit */}
      {modalMode && (
        <dialog className="modal modal-open" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box space-y-4">
            <h3 className="font-bold text-lg">{modalMode === "create" ? "Nova Promoção" : "Editar Promoção"}</h3>

            <div>
              <label className="label"><span className="label-text">Código *</span></label>
              <input
                className="input input-bordered w-full uppercase"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="EX: DESCONTO10"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label"><span className="label-text">Tipo *</span></label>
                <select
                  className="select select-bordered w-full"
                  value={form.discount_type}
                  onChange={e => setForm(f => ({ ...f, discount_type: e.target.value as "percent" | "fixed" }))}
                >
                  <option value="percent">Porcentagem (%)</option>
                  <option value="fixed">Valor fixo (R$)</option>
                </select>
              </div>
              <div>
                <label className="label"><span className="label-text">Valor *</span></label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input input-bordered w-full"
                  value={form.discount_value}
                  onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))}
                  placeholder={form.discount_type === "percent" ? "10" : "50.00"}
                />
              </div>
            </div>

            <div>
              <label className="label"><span className="label-text">Curso (deixe vazio para todos)</span></label>
              <select
                className="select select-bordered w-full"
                value={form.course_id}
                onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}
              >
                <option value="">Todos os cursos</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label"><span className="label-text">Máximo de usos</span></label>
                <input
                  type="number"
                  min="1"
                  className="input input-bordered w-full"
                  value={form.max_uses}
                  onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                  placeholder="Ilimitado"
                />
              </div>
              <div>
                <label className="label"><span className="label-text">Expira em</span></label>
                <input
                  type="datetime-local"
                  className="input input-bordered w-full"
                  value={form.expires_at}
                  onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={form.is_active}
                onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                id="promo_is_active"
              />
              <label htmlFor="promo_is_active" className="label-text cursor-pointer">Promoção ativa</label>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="loading loading-spinner loading-sm" /> : "Salvar"}
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Modal delete */}
      {deleteTarget && (
        <dialog className="modal modal-open" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirmar Exclusão</h3>
            <p className="py-4">Excluir a promoção <strong>{deleteTarget.code}</strong>?</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button className="btn btn-error" onClick={handleDelete}>Excluir</button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
