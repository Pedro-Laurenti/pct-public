"use client";
import { useState, useEffect, useRef } from "react";
import { FaArrowLeft, FaArrowRight, FaPlus, FaExternalLinkAlt, FaCalendarAlt, FaCalendarWeek, FaClock, FaEdit } from "react-icons/fa";
import Alert from "@/components/Alert";
import LoadingOrError from "@/components/LoadingOrError";
import Link from "next/link";
import { CgLock, CgTime } from "react-icons/cg";
import { FcClock } from "react-icons/fc";
import { FiClock } from "react-icons/fi";
import { BiStopwatch } from "react-icons/bi";

interface Reunion {
  id: number;
  reunion_id: number;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  reunion_title: string;
  reunion_description: string;
  reunion_url: string;
  lesson_content_id: number;
}

type ViewMode = "week" | "month";

export default function ReunionsPage() {
  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  // Estado para controle de visualização (semanal ou mensal)
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  
  // Calendário e seleção
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedReunions, setSelectedReunions] = useState<Reunion[]>([]);
  
  // Para visualização semanal
  const [currentWeek, setCurrentWeek] = useState<Date>(today);
  
  // Estado para rastrear a hora atual para a agulha do tempo
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Referência para calcular a posição da agulha de tempo
  const timelineRef = useRef<HTMLDivElement>(null);

  // Atualiza a hora atual a cada minuto para mover a agulha de tempo
  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(new Date());
    };
    
    updateCurrentTime(); // Atualiza imediatamente
    const intervalId = setInterval(updateCurrentTime, 60000); // Atualiza a cada minuto (60000ms)
    
    return () => clearInterval(intervalId);
  }, []);

  // Buscar reuniões para o mês/ano ou semana atual
  useEffect(() => {
    async function fetchReunions() {
      setLoading(true);
      try {
        let url = "/api/admin/reunions?";
        
        if (viewMode === "month") {
          url += `month=${currentMonth}&year=${currentYear}`;
        } else {
          // Para visualização semanal, vamos pegar o primeiro e último dia da semana
          const weekStart = getStartOfWeek(currentWeek);
          const weekEnd = getEndOfWeek(currentWeek);
          url += `startDate=${formatDateForApi(weekStart)}&endDate=${formatDateForApi(weekEnd)}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch reunions");
        
        const data = await response.json();
        setReunions(data.reunions || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchReunions();
  }, [currentMonth, currentYear, currentWeek, viewMode]);

  // Funções auxiliares para datas
  const formatDateForApi = (date: Date): string => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // ajuste para semana começar na segunda
    return new Date(d.setDate(diff));
  };

  const getEndOfWeek = (date: Date): Date => {
    const d = new Date(getStartOfWeek(date));
    d.setDate(d.getDate() + 6);
    return d;
  };

  // Gerar dias do mês atual
  const getDaysInMonth = () => {
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
    
    let calendarDays = [];
    
    // Dias do mês anterior (para preenchimento)
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push({ day: null, isCurrentMonth: false });
    }
    
    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      // Agora extraindo apenas a parte da data (YYYY-MM-DD) para comparação
      const reunionsForDay = reunions.filter(r => {
        // Verificar se a data da reunião começa com a data do dia atual do calendário
        return r.scheduled_date.substring(0, 10) === dateString;
      });
      
      calendarDays.push({
        day,
        isCurrentMonth: true,
        dateString,
        reunions: reunionsForDay,
      });
    }
    
    // Calcular quantos mais dias adicionar para completar a grade (múltiplo de 7)
    const remainingCells = 42 - calendarDays.length; // 6 semanas x 7 dias
    
    // Dias do próximo mês (para preenchimento)
    for (let i = 1; i <= remainingCells; i++) {
      calendarDays.push({ day: null, isCurrentMonth: false });
    }
    
    return calendarDays;
  };

  // Gerar dias da semana atual
  const getDaysInWeek = () => {
    const weekStart = getStartOfWeek(currentWeek);
    let weekDays = [];
    
    // Gerar os 7 dias da semana
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);
      
      const dateString = formatDateForApi(currentDate);
      const reunionsForDay = reunions.filter(r => r.scheduled_date.substring(0, 10) === dateString);
      
      weekDays.push({
        date: currentDate,
        dateString,
        reunions: reunionsForDay,
        isToday: formatDateForApi(new Date()) === dateString
      });
    }
    
    return weekDays;
  };

  // Mudar para o mês anterior
  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
    setSelectedReunions([]);
  };

  // Mudar para o próximo mês
  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
    setSelectedReunions([]);
  };

  // Mudar para a semana anterior
  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeek(prevWeek);
    setSelectedDate(null);
    setSelectedReunions([]);
  };

  // Mudar para a próxima semana
  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeek(nextWeek);
    setSelectedDate(null);
    setSelectedReunions([]);
  };

  // Formatar a data para exibição
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    // Adiciona o horário 'T12:00:00' para garantir que a data fique no dia correto,
    // evitando problemas com fuso horário
    const date = new Date(`${dateString.substring(0, 10)}T12:00:00`);
    return date.toLocaleDateString('pt-BR');
  };

  // Formatar a hora para exibição
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  // Retornar para a semana atual
  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  // Retornar para o mês atual
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date().getMonth() + 1);
    setCurrentYear(new Date().getFullYear());
  };

  // Nomes dos meses em português
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Nomes dos dias da semana em português
  const weekdayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  if (loading || error) {
    return <LoadingOrError loading={loading} error={error} />;
  }

  return (
    <div className="p-6 space-y-6 flex flex-col h-screen overflow-hidden">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="flex flex-col gap-4">
        {/* Cabeçalho principal */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Calendário de Reuniões</h1>
          <Link href="/admin/contents/new" className="btn btn-primary btn-sm md:btn-md flex items-center gap-2">
            <FaPlus /> Nova Reunião
          </Link>
        </div>

        {/* Barra de controles do calendário */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-base-200 rounded-lg shadow-sm">
          {/* Navegação calendário */}
          <div className="flex items-center gap-3">
            <button
              className="btn btn-circle btn-sm bg-base-100"
              onClick={viewMode === "week" ? goToPreviousWeek : goToPreviousMonth}
              aria-label={viewMode === "week" ? "Semana anterior" : "Mês anterior"}
            >
              <FaArrowLeft />
            </button>
            
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-semibold">
                {viewMode === "week" 
                  ? `${formatDate(formatDateForApi(getStartOfWeek(currentWeek)))} - ${formatDate(formatDateForApi(getEndOfWeek(currentWeek)))}`
                  : `${monthNames[currentMonth - 1]} ${currentYear}`
                }
              </h2>
            </div>
            
            <button
              className="btn btn-circle btn-sm bg-base-100"
              onClick={viewMode === "week" ? goToNextWeek : goToNextMonth}
              aria-label={viewMode === "week" ? "Próxima semana" : "Próximo mês"}
            >
              <FaArrowRight />
            </button>
            <button 
                onClick={viewMode === "week" ? goToCurrentWeek : goToCurrentMonth} 
                className="btn btn-sm bg-base-100"
              >
               <CgTime /> hoje
            </button>
          </div>

          {/* Seleção de modo de visualização */}
          <div className="join">
            <button 
              className={`join-item btn btn-sm btn-square ${viewMode === "week" ? "btn-secondary" : "btn-ghost"}`}
              onClick={() => setViewMode("week")}
            >
              <FaCalendarWeek className="" />
            </button>
            <button 
              className={`join-item btn btn-sm btn-square ${viewMode === "month" ? "btn-secondary" : "btn-ghost"}`}
              onClick={() => setViewMode("month")}
            >
              <FaCalendarAlt className="" />
            </button>
          </div>
        </div>
      </div>
      
      {viewMode === "week" ? (
        <>
          {/* Layout da visualização semanal */}
          <div className="overflow-y-auto h-full relative bg-base-100 rounded-lg shadow-sm">
            {/* Agulha de tempo atual - posicionada absolutamente */}
            <div 
              ref={timelineRef}
              className="absolute left-0 right-0 z-10 pointer-events-none" 
              style={{
                top: `calc(${currentTime.getHours() * 59.3}px + ${currentTime.getMinutes()}px)`,
              }}
            >
              <div className="flex items-center w-full">
                <div className="w-20 pr-2 text-right">
                  <span className="text-xs font-medium text-error bg-base-100 px-1 py-0.5 rounded shadow-sm">
                    {`${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`}
                  </span>
                </div>
                <div className="h-[2px] bg-error flex-grow" />
              </div>
            </div>

            <table className="table w-full relative border-collapse table-fixed">
              <thead className="sticky top-0 bg-base-100 z-20 shadow-sm">
                <tr>
                  <th className="w-20 bg-base-200 p-3">Horário</th>
                  {getDaysInWeek().map((dayInfo, index) => (
                    <th 
                      key={`header-${index}`}
                      style={{ width: `calc((100% - 5rem) / 7)` }}
                      className={`text-center p-3 ${dayInfo.isToday ? 'bg-primary/10 text-primary font-bold' : 'bg-base-200'}`}
                    >
                      <div className="font-medium">{weekdayNames[dayInfo.date.getDay()]}</div>
                      <div className={`text-sm ${dayInfo.isToday ? 'font-bold' : ''}`}>
                        {dayInfo.date.getDate().toString().padStart(2, '0')}/{(dayInfo.date.getMonth() + 1).toString().padStart(2, '0')}
                      </div>
                      {dayInfo.reunions.length > 0 && (
                        <div className="badge badge-xs badge-primary mt-1">{dayInfo.reunions.length}</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Faixa de horários das 0h às 23h */}
                {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                  <tr key={`hour-${hour}`} className="border-t border-base-200">
                    <td className="font-medium text-sm text-center bg-base-100 border-r border-base-200 sticky left-0 w-20">
                      {hour.toString().padStart(2, '0')}:00
                    </td>
                    {getDaysInWeek().map((dayInfo, dayIndex) => {
                      const hoursReunions = dayInfo.reunions.filter(r => {
                        const reunionHour = parseInt(r.scheduled_time.split(':')[0], 10);
                        return reunionHour === hour;
                      });
                      
                      return (
                        <td 
                          key={`day-${dayIndex}-hour-${hour}`}
                          style={{ width: `calc((100% - 5rem) / 7)` }}
                          className={`border border-base-200 h-14 p-1 align-top ${dayInfo.isToday ? 'bg-primary/5' : ''} 
                          ${hour >= 8 && hour <= 18 ? 'bg-base-100' : 'bg-base-200/20'} 
                          ${hoursReunions.length > 0 ? 'hover:bg-base-300/50 transition-colors cursor-pointer' : ''}`}
                        >
                          {hoursReunions.length > 0 ? (
                            <div className="space-y-1">
                              {hoursReunions.map(reunion => (
                                <div 
                                  key={reunion.id} 
                                  className="p-1.5 px-2 bg-primary text-primary-content rounded text-xs shadow-sm
                                    whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer hover:shadow-md transition-all"
                                  title={`${reunion.reunion_title} (${formatTime(reunion.scheduled_time)} - ${reunion.duration_minutes} min)`}
                                  onClick={() => {
                                    setSelectedDate(dayInfo.dateString);
                                    setSelectedReunions([reunion]);
                                    (document.getElementById('reunion_details_modal') as HTMLDialogElement).showModal();
                                  }}
                                >
                                  <div className="flex items-center gap-1">
                                    <span className="font-bold">{formatTime(reunion.scheduled_time)}</span>
                                    <span className="truncate"> | {reunion.reunion_title}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* Grid do calendário mensal com design melhorado */}
          <div className="bg-base-100 rounded-lg shadow-sm overflow-hidden h-full m-0">
            {/* Cabeçalhos dos dias da semana */}
            <div className="grid grid-cols-7 bg-base-200 border-b border-base-300">
              {weekdayNames.map((day, i) => (
                <div key={`header-${i}`} className="p-3 text-center font-medium">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Dias do mês em grid */}
            <div className="grid grid-cols-7">
              {getDaysInMonth().map((dayInfo: any, idx) => {
                const isToday = dayInfo.isCurrentMonth && formatDateForApi(new Date()) === dayInfo.dateString;
                
                return (
                  <div
                    key={`day-${idx}`}
                    className={`min-h-[120px] p-2 border border-base-200 transition-all duration-200
                      ${!dayInfo.isCurrentMonth ? "bg-base-200/30" : ""}
                      ${isToday ? "bg-primary/10" : ""}
                      ${dayInfo.isCurrentMonth && dayInfo.reunions?.length > 0 ? "hover:bg-base-200 cursor-pointer" : ""}`}
                  >
                    {/* Número do dia com indicador para hoje */}
                    {dayInfo.day && (
                      <div className="flex justify-between items-center mb-1">
                        <div className={`flex items-center justify-center 
                          ${isToday ? "h-7 w-7 rounded-full bg-primary text-primary-content" : ""}`}>
                          <span className={`${isToday ? "" : "text-sm font-medium"} ${!dayInfo.isCurrentMonth ? "opacity-50" : ""}`}>
                            {dayInfo.day}
                          </span>
                        </div>
                        
                        {/* Badge com contagem de reuniões */}
                        {dayInfo.isCurrentMonth && dayInfo.reunions?.length > 0 && (
                          <span className="badge badge-sm badge-primary">{dayInfo.reunions.length}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Lista de reuniões para o dia (limitado a 3 com indicador de "mais") */}
                    {dayInfo.isCurrentMonth && dayInfo.reunions?.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {dayInfo.reunions.slice(0, 3).map((r: Reunion) => (
                          <div
                            key={r.id}
                            className="text-xs p-1 px-2 bg-primary/80 text-primary-content rounded-md
                              whitespace-nowrap overflow-hidden text-ellipsis hover:bg-primary transition-colors"
                            title={`${r.reunion_title} (${formatTime(r.scheduled_time)})`}
                            onClick={() => {
                              setSelectedDate(dayInfo.dateString);
                              setSelectedReunions([r]);
                              (document.getElementById('reunion_details_modal') as HTMLDialogElement).showModal();
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{formatTime(r.scheduled_time)}</span>
                              <span className="truncate">- {r.reunion_title}</span>
                            </div>
                          </div>
                        ))}
                        
                        {dayInfo.reunions.length > 3 && (
                          <div 
                            className="text-xs text-primary font-medium pl-2 flex items-center gap-1 mt-1 cursor-pointer hover:underline"
                            onClick={() => {
                              setSelectedDate(dayInfo.dateString);
                              setSelectedReunions(dayInfo.reunions);
                              (document.getElementById('reunion_details_modal') as HTMLDialogElement).showModal();
                            }}
                          >
                            <span className="text-primary">+{dayInfo.reunions.length - 3}</span> mais
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Modal para detalhes da reunião selecionada */}
      <dialog id="reunion_details_modal" className="modal">
        <div className="modal-box w-11/12 max-w-3xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="text-xl font-semibold border-b pb-2 mb-4">
            Reuniões do dia {selectedDate ? formatDate(selectedDate) : ''}
            {selectedReunions.length > 0 && (
              <span className="text-sm font-normal ml-2 text-base-content/70">
                ({selectedReunions.length} {selectedReunions.length === 1 ? "reunião" : "reuniões"})
              </span>
            )}
          </h3>
          
          {selectedReunions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-base-content/70">Nenhuma reunião agendada para esta data.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {selectedReunions.map((reunion) => (
                <div key={reunion.id} className="card bg-base-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="card-body p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="card-title text-lg">{reunion.reunion_title}</h4>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-2">
                            <FiClock/><span>{formatTime(reunion.scheduled_time)}</span>
                          </div>
                          |
                          <div className="flex items-center gap-2">
                            <BiStopwatch /><span>{reunion.duration_minutes} minutos</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {reunion.reunion_url && (
                          <a
                            href={reunion.reunion_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-square btn-primary"
                            title="Participar da reunião"
                          >
                            <FaExternalLinkAlt />
                          </a>
                        )}
                        <Link
                          href={`/admin/contents/${reunion.lesson_content_id}/reunion`}
                          className="btn btn-sm btn-square btn-secondary"
                          title="Editar reunião"
                        >
                          <FaEdit />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Fechar</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>fechar</button>
        </form>
      </dialog>
    </div>
  );
}