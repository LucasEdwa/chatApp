import { useState, useEffect, useCallback } from 'react';

interface MobileOptimizationOptions {
  enableSwipeToClose?: boolean;
  swipeThreshold?: number;
}

export const useMobileOptimization = (
  isVisible: boolean,
  onToggle: () => void,
  options: MobileOptimizationOptions = {}
) => {
  const { enableSwipeToClose = true, swipeThreshold = 100 } = options;
  const [isMobile, setIsMobile] = useState(false);
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle swipe to close on mobile
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enableSwipeToClose || !isMobile || !isVisible) return;
    setSwipeStartX(e.touches[0].clientX);
  }, [enableSwipeToClose, isMobile, isVisible]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enableSwipeToClose || !isMobile || !isVisible || swipeStartX === null) return;
    
    const currentX = e.touches[0].clientX;
    const diffX = currentX - swipeStartX;
    
    // Prevent scrolling while swiping
    if (diffX > 20) {
      e.preventDefault();
    }
  }, [enableSwipeToClose, isMobile, isVisible, swipeStartX]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enableSwipeToClose || !isMobile || !isVisible || swipeStartX === null) return;
    
    const endX = e.changedTouches[0].clientX;
    const diffX = endX - swipeStartX;
    
    // Swipe right to close (threshold met)
    if (diffX > swipeThreshold) {
      onToggle();
    }
    
    setSwipeStartX(null);
  }, [enableSwipeToClose, isMobile, isVisible, swipeStartX, swipeThreshold, onToggle]);

  // Add touch event listeners
  useEffect(() => {
    if (!enableSwipeToClose || !isMobile) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, enableSwipeToClose, isMobile]);

  // Prevent body scroll when users list is open on mobile
  useEffect(() => {
    if (!isMobile) return;

    if (isVisible) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [isVisible, isMobile]);

  return {
    isMobile,
    swipeProgress: swipeStartX !== null ? Math.max(0, Math.min(1, (swipeStartX || 0) / swipeThreshold)) : 0
  };
};
