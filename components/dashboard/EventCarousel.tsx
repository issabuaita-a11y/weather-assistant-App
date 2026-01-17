import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { EnrichedEvent } from '../../hooks/useWeatherForEvents';
import { EventWeatherCard } from './EventWeatherCard';

interface EventCarouselProps {
  events: EnrichedEvent[];
}

export const EventCarousel: React.FC<EventCarouselProps> = ({ events }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50; // Minimum distance to trigger swipe
    
    if (info.offset.x > swipeThreshold && currentIndex > 0) {
      // Swipe right - go to previous
      setCurrentIndex(currentIndex - 1);
    } else if (info.offset.x < -swipeThreshold && currentIndex < events.length - 1) {
      // Swipe left - go to next
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (events.length === 0) return null;

  return (
    <div className="relative w-full h-full flex flex-col min-h-0">
      {/* Carousel Container - Full screen swipeable area */}
      <div className="flex-1 relative overflow-hidden min-h-0 flex items-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="w-full px-8"
            style={{ touchAction: 'pan-x' }}
          >
            <EventWeatherCard event={events[currentIndex]} index={currentIndex} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots Indicator - Moved to bottom, above navigation bar */}
      <div className="flex justify-center gap-2 pb-2 pt-1 shrink-0">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-200 ${
              index === currentIndex
                ? 'w-2 h-2 rounded-full bg-black'
                : 'w-2 h-2 rounded-full bg-black/30'
            }`}
            aria-label={`Go to event ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
