import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { Card } from '@dating-app/ui';
import { api, Profile } from '../api';

export const SwipeCards: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [exitX, setExitX] = useState<number>(0);
  const [showMatch, setShowMatch] = useState<Profile | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const data = await api.getDiscovery();
      setProfiles(data);
    } catch (err) {
      console.error('Failed to fetch profiles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      setExitX(400);
      swipe('right');
    } else if (info.offset.x < -100) {
      setExitX(-400);
      swipe('left');
    }
  };

  const swipe = async (direction: 'left' | 'right') => {
    const swipedProfile = profiles[0];
    if (!swipedProfile) return;

    setProfiles((prev) => prev.slice(1));
    
    try {
      const { isMatch } = await api.swipe(swipedProfile.userId, direction);
      if (isMatch) {
        setShowMatch(swipedProfile);
      }
    } catch (err) {
      console.error('Swipe failed', err);
    }
  };

  if (loading) return <div>Loading candidates...</div>;

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
            <Card className="w-full h-full overflow-hidden p-0 relative border-none shadow-2xl">
              <img src={profiles[0].imageUrl} alt={profiles[0].name} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                <h2 className="text-2xl font-bold">{profiles[0].name}, {profiles[0].age}</h2>
                <p className="text-sm opacity-90">{profiles[0].bio}</p>
                {profiles[0].interests && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(profiles[0].interests as unknown as string[]).map(interest => (
                      <span key={interest} className="text-xs bg-white/20 px-2 py-1 rounded-full">{interest}</span>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold">No more profiles!</h2>
            <button 
              onClick={fetchProfiles}
              className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg shadow-md hover:bg-pink-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        )}
      </AnimatePresence>

      {profiles.length > 0 && (
        <div className="absolute -bottom-20 flex gap-8">
          <button 
            onClick={() => { setExitX(-400); swipe('left'); }}
            className="p-5 rounded-full bg-white shadow-xl text-red-500 hover:scale-110 active:scale-95 transition-transform"
          >
            <X size={32} strokeWidth={3} />
          </button>
          <button 
            onClick={() => { setExitX(400); swipe('right'); }}
            className="p-5 rounded-full bg-white shadow-xl text-green-500 hover:scale-110 active:scale-95 transition-transform"
          >
            <Heart size={32} strokeWidth={3} />
          </button>
        </div>
      )}

      {/* Match Modal */}
      <AnimatePresence>
        {showMatch && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          >
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
              <h2 className="text-4xl font-black text-pink-600 mb-2">MATCH!</h2>
              <p className="text-gray-600 mb-6">You and {showMatch.name} liked each other.</p>
              <div className="relative w-32 h-32 mx-auto mb-8">
                 <img src={showMatch.imageUrl} className="w-full h-full rounded-full object-cover border-4 border-pink-500 shadow-xl" />
                 <div className="absolute -bottom-2 -right-2 bg-pink-500 text-white p-2 rounded-full">
                    <Heart fill="currentColor" size={24} />
                 </div>
              </div>
              <button 
                onClick={() => setShowMatch(null)}
                className="w-full py-3 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition-colors"
              >
                Keep Swiping
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
