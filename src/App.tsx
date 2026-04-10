/**
 * @license
 * Julian Vance Studio — Multi-Page Rebuild with New Pill Navbar
 */

import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Instagram, Mail, Twitter } from "lucide-react";
import { Navbar1 } from "./components/ui/navbar-1";

import { InteractiveImageBentoGallery, ImageItem } from "./components/ui/gallery";
import { Play, Pause } from "lucide-react";

// --- HOOKS ---
function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return prefersReduced;
}

const studioTracks = [
  { id: 'CBGuX7yEh2Q', artist: 'AJ Tracey', title: 'Ibiza', label: '01. ENGINEER', start: 45, duration: 25000 },
  { id: 'hCCZawVBx38', artist: 'Rheez.', title: '100£', label: '02. PRODUCER / MIX / MASTER', start: 30, duration: 25000 },
  { id: 'RkYPJN1cM1o', artist: 'Rheez.', title: 'Plenty', label: '03. MASTERING / MIX / ENGINEER', start: 0, duration: 25000 },
];

const landingImages = [
  { url: '/images/landing-1.jpg', position: 'object-[center_20%]', label: 'ATMOSPHERE', title: 'STUDIO 01' },
  { url: '/images/landing-2.jpg', position: 'object-[center_35%]', label: 'EQUIPMENT', title: 'PRE-AMP STACK' },
  { url: '/images/landing-3.jpg', position: 'object-center', label: 'MIXING', title: 'CONSOLE' },
  { url: '/images/landing-7.jpg', position: 'object-center', label: 'CREATIVE', title: 'SESSION' },
];

// Merged gallery for mobile/tablet swiping - Alternating Videos and Photos
const masterGallery = (() => {
  const gallery = [];
  const maxLen = Math.max(studioTracks.length, landingImages.length);
  for (let i = 0; i < maxLen; i++) {
    if (studioTracks[i]) gallery.push({ ...studioTracks[i], type: 'video' as const });
    if (landingImages[i]) gallery.push({ ...landingImages[i], type: 'image' as const });
  }
  return gallery;
})();

