"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FaBell, FaTasks, FaCalendarAlt } from "react-icons/fa";

interface PendingActivity {
  content_id: number;
  lesson_id: number;
  lesson_title: string;
  course_name: string;
}

interface UpcomingReunion {
  content_id: number;
  lesson_id: number;
  reunion_title: string;
  scheduled_date: string;
  scheduled_time: string;
}

interface Notifications {
  pendingActivities: PendingActivity[];
  upcomingReunions: UpcomingReunion[];
  total: number;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Notifications | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const total = data?.total ?? 0;

  return (
    <>
      <button
        className="btn btn-ghost btn-circle relative"
        aria-label="Notificações"
        onClick={() => setOpen(true)}
      >
        <FaBell className="w-5 h-5" />
        {total > 0 && (
          <span className="badge badge-error badge-xs absolute top-1 right-1 text-[10px] min-w-4 h-4 px-1">
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>

      {open && (
        <dialog className="modal modal-open" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="modal-box max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Notificações</h3>
              <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setOpen(false)}>
                x
              </button>
            </div>

            {loading && (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner" />
              </div>
            )}

            {!loading && total === 0 && (
              <p className="text-center text-base-content/60 py-8">
                Nenhuma notificacao no momento.
              </p>
            )}

            {!loading && data && (
              <div className="space-y-4">
                {data.pendingActivities.length > 0 && (
                  <section>
                    <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50 mb-2">
                      Atividades Pendentes
                    </p>
                    <ul className="space-y-2">
                      {data.pendingActivities.map((a) => (
                        <li key={a.content_id}>
                          <Link
                            href={`/dashboard/lessons/${a.lesson_id}/${a.content_id}/activity`}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
                            onClick={() => setOpen(false)}
                          >
                            <FaTasks className="text-warning mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{a.lesson_title}</p>
                              <p className="text-xs text-base-content/50">{a.course_name}</p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {data.upcomingReunions.length > 0 && (
                  <section>
                    <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50 mb-2">
                      Reunioes nos Proximos 7 Dias
                    </p>
                    <ul className="space-y-2">
                      {data.upcomingReunions.map((r) => (
                        <li key={r.content_id}>
                          <Link
                            href={`/dashboard/lessons/${r.lesson_id}/${r.content_id}/reunion`}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
                            onClick={() => setOpen(false)}
                          >
                            <FaCalendarAlt className="text-info mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{r.reunion_title}</p>
                              <p className="text-xs text-base-content/50">
                                {formatDate(r.scheduled_date)} as {formatTime(r.scheduled_time)}
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {(data.pendingActivities.length > 0 || data.upcomingReunions.length > 0) && (
                  <div className="pt-2 border-t border-base-200">
                    <Link
                      href="/dashboard/activities"
                      className="btn btn-ghost btn-sm w-full"
                      onClick={() => setOpen(false)}
                    >
                      Ver todas as atividades
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </dialog>
      )}
    </>
  );
}
