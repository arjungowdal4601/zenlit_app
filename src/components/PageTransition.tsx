'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export default function PageTransition({ 
  children, 
  className = '', 
  direction = 'right' 
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset state when pathname changes
    setIsVisible(false);
    
    // Trigger entrance animation with staggered timing for smoother effect
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Get transform values based on direction
  const getTransformValues = () => {
    const distance = '100%';
    switch (direction) {
      case 'left':
        return {
          enter: `translateX(-${distance})`,
          visible: 'translateX(0)',
          exit: `translateX(${distance})`
        };
      case 'right':
        return {
          enter: `translateX(${distance})`,
          visible: 'translateX(0)',
          exit: `translateX(-${distance})`
        };
      case 'up':
        return {
          enter: `translateY(-${distance})`,
          visible: 'translateY(0)',
          exit: `translateY(${distance})`
        };
      case 'down':
        return {
          enter: `translateY(${distance})`,
          visible: 'translateY(0)',
          exit: `translateY(-${distance})`
        };
      default:
        return {
          enter: `translateX(${distance})`,
          visible: 'translateX(0)',
          exit: `translateX(-${distance})`
        };
    }
  };

  const transforms = getTransformValues();

  return (
    <div 
      ref={containerRef}
      className={`page-transition w-full h-full transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${className}`}
      data-page-transition
      role="main"
      aria-busy={!isVisible}
      aria-live="polite"
      style={{
        transform: isVisible ? transforms.visible : transforms.enter,
        opacity: isVisible ? 1 : 0,
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
        perspective: '1000px',
      }}
    >
      <div 
        className="w-full h-full"
        style={{
          transform: `scale(${isVisible ? 1 : 0.98})`,
          transition: 'transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)',
          transformOrigin: 'center center',
        }}
      >
        {children}
      </div>
      
      {/* Screen reader announcement for page transitions */}
      <div className="sr-only" aria-live="assertive">
        {isVisible ? 'Page loaded' : 'Loading page...'}
      </div>
    </div>
  );
}

// Enhanced hook for programmatic navigation with smooth swipe animations
export function useAnimatedRouter() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | 'down'>('left');

  const animatedPush = (href: string, options?: { 
    direction?: 'left' | 'right' | 'up' | 'down';
    duration?: number;
  }) => {
    const { direction = 'left', duration = 350 } = options || {};
    
    setIsNavigating(true);
    setExitDirection(direction);
    
    // Create a smooth exit animation
    const exitElement = document.querySelector('[data-page-transition]');
    if (exitElement) {
      (exitElement as HTMLElement).style.transform = 
        direction === 'left' ? 'translateX(-100%)' : 
        direction === 'right' ? 'translateX(100%)' :
        direction === 'up' ? 'translateY(-100%)' : 'translateY(100%)';
      (exitElement as HTMLElement).style.opacity = '0';
      (exitElement as HTMLElement).style.transition = `all ${duration}ms cubic-bezier(0.25,0.46,0.45,0.94)`;
    }
    
    // Add body class for global exit state
    document.body.classList.add('page-transitioning');
    document.body.style.setProperty('--page-exit-direction', direction);
    
    setTimeout(() => {
      router.push(href);
      setIsNavigating(false);
      document.body.classList.remove('page-transitioning');
      document.body.style.removeProperty('--page-exit-direction');
    }, duration);
  };

  const animatedReplace = (href: string, options?: { 
    direction?: 'left' | 'right' | 'up' | 'down';
    duration?: number;
  }) => {
    const { direction = 'left', duration = 350 } = options || {};
    
    setIsNavigating(true);
    setExitDirection(direction);
    
    setTimeout(() => {
      router.replace(href);
      setIsNavigating(false);
    }, duration);
  };

  return { 
    animatedPush, 
    animatedReplace, 
    isNavigating, 
    exitDirection 
  };
}

