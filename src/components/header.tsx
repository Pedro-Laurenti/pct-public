"use client";

import { useEffect, useState } from 'react';
import { FaSignInAlt, FaWhatsapp } from 'react-icons/fa';
import Logo from './logo';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 50);
        };
        
        // Add scroll event listener
        window.addEventListener('scroll', handleScroll);
        
        // Fade in header after a small delay
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 100);
        
        // Clean up
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timer);
        };
    }, []);
    
    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled 
            ? 'bg-base-100/95 backdrop-blur-sm shadow-md py-2' 
            : 'bg-transparent py-4 shadow-none'
        } ${
            isVisible ? 'opacity-100' : 'opacity-0'
        }`}>
            <div className="container px-4 mx-auto">
                <div className="flex items-center justify-between">
                    {/* Logo section */}
                    <div className={`transition-all duration-300 ${isScrolled ? 'scale-75' : 'scale-100'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`transition-all duration-300 ${isScrolled ? 'w-8 h-8' : 'w-12 h-12'}`}>
                                <Logo className="w-full h-full" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Simple Navigation */}
                    <div className="flex items-center gap-6">
                        <a
                            href="/login"
                            className="transition-colors btn btn-circle btn-ghost hover:text-primary"
                            aria-label="Login"
                            title="Login"
                        >
                            <FaSignInAlt aria-hidden="true" />
                        </a>
                        <a
                            href="https://wa.me/5562821377"
                            className="btn btn-primary btn-circle"
                            aria-label="Contato"
                            title="Contato"
                        >
                            <FaWhatsapp aria-hidden="true" />
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
}
