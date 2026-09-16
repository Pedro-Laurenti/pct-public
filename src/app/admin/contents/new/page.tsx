"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/Alert";

interface CourseOption {
  id: number;
  name: string;
  description: string;
}

interface LessonOption {
  id: number;
  title: string;
  course_id: number;
}

export default function NewContentPage() {
  const router = useRouter();
  
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [selectedContentType, setSelectedContentType] = useState<string>("text");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [validationAlert, setValidationAlert] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all courses using our new endpoint
    async function fetchCourses() {
      try {
        const response = await fetch("/api/admin/contents/courses");
        
        if (!response.ok) {
          throw new Error("Falha ao carregar os cursos");
        }
        
        const data = await response.json();
        setCourses(data.courses);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCourses();
  }, []);

  // Fetch lessons when a course is selected using our new endpoint
  useEffect(() => {
    if (!selectedCourse) {
      setLessons([]);
      setSelectedLesson("");
      return;
    }

    // Fetch lessons for the selected course using the new endpoint
    async function fetchLessonsForCourse() {
      setLoadingLessons(true);
      try {
        const response = await fetch(`/api/admin/contents/lessons-by-course?courseId=${selectedCourse}`);
        
        if (!response.ok) {
          throw new Error("Falha ao carregar as aulas para o curso selecionado");
        }
        
        const data = await response.json();
        setLessons(data.lessons);
        
        // Clear the selected lesson when changing courses
        setSelectedLesson("");
      } catch (err: any) {
        setError(err.message);
        setLessons([]);
      } finally {
        setLoadingLessons(false);
      }
    }

    fetchLessonsForCourse();
  }, [selectedCourse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLesson) {
      setValidationAlert("Por favor, selecione uma aula.");
      return;
    }
    
    // Redirecionar para a página de criação específica do tipo de conteúdo
    router.push(`/admin/contents/new/${selectedLesson}/${selectedContentType}`);
  };

  if (loading) return <div className="text-center p-10">Carregando...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {validationAlert && <Alert type="error" message={validationAlert} onClose={() => setValidationAlert(null)} />}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Criar Novo Conteúdo</h1>
        <button
          className="btn btn-outline"
          onClick={() => router.push('/admin/contents')}
        >
          Voltar
        </button>
      </div>

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Selecione um Curso</span>
              </label>
              <select 
                className="select select-bordered w-full"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">Selecione um curso</option>
                {courses.map((courseOption) => (
                  <option key={courseOption.id} value={courseOption.id}>
                    {courseOption.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Selecione a Aula</span>
              </label>
              <select 
                className="select select-bordered w-full"
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
                disabled={!selectedCourse || loadingLessons}
                required
              >
                <option value="" disabled>
                  {loadingLessons ? "Carregando aulas..." : "Selecione uma aula"}
                </option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
              {!selectedCourse && (
                <label className="label">
                  <span className="label-text-alt text-warning">Selecione um curso primeiro</span>
                </label>
              )}
              {lessons.length === 0 && selectedCourse && !loadingLessons && (
                <label className="label">
                  <span className="label-text-alt text-warning">Não há aulas disponíveis para este curso</span>
                </label>
              )}
            </div>

            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">Tipo de Conteúdo</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedContentType}
                onChange={(e) => setSelectedContentType(e.target.value)}
                required
              >
                <option value="text">Texto</option>
                <option value="video">Vídeo</option>
                <option value="activity">Atividade</option>
                <option value="reunion">Reunião</option>
              </select>
            </div>

            <div className="form-control mt-6">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!selectedLesson}
              >
                Continuar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}