import React from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';

interface SwipeCardProps {
  id: string;
  employerId: string;
  title: string;
  company: string;
  requirements: string;
  tags: string[];
  onSwipe: (direction: 'like' | 'pass') => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  id,
  employerId,
  title,
  company,
  requirements,
  tags,
  onSwipe,
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Map card translation to rotation and opacity to simulate realistic physics
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);

  const controls = useAnimation();

  const handleDragEnd = async (event: any, info: any) => {
    const swipeThreshold = 120;
    if (info.offset.x > swipeThreshold) {
      // Swiped Right -> Like
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.2 } });
      onSwipe('like');
    } else if (info.offset.x < -swipeThreshold) {
      // Swiped Left -> Pass
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.2 } });
      onSwipe('pass');
    } else {
      // Snap back to center
      controls.start({ x: 0, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  return (
    <div className="relative w-full max-w-sm h-[420px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none">
      <motion.div
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.6}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x, y, rotate, opacity }}
        className="w-full h-full bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-2xl flex flex-col justify-between overflow-hidden relative"
      >
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-fuchsia-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20 px-2.5 py-1 rounded-full">
                Active Deck
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                15 ECTS Compatible
              </span>
            </div>

            <div className="pt-3">
              <h3 className="text-2xl font-black text-slate-100 leading-tight truncate">
                {title}
              </h3>
              <p className="text-sm font-bold text-slate-400 mt-1 flex items-center gap-1.5">
                <i className="fa-solid fa-building text-indigo-400" /> {company}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="flex-grow py-4 overflow-y-auto pr-1">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
              Role Requirements & Mission
            </h5>
            <p className="text-xs text-slate-300 font-semibold leading-relaxed">
              {requirements}
            </p>
          </div>

          {/* Footer tags */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5 pt-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-slate-950 border border-slate-800 text-[10px] px-2.5 py-1 rounded-lg text-slate-400 font-extrabold tracking-wide"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Hint overlay */}
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest border-t border-slate-800/80 pt-3.5">
              <span>← Swipe Pass</span>
              <span>Swipe Like →</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
