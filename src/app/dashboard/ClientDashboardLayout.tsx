"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  FaCalendarAlt, FaHome, FaSignOutAlt, FaTasks, FaUser, FaClipboardList,
  FaChevronLeft, FaChevronRight,
} from 'react-icons/fa';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationBell from '@/components/NotificationBell';
import { BiMenu } from 'react-icons/bi';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
}

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const sessionExpiredRef = useRef(false);

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/validate');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };
    fetchUserData();
  }, []);

  const menuItems = [
    { icon: <FaHome />,          label: "Início",       link: "/dashboard",            exact: true  },
    { icon: <FaCalendarAlt />,   label: "Agenda",       link: "/dashboard/reunions",   exact: false },
    { icon: <FaTasks />,         label: "Minhas Aulas", link: "/dashboard/lessons",    exact: false },
    { icon: <FaClipboardList />, label: "Atividades",   link: "/dashboard/activities", exact: false },
  ];

  const isActive = (link: string, exact: boolean) =>
    exact ? pathname === link : pathname.startsWith(link);

  return (
    <>
      {sessionExpired && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Sessão Expirada</h3>
            <p className="py-4">Sua sessão expirou. Por favor, faça login novamente para continuar.</p>
            <div className="modal-action">
              <button className="btn btn-primary" onClick={() => router.replace('/login')}>
                Ir para o Login
              </button>
            </div>
          </div>
        </dialog>
      )}

      <div className="drawer lg:drawer-open">
        <input
          id="drawer-toggle"
          type="checkbox"
          className="drawer-toggle"
          checked={isMenuOpen}
          onChange={() => setIsMenuOpen(!isMenuOpen)}
        />

        {/* Conteúdo principal */}
        <div className="drawer-content flex flex-col">
          {/* Navbar — somente mobile */}
          <div className="navbar bg-base-100 shadow-md lg:hidden">
            <div className="flex-none">
              <label htmlFor="drawer-toggle" className="btn btn-square btn-ghost drawer-button p-3">
                <BiMenu className="w-7 h-7" />
              </label>
            </div>
            <div className="flex-1">
              <span className="btn btn-ghost text-xl px-3">Portal do Aluno</span>
            </div>
            <div className="flex-none flex items-center gap-1">
              <ThemeToggle />
              <NotificationBell />
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle bg-primary text-primary-content rounded-full w-12 h-12 text-lg ml-2">
                  <span>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
                <ul tabIndex={0} className="menu dropdown-content mt-3 z-[1] p-3 shadow bg-base-100 rounded-box w-64">
                  <li className="my-1">
                    <Link href="/dashboard/profile" className="py-3 text-base flex items-center">
                      <FaUser className="mr-2" /> Perfil
                    </Link>
                  </li>
                  <li className="my-1">
                    <Link href="/logout" className="py-3 text-base flex items-center">
                      <FaSignOutAlt className="mr-2" /> Sair
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div>{children}</div>
        </div>

        {/* Sidebar */}
        <div className="drawer-side z-10">
          <label htmlFor="drawer-toggle" aria-label="close sidebar" className="drawer-overlay" />

          <div className={`
            flex flex-col min-h-full bg-base-100 border-r border-base-200 text-base-content
            transition-all duration-200
            w-64 p-4
            ${collapsed ? "lg:w-16 lg:p-2" : "lg:w-64 lg:p-4"}
          `}>

            {/* Cabeçalho */}
            <div className={`flex items-center mb-6 ${collapsed ? "lg:justify-center" : "justify-between"}`}>
              {!collapsed && (
                <span className="text-lg font-bold truncate">Portal do Aluno</span>
              )}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="btn btn-ghost btn-sm btn-square hidden lg:flex shrink-0"
                title={collapsed ? "Expandir" : "Recolher"}
              >
                {collapsed
                  ? <FaChevronRight className="w-3 h-3" />
                  : <FaChevronLeft className="w-3 h-3" />}
              </button>
            </div>

            {/* Perfil */}
            <div className={`flex items-center gap-3 mb-6 ${collapsed ? "lg:justify-center" : ""}`}>
              <div
                className="bg-primary text-primary-content rounded-full w-9 h-9 shrink-0 flex items-center justify-center font-bold"
                title={user?.name || ''}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className={`overflow-hidden transition-all duration-200 ${collapsed ? "lg:hidden" : ""}`}>
                <div className="font-medium truncate">{user?.name || 'Carregando...'}</div>
                <div className="text-xs opacity-50 truncate">{user?.email || ''}</div>
              </div>
            </div>

            {/* Navegação */}
            <ul className="space-y-1 flex-grow">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.link}
                    title={collapsed ? item.label : undefined}
                    className={`
                      flex items-center gap-3 p-2 rounded-lg hover:bg-base-300 transition-colors
                      ${collapsed ? "lg:justify-center" : ""}
                      ${isActive(item.link, item.exact) ? "bg-primary/10 text-primary font-semibold" : ""}
                    `}
                  >
                    <span className="text-lg shrink-0">{item.icon}</span>
                    <span className={`text-base transition-all duration-200 ${collapsed ? "lg:hidden" : ""}`}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Rodapé — somente ícones */}
            <div className={`mt-6 pt-4 border-t border-base-300 flex items-center gap-1 ${collapsed ? "lg:flex-col lg:gap-2" : "justify-between"}`}>
              <button
                onClick={() => router.push('/logout')}
                className="btn btn-ghost btn-sm btn-square text-error"
                title="Sair"
              >
                <FaSignOutAlt className="w-4 h-4" />
              </button>
              <NotificationBell />
              <ThemeToggle />
              <button
                onClick={() => router.push('/dashboard/profile')}
                className="btn btn-ghost btn-sm btn-square"
                title="Perfil"
              >
                <FaUser className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
