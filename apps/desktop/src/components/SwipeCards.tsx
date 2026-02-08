import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { Card } from '@dating-app/ui';

interface Profile {
  id: number;
  name: string;
  age: number;
  bio: string;
  image: string;
}

const dummyProfiles: Profile[] = [
  { id: 1, name: 'Alice', age: 25, bio: 'Love hiking and travel', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop' },
  { id: 2, name: 'Bob', age: 28, bio: 'Coffee enthusiast and coder', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop' },
  { id: 3, name: 'Charlie', age: 24, bio: 'Music lover and guitarist', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop' },
];

export const SwipeCards: React.FC = () => {
  const [profiles, setProfiles] = useState(dummyProfiles);
  const [exitX, setExitX] = useState<number>(0);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      setExitX(200);
      swipe('right');
    } else if (info.offset.x < -100) {
      setExitX(-200);
      swipe('left');
    }
  };

  const swipe = (direction: 'left' | 'right') => {
    console.log(`Swiped ${direction}`);
    setProfiles((prev) => prev.slice(1));
  };

  return (
    <div className="relative w-full max-w-sm h-[500px] flex items-center justify-center">
      <AnimatePresence>
        {profiles.length > 0 ? (
          <motion.div
            key={profiles[0].id}
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            exit={{ x: exitX, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute w-full h-full cursor-grab active:cursor-grabbing"
          >
            <Card className="w-full h-full overflow-hidden p-0 relative border-none">
              <img src={profiles[0].image} alt={profiles[0].name} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                <h2 className="text-2xl font-bold">{profiles[0].name}, {profiles[0].age}</h2>
                <p className="text-sm opacity-90">{profiles[0].bio}</p>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold">No more profiles!</h2>
            <button 
              onClick={() => setProfiles(dummyProfiles)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Reset
            </button>
          </div>
        )}
      </AnimatePresence>

      {profiles.length > 0 && (
        <div className="absolute -bottom-16 flex gap-8">
          <button 
            onClick={() => { setExitX(-200); swipe('left'); }}
            className="p-4 rounded-full bg-white shadow-lg text-red-500 hover:scale-110 transition-transform"
          >
            <X size={32} />
          </button>
          <button 
            onClick={() => { setExitX(200); swipe('right'); }}
            className="p-4 rounded-full bg-white shadow-lg text-green-500 hover:scale-110 transition-transform"
          >
            <Heart size={32} />
          </button>
        </div>
      )}
    </div>
  );
};
