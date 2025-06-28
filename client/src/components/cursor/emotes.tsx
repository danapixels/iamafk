import React, { memo, useEffect, useState } from 'react';
import { HEART_DURATION, CIRCLE_DURATION, THUMBSUP_DURATION, ANIMATION_CONSTANTS, UI_IMAGES } from '../../constants';
import type { Circle, Heart, Emote } from '../../types';

interface AnimationRendererProps {
  visibleCircles: Circle[];
  visibleHearts: Heart[];
  visibleEmotes: Emote[];
}

const AnimationRenderer: React.FC<AnimationRendererProps> = memo(({
  visibleCircles,
  visibleHearts,
  visibleEmotes
}) => {
  // Add a state to force re-render
  const [, setTick] = useState(0);

  useEffect(() => {
    let frame: number;
    let isPageVisible = !document.hidden;

    function loop() {
      // Only run animation loop if page is visible
      if (!isPageVisible) {
        frame = requestAnimationFrame(loop);
        return;
      }

      setTick(tick => tick + 1);
      frame = requestAnimationFrame(loop);
    }

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Only run the loop if there are active animations
    if (
      visibleCircles.length > 0 ||
      visibleHearts.length > 0 ||
      visibleEmotes.length > 0
    ) {
      frame = requestAnimationFrame(loop);
    }
    return () => {
      if (frame) cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [visibleCircles.length, visibleHearts.length, visibleEmotes.length]);

  return (
    <>
      {/* circles */}
      {visibleCircles.map((circle) => {
        const age = Date.now() - circle.timestamp;
        if (age >= CIRCLE_DURATION) return null;

        const progress = age / CIRCLE_DURATION;
        const scale = ANIMATION_CONSTANTS.CIRCLE_SCALE_MIN + progress * (ANIMATION_CONSTANTS.CIRCLE_SCALE_MAX - ANIMATION_CONSTANTS.CIRCLE_SCALE_MIN);
        const size = ANIMATION_CONSTANTS.CIRCLE_BASE_SIZE * scale;
        const opacity = 1 - progress;

        return (
          <img
            key={circle.id}
            src={UI_IMAGES.ECHO}
            alt="Click"
            style={{
              position: 'absolute',
              left: circle.x - size / 2,
              top: circle.y - size / 2,
              width: size,
              height: size,
              opacity,
              pointerEvents: 'none',
              zIndex: 9996,
            }}
          />
        );
      })}

      {/* hearts */}
      {visibleHearts.map((heart) => {
        const age = Date.now() - heart.timestamp;
        if (age >= HEART_DURATION) return null;

        const progress = age / HEART_DURATION;
        const opacity = 1 - progress;
        const rise = (1 - Math.pow(1 - progress, 3)) * ANIMATION_CONSTANTS.HEART_RISE_DISTANCE;

        return (
          <img
            key={heart.id}
            src={UI_IMAGES.SMILE_GIF}
            alt="Heart"
            style={{
              position: 'absolute',
              left: heart.x - 40,
              top: heart.y - 80 - rise,
              width: 48,
              height: 48,
              opacity,
              pointerEvents: 'none',
              zIndex: 9996,
            }}
          />
        );
      })}

      {/* emotes */}
      {visibleEmotes.map((emote) => {
        const age = Date.now() - emote.timestamp;
        if (age >= THUMBSUP_DURATION) return null;

        const progress = age / THUMBSUP_DURATION;
        let opacity;
        if (progress < 0.2) {
          opacity = progress / 0.2;
        } else if (progress < 0.8) {
          opacity = 1;
        } else {
          opacity = 1 - ((progress - 0.8) / 0.2);
        }
        
        const moveLeft = progress * ANIMATION_CONSTANTS.Emote_MOVE_DISTANCE;

        return (
          <img
            key={emote.id}
            src={`/UI/${emote.type}.png`}
            alt={emote.type}
            style={{
              position: 'absolute',
              left: emote.x - moveLeft,
              top: emote.y - 24,
              opacity,
              pointerEvents: 'none',
              zIndex: 9996,
            }}
          />
        );
      })}
    </>
  );
});

export default AnimationRenderer; 