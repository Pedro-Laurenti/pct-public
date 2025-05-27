'use client';

import { useRef, useEffect, ReactNode, useState } from 'react';

interface FadeInProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  className?: string;
  threshold?: number;
  duration?: number;
}

export default function FadeIn({ 
  children, 
  direction = 'up', 
  delay = 0, 
  className = '',
  threshold = 0.1,
  duration = 1.2 // Aumentado para 1.2s para fazer o efeito mais lento
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            entry.target.classList.remove('opacity-0');
            entry.target.classList.add('opacity-100');
            
            switch(direction) {
              case 'up':
                entry.target.classList.remove('translate-y-16');
                break;
              case 'down':
                entry.target.classList.remove('-translate-y-16');
                break;
              case 'left':
                entry.target.classList.remove('translate-x-16');
                break;
              case 'right':
                entry.target.classList.remove('-translate-x-16');
                break;
            }
            
            // Não remove a observação mais para permitir o reset
          } else {
            // Quando o elemento sai da viewport e o scroll está próximo ao topo
            if (window.scrollY < 50 && isVisible) {
              setIsVisible(false);
              entry.target.classList.remove('opacity-100');
              entry.target.classList.add('opacity-0');
              
              switch(direction) {
                case 'up':
                  entry.target.classList.add('translate-y-16');
                  break;
                case 'down':
                  entry.target.classList.add('-translate-y-16');
                  break;
                case 'left':
                  entry.target.classList.add('translate-x-16');
                  break;
                case 'right':
                  entry.target.classList.add('-translate-x-16');
                  break;
              }
            }
          }
        });
      },
      { threshold, rootMargin: '0px' }
    );

    // Adicionar um listener para o evento de scroll
    const handleScroll = () => {
      if (window.scrollY < 50) {
        const currentRef = ref.current;
        if (currentRef && observer) {
          // Força uma reavaliação quando estiver no topo
          observer.unobserve(currentRef);
          observer.observe(currentRef);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [direction, threshold, isVisible]);

  let initialTransform = '';
  switch(direction) {
    case 'up':
      initialTransform = 'translate-y-16';
      break;
    case 'down':
      initialTransform = '-translate-y-16';
      break;
    case 'left':
      initialTransform = 'translate-x-16';
      break;
    case 'right':
      initialTransform = '-translate-x-16';
      break;
  }
  const style = {
    transitionDelay: `${delay}s`,
    transitionDuration: `${duration}s`
  };

  return (
    <div 
      ref={ref} 
      className={`opacity-0 ${initialTransform} transition-all ease-out will-change-transform ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
