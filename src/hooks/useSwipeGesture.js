import { useState, useEffect, useRef } from 'react';

export const useSwipeGesture = (onSwipeLeft, onSwipeRight, threshold = 50) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const currentX = useRef(0);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      setIsSwiping(true);
    };

    const handleTouchMove = (e) => {
      if (!isSwiping) return;

      currentX.current = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = currentX.current - touchStartX.current;
      const diffY = currentY - touchStartY.current;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        e.preventDefault();
        setSwipeDistance(diffX);
      }
    };

    const handleTouchEnd = () => {
      const diffX = currentX.current - touchStartX.current;

      if (Math.abs(diffX) > threshold) {
        if (diffX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (diffX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }

      setIsSwiping(false);
      setSwipeDistance(0);
      touchStartX.current = 0;
      touchStartY.current = 0;
      currentX.current = 0;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isSwiping, onSwipeLeft, onSwipeRight, threshold]);

  return {
    elementRef,
    isSwiping,
    swipeDistance,
  };
};