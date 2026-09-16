"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import {
  FaHome, FaUser, FaBook, FaChalkboardTeacher, FaCalendarAlt,
  FaBars, FaTimes, FaChevronLeft, FaChevronRight,
} from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import { BiLogOut } from "react-icons/bi";

export default function ClientAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const pathname = usePathname();
  const sessionExpiredRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401 && !sessionExpiredRef.current) {
        sessionExpiredRef.current = true;
        setSessionExpired(true);
      }
      return response;
    };
    return () => { window.fetch = originalFetch; };
  }, []);

  useEffect(() => { setIsSidebarOpen(false); }, [pathname]);

  const menuItems = [
    { icon: <FaHome />,              label: "Inicio",  link: "/admin",          exact: true  },
    { icon: <FaCalendarAlt />,       label: "Agenda",  link: "/admin/reunions", exact: false },
    { icon: <FaChalkboardTeacher />, label: "Turmas",  link: "/admin/classes",  exact: false },
    { icon: <FaBook />,              label: "Cursos",  link: "/admin/courses",  exact: false },
  ];

  const isActive = (link: string, exact: boolean) =>
    exact ? pathname === link : pathname.startsWith(link);

  return (
    <>
      {sessionExpired && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Sessao Expirada</h3>
            <p className="py-4">Sua sessao expirou. Por favor, faca login novamente para continuar.</p>
            <div className="modal-action">
              <button className="btn btn-primary" onClick={() => router.replace("/login")}>
                Ir para o Login
              </button>
            </div>
          </div>
        </dialog>
      )}

      <div className="flex h-screen overflow-x-hidden">
        {/* Overlay mobile */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:static bg-base-100 border-r border-base-300 flex flex-col justify-between h-screen z-30
          transition-all duration-200
          w-64 lg:${collapsed ? "w-16" : "w-64"}
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          {/* Topo: título + botão fechar mobile / colapsar desktop */}
          <div className={`flex items-center px-3 py-4 border-b border-base-200 ${collapsed ? "lg:justify-center" : "justify-between"}`}>
            {!collapsed && (
              <span className="font-bold text-sm truncate lg:block hidden">Painel Admin</span>
            )}
            {/* Fechar — mobile */}
            <button className="btn btn-sm btn-ghost btn-square lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <FaTimes />
            </button>
            {/* Colapsar — desktop */}
            <button
              className="btn btn-sm btn-ghost btn-square hidden lg:flex"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expandir" : "Recolher"}
            >
              {collapsed ? <FaChevronRight className="w-3 h-3" /> : <FaChevronLeft className="w-3 h-3" />}
            </button>
          </div>

          {/* Itens de menu */}
          <nav className="flex flex-col flex-1 py-3 gap-0.5">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.link}
                title={collapsed ? item.label : undefined}
                className={`
                  flex items-center gap-3 px-3 py-3 mx-2 rounded-lg transition-colors hover:bg-base-200
                  ${collapsed ? "lg:justify-center lg:px-0" : ""}
                  ${isActive(item.link, item.exact) ? "bg-base-200 text-primary font-semibold" : "text-base-content"}
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="text-lg shrink-0">{item.icon}</span>
                <span className={`text-sm font-medium ${collapsed ? "lg:hidden" : ""}`}>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Rodapé — ícones */}
          <div className={`flex items-center gap-1 px-3 py-4 border-t border-base-200 ${collapsed ? "lg:flex-col lg:px-1" : "justify-between"}`}>
            <ThemeToggle />
            <button
              onClick={() => router.push("/admin/profile")}
              className={`btn btn-ghost btn-sm btn-square ${isActive("/admin/profile", true) ? "text-primary" : ""}`}
              title="Meu Perfil"
            >
              <FaUser className="h-4 w-4" />
            </button>
            <button
              onClick={() => router.push("/logout")}
              className="btn btn-ghost btn-sm btn-square text-error"
              title="Sair"
            >
              <BiLogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 flex flex-col bg-base-100 h-screen overflow-hidden min-w-0">
          {/* Navbar mobile */}
          <div className="lg:hidden flex items-center px-4 py-3 bg-base-100 border-b border-base-300">
            <button className="btn btn-sm btn-ghost" onClick={() => setIsSidebarOpen(true)}>
              <FaBars />
            </button>
            <span className="ml-4 font-medium">Painel Admin PCT</span>
          </div>

          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </>
  );
}
