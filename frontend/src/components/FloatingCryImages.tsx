'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { milestoneMessages, getRandomFiller } from '@/lib/clickMessages';

const allCryImages = [
  '/cry1.png', '/cry2.png', '/cry3.png', '/cry4.png', '/cry5.png',
  '/cry7.png', '/cry8.png', '/cry9.png', '/cry10.png', '/cry11.png',
  '/cry12.png', '/cry13.png', '/cry14.png', '/cry15.png', '/cry16.png',
  '/cry26.png', '/cry27.png', '/cry28.png', '/cry29.png', '/cry30.png', '/cry31.png',
  '/cry32.png', '/cry33.png', '/cry34.png', '/cry35.png', '/cry36.png', '/cry37.png', '/cry38.png', '/cry39.png',
  '/cry40.png', '/cry41.png', '/cry42.png',
];

interface FloatingImage {
  id: number;
  src: string;
  size: number;
  top: string;
  left: string;
  delay: string;
  duration: string;
  rotation: number;
}

interface Explosion {
  id: number;
  x: number;
  y: number;
  src: string;
}

function randomImage(): string {
  return allCryImages[Math.floor(Math.random() * allCryImages.length)];
}

const sizeMultipliers = [1, 1, 1, 1, 2, 2, 3];

function spawnImage(id: number, mobile = false): FloatingImage {
  const baseSize = mobile ? 25 + Math.floor(Math.random() * 15) : 70 + Math.floor(Math.random() * 50);
  const multiplier = mobile
    ? 1
    : sizeMultipliers[Math.floor(Math.random() * sizeMultipliers.length)];
  return {
    id,
    src: randomImage(),
    size: Math.round(baseSize * multiplier),
    top: `${5 + Math.random() * 85}%`,
    left: `${5 + Math.random() * 85}%`,
    delay: '0s',
    duration: `${5 + Math.random() * 5}s`,
    rotation: Math.floor(Math.random() * 30) - 15,
  };
}

function generateImages(count: number, mobile = false): FloatingImage[] {
  return Array.from({ length: count }, (_, i) => spawnImage(i, mobile));
}

// Messages imported from @/lib/clickMessages

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return mobile;
}