const DynamicBackground = ({ trackIndex, bgIndex, masterIndex, isPlaying, isLargeScreen }: { trackIndex: number; bgIndex: number; masterIndex: number, isPlaying: boolean, isLargeScreen: boolean }) => {
  const currentItem = masterGallery[masterIndex];
  const mobileIframeRef = useRef<HTMLIFrameElement>(null);

  // Send commands to the mobile iframe via YouTube postMessage API
  const sendCommand = (iframe: HTMLIFrameElement | null, func: string) => {
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args: [] }),
        '*'
      );
    }
  };

  // When isPlaying changes, play/pause + mute/unmute
  useEffect(() => {
    const iframe = mobileIframeRef.current;
    if (isPlaying) {
      sendCommand(iframe, 'playVideo');
      sendCommand(iframe, 'unMute');
    } else {
      sendCommand(iframe, 'pauseVideo');
      sendCommand(iframe, 'mute');
    }
  }, [isPlaying]);

  // When a NEW iframe loads, wait for YouTube API to init then apply current state
  const handleMobileIframeLoad = () => {
    setTimeout(() => {
      const iframe = mobileIframeRef.current;
      if (isPlaying) {
        sendCommand(iframe, 'playVideo');
        sendCommand(iframe, 'unMute');
      } else {
        sendCommand(iframe, 'pauseVideo');
        sendCommand(iframe, 'mute');
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-0 opacity-100 pointer-events-none overflow-hidden bg-black" aria-hidden="true">
      {/* PC (Large Screens): The Landing Photos cycle independently */}
      {isLargeScreen && (
        <AnimatePresence mode="wait">
          <motion.div
            key={bgIndex + "-pc-bg"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3.0, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full z-10"
          >
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <img 
                src={landingImages[bgIndex].url} 
                className={`w-full h-full object-cover ${landingImages[bgIndex].position} scale-100`} 
                alt="" 
              />
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Mobile & Tablet: Swipeable Master Gallery (Videos + Images) */}
      {!isLargeScreen && (
        <AnimatePresence mode="wait">
          <motion.div
             key={masterIndex + "-master-bg"}
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 0.8, ease: "easeInOut" }}
             className="absolute inset-0 h-full w-full z-10"
          >
            <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-black">
              {currentItem.type === 'video' ? (
                <div className="absolute inset-0 w-full h-full">
                  <iframe
                    ref={mobileIframeRef}
                    key={currentItem.id}
                    title="Mobile/Tablet BG"
                    src={`https://www.youtube.com/embed/${currentItem.id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${currentItem.id}&start=${currentItem.start}&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1&origin=${window.location.origin}`}
                    className="cinematic-cover"
                    style={{ border: 'none' }}
                    allow="autoplay; encrypted-media"
                    onLoad={handleMobileIframeLoad}
                  />
                </div>
              ) : (
                <img 
                  src={currentItem.url} 
                  className={`w-full h-full object-cover ${currentItem.position} scale-110`} 
                  alt="" 
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-20 pointer-events-none lg:bg-gradient-to-b lg:from-black/20 lg:via-transparent lg:to-black/20" />
    </div>
  );
};

// --- COMPONENTS ---
function Layout({ children, isPlaying, setIsPlaying, isVideoSlide }: { children: React.ReactNode, isPlaying: boolean, setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>, isVideoSlide: boolean }) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="relative min-h-screen bg-bg text-text font-sans selection:bg-primary selection:text-white antialiased">
      <a href="#content" className="skip-link">Skip to content</a>
      
      {!isHome && (
        <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" aria-hidden="true">
          <img src="/images/portfolio-bg.jpg" className="w-full h-full object-cover grayscale brightness-50" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>
      )}

      {/* New Project Navbar Integration */}
      <Navbar1 />

      {/* Global Play/Pause Toggle */}
      {location.pathname === '/' && isVideoSlide && (
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="fixed bottom-24 right-6 md:bottom-12 md:right-12 z-[60] flex items-center justify-center w-14 h-14 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full hover:bg-primary/20 hover:border-primary/40 transition-all duration-500 group"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          <AnimatePresence mode="wait">
            {!isPlaying ? (
              <motion.div
                key="play"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="flex items-center justify-center"
              >
                <Play className="w-5 h-5 text-primary fill-primary ml-0.5" />
              </motion.div>
            ) : (
              <motion.div
                key="pause"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="flex items-center justify-center"
              >
                <Pause className="w-5 h-5 text-primary fill-primary" />
              </motion.div>
            )}
          </AnimatePresence>
          {!isPlaying && (
            <span className="absolute -top-8 right-0 font-mono text-[8px] uppercase tracking-widest text-white/40 animate-pulse whitespace-nowrap">
              Tap to play
            </span>
          )}
        </button>
      )}

      <main id="content" className="relative z-10 w-full overflow-x-hidden px-6 md:px-12 lg:px-16">
        {children}
      </main>

      {!isHome && (
        <footer className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 font-mono text-[10px] text-white/10 md:px-16 pointer-events-none">
          <div>2025 © ROSÉ HANSEN AUDIO</div>
        </footer>
      )}
    </div>
  );
}

const Home = ({ isPlaying, setIsPlaying, setIsVideoSlide }: { isPlaying: boolean, setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>, setIsVideoSlide: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const reducedMotion = useReducedMotion();
  const [trackIndex, setTrackIndex] = useState(0);
  const [bgIndex, setBgIndex] = useState(0);
  const [masterIndex, setMasterIndex] = useState(0);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [hasSwiped, setHasSwiped] = useState(false);
  const desktopIframeRef = useRef<HTMLIFrameElement>(null);

  // Helper to send commands to desktop iframe
  const sendDesktopCommand = (func: string) => {
    if (desktopIframeRef.current?.contentWindow) {
      desktopIframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args: [] }),
        '*'
      );
    }
  };

  // When isPlaying changes, play/pause + mute/unmute
  useEffect(() => {
    if (isPlaying) {
      sendDesktopCommand('playVideo');
      sendDesktopCommand('unMute');
    } else {
      sendDesktopCommand('pauseVideo');
      sendDesktopCommand('mute');
    }
  }, [isPlaying]);

  // When a new desktop iframe loads, apply current play state
  const handleDesktopIframeLoad = () => {
    setTimeout(() => {
      if (isPlaying) {
        sendDesktopCommand('playVideo');
        sendDesktopCommand('unMute');
      } else {
        sendDesktopCommand('pauseVideo');
        sendDesktopCommand('mute');
      }
    }, 1500);
  };

  useEffect(() => {
    const checkScreen = () => setIsLargeScreen(window.innerWidth >= 1024);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Independent timer for Project Cycle (Video Player - PC)
  useEffect(() => {
    if (!isLargeScreen) return;
    const timer = setTimeout(() => {
      setTrackIndex((prev) => (prev + 1) % studioTracks.length);
    }, studioTracks[trackIndex].duration);
    return () => clearTimeout(timer);
  }, [trackIndex, isLargeScreen]);

  // Independent timer for Background Imagery Cycle (PC)
  useEffect(() => {
    if (!isLargeScreen) return;
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % landingImages.length);
    }, 10000); 
    return () => clearInterval(timer);
  }, [isLargeScreen]);

  // Sync isVideoSlide state whenever masterIndex changes (for mobile play button visibility)
  useEffect(() => {
    const currentItem = masterGallery[masterIndex];
    setIsVideoSlide(currentItem.type === 'video');
  }, [masterIndex, setIsVideoSlide]);

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 30;
    if (Math.abs(info.offset.x) > threshold) {
      setIsPlaying(false); // Reset to paused on every swipe — user must tap Play to authorize
      if (info.offset.x > threshold) {
        setMasterIndex((prev) => (prev - 1 + masterGallery.length) % masterGallery.length);
      } else {
        setMasterIndex((prev) => (prev + 1) % masterGallery.length);
      }
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 md:px-12 pt-20 overflow-hidden">
      <DynamicBackground trackIndex={trackIndex} bgIndex={bgIndex} masterIndex={masterIndex} isPlaying={isPlaying} isLargeScreen={isLargeScreen} />
      
      {/* Mobile Swipe Layer */}
      <motion.div 
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="lg:hidden absolute inset-0 z-50 cursor-grab active:cursor-grabbing"
      />

      {/* Centered Role Card - Mobile & Tablet Only */}
      <div className="lg:hidden absolute top-[78%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-[80%] max-w-[320px] pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={masterIndex}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="bg-black/60 backdrop-blur-3xl p-6 rounded-[2rem] border border-white/10 text-center shadow-[0_15px_40px_rgba(0,0,0,0.6)] pointer-events-auto"
          >
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="block text-primary text-[9px] md:text-[10px] font-light tracking-[0.2rem] uppercase mb-2"
            >
              {masterGallery[masterIndex].label}
            </motion.span>
            <h2 className="text-white text-xl md:text-2xl font-box uppercase leading-tight">
              {masterGallery[masterIndex].title}
            </h2>
            <div className="mt-4 flex justify-center gap-1.5">
               {masterGallery.map((_, i) => (
                 <div key={i} className={`h-0.5 rounded-full transition-all duration-500 ${masterIndex === i ? 'w-6 bg-primary' : 'w-1.5 bg-white/10'}`} />
               ))}
            </div>
            <p className="text-white/20 text-[8px] uppercase tracking-widest mt-4 animate-pulse">Swipe</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <h1 className="relative z-20 flex flex-col items-center text-center mt-[-10vh] md:mt-0 pointer-events-none">
        <motion.span 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="font-accent text-[clamp(3.5rem,11vw,11rem)] leading-[0.85] text-primary drop-shadow-cinematic"
        >
          ROMAN
        </motion.span>
        <motion.span 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          className="font-accent text-[clamp(3.5rem,11vw,11rem)] leading-[0.85] text-white brightness-125 -mt-2 md:-mt-8"
        >
          HANSEN
        </motion.span>
      </h1>

      {/* Credits Highlights & Mini-Player - Desktop Only (LG+) */}
      {isLargeScreen && (
      <div className="hidden lg:flex absolute bottom-24 left-12 z-30 flex-col items-start gap-8">
        <motion.div
            key={trackIndex}
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onClick={() => setIsPlaying(!isPlaying)}
            className="group relative aspect-video w-[450px] overflow-hidden rounded-xl border border-white/20 bg-black shadow-2xl p-1 cursor-pointer"
          >
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            
            <iframe
              ref={desktopIframeRef}
              key={studioTracks[trackIndex].id}
              title="Mini Preview"
              src={`https://www.youtube.com/embed/${studioTracks[trackIndex].id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${studioTracks[trackIndex].id}&start=${studioTracks[trackIndex].start}&rel=0&showinfo=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${window.location.origin}`}
              className="w-full h-full rounded-lg"
              style={{ border: 'none' }}
              allow="autoplay; encrypted-media"
              onLoad={handleDesktopIframeLoad}
            />

            <div className="absolute top-4 right-4 z-20">
               <div className="px-3 py-1 bg-primary/20 backdrop-blur-md border border-primary/40 rounded-full">
                  <span className="font-mono text-[10px] text-white tracking-widest animate-pulse uppercase">
                    {isPlaying ? 'NOW PLAYING' : 'PAUSED'}
                  </span>
               </div>
            </div>

            <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-0.5">
               <span className="font-mono text-xs text-primary uppercase tracking-[0.10rem] font-light">Engineering Highlight</span>
               <p className="font-box text-xl text-white uppercase tracking-wider">{studioTracks[trackIndex].artist}</p>
            </div>

            <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
               <div className="px-6 py-2 bg-white text-black font-box text-xs uppercase tracking-widest rounded-full shadow-glow-primary">
                 {isPlaying ? 'Click to Pause' : 'Click to Play'}
               </div>
            </div>
          </motion.div>

        <motion.ul 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-row gap-8"
        >
          {studioTracks.map((track, i) => (
            <li 
              key={track.id}
              onClick={() => {
                setTrackIndex(i);
                setIsPlaying(true);
              }}
              className={`cursor-pointer group transition-all duration-700 px-8 py-5 rounded-2xl backdrop-blur-md border border-white/5 ${trackIndex === i ? 'bg-black/60 scale-105 border-primary/30 shadow-[0_0_30px_rgba(157,0,255,0.1)]' : 'bg-black/20 opacity-40 scale-100'}`}
            >
              <span className={`block font-box text-xs md:text-sm uppercase tracking-[0.10rem] transition-colors font-light ${trackIndex === i ? 'text-primary' : 'text-white/40'}`}>{track.label}</span>
              <p className={`font-box text-lg md:text-2xl transition-colors ${trackIndex === i ? 'text-white' : 'text-white/60'}`}>{track.title}</p>
            </li>
          ))}
        </motion.ul>
      </div>
      )}

      <div className="absolute bottom-8 left-6 md:left-12 right-6 md:right-12 z-10 flex flex-col items-start lg:flex-row lg:items-end lg:justify-between gap-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col gap-2 pointer-events-auto"
        >
          <p className="max-w-[200px] md:max-w-xs font-mono text-[8px] md:text-[10px] uppercase leading-relaxed tracking-widest text-white/50">
            Shaping the texture of sound through analog precision and digital clarity.
          </p>
          <Link to="/portfolio" className="group flex items-center gap-2 font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-white transition-all hover:text-primary">
            [ View Discography ]
            <span className="h-[1px] w-0 bg-primary transition-all group-hover:w-12" />
          </Link>
        </motion.div>
      </div>
      
      <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 z-20 pointer-events-none text-right">
        <p className="font-mono text-[8px] uppercase tracking-[0.5em] text-white/20">2025 © ROSÉ HANSEN AUDIO</p>
      </div>
    </div>
  );
};

const Portfolio = () => {
  const [credits, setCredits] = useState<{ id: string; title: string; artist: string; role: string; img: string; date?: string; popularity?: number; youtubeId?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch('/credits.json');
        const data = await response.json();
        setCredits(data);
      } catch (error) {
        console.error("Error loading credits:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCredits();
  }, []);

  const displayedCredits = [...credits].sort((a, b) => {
    if (sortBy === 'newest') {
      const dateA = a.date || "1970-01-01";
      const dateB = b.date || "1970-01-01";
      return dateB.localeCompare(dateA);
    } else {
      return (b.popularity || 0) - (a.popularity || 0);
    }
  });

  return (
    <div className="min-h-screen pt-32 px-6 md:px-12 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-16">
          <div>
            <div className="flex items-center gap-4 mb-4">
               <span className="font-mono text-xs uppercase tracking-[0.4em] text-primary block">Discography</span>
               <div className="h-[1px] w-12 bg-primary/30" />
            </div>
            <h1 className="font-accent text-[clamp(4.5rem,15vw,6rem)] md:text-8xl uppercase leading-none">Selected<br />Credits</h1>
          </div>
          
          <div className="flex items-center p-1 border border-white/10 rounded-full bg-black/40 backdrop-blur-md w-max">
             <button 
                onClick={() => setSortBy('newest')}
                className={`px-6 py-2.5 rounded-full font-mono text-[9px] sm:text-[10px] uppercase tracking-widest transition-all duration-300 ${sortBy === 'newest' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
             >
               Newest
             </button>
             <button 
                onClick={() => setSortBy('popular')}
                className={`px-6 py-2.5 rounded-full font-mono text-[9px] sm:text-[10px] uppercase tracking-widest transition-all duration-300 ${sortBy === 'popular' ? 'bg-primary text-white' : 'text-white/40 hover:text-white'}`}
             >
               Most Popular
             </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-20 lg:gap-y-32">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-6">
                 <div className="aspect-video bg-white/[0.02] animate-pulse rounded-sm" />
                 <div className="flex justify-between items-start">
                    <div className="space-y-3 w-1/2">
                       <div className="h-8 bg-white/[0.03] animate-pulse w-full rounded-sm" />
                       <div className="h-3 bg-white/[0.03] animate-pulse w-2/3 rounded-sm" />
                    </div>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-24 lg:gap-y-32">
            {displayedCredits.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="group flex flex-col gap-6 cursor-pointer"
              >
                {/* Cinematic Wide Image */}
                <div 
                  className="relative w-full aspect-video overflow-hidden bg-black group-hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] transition-shadow duration-700 flex items-center justify-center"
                  onClick={() => item.youtubeId && setPlayingTrackId(item.id)}
                >
                  
                  {playingTrackId === item.id && item.youtubeId ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3`}
                      title={item.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 z-30"
                    />
                  ) : item.youtubeId ? (
                    // Native Wide YouTube Thumbnail 
                    <img 
                      src={`https://img.youtube.com/vi/${item.youtubeId}/maxresdefault.jpg`} 
                      className="absolute inset-0 w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.03]" 
                      loading="lazy"
                      decoding="async"
                      alt="" 
                    />
                  ) : (
                    // Matte Fill Letterbox for Square Album Art
                    <>
                      <img 
                         src={`${item.img}?auto=format&fit=crop&q=80&w=1600`} 
                         className="absolute inset-0 w-full h-full object-cover blur-3xl scale-125 opacity-30 group-hover:opacity-50 transition-opacity duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]" 
                         loading="lazy"
                         decoding="async"
                         alt="" aria-hidden="true"
                      />
                      <img 
                         src={`${item.img}?auto=format&fit=crop&q=80&w=800`} 
                         className="relative z-10 w-full h-full object-contain grayscale brightness-[0.85] group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.02]" 
                         loading="lazy"
                         decoding="async"
                         alt="" 
                      />
                    </>
                  )}

                  {/* Central interactive pill (Marceau-style hover) */}
                  {playingTrackId !== item.id && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out z-20">
                      <div className="px-6 py-3 bg-white text-black font-box text-[10px] md:text-xs uppercase tracking-[0.3em] rounded-full drop-shadow-2xl flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                        PLAY
                      </div>
                    </div>
                  )}
                </div>

                {/* Editorial Typography Underneath */}
                <div className="flex justify-between items-start w-full px-1">
                  <div className="flex flex-col gap-1.5 max-w-[70%]">
                    <h2 className="font-box text-xl md:text-3xl uppercase leading-none tracking-[0.05em] text-white group-hover:text-primary transition-colors duration-500">
                      {item.title}
                    </h2>
                    <span className="font-mono text-[10px] md:text-xs text-white/50 uppercase tracking-[0.1em] font-light">
                      {item.artist}
                    </span>
                  </div>
                  <div className="text-right flex flex-col gap-1.5 pt-1">
                    <span className="font-mono text-[9px] md:text-[10px] text-white/30 uppercase tracking-[0.2em]">
                      {item.role}
                    </span>
                    {item.date && (
                      <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest">
                        {new Date(item.date).getFullYear()}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        <div className="mt-20 p-12 border border-white/5 rounded-sm bg-surface/30 backdrop-blur-sm text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-white/40 mb-4">+ {credits.length > 50 ? credits.length : "45"} TRACKS & COUNTING</p>
          <button className="font-box text-xl uppercase tracking-widest hover:text-primary transition-colors">View Full Discographic Archive</button>
        </div>
      </div>
    </div>
  );
};

const TextReveal = ({ text, className, delay = 0, style }: { text: string, className?: string, delay?: number, style?: React.CSSProperties }) => {
  const words = text.split(" ");
  return (
    <motion.div 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        visible: { transition: { staggerChildren: 0.04, delayChildren: delay } },
        hidden: {}
      }}
      className={`flex flex-wrap ${className}`}
      style={style}
    >
      {words.map((word, i) => (
        <div key={i} className="overflow-hidden pb-[0.5em] -mb-[0.5em] pt-[0.2em] -mt-[0.2em] px-[0.1em] -mx-[0.1em] mr-[0.25em]">
          <motion.span 
            variants={{
              hidden: { y: "110%", opacity: 0, rotateZ: 5 },
              visible: { y: "0%", opacity: 1, rotateZ: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="inline-block origin-bottom-left"
          >
            {word}
          </motion.span>
        </div>
      ))}
    </motion.div>
  );
};

const RoleCycle = () => {
  const roles = ["CREATIVE", "ENGINEER", "PRODUCER", "MAN."];
  const [index, setIndex] = useState(0);
  const [hasLanded, setHasLanded] = useState(false);

  useEffect(() => {
    if (hasLanded) return;
    
    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev >= roles.length - 1) {
          clearInterval(interval);
          setHasLanded(true);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [hasLanded]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={index}
        initial={{ y: "80%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        exit={{ y: "-80%", opacity: 0 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.16, 1, 0.3, 1] 
        }}
        className="inline-block"
      >
        {roles[index]}
      </motion.span>
    </AnimatePresence>
  );
};

const About = () => (
  <section className="px-6 md:px-12 py-32 md:py-48 max-w-7xl mx-auto overflow-hidden">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-start">
      
      {/* Left Text Col */}
      <div className="lg:col-span-6 flex flex-col justify-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="flex items-center gap-4 text-primary font-mono text-[10px] uppercase tracking-[0.4em] mb-12"
        >
          <span>The Man</span>
          <div className="w-12 h-px bg-primary/40" />
        </motion.div>

        {/* Dynamic Title Slide Up */}
        <div className="flex flex-col gap-2 mb-16 overflow-visible">
           <div className="overflow-hidden mb-2 pb-[0.2em] -mb-[0.2em]">
             <motion.h1 
               initial={{ y: "100%" }}
               whileInView={{ y: "0%" }}
               viewport={{ once: true }}
               transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
               className="font-accent text-[clamp(4rem,10vw,8rem)] leading-[0.85] uppercase"
             >
               THE
             </motion.h1>
           </div>
           <div className="relative overflow-visible">
             <h1 className="font-accent text-[clamp(4rem,10vw,8rem)] leading-[0.85] uppercase text-primary">
               <RoleCycle />
             </h1>
           </div>
        </div>

        {/* Refined Staggered Editorial View */}
        <div className="flex flex-col gap-10 max-w-xl">
           <TextReveal 
             text="Rooted in London's elite sonic landscape, Roman (Rosé) Hansen combines analog warmth with clinical digital precision." 
             className="font-sans text-base md:text-lg text-white/50 leading-relaxed font-light tracking-wide uppercase"
             delay={0.3}
           />
           
           <div className="border-l-2 border-primary/40 pl-6 md:pl-8 py-2 relative">
             <div className="absolute -left-3 top-0 opacity-10 text-primary font-accent text-6xl">"</div>
             <TextReveal 
               text="My philosophy is simple, but unapologetic: vibe-first. The goal isn't just to make sure the mix doesn't clip, it's to shape a spatial environment that immediately puts the listener into a world of your creation." 
               className="font-sans text-xl md:text-2xl text-white leading-relaxed font-light italic"
               delay={0.6}
             />
           </div>
        </div>
      </div>

      <div className="lg:col-span-1 hidden lg:block" />

      {/* Right Image Reveal */}
      <div className="lg:col-span-5 relative mt-12 lg:mt-0">
        <motion.div 
           initial={{ clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" }}
           whileInView={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
           viewport={{ once: true, margin: "-10%" }}
           transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
           className="relative aspect-[3/4] bg-black border border-white/10"
        >
          <img src="/images/about-portrait.jpg" className="w-full h-full object-cover opacity-100" alt="Roman Hansen Portrait" />
          
          {/* Edge Labeling */}
          <div className="absolute bottom-12 -left-6 z-10 hidden md:flex items-center gap-4 origin-bottom-left -rotate-90">
             <span className="font-mono text-[8px] uppercase tracking-[0.5em] text-white/40">EST. 2018</span>
             <div className="h-px w-16 bg-white/20" />
          </div>
        </motion.div>
      </div>

    </div>
  </section>
);

const Contact = () => (
  <section className="flex flex-col px-6 md:px-12 pt-32 pb-24 max-w-7xl mx-auto">
    <div>
      <div className="flex items-center gap-4 text-primary font-mono text-[10px] uppercase tracking-[0.4em] mb-6 md:mb-8">
          <span>Inquiry</span>
          <div className="w-12 h-px bg-primary/40" />
      </div>
      <h1 className="font-accent text-[clamp(48px,18vw,160px)] leading-[0.8] uppercase text-primary -ml-1 md:-ml-3">LET'S MIX.</h1>
    </div>

    {/* Framer Interactive Draggable Studio Photo Gallery */}
    <InteractiveImageBentoGallery
      title="BEHIND THE SCENES"
      description="A Journey Through The Studio"
      imageItems={[
        {
          id: 1,
          title: "Studio Desk",
          desc: "Mixing Setup",
          url: "/mixedbyrose/mixedbyrose_1764790565_3779659666272558786_717492728.jpg",
          span: "md:col-span-2 md:row-span-2",
        },
        {
          id: 2,
          title: "Console View",
          desc: "Analog Gear",
          url: "/mixedbyrose/mixedbyrose_1762188568_3757832538673680789_717492728.jpg",
          span: "md:col-span-1 md:row-span-1",
        },
        {
          id: 3,
          title: "Session",
          desc: "In The Zone",
          url: "/mixedbyrose/mixedbyrose_1709892841_3319144181089259159_717492728.jpg",
          span: "md:col-span-1 md:row-span-1",
        },
        {
          id: 4,
          title: "Hardware",
          desc: "Rack Units",
          url: "/mixedbyrose/mixedbyrose_1761888600_3754958525119082828_717492728.jpg",
          span: "md:col-span-1 md:row-span-2",
        },
        {
          id: 5,
          title: "Tracking",
          desc: "Vibe",
          url: "/mixedbyrose/mixedbyrose_1757954393_3722313701350232236_717492728.jpg",
          span: "md:col-span-2 md:row-span-1",
        },
        {
          id: 6,
          title: "The Rack",
          desc: "Analog Signal Path",
          url: "/mixedbyrose/mixedbyrose_1751992991_3672305838462306857_717492728.jpg",
          span: "md:col-span-2 md:row-span-1",
        },
        {
          id: 7,
          title: "Vocal Chain",
          desc: "Capture",
          url: "/mixedbyrose/mixedbyrose_1769490000_3818902296722206257_717492728.jpg",
          span: "md:col-span-1 md:row-span-2",
        },
        {
          id: 8,
          title: "Golden Hour",
          desc: "After Hours Session",
          url: "/mixedbyrose/mixedbyrose_1771952976_3839738783042646119_717492728.jpg",
          span: "md:col-span-2 md:row-span-2",
        },
        {
          id: 9,
          title: "Focused",
          desc: "Fine Tuning",
          url: "/mixedbyrose/mixedbyrose_1729872760_3486747891960324889_717492728.jpg",
          span: "md:col-span-1 md:row-span-2",
        },
      ]}
    />

    <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 border-t border-white/5 pt-8 w-full">
      <div className="flex flex-col gap-8 md:gap-12">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">Direct Email</span>
          <a href="mailto:rose@hansenaudio.co.uk" className="font-mono text-base sm:text-2xl md:text-3xl lg:text-4xl transition-colors hover:text-primary break-all sm:break-normal">
            rose@hansenaudio.co.uk
          </a>
        </div>
      </div>
      <div className="flex flex-col justify-end gap-8 md:gap-12">
        <div className="flex flex-col gap-4 md:items-end">
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">Socials</span>
          <div className="flex gap-8">
            <a href="https://www.instagram.com/mixedbyrose/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors cursor-pointer">
              <Instagram className="h-6 w-6" />
            </a>
            <Twitter className="h-6 w-6 hover:text-primary transition-colors cursor-pointer" />
            <a href="mailto:rose@hansenaudio.co.uk" className="hover:text-primary transition-colors cursor-pointer">
              <Mail className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// --- MAIN WRAPPER ---
const App = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoSlide, setIsVideoSlide] = useState(false);

  return (
    <Router>
      <div className="relative min-h-screen">
        <Layout isPlaying={isPlaying} setIsPlaying={setIsPlaying} isVideoSlide={isVideoSlide}>
          <Routes>
            <Route path="/" element={<Home isPlaying={isPlaying} setIsPlaying={setIsPlaying} setIsVideoSlide={setIsVideoSlide} />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
};

export default App;
