"use client";
import { useState, useEffect, useRef } from "react";
import { FaArrowLeft, FaArrowRight, FaPlus, FaExternalLinkAlt, FaCalendarAlt, FaCalendarWeek, FaEdit } from "react-icons/fa";
import Alert from "@/components/Alert";
import LoadingOrError from "@/components/LoadingOrError";
import Link from "next/link";
import { CgTime } from "react-icons/cg";
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
  
  // Estado para controlar a largura da tela (para responsividade)
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Detecta tamanho da tela para responsividade
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Checa inicialmente
    checkIfMobile();
    
    // Adiciona listener para quando o tamanho da tela mudar
    window.addEventListener('resize', checkIfMobile);
    
    // Limpa o listener quando o componente for desmontado
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  // Atualiza a hora atual a cada minuto para mover a agulha de tempo
  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(new Date());
    };
    
    updateCurrentTime(); // Atualiza imediatamente
    const intervalId = setInterval(updateCurrentTime, 60000); // Atualiza a cada minuto (60000ms)
    
    return () => clearInterval(intervalId);
  }, []);

  // Função para agrupar reuniões por dia da semana
  const getReunionsByDay = () => {
    const days = getDaysInWeek();
    const reunionsByDay = days.map(day => ({
      date: day.date,
      dateString: day.dateString,
      isToday: day.isToday,
      dayName: weekdayNames[day.date.getDay()],
      dayNumber: day.date.getDate(),
      month: day.date.getMonth() + 1,
      reunions: day.reunions.sort((a, b) => 
        a.scheduled_time.localeCompare(b.scheduled_time)
      )
    }));
    
    return reunionsByDay;
  };

  // Buscar reuniões para o mês/ano ou semana atual
  useEffect(() => {
    async function fetchReunions() {
      setLoading(true);
      try {
        let url = "/api/reunions?";
        
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
    <div className="p-2 md:p-6 space-y-4 md:space-y-6 flex flex-col h-screen overflow-hidden">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="flex flex-col gap-2 md:gap-4">
        {/* Cabeçalho principal */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold">Calendário de Reuniões</h1>
        </div>

        {/* Barra de controles do calendário */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 p-2 md:p-4 bg-base-200 rounded-lg shadow-sm">
          {/* Navegação calendário */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            <button
              className="btn btn-circle btn-xs md:btn-sm bg-base-100"
              onClick={viewMode === "week" ? goToPreviousWeek : goToPreviousMonth}
              aria-label={viewMode === "week" ? "Semana anterior" : "Mês anterior"}
            >
              <FaArrowLeft />
            </button>
            
            <div className="flex flex-col items-center">
              <h2 className="text-sm md:text-lg font-semibold text-center">
                {viewMode === "week" 
                  ? `${formatDate(formatDateForApi(getStartOfWeek(currentWeek)))} - ${formatDate(formatDateForApi(getEndOfWeek(currentWeek)))}`
                  : `${monthNames[currentMonth - 1]} ${currentYear}`
                }
              </h2>
            </div>
            
            <button
              className="btn btn-circle btn-xs md:btn-sm bg-base-100"
              onClick={viewMode === "week" ? goToNextWeek : goToNextMonth}
              aria-label={viewMode === "week" ? "Próxima semana" : "Próximo mês"}
            >
              <FaArrowRight />
            </button>
            <button 
                onClick={viewMode === "week" ? goToCurrentWeek : goToCurrentMonth} 
                className="btn btn-xs md:btn-sm bg-base-100"
              >
               <CgTime className="mr-1 hidden sm:inline-block" /> hoje
            </button>
          </div>

          {/* Seleção de modo de visualização */}
          <div className="join mt-2 sm:mt-0">
            <button 
              className={`join-item btn btn-xs md:btn-sm btn-square ${viewMode === "week" ? "btn-secondary" : "btn-ghost"}`}
              onClick={() => setViewMode("week")}
              aria-label="Visualização semanal"
            >
              <FaCalendarWeek />
            </button>
            <button 
              className={`join-item btn btn-xs md:btn-sm btn-square ${viewMode === "month" ? "btn-secondary" : "btn-ghost"}`}
              onClick={() => setViewMode("month")}
              aria-label="Visualização mensal"
            >
              <FaCalendarAlt />
            </button>
          </div>
        </div>
      </div>
        {viewMode === "week" ? (
        <>
          {/* Layout da visualização semanal */}
          <div className="overflow-auto h-full relative bg-base-100 rounded-lg shadow-sm">
            {/* Seletor de dias para telas pequenas (visível apenas em mobile) */}
            <div className="md:hidden flex overflow-x-auto bg-base-100 sticky top-0 z-20 border-b border-base-200 shadow-sm">
              {getDaysInWeek().map((dayInfo, index) => (
                <button 
                  key={`mobile-day-${index}`}
                  className={`flex flex-col items-center p-2 min-w-[4rem] ${dayInfo.isToday ? 'bg-primary/10 text-primary font-bold' : ''}`}
                  onClick={() => {
                    // Mostrar reuniões deste dia no modal
                    if (dayInfo.reunions.length > 0) {
                      setSelectedDate(dayInfo.dateString);
                      setSelectedReunions(dayInfo.reunions);
                      (document.getElementById('reunion_details_modal') as HTMLDialogElement).showModal();
                    }
                  }}
                >
                  <div className="font-medium text-xs">{weekdayNames[dayInfo.date.getDay()]}</div>
                  <div className={`text-sm ${dayInfo.isToday ? 'font-bold' : ''}`}>
                    {dayInfo.date.getDate().toString().padStart(2, '0')}/{(dayInfo.date.getMonth() + 1).toString().padStart(2, '0')}
                  </div>
                  {dayInfo.reunions.length > 0 && (
                    <div className="badge badge-xs badge-primary mt-1">{dayInfo.reunions.length}</div>
                  )}
                </button>
              ))}
            </div>

            {/* Agulha de tempo atual - posicionada absolutamente */}
            <div 
              ref={timelineRef}
              className="absolute left-0 right-0 z-10 pointer-events-none hidden md:block" 
              style={{
                top: `calc(60px + (${currentTime.getHours()} * 56px) + (${currentTime.getMinutes()} / 60 * 56px))`,
              }}
            >
              <div className="flex items-center w-full">
                <div className="w-12 md:w-20 pr-2 text-right">
                  <span className="text-xs font-medium text-error bg-base-100 px-1 py-0.5 rounded shadow-sm">
                    {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                </div>
                <div className="h-[2px] bg-error flex-grow" />
              </div>
            </div>            {/* Tabela de calendário (visível apenas em desktop) */}
            <table className="hidden md:table w-full relative border-collapse table-fixed">
              <thead className="sticky top-0 bg-base-100 z-20 shadow-sm">
                <tr>
                  <th className="w-12 md:w-20 bg-base-200 p-1 md:p-3 text-xs md:text-sm">Horário</th>
                  {getDaysInWeek().map((dayInfo, index) => (
                    <th 
                      key={`header-${index}`}
                      style={{ width: `calc((100% - 5rem) / 7)` }}
                      className={`text-center p-1 md:p-3 ${dayInfo.isToday ? 'bg-primary/10 text-primary font-bold' : 'bg-base-200'}`}
                    >
                      <div className="font-medium text-xs md:text-sm">{weekdayNames[dayInfo.date.getDay()]}</div>
                      <div className={`text-xs md:text-sm ${dayInfo.isToday ? 'font-bold' : ''}`}>
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
                    <td className="font-medium text-xs md:text-sm text-center bg-base-100 border-r border-base-200 sticky left-0 w-12 md:w-20">
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
                          className={`border border-base-200 h-10 md:h-14 p-1 align-top ${dayInfo.isToday ? 'bg-primary/5' : ''} 
                          ${hour >= 8 && hour <= 18 ? 'bg-base-100' : 'bg-base-200/20'} 
                          ${hoursReunions.length > 0 ? 'hover:bg-base-300/50 transition-colors cursor-pointer' : ''}`}
                        >
                          {hoursReunions.length > 0 ? (
                            <div className="space-y-1">
                              {hoursReunions.map(reunion => (
                                <div 
                                  key={reunion.id} 
                                  className="p-1 md:p-1.5 px-2 bg-primary text-primary-content rounded text-xs shadow-sm
                                    w-full block overflow-hidden text-ellipsis cursor-pointer hover:shadow-md transition-all"
                                  title={`${reunion.reunion_title} (${formatTime(reunion.scheduled_time)} - ${reunion.duration_minutes} min)`}
                                  onClick={() => {
                                    setSelectedDate(dayInfo.dateString);
                                    setSelectedReunions([reunion]);                                    (document.getElementById('reunion_details_modal') as HTMLDialogElement).showModal();
                                  }}
                                >
                                  <div className="flex items-center gap-1">
                                    <span className="font-bold whitespace-nowrap">{formatTime(reunion.scheduled_time)}</span>
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
            </table>            {/* Visualização de lista para dispositivos móveis (vista diária) */}
            <div className="md:hidden px-2 py-3 space-y-4">
              {getReunionsByDay().map((dayInfo, index) => (
                <div key={`mobile-day-list-${index}`} className={`space-y-2 ${!dayInfo.isToday && 'hidden'}`}>
                  <h3 className="font-semibold text-center flex items-center justify-center gap-2">
                    <span>Reuniões de Hoje</span>
                    <span className="badge badge-primary badge-sm">{dayInfo.reunions.length}</span>
                  </h3>
                  
                  {dayInfo.reunions.length > 0 ? (
                    <div className="space-y-2">
                      {dayInfo.reunions.map(reunion => (
                        <div 
                          key={reunion.id} 
                          className="p-3 bg-base-200 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
                          onClick={() => {
                            setSelectedDate(dayInfo.dateString);
                            setSelectedReunions([reunion]);
                            (document.getElementById('reunion_details_modal') as HTMLDialogElement).showModal();
                          }}
                        >
                          <div className="font-medium">{reunion.reunion_title}</div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-base-content/80">
                            <div className="flex items-center gap-1">
                              <FiClock />
                              <span>{formatTime(reunion.scheduled_time)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BiStopwatch />
                              <span>{reunion.duration_minutes} min</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-base-content/60">
                      <p>Nenhuma reunião agendada para hoje</p>
                      <button 
                        className="btn btn-xs btn-link mt-2"
                        onClick={() => {
                          const allReunions = reunions.flatMap(r => r);
                          if (allReunions.length > 0) {
                            setSelectedReunions(allReunions);
                            (document.getElementById('reunion_details_modal') as HTMLDialogElement).showModal();
                          }
                        }}
                      >
                        Ver todas as reuniões da semana
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Lista de todos os dias da semana para navegação rápida */}
              <div className="pt-4 border-t mt-4">
                <h4 className="font-medium text-sm mb-2">Outros dias da semana:</h4>
                <div className="space-y-2">
                  {getReunionsByDay().filter(day => !day.isToday).map((dayInfo, index) => (
                    <button 
                      key={`day-nav-${index}`}
                      className="flex justify-between items-center w-full p-2 rounded hover:bg-base-200 transition-colors text-left"
                      onClick={() => {
                        if (dayInfo.reunions.length > 0) {
                          setSelectedDate(dayInfo.dateString);
                          setSelectedReunions(dayInfo.reunions);
                          (document.getElementById('reunion_details_modal') as HTMLDialogElement).showModal();
                        }
                      }}
                    >
                      <span>
                        <span className="font-medium">{dayInfo.dayName}</span>
                        <span className="text-xs text-base-content/70 ml-2">
                          {dayInfo.dayNumber.toString().padStart(2, '0')}/{dayInfo.month.toString().padStart(2, '0')}
                        </span>
                      </span>
                      {dayInfo.reunions.length > 0 ? (
                        <span className="badge badge-primary badge-sm">{dayInfo.reunions.length}</span>
                      ) : (
                        <span className="text-xs text-base-content/50">Sem reuniões</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>      ) : (
        <>
          {/* Grid do calendário mensal com design melhorado */}
          <div className="bg-base-100 rounded-lg shadow-sm overflow-hidden h-full m-0">
            {/* Cabeçalhos dos dias da semana */}
            <div className="grid grid-cols-7 bg-base-200 border-b border-base-300">
              {weekdayNames.map((day, i) => (
                <div key={`header-${i}`} className="p-1 md:p-3 text-center font-medium text-xs md:text-sm">
                  {/* Em telas muito pequenas, mostrar apenas a primeira letra */}
                  <span className="xs:hidden">{day.charAt(0)}</span>
                  <span className="hidden xs:inline">{day}</span>
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
                    className={`min-h-[80px] md:min-h-[120px] p-1 md:p-2 border border-base-200 transition-all duration-200
                      ${!dayInfo.isCurrentMonth ? "bg-base-200/30" : ""}
                      ${isToday ? "bg-primary/10" : ""}
                      ${dayInfo.isCurrentMonth && dayInfo.reunions?.length > 0 ? "hover:bg-base-200 cursor-pointer" : ""}`}
                  >
                    {/* Número do dia com indicador para hoje */}
                    {dayInfo.day && (
                      <div className="flex justify-between items-center mb-1">
                        <div className={`flex items-center justify-center 
                          ${isToday ? "h-5 w-5 md:h-7 md:w-7 rounded-full bg-primary text-primary-content" : ""}`}>
                          <span className={`text-xs md:text-sm ${isToday ? "" : "font-medium"} ${!dayInfo.isCurrentMonth ? "opacity-50" : ""}`}>
                            {dayInfo.day}
                          </span>
                        </div>
                        
                        {/* Badge com contagem de reuniões */}
                        {dayInfo.isCurrentMonth && dayInfo.reunions?.length > 0 && (
                          <span className="badge badge-xs md:badge-sm badge-primary">{dayInfo.reunions.length}</span>
                        )}
                      </div>
                    )}
                      {/* Lista de reuniões para o dia (limitado a 3 com indicador de "mais") */}
                    {dayInfo.isCurrentMonth && dayInfo.reunions?.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {/* Em telas grandes mostrar 3 reuniões, em pequenas apenas 1 */}
                        {dayInfo.reunions.slice(0, isMobile ? 1 : 3).map((r: Reunion) => (
                          <div
                            key={r.id}
                            className="text-[10px] md:text-xs p-0.5 md:p-1 px-1 md:px-2 bg-primary/80 text-primary-content rounded-md
                              whitespace-nowrap overflow-hidden text-ellipsis hover:bg-primary transition-colors"
                            title={`${r.reunion_title} (${formatTime(r.scheduled_time)})`}
                            onClick={() => {
                              setSelectedDate(dayInfo.dateString);
                              setSelectedReunions([r]);
                              (document.getElementById('reunion_details_modal') as HTMLDialogElement).showModal();
                            }}
                          >
                            <div className="flex items-center gap-0 md:gap-1">
                              <span className="font-medium">{formatTime(r.scheduled_time)}</span>
                              <span className="truncate hidden sm:inline">- {r.reunion_title}</span>
                            </div>
                          </div>
                        ))}
                        
                        {dayInfo.reunions.length > (isMobile ? 1 : 3) && (
                          <div 
                            className="text-[10px] md:text-xs text-primary font-medium pl-1 md:pl-2 flex items-center gap-1 mt-1 cursor-pointer hover:underline"
                            onClick={() => {
                              setSelectedDate(dayInfo.dateString);
                              setSelectedReunions(dayInfo.reunions);
                              (document.getElementById('reunion_details_modal') as HTMLDialogElement).showModal();
                            }}
                          >
                            <span className="text-primary">+{dayInfo.reunions.length - (isMobile ? 1 : 3)}</span> mais
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
      )}      {/* Modal para detalhes da reunião selecionada */}
      <dialog id="reunion_details_modal" className="modal">
        <div className="modal-box w-11/12 max-w-3xl p-3 md:p-6">
          <form method="dialog">
            <button className="btn btn-xs md:btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="text-base md:text-xl font-semibold border-b pb-2 mb-4">
            Reuniões do dia {selectedDate ? formatDate(selectedDate) : ''}
            {selectedReunions.length > 0 && (
              <span className="text-xs md:text-sm font-normal ml-2 text-base-content/70">
                ({selectedReunions.length} {selectedReunions.length === 1 ? "reunião" : "reuniões"})
              </span>
            )}
          </h3>
          
          {selectedReunions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl md:text-5xl mb-3 opacity-20">📅</div>
              <p className="text-base-content/70">Nenhuma reunião agendada para esta data.</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4 max-h-[60vh] overflow-y-auto pr-1 md:pr-2">
              {selectedReunions.map((reunion) => (
                <div key={reunion.id} className="card bg-base-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="card-body p-3 md:p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                      <div>
                        <h4 className="card-title text-sm md:text-lg">{reunion.reunion_title}</h4>
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-xs md:text-sm">
                          <div className="flex items-center gap-1 md:gap-2">
                            <FiClock/><span>{formatTime(reunion.scheduled_time)}</span>
                          </div>
                          <span className="hidden sm:inline">|</span>
                          <div className="flex items-center gap-1 md:gap-2">
                            <BiStopwatch /><span>{reunion.duration_minutes} minutos</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-2 sm:mt-0">
                        {reunion.reunion_url && (
                          <a
                            href={reunion.reunion_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-xs md:btn-sm btn-square btn-primary"
                            title="Participar da reunião"
                          >
                            <FaExternalLinkAlt />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        
        </div>
        <form method="dialog" className="modal-backdrop">
          <button></button>
        </form>
      </dialog>
    </div>
  );
}