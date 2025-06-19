import { useEffect } from 'react';
import { HEART_DURATION, CIRCLE_DURATION, THUMBSUP_DURATION } from '../../constants';

interface AnimationCleanupProps {
  hearts: any[];
  circles: any[];
  emotes: any[];
  setHearts: React.Dispatch<React.SetStateAction<any[]>>;
  setCircles: React.Dispatch<React.SetStateAction<any[]>>;
  setEmotes: React.Dispatch<React.SetStateAction<any[]>>;
}

export const useAnimationCleanup = ({
  setHearts,
  setCircles,
  setEmotes
}: AnimationCleanupProps) => {
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setHearts((prev) => prev.filter((heart) => now - heart.timestamp < HEART_DURATION));
      setCircles((prev) => prev.filter((circle) => now - circle.timestamp < CIRCLE_DURATION));
      setEmotes((prev) => prev.filter((emoji) => now - emoji.timestamp < THUMBSUP_DURATION));
    }, 16);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const now = Date.now();
        setHearts((prev) => prev.filter((heart) => now - heart.timestamp < HEART_DURATION));
        setCircles((prev) => prev.filter((circle) => now - circle.timestamp < CIRCLE_DURATION));
        setEmotes((prev) => prev.filter((emoji) => now - emoji.timestamp < THUMBSUP_DURATION));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [setHearts, setCircles, setEmotes]);
}; 