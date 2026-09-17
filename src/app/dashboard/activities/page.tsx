"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import LoadingOrError from "@/components/LoadingOrError";
import { FaArrowLeft, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface Activity {
  content_id: number;
  lesson_id: number;
  lesson_title: string;
  course_name: string;
  total_questions: number;
  correct_answers: number;
  answered_questions: number;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/activities")
      .then((r) => r.json())
      .then((data) => setActivities(data.activities || []))
      .catch(() => setError("Falha ao carregar atividades."))
      .finally(() => setLoading(false));
  }, []);

  if (loading || error) return <LoadingOrError loading={loading} error={error} />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="btn btn-ghost btn-circle btn-sm">
          <FaArrowLeft />
        </Link>
        <h1 className="font-display text-2xl">Minhas Atividades</h1>
      </div>

      {activities.length === 0 ? (
        <div className="card bg-base-200 p-8 text-center">
          <p className="text-base-content/50">Nenhuma atividade respondida ainda.</p>
          <Link href="/dashboard/lessons" className="btn btn-primary btn-sm mt-4 self-center mx-auto w-fit">
            Ver Aulas
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((activity) => {
            const score = activity.total_questions > 0
              ? Math.round((activity.correct_answers / activity.total_questions) * 100)
              : 0;
            const completed = activity.answered_questions >= activity.total_questions;

            return (
              <div key={activity.content_id} className="card bg-base-100 border border-base-content/8">
                <div className="card-body gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-base-content/50 font-medium uppercase tracking-wide">
                        {activity.course_name}
                      </p>
                      <h2 className="font-semibold text-base mt-1">{activity.lesson_title}</h2>
                    </div>
                    {completed ? (
                      <FaCheckCircle className="text-success text-xl shrink-0 mt-1" />
                    ) : (
                      <FaTimesCircle className="text-warning text-xl shrink-0 mt-1" />
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{activity.correct_answers}/{activity.total_questions} corretas</span>
                      <span className="font-semibold">{score}%</span>
                    </div>
                    <progress
                      className={`progress w-full ${score >= 70 ? 'progress-success' : score >= 40 ? 'progress-warning' : 'progress-error'}`}
                      value={score}
                      max={100}
                    />
                  </div>

                  {!completed && (
                    <p className="mt-1">
                      <span className="badge badge-sm badge-warning">{activity.answered_questions}/{activity.total_questions} respondidas</span>
                    </p>
                  )}

                  <div className="card-actions justify-end mt-2">
                    <Link
                      href={`/dashboard/lessons/${activity.lesson_id}/${activity.content_id}/activity`}
                      className="btn btn-outline btn-sm"
                    >
                      {completed ? "Rever" : "Continuar"}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
