import { useState, useEffect } from 'react';

export const ReadingProgressBar = () => {
  const [width, setWidth] = useState(0);

  const scrollListener = () => {
    const element = document.documentElement;
    const totalHeight = element.scrollHeight - element.clientHeight;
    const windowScroll = window.scrollY;
    
    if (totalHeight > 0) {
      const progress = (windowScroll / totalHeight) * 100;
      setWidth(progress);
    } else {
      setWidth(0);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', scrollListener);
    return () => window.removeEventListener('scroll', scrollListener);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1.5">
      <div
        className="h-full bg-gradient-to-r from-green-400 to-lime-500 transition-all duration-100 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
};
