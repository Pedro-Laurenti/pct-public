'use client';

import { useEffect, useState } from 'react';
import { FaClock, FaCheck, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';
import LoadingOrError from '@/components/LoadingOrError';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'mentor';
}

interface Lesson {
  id: number;
  title: string;
  lesson_description: string;
}

interface CourseProgress {
  totalActivities: number;
  completedActivities: number;
  progressPercentage: number;
  totalContents: number;
}

interface Course {
  id: number;
  name: string;
  description: string;
  lessons: Lesson[];
  progress: CourseProgress;
}

interface Activity {
  content_id: number;
  content_type: string;
  lesson_id: number;
  lesson_title: string;
  course_id: number;
  course_name: string;
  statement_count: number;
  first_statement: string;
}

interface Reunion {
  id: number;
  reunion_title: string;
  reunion_url: string;
  reunion_description: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  lesson_id: number;
  lesson_title: string;
  course_id: number;
  course_name: string;
}

interface UserStats {
  completedActivities: number;
  pendingActivities: number;
  totalActivities: number;
  overallProgress: number;
}

interface DashboardData {
  user: User;
  courses: Course[];
  pendingActivities: Activity[];
  upcomingReunions: Reunion[];
  pastReunions: Reunion[];
  stats: UserStats;
}

const formatUtils = {
  date: (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) throw new Error('');
      return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
    } catch { return dateStr; }
  },

  time: (timeStr: string) => {
    if (!timeStr) return '';
    try {
      if (timeStr.includes('T')) return new Date(timeStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return timeStr.substring(0, 5);
    } catch { return timeStr; }
  },

  dateTime: (dateStr: string, timeStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T${timeStr}`);
      if (isNaN(date.getTime())) throw new Error('');
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }).format(date);
    } catch { return `${formatUtils.date(dateStr)} ${formatUtils.time(timeStr)}`; }
  },

  timeRemaining: (dateStr: string, timeStr: string) => {
    if (!dateStr) return '';
    try {
      const now = new Date();
      const fmt = dateStr.includes('T') ? dateStr : `${dateStr}T${timeStr}`;
      let d = new Date(fmt);
      if (isNaN(d.getTime())) {
        const [y, mo, day] = dateStr.split('-').map(Number);
        const [h, mi] = timeStr.split(':').map(Number);
        d = new Date(y, mo - 1, day, h, mi);
      }
      const diff = d.getTime() - now.getTime();
      if (diff <= 0) return 'Agora';
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (days > 0) return `Em ${days} dia${days > 1 ? 's' : ''}`;
      if (hours > 0) return `Em ${hours}h`;
      return `Em ${mins} min`;
    } catch { return 'Em breve'; }
  },

  todayLabel: () => new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long'
  }).format(new Date()),
};

function ProgressBar({ percentage }: { percentage: number }) {
  const cls = percentage >= 80 ? 'progress-success' : percentage >= 40 ? 'progress-primary' : 'progress-warning';
  return <progress className={`progress w-full ${cls}`} value={percentage} max={100} />;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => {
        if (r.status === 401) { router.push('/'); return null; }
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then(d => { if (d) { setData(d); setLoading(false); } })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [router]);

  if (loading || error) return <LoadingOrError loading={loading} error={error} />;
  if (!data) return null;

  const nextReunion = data.upcomingReunions?.[0];
  const { completedActivities, pendingActivities, totalActivities, overallProgress } = data.stats;
  const firstName = data.user.name.split(' ')[0];

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-12">

      {/* ── Saudação ── */}
      <header>
        <p className="text-[0.65rem] uppercase tracking-[0.18em] text-base-content/35 mb-2">
          {formatUtils.todayLabel()}
        </p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight">
          Olá, {firstName}
        </h1>
        <div className="flex items-baseline gap-2 mt-4">
          <span className="text-gold font-display text-3xl">{overallProgress}%</span>
          <span className="text-sm text-base-content/50">
            de conclusão &middot; {completedActivities} de {totalActivities} atividades
          </span>
        </div>
        <ProgressBar percentage={overallProgress} />
      </header>

      {/* ── Próxima Reunião ── */}
      {nextReunion && (
        <section className="border border-primary/25 bg-primary/5 p-5">
          <p className="text-[0.6rem] uppercase tracking-widest text-primary/60 flex items-center gap-1.5 mb-2">
            <FaClock /> Próxima reunião &middot; {formatUtils.timeRemaining(nextReunion.scheduled_date, nextReunion.scheduled_time)}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-serif text-lg">{nextReunion.reunion_title}</p>
              <p className="text-xs text-base-content/50 mt-0.5">
                {nextReunion.course_name} &middot; {formatUtils.dateTime(nextReunion.scheduled_date, nextReunion.scheduled_time)} &middot; {nextReunion.duration_minutes} min
              </p>
            </div>
            {nextReunion.reunion_url && (
              <a href={nextReunion.reunion_url} target="_blank" rel="noopener noreferrer"
                className="btn btn-primary btn-sm shrink-0">
                Acessar reunião
              </a>
            )}
          </div>
        </section>
      )}

      {/* ── Cursos ── */}
      <section>
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-serif text-xl">Formação</h2>
          <Link href="/dashboard/lessons" className="text-[0.65rem] text-base-content/35 hover:text-primary transition-colors uppercase tracking-widest">
            Todas as aulas
          </Link>
        </div>

        {data.courses.length === 0 ? (
          <p className="text-sm text-base-content/50 border border-base-content/8 p-5">
            Nenhum curso matriculado.
          </p>
        ) : (
          <div className="space-y-3">
            {data.courses.map((course) => (
              <div key={course.id} className="border border-base-content/8 bg-base-100 p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-serif text-base leading-snug">{course.name}</h3>
                    <p className="text-xs text-base-content/40 mt-1">
                      {course.lessons.length} aulas &middot; {course.progress.completedActivities}/{course.progress.totalActivities} atividades
                    </p>
                  </div>
                  <span className="font-display text-primary shrink-0">{course.progress.progressPercentage}%</span>
                </div>
                <ProgressBar percentage={course.progress.progressPercentage} />
                <div className="mt-3 flex justify-end">
                  <Link href={`/dashboard/lessons?course=${course.id}`}
                    className="btn btn-ghost btn-xs text-primary gap-1 -mr-1">
                    Acessar <FaChevronRight className="text-[9px]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Atividades Pendentes ── */}
      <section>
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-serif text-xl">Atividades pendentes</h2>
          {pendingActivities > 2 && (
            <Link href="/dashboard/activities" className="text-[0.65rem] text-base-content/35 hover:text-primary transition-colors uppercase tracking-widest">
              Ver todas
            </Link>
          )}
        </div>

        {pendingActivities === 0 ? (
          <div className="border border-base-content/8 p-5 flex items-center gap-3">
            <FaCheck className="text-success shrink-0" />
            <p className="text-sm text-base-content/50">Todas as atividades concluídas.</p>
          </div>
        ) : (
          <div className="border border-base-content/8 divide-y divide-base-content/8">
            {data.pendingActivities.slice(0, 4).map((activity) => (
              <Link
                key={activity.content_id}
                href={`/dashboard/lessons/${activity.lesson_id}/${activity.content_id}`}
                className="flex items-center justify-between p-4 hover:bg-base-200/50 transition-colors group"
              >
                <div className="min-w-0 mr-4">
                  <p className="text-[0.6rem] uppercase tracking-widest text-base-content/35 mb-0.5">
                    {activity.course_name}
                  </p>
                  <p className="text-sm font-medium truncate">{activity.lesson_title}</p>
                  <p className="text-xs text-base-content/40 line-clamp-1 mt-0.5">{activity.first_statement}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="badge badge-sm badge-outline">
                    {activity.statement_count} {activity.statement_count > 1 ? 'questões' : 'questão'}
                  </span>
                  <FaChevronRight className="text-base-content/20 group-hover:text-primary transition-colors text-xs" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Agenda ── */}
      <section>
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-serif text-xl">Próximas reuniões</h2>
          <Link href="/dashboard/reunions" className="text-[0.65rem] text-base-content/35 hover:text-primary transition-colors uppercase tracking-widest">
            Calendário
          </Link>
        </div>

        {data.upcomingReunions.length === 0 ? (
          <p className="text-sm text-base-content/50 border border-base-content/8 p-5">
            Nenhuma reunião agendada.
          </p>
        ) : (
          <div className="border border-base-content/8 divide-y divide-base-content/8">
            {data.upcomingReunions.slice(0, 4).map((reunion, i) => (
              <div key={`${reunion.id}-${i}`} className="flex items-center justify-between p-4 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{reunion.reunion_title}</p>
                  <p className="text-xs text-base-content/40 mt-0.5">
                    {formatUtils.dateTime(reunion.scheduled_date, reunion.scheduled_time)} &middot; {reunion.duration_minutes} min
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-primary font-medium">
                    {formatUtils.timeRemaining(reunion.scheduled_date, reunion.scheduled_time)}
                  </span>
                  {reunion.reunion_url && (
                    <a href={reunion.reunion_url} target="_blank" rel="noopener noreferrer"
                      className="btn btn-outline btn-xs">
                      Entrar
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
