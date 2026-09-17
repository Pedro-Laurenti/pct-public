'use client';

import { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

interface Props {
  size?: 'sm' | 'md';
}

export default function ThemeToggle({ size = 'md' }: Props) {
  const [currentTheme, setCurrentTheme] = useState<string>('mylight');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'mylight';
    setCurrentTheme(savedTheme);
    import('theme-change').then(({ themeChange }) => {
      themeChange(false);
      document.documentElement.setAttribute('data-theme', savedTheme);
    });
  }, []);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'mylight' ? 'mydark' : 'mylight';
    setCurrentTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (!mounted) {
    return <div className={`btn btn-square btn-ghost opacity-0 ${size === 'sm' ? 'btn-sm' : ''}`} />;
  }

  const iconCls = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      className={`btn btn-square btn-ghost ${size === 'sm' ? 'btn-sm' : ''}`}
      onClick={toggleTheme}
      aria-label="Alternar tema"
      title="Alternar tema"
    >
      {currentTheme === 'mydark'
        ? <FiSun className={iconCls} />
        : <FiMoon className={iconCls} />}
    </button>
  );
}
