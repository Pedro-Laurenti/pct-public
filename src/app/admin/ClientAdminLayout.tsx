"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import {
  FaHome, FaUser, FaBook, FaChalkboardTeacher, FaCalendarAlt,
  FaBars, FaTimes, FaChevronLeft, FaChevronRight, FaTag,
} from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import { BiLogOut } from "react-icons/bi";
import packageJson from "@/../package.json";

const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === "true";

export default function ClientAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const menuItems = [
    { icon: <FaHome />,              label: "Início",     link: "/admin",             exact: true  },
    { icon: <FaCalendarAlt />,       label: "Agenda",     link: "/admin/reunions",    exact: false },
    { icon: <FaChalkboardTeacher />, label: "Turmas",     link: "/admin/classes",     exact: false },
    { icon: <FaBook />,              label: "Cursos",     link: "/admin/courses",     exact: false },
    ...(PAYMENTS_ENABLED ? [{ icon: <FaTag />, label: "Promoções", link: "/admin/promotions", exact: false }] : []),
  ];

  const isActive = (link: string, exact: boolean) =>
    exact ? pathname === link : pathname.startsWith(link);

  return (
    <>
      {sessionExpired && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Sessão Expirada</h3>
            <p className="py-4">Sua sessão expirou. Faça login novamente para continuar.</p>
            <div className="modal-action">
              <button className="btn btn-primary" onClick={() => router.replace("/login")}>
                Ir para o Login
              </button>
            </div>
          </div>
        </dialog>
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Overlay mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30 flex flex-col
          bg-base-200 border-r border-base-300
          transition-all duration-200
          ${collapsed ? "lg:w-14" : "lg:w-56"}
          w-56
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>

          {/* Cabeçalho */}
          <div className={`flex items-center px-3 py-4 border-b border-base-content/8 ${collapsed ? "lg:justify-center" : "justify-between"}`}>
            <div className={`flex items-center gap-2 min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
              <img src="/images/logo_mini.svg" alt="" className="w-5 h-5 shrink-0" />
              <span className="font-serif text-sm font-semibold tracking-wide truncate text-base-content/80">
                Painel Admin
              </span>
            </div>
            {collapsed && (
              <img src="/images/logo_mini.svg" alt="" className="w-5 h-5 hidden lg:block" />
            )}
            {/* Fechar — mobile */}
            <button
              className="btn btn-ghost btn-sm btn-square lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <FaTimes className="w-4 h-4" />
            </button>
            {/* Colapsar — desktop */}
            <button
              className="btn btn-ghost btn-sm btn-square hidden lg:flex text-base-content/40 hover:text-base-content"
              onClick={() => setCollapsed(v => !v)}
              title={collapsed ? "Expandir" : "Recolher"}
            >
              {collapsed
                ? <FaChevronRight className="w-3 h-3" />
                : <FaChevronLeft className="w-3 h-3" />}
            </button>
          </div>

          {/* Navegação */}
          <nav className="flex flex-col grow py-2">
            {menuItems.map((item) => {
              const active = isActive(item.link, item.exact);
              return (
                <Link
                  key={item.link}
                  href={item.link}
                  title={item.label}
                  className={`
                    flex items-center gap-3 py-2.5 transition-colors
                    ${collapsed
                      ? "lg:justify-center lg:mx-1.5 lg:px-0 lg:rounded-sm px-3"
                      : "px-3 border-l-2"}
                    ${active
                      ? collapsed
                        ? "lg:bg-primary/12 lg:border-0 text-primary font-semibold border-l-2 border-primary bg-primary/8"
                        : "border-primary bg-primary/8 text-primary font-semibold"
                      : collapsed
                        ? "lg:border-0 border-l-2 border-transparent text-base-content/55 hover:bg-base-300/70 hover:text-base-content"
                        : "border-transparent text-base-content/55 hover:bg-base-300/70 hover:text-base-content hover:border-base-content/15"}
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="text-sm shrink-0">{item.icon}</span>
                  <span className={`text-sm ${collapsed ? "lg:hidden" : ""}`}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Rodapé */}
          <div className={`
            border-t border-base-content/8 px-2 py-3
            ${collapsed ? "lg:flex-col flex-row" : "flex-row"}
            flex items-center gap-1
          `}>
            {/* Versão — só quando expandida */}
            {!collapsed && (
              <Link
                href="/admin/changelog"
                className="text-[0.55rem] text-base-content/25 hover:text-primary/60 transition-colors tracking-widest mr-auto"
                title="Novidades"
              >
                v{packageJson.version}
              </Link>
            )}

            <ThemeToggle size="sm" />
            <button
              onClick={() => router.push("/admin/profile")}
              className={`btn btn-ghost btn-sm btn-square ${isActive("/admin/profile", true) ? "text-primary" : "text-base-content/40 hover:text-base-content"}`}
              title="Meu Perfil"
            >
              <FaUser className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push("/logout")}
              className="btn btn-ghost btn-sm btn-square text-error/50 hover:text-error"
              title="Sair"
            >
              <BiLogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* ── Conteúdo ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Navbar mobile */}
          <div className="lg:hidden flex items-center px-4 py-3 bg-base-100 border-b border-base-300 shrink-0">
            <button
              className="btn btn-ghost btn-sm btn-square"
              onClick={() => setSidebarOpen(true)}
            >
              <FaBars className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 ml-3">
              <img src="/images/logo_mini.svg" alt="" className="w-5 h-5" />
              <span className="font-serif text-sm font-semibold tracking-wide">Painel Admin</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </>
  );
}
