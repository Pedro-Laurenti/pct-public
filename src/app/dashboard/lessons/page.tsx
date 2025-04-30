"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import LoadingOrError from "@/components/LoadingOrError";
import { FaBook, FaChalkboardTeacher, FaChevronRight, FaGraduationCap, FaVideo, FaFileAlt, FaTasks, FaUsers } from "react-icons/fa";

interface Course {
  id: number;
  name: string;
  description: string;
  lessons: Lesson[];
  progress: {
    totalActivities: number;
    completedActivities: number;
    progressPercentage: number;
    totalContents: number;
    contentCounts?: {
      videos: number;
      texts: number;
      activities: number;
      reunions: number;
    };
  };
}

interface Lesson {
  id: number;
  title: string;
  lesson_description: string;
}

export default function LessonsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/dashboard");
        if (!response.ok) {
          throw new Error("Falha ao carregar dados do dashboard");
        }
        const data = await response.json();
        setCourses(data.courses || []);
        
        // Inicializa o estado expandido para cada curso (o primeiro expandido, os demais recolhidos)
        const initialExpandState: Record<number, boolean> = {};
        data.courses?.forEach((course: Course, index: number) => {
          initialExpandState[course.id] = index === 0;
        });
        setExpandedCourses(initialExpandState);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Função para expandir/recolher um curso
  const toggleCourse = (courseId: number) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  if (loading || error) {
    return <LoadingOrError loading={loading} error={error} />;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaGraduationCap className="text-primary" />
        Minhas Aulas
      </h1>

      {courses.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-5xl mb-3 opacity-20">📚</div>
          <p className="text-xl font-medium">Você não está inscrito em nenhum curso.</p>
          <p className="text-base-content/70 mt-2">Entre em contato com um administrador para ser adicionado a um curso.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => (
            <div key={course.id} className="card bg-base-100 shadow-sm">
              <div className="card-body p-5">
                {/* Cabeçalho do curso com informações de progresso */}
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleCourse(course.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                      <FaBook className="text-xl" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{course.name}</h2>
                      <p className="text-sm text-base-content/70 mt-1">{course.description}</p>
                      
                      {/* Resumo dos conteúdos */}
                      {course.progress.contentCounts && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {course.progress.contentCounts.texts > 0 && (
                            <span className="badge badge-sm badge-outline gap-1">
                              <FaFileAlt className="text-green-500" /> {course.progress.contentCounts.texts} {course.progress.contentCounts.texts === 1 ? 'texto' : 'textos'}
                            </span>
                          )}
                          {course.progress.contentCounts.videos > 0 && (
                            <span className="badge badge-sm badge-outline gap-1">
                              <FaVideo className="text-blue-500" /> {course.progress.contentCounts.videos} {course.progress.contentCounts.videos === 1 ? 'vídeo' : 'vídeos'}
                            </span>
                          )}
                          {course.progress.contentCounts.activities > 0 && (
                            <span className="badge badge-sm badge-outline gap-1">
                              <FaTasks className="text-orange-500" /> {course.progress.contentCounts.activities} {course.progress.contentCounts.activities === 1 ? 'atividade' : 'atividades'}
                            </span>
                          )}
                          {course.progress.contentCounts.reunions > 0 && (
                            <span className="badge badge-sm badge-outline gap-1">
                              <FaUsers className="text-purple-500" /> {course.progress.contentCounts.reunions} {course.progress.contentCounts.reunions === 1 ? 'reunião' : 'reuniões'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {/* Indicador de progresso */}
                    <div className="hidden md:flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">Progresso: {course.progress.progressPercentage}%</div>
                        <div className="w-20 h-2 bg-base-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${course.progress.progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs text-base-content/70 mt-1">
                        {course.progress.completedActivities} de {course.progress.totalActivities} atividades
                      </div>
                    </div>
                    
                    {/* Ícone de expansão */}
                    <div className="btn btn-circle btn-sm btn-ghost">
                      <FaChevronRight className={`transition-transform ${expandedCourses[course.id] ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                </div>
                
                {/* Lista de aulas (expandível) */}
                {expandedCourses[course.id] && (
                  <div className="mt-5">
                    <h3 className="text-base font-medium mb-3 flex items-center gap-2">
                      <FaChalkboardTeacher />
                      Aulas disponíveis
                    </h3>
                    
                    <div className="space-y-2">
                      {course.lessons.length > 0 ? (
                        course.lessons.map((lesson) => (
                          <Link 
                            href={`/dashboard/lessons/${lesson.id}`} 
                            key={lesson.id}
                            className="block p-3 bg-base-200/50 hover:bg-base-200 rounded-lg transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{lesson.title}</h4>
                                <p className="text-sm text-base-content/70 line-clamp-1">{lesson.lesson_description}</p>
                              </div>
                              <FaChevronRight className="text-primary/70" />
                            </div>
                          </Link>
                        ))
                      ) : (
                        <p className="text-center py-3 text-base-content/70">Nenhuma aula disponível neste curso.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}