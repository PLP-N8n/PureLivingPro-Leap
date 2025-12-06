"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MotionContextProps {
  isReducedMotion: boolean;
}

const MotionContext = createContext<MotionContextProps>({
  isReducedMotion: false,
});

export const useMotion = () => useContext(MotionContext);

const getInitialState = () => {
  if (typeof window === 'undefined') {
    return false; // Default to animations enabled on the server
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export function MotionProvider({ children }: { children: ReactNode }) {
  const [isReducedMotion, setIsReducedMotion] = useState(getInitialState());

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = () => {
      setIsReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <MotionContext.Provider value={{ isReducedMotion }}>
      {children}
    </MotionContext.Provider>
  );
}
