import React, { useState, useRef, useEffect } from 'react';
import { EnrichedEvent } from '../../hooks/useWeatherForEvents';
import { EventWeatherCard } from './EventWeatherCard';

interface EventCarouselProps {
  events: EnrichedEvent[];
}

export const EventCarousel: React.FC<EventCarouselProps> = ({ events }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Measure container width for proper card sizing
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateWidth = () => {
      setContainerWidth(container.clientWidth);
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Update current index based on scroll position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || events.length === 0) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.clientWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(newIndex);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [events.length]);

  // Convert vertical mouse wheel scrolling to horizontal scrolling
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Only handle if vertical scrolling is dominant
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
      // If horizontal scrolling, let browser handle it naturally
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Scroll to specific card when dot is clicked
  const scrollToIndex = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const cardWidth = container.clientWidth;
    container.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });
  };

  if (events.length === 0) return null;

  return (
    <div className="relative w-full h-full flex flex-col min-h-0">
      {/* Native Scroll Container - Full size, covers entire area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x pan-y',
          scrollSnapType: 'x mandatory',
        }}
      >
        <div className="flex h-full flex-nowrap">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="flex-shrink-0 px-8 pb-6"
              style={{ 
                width: containerWidth > 0 ? `${containerWidth}px` : '100%',
                minWidth: containerWidth > 0 ? `${containerWidth}px` : '100%',
                touchAction: 'pan-x pan-y',
                scrollSnapAlign: 'start',
              }}
            >
              <EventWeatherCard event={event} index={index} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator - Fixed at bottom, above navigation bar, closer to card */}
      {events.length > 1 && (
        <div className="fixed bottom-[130px] left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="flex gap-2 pointer-events-auto bg-white/90 backdrop-blur-md px-3 py-2 rounded-full shadow-lg border border-black/10">
            {events.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`transition-all duration-200 ${
                  index === currentIndex
                    ? 'w-2.5 h-2.5 rounded-full bg-black shadow-sm'
                    : 'w-2.5 h-2.5 rounded-full bg-black/40 border border-black/20'
                }`}
                aria-label={`Go to event ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
