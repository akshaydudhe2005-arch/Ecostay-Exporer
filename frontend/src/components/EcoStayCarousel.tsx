'use client';

import { useRef, useState, useEffect } from 'react';
import { EcoStayCard } from './EcoStayCard';

interface CarouselProps {
  stays: any[];
}

export function EcoStayCarousel({ stays }: CarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [initialScrollLeft, setInitialScrollLeft] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-scroll loop tracker
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let animationFrameId: number;

    const performAutoScroll = () => {
      if (!isHovered && !isDragging) {
        container.scrollLeft += 1;

        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(performAutoScroll);
    };

    animationFrameId = requestAnimationFrame(performAutoScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, isDragging]);

  // Drag Gesture Physics
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setInitialScrollLeft(container.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const container = scrollContainerRef.current;
    if (!container) return;
    const currentX = e.pageX - container.offsetLeft;
    const scrollDistanceWalked = (currentX - startX) * 1.5;
    container.scrollLeft = initialScrollLeft - scrollDistanceWalked;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Button Click Jumps
  const triggerManualNavigation = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const cardStepOffset = 392; // 360px rigid card width + 32px track gap (space-x-8)
    
    container.scrollTo({
      left: container.scrollLeft + (direction === 'left' ? -cardStepOffset : cardStepOffset),
      behavior: 'smooth',
    });
  };

  return (
    <div 
      className="group relative w-full overflow-hidden bg-gray-50/50 py-6 dark:bg-gray-900/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handleMouseUpOrLeave();
      }}
    >
      {/* Blurred Layout Gradients */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white dark:from-neutral-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white dark:from-neutral-950 to-transparent" />

      {/* Navigation Arrow Left */}
      <button 
        onClick={() => triggerManualNavigation('left')}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/95 p-3 rounded-full shadow-md text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:bg-neutral-900/95 dark:text-emerald-400 hidden md:flex items-center justify-center border border-gray-100 dark:border-neutral-800 hover:scale-105 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      
      {/* Navigation Arrow Right */}
      <button 
        onClick={() => triggerManualNavigation('right')}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/95 p-3 rounded-full shadow-md text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:bg-neutral-900/95 dark:text-emerald-400 hidden md:flex items-center justify-center border border-gray-100 dark:border-neutral-800 hover:scale-105 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Main Viewport Container */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        className={`flex w-full overflow-x-auto scrollbar-none px-12 select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Rigid inner row wrapper prevents items from compressing down below 360px */}
        <div className="flex space-x-8 py-2">
          {stays.map((stay: any, idx) => (
            <div key={`${stay.id || stay._id}-${idx}`} className="w-[360px] min-w-[360px] shrink-0">
              <EcoStayCard stay={stay} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}