export default function FloatingCryImages({ count = 8 }: { count?: number }) {
  const isMobile = useIsMobile();
  const effectiveCount = isMobile ? Math.ceil(count / 2) : count;
  const [images, setImages] = useState<FloatingImage[]>(() => generateImages(effectiveCount));
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [nukePrompt, setNukePrompt] = useState(false);
  const [nuking, setNuking] = useState(false);
  const nextId = useRef(effectiveCount);
  const clickCount = useRef(0);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileRef = useRef(isMobile);
  mobileRef.current = isMobile;

  useEffect(() => {
    const handler = () => setHidden(h => !h);
    window.addEventListener('toggleFloatingImages', handler);
    return () => window.removeEventListener('toggleFloatingImages', handler);
  }, []);

  const showToast = useCallback((msg: string) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast(msg);
    toastTimeout.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent, clickedId: number, src: string) => {
    if (won) return;
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const explosionId = Date.now() + Math.random();
    setExplosions(prev => [...prev, { id: explosionId, x, y, src }]);
    setTimeout(() => {
      setExplosions(prev => prev.filter(ex => ex.id !== explosionId));
    }, 800);

    clickCount.current++;
    const clicks = clickCount.current;

    // Mobile nuke prompt at 15 clicks
    if (mobileRef.current && clicks === 15) {
      setNukePrompt(true);
      return;
    }

    if (milestoneMessages[clicks]) {
      showToast(milestoneMessages[clicks]);
    } else if (clicks % 10 === 0) {
      showToast(getRandomFiller());
    }

    if (clicks >= 500) {
      setWon(true);
      setTimeout(() => setWon(false), 3000);
      setImages([]);
      return;
    }

    const isDoubleClick = clicks % 2 === 0;
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== clickedId);
      const spawnCount = isDoubleClick ? 3 : 1;
      const newImages = Array.from({ length: spawnCount }, () => spawnImage(nextId.current++, mobileRef.current));
      return [...filtered, ...newImages];
    });
  }, [won, showToast]);

  const handleNuke = useCallback(() => {
    setNukePrompt(false);
    setNuking(true);
    // Create explosions for all current images
    const nukeExplosions: Explosion[] = images.map(img => ({
      id: Date.now() + Math.random() + img.id,
      x: (parseFloat(img.left) / 100) * (typeof window !== 'undefined' ? window.innerWidth : 400),
      y: (parseFloat(img.top) / 100) * (typeof window !== 'undefined' ? window.innerHeight : 800),
      src: img.src,
    }));
    setExplosions(prev => [...prev, ...nukeExplosions]);
    setTimeout(() => {
      setImages([]);
      setExplosions([]);
      setNuking(false);
      setWon(true);
      setTimeout(() => setWon(false), 3000);
    }, 1200);
  }, [images]);

  if (hidden) return null;

  if (nukePrompt) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
        <div className="mx-6 p-8 rounded-2xl bg-[#0a0a0a] border-2 border-red-500/40 shadow-[0_0_80px_rgba(239,68,68,0.3)] text-center max-w-sm">
          <div className="text-5xl mb-4">💣</div>
          <h3 className="text-2xl font-black text-red-400 mb-2">NUKE THEM ALL?</h3>
          <p className="text-gray-400 text-sm mb-6">Destroy every last wojak on this page?</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleNuke}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-sm hover:from-red-400 hover:to-red-500 transition-all hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:scale-105"
            >
              NUKE 💥
            </button>
            <button
              onClick={() => setNukePrompt(false)}
              className="px-6 py-3 rounded-xl border border-gray-700 text-gray-400 font-bold text-sm hover:border-gray-500 hover:text-gray-300 transition-all"
            >
              Nah, keep clicking
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (nuking) {
    return (
      <>
        {/* Flash overlay */}
        <div className="fixed inset-0 z-[9998] bg-white pointer-events-none" style={{ animation: 'nukeFlash 1.2s ease-out forwards' }} />
        {/* Explosions */}
        {explosions.map((ex) => (
          <div
            key={ex.id}
            className="fixed z-[9999] pointer-events-none"
            style={{ left: ex.x, top: ex.y, transform: 'translate(-50%, -50%)' }}
          >
            <div
              className="absolute rounded-full bg-red-500/80"
              style={{ width: 40, height: 40, left: -20, top: -20, animation: 'explosionFlash 0.8s ease-out forwards' }}
            />
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i / 6) * 360;
              const dist = 60 + Math.random() * 80;
              return (
                <img
                  key={i}
                  src={ex.src}
                  alt=""
                  className="absolute"
                  style={{
                    width: 15 + Math.random() * 15,
                    height: 15 + Math.random() * 15,
                    objectFit: 'contain',
                    left: 0, top: 0,
                    opacity: 0.8,
                    transform: `rotate(${Math.random() * 360}deg)`,
                    animation: 'explosionShard 0.8s ease-out forwards',
                    '--shard-x': `${Math.cos(angle * Math.PI / 180) * dist}px`,
                    '--shard-y': `${Math.sin(angle * Math.PI / 180) * dist}px`,
                    '--shard-rot': `${Math.random() * 720 - 360}deg`,
                  } as React.CSSProperties}
                />
              );
            })}
          </div>
        ))}
      </>
    );
  }

  if (won) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
        <div className="text-center" style={{ animation: 'fadeSlideIn 0.5s ease-out' }}>
          <div className="text-6xl md:text-8xl font-black text-gold-400 mb-4" style={{ textShadow: '0 0 40px rgba(251,191,36,0.5)' }}>
            YOU WON
          </div>
          <p className="text-gray-400 text-lg">All wojaks have been eliminated. You are the true Diamond Hand.</p>
          <p className="text-gray-600 text-sm mt-2">(...refresh to bring them back)</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast messages */}
      {toast && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none" style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
          <div className="px-10 py-6 rounded-2xl bg-black/95 border-2 border-gold-400/40 shadow-[0_0_60px_rgba(251,191,36,0.2)]">
            <p className="text-gold-400 font-black text-2xl md:text-4xl text-center">{toast}</p>
          </div>
        </div>
      )}

      <div className="fixed inset-0 z-[50] overflow-hidden pointer-events-none">
        {images.map((cry) => (
          <img
            key={cry.id}
            src={cry.src}
            alt=""
            onClick={(e) => handleClick(e, cry.id, cry.src)}
            onDragStart={(e) => e.preventDefault()}
            draggable={false}
            className="absolute opacity-20 hover:opacity-40 cursor-pointer transition-opacity duration-200 pointer-events-auto select-none"
            style={{
              width: cry.size,
              height: cry.size,
              objectFit: 'contain',
              top: cry.top,
              left: cry.left,
              transform: `rotate(${cry.rotation}deg)`,
              animation: `cryFloat ${cry.duration} ease-in-out ${cry.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* Explosion overlays */}
      {explosions.map((ex) => (
        <div
          key={ex.id}
          className="fixed z-[9999] pointer-events-none"
          style={{ left: ex.x, top: ex.y, transform: 'translate(-50%, -50%)' }}
        >
          <div
            className="absolute rounded-full bg-gold-400/60"
            style={{ width: 20, height: 20, left: -10, top: -10, animation: 'explosionFlash 0.6s ease-out forwards' }}
          />
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * 360;
            const dist = 80 + Math.random() * 120;
            return (
              <img
                key={i}
                src={ex.src}
                alt=""
                className="absolute"
                style={{
                  width: 20 + Math.random() * 20,
                  height: 20 + Math.random() * 20,
                  objectFit: 'contain',
                  left: 0, top: 0,
                  opacity: 0.8,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animation: 'explosionShard 0.7s ease-out forwards',
                  '--shard-x': `${Math.cos(angle * Math.PI / 180) * dist}px`,
                  '--shard-y': `${Math.sin(angle * Math.PI / 180) * dist}px`,
                  '--shard-rot': `${Math.random() * 720 - 360}deg`,
                } as React.CSSProperties}
              />
            );
          })}
          <div
            className="absolute border-2 border-gold-400/50 rounded-full"
            style={{ width: 20, height: 20, left: -10, top: -10, animation: 'explosionRing 0.6s ease-out forwards' }}
          />
        </div>
      ))}
    </>
  );
}