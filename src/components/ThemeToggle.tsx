'use client';

import { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState<string>('mylight');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Get the current theme from localStorage or default to 'mylight'
    const savedTheme = localStorage.getItem('theme') || 'mylight';
    setCurrentTheme(savedTheme);
    
    // Import and initialize theme-change
    import('theme-change').then(({ themeChange }) => {
      themeChange(false);
      
      // Make sure the theme is applied on initial load
      document.documentElement.setAttribute('data-theme', savedTheme);
    });
  }, []);

  // Handle manual theme toggle
  const toggleTheme = () => {
    const newTheme = currentTheme === 'mylight' ? 'mydark' : 'mylight';
    setCurrentTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // To avoid hydration mismatch, only show the button after component mounts
  if (!mounted) {
    return <div className="btn btn-square btn-ghost opacity-0" />;
  }

  return (
    <button 
      className="btn btn-square"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <div className="w-full h-full relative flex items-center justify-center">
        {currentTheme === 'mydark' ? (
          <FiSun className="h-5 w-5" />
        ) : (
          <FiMoon className="h-5 w-5" />
        )}
      </div>
    </button>
  );
}