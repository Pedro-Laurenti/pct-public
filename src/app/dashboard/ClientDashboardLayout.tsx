"use client";

import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaGraduationCap, FaHome, FaSignOutAlt, FaTasks, FaUser, } from 'react-icons/fa';
import ThemeToggle from '@/components/ThemeToggle';
import { BiMenu } from 'react-icons/bi';
import { FaGear } from 'react-icons/fa6';
import { useRouter } from 'next/navigation'; // Change from next/router to next/navigation for App Router

interface User {
  id: number;
  name: string;
  email: string;
}

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter(); // Initialize router at the top level
  
  useEffect(() => {
    // Buscar informações básicas do usuário para o layout
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/dashboard');
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
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { icon: <FaHome />, label: "Início", link: "/dashboard" },
    { icon: <FaCalendarAlt />, label: "Agenda", link: "/dashboard/reunions" },
    { icon: <FaTasks />, label: "Minhas Aulas", link: "/dashboard/lessons" },    
  ];
  
  return (
    <div className="drawer lg:drawer-open">
      <input 
        id="drawer-toggle" 
        type="checkbox" 
        className="drawer-toggle" 
        checked={isMenuOpen}
        onChange={toggleMenu}
      />
      
      <div className="drawer-content flex flex-col">
        {/* Navbar */}        <div className="navbar bg-base-100 shadow-md lg:hidden">
          <div className="flex-none">
            <label htmlFor="drawer-toggle" className="btn btn-square btn-ghost drawer-button p-3">
              <BiMenu className="w-7 h-7" />
            </label>
          </div>        <div className="flex-1">
            <a className="btn btn-ghost text-xl px-3">Portal do Aluno</a>
          </div>
          <div className="flex-none flex items-center gap-1"><ThemeToggle />
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle bg-primary text-primary-content rounded-full w-12 h-12 text-lg ml-2">
                  <span>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
              </div>
              <ul tabIndex={0} className="menu dropdown-content mt-3 z-[1] p-3 shadow bg-base-100 rounded-box w-64">
                <li className="my-1"><a href="/dashboard/profile" className="py-3 text-base flex items-center"><FaUser className="mr-2" /> Perfil</a></li>
                <li className="my-1"><a href="/logout" className="py-3 text-base flex items-center"><FaSignOutAlt className="mr-2" /> Sair</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Conteúdo principal */}
        <div>
          {children}
        </div>
      </div>
      
      {/* Sidebar */}
      <div className="drawer-side z-10">
        <label htmlFor="drawer-toggle" aria-label="close sidebar" className="drawer-overlay"></label>
        
        <div className="menu p-4 w-72 min-h-full bg-base-100 border-r border-base-200 text-base-content flex flex-col">
          {/* Logo e título */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold">Portal do Aluno</div>
            </div>
          </div>
          
          {/* Perfil do usuário */}
          <div className="flex items-center gap-2 p-2 mb-6">
            <div className="bg-primary text-primary-content rounded-full w-10 aspect-square flex items-center justify-center font-bold text-xl">
              <span>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
            <div>
              <div className="font-medium">{user?.name || 'Carregando...'}</div>
              <div className="text-sm opacity-50">{user?.email || ''}</div>
            </div>
          </div>
          
          {/* Links de navegação */}
          <ul className="space-y-1 flex-grow">
            {menuItems.map((item, index) => (
              <li key={index}>
                <a
                  href={item.link}
                  className="flex items-center p-2 rounded-lg hover:bg-base-300 textarea-lg"
                >
                  {item.icon}
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
            {/* Rodapé - botão de logout */}
          <div className="mt-6 pt-6 border-t border-base-300 flex justify-between">
              <button onClick={() => router.push('/logout')} className="btn btn-lg btn-ghost text-error flex gap-2 flex-1 justify-start">
                <FaSignOutAlt className="w-5 h-5" /> <span>Sair</span>
              </button>
              <ThemeToggle />
              <button onClick={() => router.push('/dashboard/profile')} className="btn btn-lg btn-ghost flex gap-2 flex-1 justify-end">
                <FaUser className="w-5 h-5" /> <span>Perfil</span>
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}