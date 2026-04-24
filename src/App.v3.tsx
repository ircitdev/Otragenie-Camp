import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView, useMotionValue, useMotionTemplate, animate } from 'motion/react';
import { X, CheckCircle, ChevronRight, ChevronDown, ChevronLeft, MapPin, Calendar, Users, Star, ArrowRight, ArrowUp, Quote, Info, Play, Pause, Volume2, VolumeX, AlertTriangle, Home, Coffee, Bus, Video, Zap, Target, HelpCircle, Brain, Flame, MessageSquare, Eye, RefreshCw, Compass, Clock, Scale, Infinity, Key, Send, MessageCircle, Menu } from 'lucide-react';
import { PAINS, WHAT_HAPPENS, AUTHORS, PROCESS, PROGRAM, CASES, FOR_WHO, RESULTS, STATS, PRICING } from './data';
import { ChatAssistant } from './components/ChatAssistant';
import { LiveChat } from './components/LiveChat';

// Yandex.Metrika goal helper
const YM_ID = 108536568;
const ymGoal = (name: string, params?: Record<string, any>) => {
  try {
    (window as any).ym?.(YM_ID, "reachGoal", name, params);
  } catch {}
};

// --- Components ---

const Reveal = ({ children, delay = 0, className = '', direction = 'up', scale = false }: any) => (
  <motion.div
    initial={{ 
      opacity: 0, 
      y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0, 
      x: direction === 'left' ? -30 : direction === 'right' ? 30 : 0, 
      scale: scale ? 0.95 : 1 
    }}
    whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
    className={className}
    style={{ willChange: "transform, opacity" }}
  >
    {children}
  </motion.div>
);

const Button = ({ variant = 'brown', href, children, className = '', onClick, type }: any) => {
  const base = "inline-flex min-h-[3.1rem] items-center justify-center gap-2 rounded-full px-8 py-3 text-center font-sans text-[0.85rem] font-semibold tracking-[0.02em] transition-all duration-400 relative overflow-hidden group hover:scale-[1.015] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown/40 focus-visible:ring-offset-2";
  const variants: any = {
    brown: "border border-brown bg-brown text-white shadow-[0_10px_28px_rgba(154,125,90,0.22)] hover:bg-brown-dark hover:border-brown-dark hover:shadow-[0_14px_32px_rgba(154,125,90,0.32)]",
    olive: "border border-[#5c6b5e] bg-[#5c6b5e] text-white shadow-[0_10px_28px_rgba(92,107,94,0.2)] hover:bg-[#4a574b] hover:border-[#4a574b] hover:shadow-[0_14px_32px_rgba(92,107,94,0.3)]",
    navy: "border border-[#16213d] bg-[#16213d] text-white shadow-[0_10px_28px_rgba(15,23,42,0.22)] hover:bg-[#1d2b4f] hover:border-[#1d2b4f] hover:shadow-[0_14px_32px_rgba(15,23,42,0.34)]",
    "outline-light": "border border-white/60 bg-white/20 text-white shadow-[0_10px_24px_rgba(4,9,26,0.12)] backdrop-blur-md hover:bg-white/35 hover:border-white/90 hover:text-white",
    "outline-dark": "border border-brown/30 bg-white/78 text-brown shadow-[0_10px_24px_rgba(125,92,58,0.08)] backdrop-blur-sm hover:bg-brown hover:border-brown hover:text-white",
    ghost: "border border-transparent bg-transparent text-brown hover:bg-brown/6 hover:text-brown-dark"
  };
  const cls = `${base} ${variants[variant]} ${className}`;
  
  const content = (
    <>
      <span className="relative z-10">{children}</span>
      <motion.div 
        className="absolute inset-0 bg-white/10 translate-y-full transition-transform duration-500 group-hover:translate-y-0"
      />
    </>
  );

  return href ? (
    <a href={href} className={cls} onClick={onClick}>{content}</a>
  ) : (
    <button type={type} className={cls} onClick={onClick}>{content}</button>
  );
};

const SectionHeading = ({ subtitle, title, light = false, centered = true }: any) => (
  <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
    <Reveal delay={0.1}>
      <span className={`text-[0.68rem] tracking-[0.2em] uppercase font-medium mb-4 block ${light ? 'text-white/60' : 'text-brown'}`}>
        {subtitle}
      </span>
    </Reveal>
    <Reveal delay={0.2}>
      <h2 className={`font-serif text-[clamp(1.9rem,4.5vw,3.25rem)] leading-[1.12] mb-6 ${light ? 'text-white' : 'text-text-dark'}`}>
        {title}
      </h2>
    </Reveal>
    <Reveal delay={0.3}>
      <div className={`h-[1px] w-24 mx-auto ${light ? 'bg-white/20' : 'bg-brown/30'} ${centered ? '' : 'ml-0'}`} />
    </Reveal>
  </div>
);

// --- Sections ---

const Preloader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
      className="fixed inset-0 z-[999] bg-navy flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center"
      >
        <h1 className="font-serif text-4xl md:text-6xl text-white tracking-widest mb-4">ОТРАЖЕНИЕ</h1>
        <motion.div 
          className="w-0 h-[1px] bg-brown mx-auto"
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
};

const Navbar = ({ onOpenModal }: any) => {
  const [scrolled, setScrolled] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      setScrolled(window.scrollY > 50);
      setIsPastHero(window.scrollY > heroHeight - 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'О кэмпе', id: 'about' },
    { name: 'Программа', id: 'program' },
    { name: 'Авторы', id: 'authors' },
    { name: 'Тарифы', id: 'pricing' }
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isPastHero
          ? 'bg-cream/80 backdrop-blur-xl py-4 shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-b border-brown/5'
          : scrolled
            ? 'bg-navy/20 backdrop-blur-md py-6'
            : 'bg-transparent py-8'
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <a href="#" className={`font-serif text-[1.4rem] font-normal tracking-[0.08em] transition-colors duration-500 flex items-center gap-3 ${isPastHero ? 'text-text-dark' : 'text-white'}`}>
            ОТРАЖЕНИЕ
            <span className={`text-[0.55rem] uppercase tracking-[0.2em] px-2 py-1 rounded-md font-sans font-bold border transition-colors duration-500 ${isPastHero ? 'border-brown text-brown' : 'border-white/40 text-white'}`}>camp</span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3">
            <div className={`flex items-center gap-2 rounded-full border px-3 py-2 transition-all duration-500 ${
              isPastHero
                ? 'border-brown/10 bg-white/70 shadow-[0_10px_30px_rgba(34,25,16,0.06)] backdrop-blur-xl'
                : scrolled
                  ? 'border-white/10 bg-white/8 backdrop-blur-xl shadow-[0_14px_40px_rgba(3,8,20,0.18)]'
                  : 'border-white/12 bg-white/6 backdrop-blur-lg'
            }`}>
              {navLinks.map((item, i) => (
                <a
                  key={i}
                  href={`#${item.id}`}
                  className={`rounded-full px-4 py-2 text-[0.67rem] uppercase tracking-[0.22em] font-semibold transition-all duration-300 hover:bg-white/70 hover:text-brown ${isPastHero ? 'text-text-dark/75' : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]'}`}
                >
                  {item.name}
                </a>
              ))}
            </div>

            <div className="hidden xl:block">
              <Button
                variant="brown"
                className="!px-6 !py-2.5 !text-[0.65rem] shadow-[0_12px_30px_rgba(17,24,39,0.18)]"
                onClick={onOpenModal}
              >
                Участвовать
              </Button>
            </div>
          </div>

          {/* Mobile: hamburger */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(v => !v)}
            aria-label="Меню"
          >
            {isMobileMenuOpen
              ? <X size={24} className={isPastHero ? 'text-text-dark' : 'text-white'} />
              : <Menu size={24} className={isPastHero ? 'text-text-dark' : 'text-white'} />
            }
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[99] bg-navy/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 md:hidden"
          >
            <button
              className="absolute top-6 right-6 text-white/70 hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Закрыть меню"
            >
              <X size={28} />
            </button>
            {navLinks.map((item, i) => (
              <a
                key={i}
                href={`#${item.id}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-serif text-3xl text-white/90 hover:text-brown transition-colors tracking-wide"
              >
                {item.name}
              </a>
            ))}
            <Button variant="brown" onClick={() => { setIsMobileMenuOpen(false); onOpenModal(); }} className="mt-4">
              Участвовать
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Hero = ({ onOpenModal }: any) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 1000], [1.05, 1.2]);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    mouseX.set((clientX - left) / width);
    mouseY.set((clientY - top) / height);
  };

  const spotlightX = useTransform(mouseX, [0, 1], ["0%", "100%"]);
  const spotlightY = useTransform(mouseY, [0, 1], ["0%", "100%"]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoSrc, setVideoSrc] = useState("");

  useEffect(() => {
    const desktopVideos = [
      "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/img/intro-budda.mp4",
      "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/img/intro-girls.mp4",
      "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/img/intro-yoga.mp4",
      "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/intro1.mp4",
      "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/intro.mp4"
    ];

    const mobileVideos = [
      "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/intro2_m.mp4",
      "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/intro1_m.mp4",
      "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/intro_m.mp4",
      "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/intro3_m.mp4"
    ];

    const isMobile = window.innerWidth < 768;
    const videos = isMobile ? mobileVideos : desktopVideos;
    const randomVideo = videos[Math.floor(Math.random() * videos.length)];
    setVideoSrc(randomVideo);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section 
      id="hero" 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-navy group/hero"
    >
      <motion.div style={{ y, opacity, scale, willChange: "transform, opacity" }} className="absolute inset-0 z-0">
        {videoSrc && (
          <video 
            ref={videoRef}
            autoPlay muted loop playsInline 
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-transparent to-navy/80" />
        
        <motion.div 
          className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover/hero:opacity-100 transition-opacity duration-1000"
          style={{
            background: useMotionTemplate`radial-gradient(600px circle at ${spotlightX} ${spotlightY}, rgba(255,255,255,0.08), transparent 80%)`
          }}
        />
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
        
      </motion.div>

      <div className="relative z-10 max-w-[72rem] mx-auto px-6 text-center">
        <Reveal delay={2.4} direction="down">
          <span className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white/70 text-[0.72rem] tracking-[0.3em] uppercase mb-9">
            19 — 21 июня • Красная Поляна
          </span>
        </Reveal>
        
        <Reveal delay={2.6}>
            <div className="relative mb-7">
              <h1 className="font-serif text-[clamp(3.2rem,9vw,7rem)] leading-[0.95] text-white font-normal tracking-[0.02em] relative z-10">
              Отражение
            </h1>
              <h1 className="font-serif text-[clamp(3.2rem,9vw,7rem)] leading-[0.95] text-white font-normal tracking-[0.02em] absolute top-full left-0 right-0 opacity-[0.07] scale-y-[-1] blur-[2px] select-none pointer-events-none" style={{ maskImage: "linear-gradient(to bottom, transparent 20%, black 100%)" }}>
              Отражение
            </h1>
          </div>
        </Reveal>

        <Reveal delay={2.8}>
          <p className="font-serif text-[clamp(1rem,2vw,1.2rem)] text-white/75 max-w-[32.5rem] mx-auto mb-5 italic leading-[1.7] font-light">
            о честности с собой, о том, как увидеть свою жизнь без иллюзий и изменить то, что в ней не работает
          </p>
        </Reveal>


        <Reveal delay={3.0}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="brown" onClick={onOpenModal} className="!px-10 shadow-2xl">
              Пройти индивидуальный разбор
            </Button>
            <Button variant="outline-light" href="#pricing" className="!px-10">
              Забронировать место
            </Button>
          </div>
        </Reveal>

        <Reveal delay={3.1}>
          <p className="font-serif italic text-white/50 text-[0.95rem] leading-[1.6] max-w-[31.25rem] mx-auto mt-8">
            Участие в кэмпе проходит через индивидуальный разбор, чтобы вы точно поняли, зачем вам это и какой результат хотите получить. Если вы уже понимаете, что вам нужно — можно сразу забронировать место.
          </p>
        </Reveal>
      </div>

      <Reveal delay={3.2} className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-white/40 text-[0.6rem] tracking-[0.4em] uppercase font-medium">Листайте вниз</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={20} className="text-white/30" />
          </motion.div>
        </motion.div>
      </Reveal>
    </section>
  );
};

// --- JourneyPath (Экран 2 — пунктирный маршрут) ---

const JourneyPath = () => (
  <section className="bg-navy py-20 md:py-28 relative overflow-hidden">
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")", backgroundSize: "200px 200px" }} />
    <div className="max-w-3xl mx-auto px-6 md:px-12 relative text-center">
      <Reveal delay={0.05}>
        <p className="text-[clamp(1.05rem,2vw,1.25rem)] text-white/80 leading-[1.75] mb-10 max-w-2xl mx-auto">
          «Отражение» — это двухдневный терапевтический выезд для людей, которые хотят большего от своей жизни и готовы наконец разобраться, что им мешает это получить.
        </p>
      </Reveal>
      <Reveal delay={0.18}>
        <div className="inline-block">
          <p className="text-[0.78rem] uppercase tracking-[0.28em] text-brown/70 mb-5 font-medium">За два дня вы проходите путь</p>
          <div className="flex items-center gap-4 md:gap-6 justify-center">
            <span className="font-serif italic text-[clamp(1rem,2.2vw,1.3rem)] text-white/90 leading-snug">от честной диагностики<br className="hidden sm:block" /> своей жизни</span>
            <div className="flex items-center gap-1 text-brown shrink-0">
              <div className="w-6 md:w-10 h-px bg-brown/50" />
              <ArrowRight size={16} className="text-brown" />
            </div>
            <span className="font-serif italic text-[clamp(1rem,2.2vw,1.3rem)] text-white/90 leading-snug">к первым правилам<br className="hidden sm:block" /> новой</span>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

const ABOUT_INTRO_1 = "Мы создали «Отражение» для людей, у которых снаружи уже многое получилось, но внутри всё чаще появляется ощущение усталости, повторов и потери смысла.";
const ABOUT_INTRO_2 = "Это пространство, где можно остановиться, увидеть свою реальность без иллюзий и найти более зрелую опору для решений, отношений и следующего этапа жизни.";
const ABOUT_ITEMS = [
  "Поймать момент, где внешняя успешность уже не даёт внутренней опоры.",
  "Увидеть повторяющиеся сценарии в отношениях, выборе и способе жить.",
  "Собрать более честную стратегию жизни без самообмана и перегруза."
];
const ABOUT_VIDEO = "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/intro2.mp4";

// VARIANT 1 — minimal (www style)
const AboutV1 = () => (
  <section className="min-h-screen flex items-center py-16 bg-cream">
    <div className="max-w-7xl mx-auto px-6 md:px-12">
      <div className="text-center mb-4 text-[0.65rem] uppercase tracking-[0.4em] text-brown/60">Вариант 1 · Минимализм</div>
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-navy">
          <video src={ABOUT_VIDEO} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-90" />
        </div>
        <div>
          <span className="text-[0.68rem] uppercase tracking-[0.25em] text-brown font-medium block mb-4">О проекте</span>
          <h2 className="font-serif text-[clamp(1.8rem,4.5vw,3.2rem)] leading-[1.15] text-text-dark mb-6">Зачем мы создали этот кэмп</h2>
          <p className="text-[1rem] md:text-[1.05rem] text-text-dark-soft leading-[1.8] mb-5 max-w-[38rem]">{ABOUT_INTRO_1}</p>
          <p className="text-[1rem] md:text-[1.05rem] text-text-dark-soft leading-[1.8] mb-8 max-w-[38rem]">{ABOUT_INTRO_2}</p>
          <div className="flex items-center gap-3 font-serif text-[1.1rem] text-brown">
            <span className="h-px flex-1 bg-brown/30 max-w-[80px]" />
            <span>Что меняется</span>
          </div>
          <ul className="mt-5 space-y-3 max-w-[38rem]">
            {ABOUT_ITEMS.map((item, i) => (
              <li key={i} className="flex gap-3 text-[0.95rem] text-text-dark-soft leading-[1.7]">
                <span className="text-brown font-serif shrink-0">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

// VARIANT 2 — dark accent
const AboutV2 = () => (
  <section className="min-h-screen flex items-center py-16 bg-navy relative overflow-hidden">
    <video src={ABOUT_VIDEO} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-25" />
    <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/60 to-navy/90" />
    <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-10 text-center">
      <div className="mb-4 text-[0.65rem] uppercase tracking-[0.4em] text-brown-light/60">Вариант 2 · Тёмный акцент</div>
      <span className="text-[0.7rem] uppercase tracking-[0.3em] text-brown-light font-medium block mb-6">О проекте</span>
      <h2 className="font-serif text-[clamp(2rem,5vw,3.8rem)] leading-[1.1] text-white font-light mb-8">Зачем мы создали <em className="text-brown-light not-italic font-normal">этот кэмп</em></h2>
      <p className="font-serif italic text-[clamp(1.1rem,2vw,1.4rem)] text-white/80 leading-[1.6] max-w-3xl mx-auto mb-6">{ABOUT_INTRO_1}</p>
      <p className="text-[1rem] text-white/65 leading-[1.8] max-w-2xl mx-auto mb-12">{ABOUT_INTRO_2}</p>
      <div className="grid md:grid-cols-3 gap-6 mt-10">
        {ABOUT_ITEMS.map((item, i) => (
          <div key={i} className="text-left border-t border-brown-light/30 pt-5">
            <div className="font-serif text-brown-light text-2xl mb-3">0{i + 1}</div>
            <p className="text-[0.92rem] text-white/75 leading-[1.7]">{item}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// VARIANT 3 — split asymmetric
const AboutV3 = () => (
  <section className="min-h-screen flex flex-col justify-center bg-cream-soft relative overflow-hidden">
    <div className="mb-4 text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60">Вариант 3 · Асимметрия</div>
    <div className="grid lg:grid-cols-[60%_40%] gap-0 items-stretch">
      <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[600px] overflow-hidden">
        <video src={ABOUT_VIDEO} autoPlay muted loop playsInline className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-cream-soft/80" />
        <div className="absolute bottom-10 left-10 text-white">
          <div className="font-serif text-5xl opacity-90">“</div>
          <p className="font-serif italic text-lg max-w-xs leading-snug">Остановиться. Увидеть. Выбрать заново.</p>
        </div>
      </div>
      <div className="px-8 lg:px-16 py-12 lg:py-20 flex flex-col justify-center">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-5">О проекте</span>
        <h2 className="font-serif text-[clamp(1.9rem,3.5vw,2.8rem)] leading-[1.1] text-text-dark mb-8">Зачем мы создали этот кэмп</h2>
        <p className="text-[0.98rem] text-text-dark-soft leading-[1.8] mb-10">{ABOUT_INTRO_1}</p>
        <div className="space-y-6">
          {ABOUT_ITEMS.map((item, i) => (
            <div key={i} className="flex gap-5">
              <div className="font-serif text-3xl text-brown/60 leading-none shrink-0 w-10">{String(i + 1).padStart(2, "0")}</div>
              <p className="text-[0.95rem] text-text-dark-soft leading-[1.7] pt-1">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// VARIANT 4 — lifestyle editorial
const AboutV4 = () => (
  <section className="min-h-screen flex items-center py-16 bg-cream relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 md:px-12">
      <div className="text-center mb-4 text-[0.65rem] uppercase tracking-[0.4em] text-brown/60">Вариант 4 · Журнальный</div>
      <div className="grid lg:grid-cols-[1fr_340px] gap-16 items-start">
        <div>
          <span className="text-[0.68rem] uppercase tracking-[0.35em] text-brown font-medium block mb-8 pb-4 border-b border-brown/20">О проекте · 2026</span>
          <h2 className="font-serif italic text-[clamp(2.2rem,5.5vw,4rem)] leading-[1.05] text-text-dark mb-10 max-w-[18ch]">
            Место, где <span className="not-italic">честность</span> становится опорой.
          </h2>
          <p className="font-serif text-[1.25rem] text-text-dark leading-[1.7] mb-6 max-w-[40rem]">{ABOUT_INTRO_1}</p>
          <p className="text-[1rem] text-text-dark-soft leading-[1.8] mb-12 max-w-[40rem]">{ABOUT_INTRO_2}</p>
          <div>
            {ABOUT_ITEMS.map((item, i) => (
              <div key={i} className="flex gap-8 py-5 border-b border-text-dark/10">
                <div className="font-serif text-brown text-[0.78rem] uppercase tracking-[0.25em] pt-1 shrink-0 w-16">№ {i + 1}</div>
                <p className="font-serif text-[1.05rem] text-text-dark leading-[1.6]">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <aside className="lg:sticky lg:top-28">
          <div className="aspect-[3/4] overflow-hidden rounded-sm bg-navy mb-4">
            <video src={ABOUT_VIDEO} autoPlay muted loop playsInline className="w-full h-full object-cover" />
          </div>
          <p className="font-serif italic text-[0.85rem] text-text-dark-muted leading-snug">Выездной кэмп «Отражение», Красная Поляна.</p>
        </aside>
      </div>
    </div>
  </section>
);

const About = () => (
  <section id="about" className="scroll-mt-20 min-h-screen flex items-center bg-cream relative overflow-hidden py-16">
    <div className="max-w-7xl w-full mx-auto px-6 md:px-12">
      <div className="grid lg:grid-cols-[1fr_440px] gap-10 lg:gap-16 items-center">
        <div>
          <Reveal direction="up" delay={0.05}>
            <span className="text-[0.65rem] uppercase tracking-[0.35em] text-brown font-medium block mb-4 pb-3 border-b border-brown/20">О проекте · 2026</span>
          </Reveal>
          <Reveal direction="up" delay={0.15}>
            <h2 className="font-serif italic text-[clamp(1.8rem,4vw,2.9rem)] leading-[1.15] text-text-dark mb-5 max-w-[16ch]">
              Место, где <span className="not-italic">честность</span><br />становится опорой.
            </h2>
          </Reveal>
          <Reveal direction="up" delay={0.25}>
            <p className="text-[0.92rem] text-text-dark-soft leading-[1.6] mb-6 max-w-[40rem]">{ABOUT_INTRO_2}</p>
          </Reveal>
          <div>
            {ABOUT_ITEMS.map((item, i) => (
              <Reveal key={i} direction="up" delay={0.3 + i * 0.08}>
                <div className="flex gap-6 py-2.5 border-b border-text-dark/10 items-start">
                  <div className="font-serif text-brown text-[1.3rem] leading-none shrink-0 w-10 pt-0.5">№{i + 1}</div>
                  <p className="font-serif text-[0.98rem] text-text-dark leading-[1.5]">{item}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal direction="up" delay={0.5}>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button href="#program" className="w-full sm:w-auto">Посмотреть программу</Button>
              <Button variant="outline-dark" href="#authors" className="w-full sm:w-auto">Познакомиться с авторами</Button>
            </div>
          </Reveal>
        </div>
        <Reveal direction="left" delay={0.2} scale>
          <aside>
            <div
              className="w-full bg-navy overflow-hidden"
              style={{
                aspectRatio: '3/4',
                clipPath: 'polygon(18% 0%, 100% 0%, 100% 82%, 82% 100%, 0% 100%, 0% 18%)',
              }}
            >
              <video
                src="https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/img/topview.MP4"
                autoPlay muted loop playsInline
                className="w-full h-full object-cover scale-[1.04]"
              />
            </div>
            {/* Caption card overlapping video bottom */}
            <div className="-mt-10 relative z-10 mx-4 bg-cream/95 backdrop-blur-sm rounded-xl px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.10)] border border-brown/10">
              <p className="font-serif text-[0.95rem] text-text-dark leading-[1.55]">{ABOUT_INTRO_1}</p>
            </div>
          </aside>
        </Reveal>
      </div>
    </div>
  </section>
);

const Program = () => {
  const [active, setActive] = useState(0);
  const p = PROGRAM[active] as any;
  const isEvening = active === 0;

  return (
    <section id="program" className="scroll-mt-20 py-16 bg-[#f0ece7] relative overflow-hidden">
      <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
        <Reveal direction="up">
          <div className="text-center mb-8">
            <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Программа</span>
            <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark">Три дня трансформации</h2>
            <div className="h-px w-16 bg-brown/30 mx-auto mt-4" />
          </div>
        </Reveal>

        {/* Tabs */}
        <div role="tablist" aria-label="Программа по дням" className="flex justify-center gap-2 mb-8 bg-white/60 p-1.5 rounded-full w-fit mx-auto shadow-sm">
          {PROGRAM.map((day: any, i: number) => (
            <button
              key={i}
              type="button"
              role="tab"
              id={`program-tab-${i}`}
              aria-selected={active === i}
              aria-controls={`program-panel-${i}`}
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
              className={`px-5 py-2.5 rounded-full text-[0.65rem] uppercase tracking-[0.2em] font-bold transition-all whitespace-nowrap ${active === i ? "bg-brown text-white shadow-sm" : "text-text-dark-muted hover:text-text-dark"}`}>
              {i === 0 ? "Вечер" : `День ${i}`}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            role="tabpanel"
            id={`program-panel-${active}`}
            aria-labelledby={`program-tab-${active}`}
            tabIndex={0}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>

            {isEvening ? (
              /* ВЕЧЕР: split — фото слева, контент справа */
              <div className="rounded-3xl overflow-hidden bg-white shadow-sm grid md:grid-cols-2 min-h-[480px]">
                {/* Фото */}
                <div className="relative min-h-[260px] md:min-h-0">
                  <img
                    src="/images/photo_4_2026-04-19_12-01-51.jpg"
                    alt="Глэмпинг Дзен рекавери"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5">
                    <span className="text-[0.62rem] uppercase tracking-[0.2em] text-white/70 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">Программа выезда</span>
                  </div>
                </div>
                {/* Контент */}
                <div className="p-7 md:p-10 flex flex-col justify-center">
                  <h3 className="font-serif text-[clamp(1.8rem,3.5vw,2.4rem)] leading-[1.1] text-text-dark mb-1">
                    <span className="text-brown font-bold">Пятница</span> <span className="font-light">вечер</span>
                  </h3>
                  <p className="text-[1.05rem] text-text-dark-soft font-light mb-6">{p.subtitle}</p>
                  <div className="space-y-2 mb-5">
                    {p.blocks.map((b: any) => (
                      <div key={b.num} className="flex items-center gap-4 py-3 border-b border-brown/10 last:border-0">
                        <span className="font-serif text-[0.72rem] text-brown/40 tabular-nums select-none shrink-0 w-5">{b.num}</span>
                        <span className="text-[0.93rem] text-text-dark">{b.title}</span>
                      </div>
                    ))}
                  </div>
                  {p.closing && (
                    <div className="flex gap-3 items-start bg-brown text-white rounded-2xl px-5 py-4">
                      <span className="text-white/50 text-base leading-none mt-0.5 shrink-0">✦</span>
                      <p className="font-serif italic text-[0.92rem] leading-snug">
                        <span className="font-semibold not-italic">здесь начинается честность,</span>{" "}
                        с которой всё дальше будет разворачиваться
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ДЕНЬ 1 & 2: заголовок + вопросы сверху, блоки в сетке снизу */
              <div>
                {/* Заголовок с вопросами */}
                <div className="rounded-2xl bg-white p-6 md:p-8 mb-4 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                    <h3 className="font-serif text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.1] text-text-dark">
                      <span className="text-brown font-bold">{p.day.split(' ')[0]} {p.day.split(' ')[1]}</span>
                      {' '}<span className="font-light">— {p.subtitle}</span>
                    </h3>
                    {p.theme && (
                      <span className="font-serif italic text-[1.05rem] text-text-dark-muted/60 whitespace-nowrap shrink-0">{p.theme}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.questions.map((q: string, qi: number) => (
                      <span key={qi} className="text-[0.72rem] border border-brown/20 rounded-full px-3 py-1.5 text-text-dark-soft bg-[#f5f1ec]">
                        {String(qi + 1).padStart(2, "0")}&nbsp;&nbsp;{q}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Блоки 2-col grid */}
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-brown/10 bg-white rounded-2xl shadow-sm overflow-hidden">
                  {p.blocks.map((b: any, bi: number) => (
                    <div key={b.num} className={`px-6 py-6 border-brown/10 ${bi >= 2 ? "border-t" : ""}`}>
                      <h4 className="font-serif text-[1rem] text-text-dark leading-snug mb-3">
                        <span className="text-brown font-semibold">{b.num}</span>
                        {' — '}{b.title}
                      </h4>
                      {b.intro && (
                        <p className="text-[0.78rem] text-text-dark-soft mb-2">{b.intro}</p>
                      )}
                      {b.points && b.points.length > 0 && (
                        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                          {b.points.map((pt: string, pi: number) => (
                            <span key={pi} className="flex items-start gap-1.5 text-[0.8rem] text-text-dark-soft leading-snug">
                              <span className="text-brown mt-0.5 shrink-0 font-bold">+</span>
                              {pt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

const Philosophy = () => (
  <section id="philosophy" className="min-h-screen flex items-center py-16 bg-cream relative overflow-hidden">
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 92%)",
        maskImage: "linear-gradient(to top, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 92%)"
      }}
    >
      <svg width="100%" height="100%" className="opacity-20">
        <defs>
          <pattern id="philosophy-diamonds" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <g stroke="#9a7d5a" strokeWidth="0.8" fill="none">
              <path d="M40 8 L72 40 L40 72 L8 40 Z" />
              <path d="M40 28 L52 40 L40 52 L28 40 Z" opacity="0.5" />
            </g>
            <circle cx="40" cy="40" r="1" fill="#9a7d5a" />
            <circle cx="0" cy="0" r="1" fill="#9a7d5a" opacity="0.5" />
            <circle cx="80" cy="0" r="1" fill="#9a7d5a" opacity="0.5" />
            <circle cx="0" cy="80" r="1" fill="#9a7d5a" opacity="0.5" />
            <circle cx="80" cy="80" r="1" fill="#9a7d5a" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#philosophy-diamonds)" />
      </svg>
    </div>
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12 relative">
      <Reveal direction="up" delay={0.05}>
        <div className="mb-10 pb-6 border-b border-brown/20 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <span className="text-[0.68rem] uppercase tracking-[0.35em] text-brown font-medium block mb-3">Философия · принципы</span>
            <h2 className="font-serif italic text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.05] text-text-dark max-w-[18ch]">
              Глубина и <span className="not-italic">структура</span> в одной работе.
            </h2>
          </div>
          <p className="text-[0.9rem] text-text-dark-soft leading-[1.7] max-w-sm">{PHIL_DESC}</p>
        </div>
      </Reveal>
      <div className="grid md:grid-cols-3 gap-10">
        {PHIL_ITEMS.map((it, i) => (
          <Reveal key={it.title} direction="up" delay={0.1 + i * 0.12}>
            <div>
              <div className="font-serif text-[3rem] leading-none text-brown/40 mb-3">0{i + 1}</div>
              <h3 className="font-serif text-[1.5rem] text-text-dark mb-3">{it.title}</h3>
              <p className="text-[0.93rem] text-text-dark-soft leading-[1.7]">{it.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const Authors = ({ onOpenModal }: any) => (
  <section id="authors" className="scroll-mt-20 min-h-screen flex items-center py-10 bg-navy text-white relative overflow-hidden">
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 92%)",
        maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 92%)"
      }}
    >
      <svg width="100%" height="100%" className="opacity-[0.08]">
        <defs>
          <pattern id="authors-diamonds" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <g stroke="#ffffff" strokeWidth="0.6" fill="none">
              <path d="M40 8 L72 40 L40 72 L8 40 Z" />
              <path d="M40 28 L52 40 L40 52 L28 40 Z" opacity="0.5" />
            </g>
            <circle cx="40" cy="40" r="0.8" fill="#ffffff" />
            <circle cx="0" cy="0" r="0.8" fill="#ffffff" opacity="0.5" />
            <circle cx="80" cy="0" r="0.8" fill="#ffffff" opacity="0.5" />
            <circle cx="0" cy="80" r="0.8" fill="#ffffff" opacity="0.5" />
            <circle cx="80" cy="80" r="0.8" fill="#ffffff" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#authors-diamonds)" />
      </svg>
    </div>
    <div className="max-w-7xl w-full mx-auto px-6 md:px-12 relative">
      <Reveal direction="up" delay={0.05}>
        <div className="text-center mb-6">
          <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown-light font-medium block mb-3">Авторы программы</span>
          <h2 className="font-serif text-[clamp(1.8rem,3.8vw,2.8rem)] leading-[1.1] text-white font-light mb-3">
            Программу проводят <span className="font-semibold">Майя и Роман</span>
          </h2>
          <p className="font-serif italic text-[clamp(0.95rem,1.5vw,1.1rem)] text-white/65 leading-[1.55] max-w-2xl mx-auto">
            Дуэт, который соединяет женскую и мужскую перспективу в работе с жизненными сценариями, отношениями и стратегией жизни
          </p>
        </div>
      </Reveal>
      <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-6">
        {AUTHORS.map((a: any, i: number) => (
          <Reveal key={a.name} direction={i === 0 ? "left" : "right"} delay={0.15 + i * 0.1}>
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col h-full group">
              {/* Фото — полное, имя поверх */}
              <div className="relative aspect-[3/2] overflow-hidden shrink-0">
                <img src={a.img} alt={a.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-serif text-[clamp(1.4rem,2.5vw,1.9rem)] leading-[1.05] text-white mb-1.5">{a.name}</h3>
                  <p className="text-brown-light/80 text-[0.72rem] tracking-wide leading-[1.5]">{a.role}</p>
                </div>
              </div>
              {/* Контент */}
              <div className="p-6 md:p-8 flex flex-col gap-5 flex-1">
                <ul className="space-y-2.5 flex-1">
                  {a.points.map((pt: string, j: number) => (
                    <li key={j} className="flex items-start gap-3 text-[0.88rem] text-white/70 leading-[1.6]">
                      <span className="font-serif text-[0.7rem] text-brown-light/50 shrink-0 tabular-nums select-none mt-0.5">{String(j + 1).padStart(2, '0')}</span>
                      {pt}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                  {a.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1.5 rounded-full text-[0.7rem] font-medium bg-brown/20 border border-brown-light/20 text-brown-light tracking-wide">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

    </div>
  </section>
);

const LOC_PHOTOS = {
  main:   null,   // заменено видео — см. ниже
  topR:   "/images/photo_1_2026-04-19_12-01-30.jpg",   // уютный интерьер с зеркалом
  midR:   "/images/photo_5_2026-04-19_12-01-26.jpg",   // купель с людьми и лепестками
  botR:   "/images/photo_1_2026-04-19_12-01-26.jpg",   // пустая купель в лесу
  strip1: "/images/photo_6_2026-04-19_12-01-26.jpg",   // баня — компания
  strip2: "/images/photo_7_2026-04-19_12-01-26.jpg",   // интерьер домика (тёмный)
  strip3: "/images/photo_4_2026-04-19_12-01-45.jpg",   // светлый интерьер — плетёные кресла
  strip4: "/images/photo_4_2026-04-19_12-01-51.jpg",   // терраса, лес, шезлонги
};

const Location = () => (
  <section id="location" className="scroll-mt-20 min-h-screen flex items-center py-12 bg-cream relative overflow-hidden">
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
      <Reveal direction="up" delay={0.05}>
        <div className="mb-6 pb-5 border-b border-brown/20">
          <span className="text-[0.68rem] uppercase tracking-[0.35em] text-brown font-medium block mb-3">Локация</span>
          <h2 className="font-serif italic text-[clamp(1.5rem,3.4vw,2.6rem)] leading-[1.05] text-text-dark">
            Красная Поляна · <span className="not-italic">Глэмпинг «Дзен рекавери»</span>
          </h2>
        </div>
      </Reveal>

      <Reveal direction="up" delay={0.12}>
        <div className="mb-8 grid md:grid-cols-[1fr_1.6fr] gap-8 md:gap-14 items-start">
          <p className="font-serif italic text-[clamp(1.1rem,2.2vw,1.45rem)] leading-[1.4] text-text-dark">
            Горы. Уединение.<br />Пространство, где можно<br className="hidden md:block" /> наконец остановиться.
          </p>
          <div className="flex flex-col gap-4">
            <div className="w-8 h-px bg-brown/30 hidden md:block" />
            <p className="text-[0.93rem] text-text-dark-soft leading-[1.72]">
              Не случайно мы выбрали именно это место. Когда вокруг нет привычного контекста — работы, обязательств, бытовых ролей — именно тогда становится возможным увидеть себя по-другому.
            </p>
          </div>
        </div>
      </Reveal>

      {/* Main grid: большое фото + 3 маленьких справа */}
      <Reveal direction="up" delay={0.2} scale>
        <div className="grid grid-cols-6 grid-rows-2 gap-3 h-[52vh]">
          <div className="col-span-4 row-span-2 rounded-xl overflow-hidden bg-navy relative group">
            <video
              src="https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/img/gamak.MP4"
              autoPlay muted loop playsInline
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/55 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 text-white font-serif italic text-[1.05rem]">Место, где замедляется жизнь</div>
          </div>
          <div className="col-span-2 rounded-xl overflow-hidden group cursor-zoom-in">
            <img src={LOC_PHOTOS.topR} alt="Интерьер домика" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div className="col-span-2 rounded-xl overflow-hidden group cursor-zoom-in">
            <img src={LOC_PHOTOS.botR} alt="Купель в лесу" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
        </div>
      </Reveal>

      {/* Strip: 4 фото в ряд */}
      <Reveal direction="up" delay={0.28}>
        <div className="grid grid-cols-4 gap-3 mt-3 h-[20vh] md:h-[24vh]">
          {[LOC_PHOTOS.strip1, LOC_PHOTOS.strip2, LOC_PHOTOS.strip3, LOC_PHOTOS.strip4].map((src, i) => (
            <div key={i} className="rounded-xl overflow-hidden group cursor-zoom-in">
              <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal direction="up" delay={0.35}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-6 pt-5 border-t border-brown/15">
          {LOC_FEATURES.map((f) => (
            <div key={f.title} className="flex items-center gap-3 group">
              <f.icon size={20} className="text-brown shrink-0 transition-transform group-hover:scale-110" />
              <span className="text-[0.88rem] text-text-dark-soft font-medium leading-tight">{f.title}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

const CaseCard = ({ c, active }: { c: any; active: boolean }) => (
  <div className={`flex-shrink-0 w-[85vw] sm:w-[75vw] lg:w-[860px] grid lg:grid-cols-2 gap-6 bg-white rounded-[1.5rem] p-6 md:p-8 shadow-sm border transition-all duration-500 ${active ? "border-brown/20 shadow-[0_8px_40px_rgba(154,125,90,0.12)]" : "border-brown/8 opacity-60 scale-[0.97]"}`}>
    <div>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-brown/10 shrink-0">
          {c.img
            ? <img src={c.img} alt={c.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            : <span className="w-full h-full flex items-center justify-center font-serif text-brown text-2xl">{c.name[0]}</span>}
        </div>
        <div>
          <h3 className="font-serif text-[1.35rem] text-text-dark leading-tight">{c.name}</h3>
          <p className="text-text-dark-muted text-[0.72rem] mt-0.5 leading-tight">{c.role}</p>
        </div>
      </div>

      <div className="mb-4">
        <span className="text-[0.58rem] uppercase tracking-[0.2em] font-bold text-text-dark-muted mb-2 block">До участия</span>
        <ul className="space-y-1.5">
          {c.before.map((x: string, j: number) => (
            <li key={j} className="flex gap-2 text-[0.85rem] text-text-dark-soft leading-[1.5]">
              <span className="text-brown/50 shrink-0">—</span>{x}
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 rounded-xl bg-brown/6">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="text-[0.58rem] uppercase tracking-[0.2em] font-bold text-brown">После этого</span>
          {c.author && <span className="text-[0.58rem] text-text-dark-muted">· результат работы с {c.author}</span>}
        </div>
        <ul className="space-y-1.5">
          {c.after.map((x: string, j: number) => (
            <li key={j} className="flex gap-2 text-[0.85rem] text-text-dark leading-[1.5] font-medium">
              <CheckCircle size={13} className="shrink-0 mt-0.5 text-brown" />{x}
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="bg-navy text-white p-6 md:p-7 rounded-[1.25rem] relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-24 h-24 bg-brown/15 rounded-full blur-3xl" />
      <div>
        <Quote className="text-brown mb-3 opacity-70" size={28} />
        <p className="font-serif italic text-[0.98rem] md:text-[1.08rem] leading-[1.5] mb-4">«{c.resText}»</p>
      </div>
      <div className="flex items-center gap-3 pt-3 border-t border-white/10">
        <div className="h-px w-8 bg-brown" />
        <span className="text-[0.6rem] uppercase tracking-[0.18em] text-brown-light font-bold">{c.resLabel}</span>
      </div>
    </div>
  </div>
);

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatCases = CASES.flat();
  const trackRef = useRef<HTMLDivElement>(null);

  const go = (idx: number) => {
    const clamped = (idx + flatCases.length) % flatCases.length;
    setCurrentIndex(clamped);
    if (trackRef.current) {
      const card = trackRef.current.children[clamped] as HTMLElement;
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(currentIndex - 1);
      if (e.key === "ArrowRight") go(currentIndex + 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  // sync currentIndex when user scrolls manually
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const cardWidth = (track.children[0] as HTMLElement)?.offsetWidth ?? 0;
      const gap = 24;
      const idx = Math.round(track.scrollLeft / (cardWidth + gap));
      setCurrentIndex(Math.min(idx, flatCases.length - 1));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="testimonials" className="scroll-mt-20 py-12 md:py-16 bg-cream relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 92%)",
          maskImage: "linear-gradient(to top, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 92%)"
        }}
      >
        <svg width="100%" height="100%" className="opacity-25">
          <defs>
            <pattern id="cases-waves" x="0" y="0" width="140" height="140" patternUnits="userSpaceOnUse">
              <g stroke="#9a7d5a" strokeWidth="1" strokeLinecap="round" fill="none">
                <path d="M0 70 C 25 45, 45 95, 70 70 S 115 45, 140 70" />
                <path d="M0 115 C 25 90, 45 140, 70 115 S 115 90, 140 115" opacity="0.6" />
              </g>
              <circle cx="70" cy="70" r="1.5" fill="#9a7d5a" />
              <circle cx="0" cy="115" r="1.5" fill="#9a7d5a" />
              <circle cx="140" cy="115" r="1.5" fill="#9a7d5a" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cases-waves)" />
        </svg>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative">
        <Reveal direction="up">
          <div className="text-center mb-7">
            <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Кейсы</span>
            <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark">Истории трансформации</h2>
            <div className="h-px w-16 bg-brown/30 mx-auto mt-4" />
          </div>
        </Reveal>
      </div>

      {/* Peek scroll track — overflows container on both sides, left padding aligns first card */}
      <div
        ref={trackRef}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 px-6 md:px-12"
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          paddingRight: "calc(15vw - 24px)",
        }}
      >
        <style>{`.cases-track::-webkit-scrollbar { display: none; }`}</style>
        {flatCases.map((c, i) => (
          <div key={i} className="snap-start flex-shrink-0 cursor-pointer" onClick={() => go(i)}>
            <CaseCard c={c} active={i === currentIndex} />
          </div>
        ))}
        {/* ghost spacer so last card isn't flush right */}
        <div className="flex-shrink-0 w-[15vw] min-w-[40px]" aria-hidden />
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative">
        <div className="flex items-center justify-center gap-6 mt-6">
          <motion.button
            onClick={() => go(currentIndex - 1)}
            aria-label="Предыдущий кейс"
            whileHover={{ scale: 1.08, backgroundColor: "#9a7d5a", color: "#fff" }}
            whileTap={{ scale: 0.93 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-14 h-14 rounded-full border-2 border-brown/35 bg-white text-brown shadow-[0_4px_16px_rgba(154,125,90,0.12)] flex items-center justify-center"
            style={{ color: "#9a7d5a" }}
          >
            <ChevronLeft size={22} strokeWidth={1.8} />
          </motion.button>

          <div className="flex items-center gap-2">
            {flatCases.map((_, j) => (
              <motion.button
                key={j}
                onClick={() => go(j)}
                aria-label={`Кейс ${j + 1}`}
                animate={{ width: currentIndex === j ? 28 : 8, backgroundColor: currentIndex === j ? "#9a7d5a" : "rgba(154,125,90,0.25)" }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="h-2 rounded-full"
              />
            ))}
          </div>

          <motion.button
            onClick={() => go(currentIndex + 1)}
            aria-label="Следующий кейс"
            whileHover={{ scale: 1.08, backgroundColor: "#9a7d5a", color: "#fff" }}
            whileTap={{ scale: 0.93 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-14 h-14 rounded-full border-2 border-brown/35 bg-white text-brown shadow-[0_4px_16px_rgba(154,125,90,0.12)] flex items-center justify-center"
            style={{ color: "#9a7d5a" }}
          >
            <ChevronRight size={22} strokeWidth={1.8} />
          </motion.button>
        </div>
      </div>
    </section>
  );
};


const LeadMagnet = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play(); setPlaying(true); }
  };

  const handleTimeUpdate = () => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    setCurrentTime(a.currentTime);
    setProgress((a.currentTime / a.duration) * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    a.currentTime = ratio * a.duration;
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
  <section className="min-h-screen flex items-center py-12 bg-cream relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none opacity-40">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-brown/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-navy/5 rounded-full blur-[110px]" />
    </div>
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12 relative z-10">
      <Reveal direction="up" delay={0.1} scale>
      <div className="bg-[#fdfbf9] rounded-[2rem] shadow-xl overflow-hidden border border-brown/10">
        <div className="grid lg:grid-cols-12">
          <div className="lg:col-span-5 relative min-h-[360px] lg:min-h-[520px] bg-navy overflow-hidden flex flex-col justify-end p-8 md:p-10">
            <video src={LM_VIDEO} muted loop autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510]/95 via-[#1a1510]/50 to-transparent" />
            <div className="relative z-10">
              <p className="font-serif italic text-[1.25rem] md:text-[1.4rem] text-white leading-snug mb-5 font-light">
                «Она задаёт вопросы, от которых невозможно отвернуться»
              </p>
              {/* Audio player */}
              <audio
                ref={audioRef}
                src={LM_VIDEO}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                onEnded={() => { setPlaying(false); setProgress(0); setCurrentTime(0); }}
              />
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/15">
                <div className="flex items-center gap-4 mb-3">
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-brown flex items-center justify-center shrink-0 hover:bg-brown-dark transition-colors shadow-lg"
                    aria-label={playing ? 'Пауза' : 'Воспроизвести'}
                  >
                    {playing
                      ? <Pause size={20} className="text-white" />
                      : <Play size={20} className="text-white ml-0.5" />
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[0.75rem] font-medium mb-0.5 truncate">10 минут честности с собой</p>
                    <p className="text-white/50 text-[0.65rem]">{fmt(currentTime)} / {duration ? fmt(duration) : '—:——'}</p>
                  </div>
                  {playing && <Volume2 size={16} className="text-brown-light shrink-0 animate-pulse" />}
                </div>
                {/* Progress bar */}
                <div
                  className="h-1.5 bg-white/20 rounded-full cursor-pointer"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full bg-brown rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <p className="text-white/60 text-[0.72rem] mt-3 tracking-wide">Нажмите Play — и начните прямо сейчас</p>
            </div>
          </div>
          <div className="lg:col-span-7 p-8 md:p-10 lg:p-12 flex flex-col justify-center">
            <h3 className="text-[1rem] md:text-[1.15rem] text-text-dark mb-2 font-serif leading-snug">
              Ты уже пробовал менять жизнь.<br />Но результат возвращается.
            </h3>
            <h2 className="font-serif text-[clamp(1.8rem,3.5vw,2.6rem)] leading-[1.1] text-text-dark mb-6">
              10 минут, <span className="italic text-brown">которые покажут почему</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-brown font-medium mb-3 text-[0.85rem] uppercase tracking-[0.15em]">Если ты</p>
                <ul className="space-y-2">
                  {LM_IFS.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-text-dark-soft text-[0.88rem] leading-[1.55]"><span className="text-brown mt-0.5">—</span>{t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-brown font-medium mb-3 text-[0.85rem] uppercase tracking-[0.15em]">После этого</p>
                <ul className="space-y-2">
                  {LM_RES.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-text-dark-soft text-[0.88rem] leading-[1.55]"><div className="w-1.5 h-1.5 rounded-full bg-brown/60 mt-2 shrink-0" />{t}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-5 border-t border-brown/10">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-[#fdfbf9] bg-cream overflow-hidden">
                      <img src={`https://picsum.photos/seed/user${i + 20}/80/80`} alt="" aria-hidden="true" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <span className="text-[0.72rem] text-text-dark-muted leading-tight"><span className="font-bold text-text-dark">1200+ человек</span> уже прошли</span>
              </div>
              <a href="https://t.me/otrageniecamp_bot" target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("leadmagnet_click")} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brown text-white hover:bg-brown-dark transition">
                <span className="font-medium text-[0.82rem]">Послушать и понять себя</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
      </Reveal>
    </div>
  </section>
  );
};

const PricingTable = () => {
  const features = [
    { name: "Участие в 2-дневной программе", base: true, full: true, premium: true },
    { name: "Групповые разборы и практики", base: true, full: true, premium: true },
    { name: "Проживание в глэмпинге", base: "2-местное", full: "2-местное", premium: "1-местное" },
    { name: "Банный ритуал", base: true, full: true, premium: true },
    { name: "Материалы программы", base: "Базовые", full: "Расширенные", premium: "Расширенные" },
    { name: "Групповой трансфер", base: false, full: true, premium: true },
    { name: "Поддержка после выезда", base: false, full: "Групповая встреча", premium: "Приоритетная" },
    { name: "Личный разбор с авторами", base: false, full: false, premium: true },
  ];

  const renderValue = (val: any, isPremium = false) => {
    if (typeof val === 'boolean') {
      return val ? (
        <CheckCircle className={isPremium ? "text-brown-light mx-auto" : "text-brown mx-auto"} size={20} />
      ) : (
        <X className="text-text-dark/10 mx-auto" size={20} />
      );
    }
    return <span className="text-[0.75rem] font-medium uppercase tracking-wider">{val}</span>;
  };

  return (
    <div className="mt-24 overflow-x-auto">
      <table className="w-full border-collapse min-w-[600px]">
        <thead>
          <tr className="border-b border-brown/10">
            <th className="py-8 px-6 text-left font-serif text-xl text-text-dark w-1/3">Сравнение тарифов</th>
            <th className="py-8 px-6 text-center font-serif text-lg text-text-dark">База</th>
            <th className="py-8 px-6 text-center font-serif text-lg text-text-dark">Полный</th>
            <th className="py-8 px-6 text-center font-serif text-lg text-brown bg-brown/5 rounded-t-3xl">Премиум</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feat, i) => (
            <tr 
              key={i} 
              className="border-b border-brown/5 transition-all duration-300 hover:bg-white hover:shadow-md hover:z-10 relative group"
            >
              <td className="py-6 px-6 text-sm text-text-dark-soft group-hover:text-text-dark transition-colors">{feat.name}</td>
              <td className="py-6 px-6 text-center group-hover:scale-110 transition-transform duration-300">{renderValue(feat.base)}</td>
              <td className="py-6 px-6 text-center group-hover:scale-110 transition-transform duration-300">{renderValue(feat.full)}</td>
              <td className="py-6 px-6 text-center bg-brown/5 group-hover:bg-brown/10 group-hover:scale-110 transition-all duration-300">{renderValue(feat.premium, true)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Pricing = ({ onOpenModal }: any) => {
  const getFeatIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('программе')) return <Calendar size={14} />;
    if (t.includes('групповую')) return <Users size={14} />;
    if (t.includes('проживание') || t.includes('размещение')) return <Home size={14} />;
    if (t.includes('банный')) return <Coffee size={14} />;
    if (t.includes('материалы')) return <Info size={14} />;
    if (t.includes('трансфер')) return <Bus size={14} />;
    if (t.includes('онлайн')) return <Video size={14} />;
    if (t.includes('место')) return <Star size={14} />;
    if (t.includes('рекомендации')) return <Target size={14} />;
    if (t.includes('разбор')) return <Zap size={14} />;
    return <CheckCircle size={14} />;
  };

  return (
    <section id="pricing" className="scroll-mt-20 min-h-screen flex items-center py-12 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <path d="M0 1000 L200 800 L400 900 L600 700 L800 850 L1000 600 L1000 1000 Z" fill="currentColor" className="text-brown" />
          <path d="M0 1000 L150 700 L350 850 L550 600 L750 800 L1000 500 L1000 1000 Z" fill="currentColor" className="text-brown" opacity="0.5" />
        </svg>
      </div>
      <div className="max-w-7xl w-full mx-auto px-6 md:px-12 relative z-10">
        <Reveal direction="up">
        <div className="text-center mb-6">
          <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Стоимость</span>
          <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark">Тарифы</h2>
          <div className="h-px w-16 bg-brown/30 mx-auto mt-4" />
        </div>
        </Reveal>
        <Reveal direction="up" delay={0.1}>
        <div className="text-center mb-10 max-w-xl mx-auto bg-brown/5 rounded-2xl px-8 py-5">
          <p className="text-[1rem] font-serif font-semibold text-text-dark mb-1">В группе всего 10 мест</p>
          <p className="text-[0.9rem] text-text-dark-soft leading-[1.6]">Это не потоковый формат и не обучение, а работа, где каждый участник проходит через личный разбор.</p>
        </div>
        </Reveal>
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">
          {PRICING.map((plan, i) => {
            const featured = plan.theme === "full";
            return (
              <Reveal key={i} direction="up" delay={i * 0.12} scale>
              <div key={i} className={`relative flex flex-col rounded-[1.5rem] p-7 md:p-8 transition-all duration-500 group ${featured ? "bg-navy text-white shadow-2xl lg:scale-[1.04] z-10 border border-brown/20" : "bg-[#fdfbf9] border border-brown/10 hover:border-brown/30 hover:shadow-lg hover:-translate-y-1"}`}>
                {featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brown text-white text-[0.58rem] px-4 py-1 rounded-full uppercase tracking-[0.22em] font-bold shadow">
                    Рекомендуем
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-serif text-[1.7rem] mb-1.5">{plan.name}</h3>
                  <p className={`text-[0.82rem] leading-[1.55] ${featured ? "text-white/60" : "text-text-dark-soft"}`}>{plan.desc}</p>
                </div>
                <div className="mb-5 flex items-baseline gap-1.5">
                  <span className="font-serif text-[2.2rem] md:text-[2.6rem] text-brown-light leading-none">{plan.price.split(" ")[0]}</span>
                  <span className={`text-sm font-serif ${featured ? "text-white/40" : "text-text-dark-muted"}`}>{plan.price.split(" ").slice(1).join(" ")}</span>
                </div>
                <ul className="flex-1 space-y-3 mb-6">
                  {plan.feats.map((f: any, j: number) => (
                    <li key={j} className="flex gap-3 items-start">
                      <div className={`mt-0.5 shrink-0 ${featured ? "text-brown-light" : "text-brown"}`}>{getFeatIcon(f.title)}</div>
                      <p className={`text-[0.85rem] leading-snug ${featured ? "text-white/85" : "text-text-dark"}`}>
                        {f.title}
                        {f.desc && <span className={`block text-[0.72rem] mt-0.5 ${featured ? "text-white/50" : "text-text-dark-muted"}`}>{f.desc}</span>}
                      </p>
                    </li>
                  ))}
                </ul>
                {plan.note && <p className={`text-[0.65rem] italic mb-4 leading-tight ${featured ? "text-brown-light" : "text-text-dark-muted"}`}>{plan.note}</p>}
                <Button
                  variant={featured ? "brown" : "outline-dark"}
                  className="w-full"
                  onClick={() => onOpenModal(plan)}
                >
                  Забронировать
                </Button>
              </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="min-h-screen flex items-center py-12 bg-cream relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 92%)",
          maskImage: "linear-gradient(to top, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 92%)"
        }}
      >
        <svg width="100%" height="100%" className="opacity-[0.12]">
          <defs>
            <pattern id="faq-marks" x="0" y="0" width="110" height="110" patternUnits="userSpaceOnUse">
              <g fill="none" stroke="#9a7d5a" strokeWidth="0.8" strokeLinecap="round">
                <path d="M40 38 q0 -14 14 -14 q14 0 14 14 q0 10 -14 16 v10" />
                <circle cx="54" cy="74" r="1.3" fill="#9a7d5a" stroke="none" />
              </g>
              <g stroke="#9a7d5a" strokeWidth="0.4" opacity="0.4">
                <line x1="0" y1="92" x2="22" y2="92" />
                <line x1="88" y1="14" x2="110" y2="14" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#faq-marks)" />
        </svg>
      </div>
      <div className="max-w-3xl w-full mx-auto px-6 md:px-12 relative z-10">
        <Reveal direction="up">
          <div className="text-center mb-8">
            <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Вопросы</span>
            <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark">Часто спрашивают</h2>
            <div className="h-px w-16 bg-brown/30 mx-auto mt-4" />
          </div>
        </Reveal>
        <div className="space-y-3">
          {FAQ_ITEMS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={i} direction="up" delay={i * 0.06}>
              <div className={`rounded-2xl border transition-all ${isOpen ? "bg-white border-brown/30 shadow-md" : "bg-white/70 border-brown/10 hover:border-brown/20"}`}>
                <button onClick={() => setOpen(isOpen ? null : i)} className="w-full px-6 py-5 flex justify-between items-center text-left gap-4">
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif text-brown/50 text-[0.85rem]">0{i + 1}</span>
                    <span className="font-serif text-[1.05rem] text-text-dark leading-snug">{f.q}</span>
                  </div>
                  <ChevronDown size={18} className={`text-text-dark-muted shrink-0 transition-transform ${isOpen ? "rotate-180 text-brown" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-6 pb-5 pl-14 text-text-dark-soft text-[0.9rem] leading-[1.7]">{f.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const Pains = () => (
  <section id="pains" className="scroll-mt-20 py-24 md:py-36 bg-[#0b1130] relative overflow-hidden">
    {/* Ambient background glows */}
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-brown/8 rounded-full blur-[120px] pointer-events-none" />
    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-brown/5 rounded-full blur-[100px] pointer-events-none" />

    <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
      {/* Header */}
      <Reveal direction="up">
        <div className="text-center mb-4">
          <span className="text-[0.65rem] uppercase tracking-[0.25em] text-brown font-bold">Почему это происходит</span>
        </div>
        <h2 className="font-serif text-4xl md:text-6xl text-white text-center leading-tight mb-4">
          Почему вы здесь?
        </h2>
        <p className="text-center text-white/40 text-lg mb-16 md:mb-20">Узнаёте себя?</p>
      </Reveal>

      {/* Pain items */}
      <div className="space-y-0 mb-16 md:mb-24">
        {PAINS.map((pain, i) => (
          <Reveal key={i} delay={i * 0.12} direction="up">
            <div className="group flex gap-5 md:gap-8 items-start py-7 md:py-8 border-b border-white/8 hover:border-brown/30 transition-all duration-500">
              {/* Number */}
              <span
                className="font-serif text-5xl md:text-7xl leading-none text-white/8 group-hover:text-brown/25 transition-colors duration-500 shrink-0 select-none"
                style={{ fontVariantNumeric: "oldstyle-nums" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {/* Text */}
              <div className="flex-1 pt-2 md:pt-3">
                <p className="font-serif text-xl md:text-3xl text-white/80 group-hover:text-white leading-snug transition-colors duration-500">
                  {pain}
                </p>
              </div>
              {/* Accent dot */}
              <div className="shrink-0 pt-4 md:pt-5">
                <div className="w-1.5 h-1.5 rounded-full bg-brown/30 group-hover:bg-brown transition-colors duration-500" />
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Quote block with walk.MP4 as background */}
      <Reveal direction="up" delay={0.5}>
        <div className="relative max-w-3xl mx-auto overflow-hidden">
          <video
            src="https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otraghenie-camp.ru/img/walk.MP4"
            autoPlay muted playsInline
            className="w-full object-cover block max-h-[60vh]"
          />
          <div className="absolute inset-0 bg-[#0b1130]/65" />
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-brown/40" />
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 py-10 md:py-12">
            <Quote className="text-brown/40 mb-6" size={36} />
            <p className="font-serif text-xl md:text-2xl italic text-white/70 leading-relaxed mb-8">
              «Когда работа, деньги и даже отдых перестают приносить радость, проблема не в них. Проблема в системе, из которой вы действуете».
            </p>
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-8 bg-brown/60" />
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-brown font-bold">Майя Дзодзатти</span>
            </div>
          </div>
        </div>
      </Reveal>

    </div>
  </section>
);

const WHEN_PAINS = [
  "постоянное фоновое напряжение, которое не проходит даже на отдыхе",
  "усталость от роли успешного человека, который держит всё на себе",
  "отношения становятся всё формальнее",
  "ощущение, что жизнь идёт не туда",
];

const WhenYouNeedCamp = () => (
  <section id="when" className="scroll-mt-20 bg-cream relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">

        {/* Левая колонка — текст */}
        <div className="flex flex-col">
          <Reveal direction="left" delay={0.05}>
            <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-4">О проекте · 2026</span>
            <h2 className="font-serif italic text-[clamp(1.8rem,4vw,3rem)] leading-[1.1] text-text-dark mb-6">
              Когда вы понимаете,<br />что нужен кэмп
            </h2>
            <p className="text-[1rem] text-text-dark-soft leading-[1.7] mb-8">Ты можешь ощущать это по-разному:</p>
          </Reveal>
          <div className="space-y-0 mb-8 flex-1">
            {WHEN_PAINS.map((item, i) => (
              <Reveal key={i} direction="left" delay={0.12 + i * 0.07}>
                <div className="flex items-start gap-4 py-4 border-b border-brown/15">
                  <span className="text-brown/50 font-serif text-[0.75rem] shrink-0 mt-1 leading-none font-bold">№ {i + 1}</span>
                  <p className="text-[1rem] text-text-dark leading-[1.65]">{item}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal direction="left" delay={0.5}>
            <p className="text-[0.93rem] text-text-dark-soft leading-[1.7] mb-5">
              Когда работа, перегрузка и внутренняя усталость начали разрушать отношения и контакт с собой.
            </p>
            <div className="pt-6 border-t border-brown/20">
              <p className="font-serif italic text-[1.1rem] text-text-dark leading-[1.7]">
                Если вы узнаёте себя — значит, вы уже понимаете: что-то нужно менять. Вопрос только в том, с чего начать.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Правая колонка — видео с наложением */}
        <Reveal direction="right" delay={0.15} className="h-full">
          <div className="relative rounded-[1.5rem] overflow-hidden shadow-[0_24px_60px_rgba(58,39,20,0.18)] h-full min-h-[480px]">
            <video
              src="https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/img/veranda.MP4"
              autoPlay muted loop playsInline
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.82) 0%, rgba(15,23,42,0.15) 55%, transparent 100%)' }} />
            <div className="absolute bottom-0 left-0 right-0 p-7 md:p-10">
              <Quote className="text-white/30 mb-4" size={24} />
              <p className="font-serif italic text-[clamp(0.95rem,1.8vw,1.15rem)] text-white leading-[1.6] mb-5">
                «Когда работа, деньги и даже отдых перестают приносить радость — проблема не в них. Проблема в системе, из которой вы действуете».
              </p>
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-brown-light/60" />
                <span className="text-[0.6rem] uppercase tracking-[0.22em] text-brown-light font-bold">Майя Дзодзатти</span>
              </div>
            </div>
          </div>
        </Reveal>

      </div>
    </div>
  </section>
);

const SYSTEM_BGS = [
  "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/maya2.jpg",
  "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/maya3.jpg",
];

const SystemProblem = () => {
  const notItems = ["в тебе", "в отношениях", "в работе", "в усталости"];
  return (
    <section className="bg-[#0c1220] text-white relative overflow-hidden">
      {/* subtle grain texture */}
      <div aria-hidden className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "180px 180px" }} />
      {/* warm glow bottom-right */}
      <div aria-hidden className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#7d5c3a]/12 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-[1fr_1px_1fr] gap-0 items-stretch min-h-[80vh]">

        {/* Left — the "NOT" list */}
        <div className="py-20 md:py-28 lg:pr-16 flex flex-col justify-center">
          <Reveal direction="left" delay={0.1}>
            <p className="text-white/40 text-[0.82rem] uppercase tracking-[0.2em] font-medium mb-6">Проблема не</p>
          </Reveal>
          <div className="space-y-0 mb-10">
            {notItems.map((item, i) => (
              <Reveal key={i} direction="left" delay={0.15 + i * 0.08}>
                <div className="flex items-baseline gap-5 py-4 border-b border-white/6 group">
                  <span className="text-[0.62rem] text-white/20 font-mono shrink-0 w-5 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-serif text-[clamp(1.6rem,3.5vw,2.4rem)] leading-[1.1] text-white/30 relative">
                    {item}
                    <span className="absolute left-0 right-0 top-1/2 h-[1.5px] bg-white/20" aria-hidden />
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal direction="left" delay={0.55}>
            <p className="text-white/45 text-[0.9rem] leading-[1.8] max-w-[42ch]">
              Можно менять работу, партнёров, города, решения — и возвращаться в ту же точку. Потому что сценарий остаётся прежним.
            </p>
          </Reveal>
        </div>

        {/* Divider */}
        <div aria-hidden className="hidden lg:block bg-white/6" />

        {/* Right — the reveal */}
        <div className="lg:pl-16 py-20 md:py-28 flex flex-col justify-center relative">
          {/* video inset */}
          <div className="absolute inset-0 lg:inset-y-8 lg:right-0 overflow-hidden lg:rounded-r-none opacity-15 pointer-events-none">
            <video src="https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/img/walk.MP4" autoPlay muted playsInline className="w-full h-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c1220] via-[#0c1220]/60 to-transparent" />
          </div>
          <div className="relative z-10">
            <Reveal direction="right" delay={0.2}>
              <p className="text-[0.62rem] tracking-[0.35em] uppercase text-[#9a7d5a] font-medium mb-8">Проблема</p>
            </Reveal>
            <Reveal direction="right" delay={0.3}>
              <h2 className="font-serif text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.08] text-white font-light mb-8">
                в системе,<br />
                <em className="not-italic text-[#c4a882]">из которой<br />ты живёшь</em>
              </h2>
            </Reveal>
            <Reveal direction="right" delay={0.45}>
              <div className="h-px w-12 bg-[#9a7d5a]/50 mb-8" />
              <p className="text-white/55 text-[0.9rem] leading-[1.85] max-w-[40ch] mb-10">
                Этот кэмп — про то, чтобы увидеть и изменить именно его.
              </p>
            </Reveal>
            <Reveal direction="right" delay={0.55}>
              <div className="inline-flex items-center gap-3 text-[0.75rem] text-[#9a7d5a] tracking-[0.12em] uppercase">
                <div className="w-8 h-px bg-[#9a7d5a]" />
                глубинная работа со сценарием
              </div>
            </Reveal>
          </div>
        </div>

      </div>
    </section>
  );
};


const WhatHappens = () => (
  <section className="py-16 md:py-24 bg-cream relative overflow-hidden">
    <div className="max-w-7xl w-full mx-auto px-6 md:px-12">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Видео слева */}
        <Reveal direction="left" delay={0.1} scale>
          <div className="relative">
            <div className="rounded-[2rem] overflow-hidden aspect-[4/5] relative shadow-[0_24px_60px_rgba(58,39,20,0.18)]">
              <video src={WHAT_HAPPENS_VIDEO} autoPlay muted loop playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-navy/50 via-transparent to-navy/40" />
              <div className="absolute top-0 left-0 right-0 p-8 md:p-10">
                <span className="text-[0.62rem] uppercase tracking-[0.28em] text-white/60 font-medium block mb-3">Процесс</span>
                <h2 className="font-serif text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.1] text-white font-light">Что происходит<br />на кэмпе</h2>
                <div className="h-px w-14 bg-white/40 mt-4" />
              </div>
            </div>
            <div className="hidden md:block absolute -bottom-6 -right-6 max-w-[260px] bg-brown text-white px-6 py-5 rounded-2xl shadow-xl">
              <Quote className="text-white/25 mb-2" size={20} />
              <p className="font-serif italic text-[0.92rem] leading-snug">
                «Это не просто отдых. Это глубокая <span className="not-italic font-semibold">хирургическая работа</span> с вашей реальностью».
              </p>
            </div>
          </div>
        </Reveal>

        {/* Текст справа */}
        <div>
          <Reveal direction="right" delay={0.15}>
            <h2 className="font-serif text-[clamp(1.8rem,3.5vw,2.6rem)] leading-[1.1] text-text-dark mb-6">
              Что происходит<br />на кэмпе
            </h2>
            <p className="text-[1rem] text-text-dark-soft leading-[1.75] mb-4">
              Это пространство, где ты больше не можешь не видеть правду. Не длительная терапия и не процесс «когда-нибудь станет лучше».
            </p>
            <p className="text-[1rem] text-text-dark-soft leading-[1.75] mb-8">
              <span className="text-brown font-medium">Концентрированная работа</span>, в которой за два дня становится видно то, что в обычной жизни остаётся незамеченным годами.
            </p>
          </Reveal>
          <Reveal direction="right" delay={0.25}>
            <p className="text-[0.72rem] uppercase tracking-[0.25em] text-brown/60 font-medium mb-4">За 2 дня ты:</p>
            <div className="space-y-3">
              {WHAT_HAPPENS.map((item, i) => (
                <div key={i} className="flex items-start gap-4 py-3 border-b border-brown/10 last:border-0">
                  <span className="font-serif text-[1.5rem] leading-none text-brown/25 shrink-0 select-none tabular-nums min-w-[2rem] text-right pt-1">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-[0.97rem] text-text-dark leading-[1.6] pt-2">
                    {item.text} <span className="font-semibold text-brown">{item.bold}</span>
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  </section>
);

const HowItWorks = () => {
  const icons: any = { Eye, RefreshCw, Zap, Compass };

  return (
    <section className="min-h-screen flex items-center py-12 bg-cream relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 92%)",
          maskImage: "linear-gradient(to top, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 92%)"
        }}
      >
        <svg width="100%" height="100%" className="opacity-[0.12]">
          <defs>
            <pattern id="methodology-rings" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <g stroke="#9a7d5a" strokeWidth="0.6" fill="none">
                <circle cx="50" cy="50" r="32" />
                <circle cx="50" cy="50" r="20" opacity="0.7" />
                <circle cx="50" cy="50" r="10" opacity="0.5" />
              </g>
              <circle cx="50" cy="50" r="1.2" fill="#9a7d5a" />
              <line x1="50" y1="0" x2="50" y2="100" stroke="#9a7d5a" strokeWidth="0.3" opacity="0.25" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#9a7d5a" strokeWidth="0.3" opacity="0.25" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#methodology-rings)" />
        </svg>
      </div>

      <div className="max-w-7xl w-full mx-auto px-6 md:px-12 relative z-10">
        <Reveal direction="up">
          <div className="text-center mb-8">
            <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Как проходит работа</span>
            <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark">Инструменты отражения</h2>
            <p className="text-[0.95rem] text-text-dark-soft mt-3 max-w-xl mx-auto">Не лекции. Не теория. Живая работа с вашей реальной ситуацией.</p>
            <div className="h-px w-16 bg-brown/30 mx-auto mt-4" />
          </div>
        </Reveal>

        <div className="max-w-2xl mx-auto">
          <div className="space-y-4">
            {PROCESS.map((item, i) => {
              const Icon = icons[item.icon] || HelpCircle;
              return (
                <Reveal key={i} direction="up" delay={0.08 + i * 0.07}>
                  <div className="flex items-center gap-5 px-6 py-5 rounded-2xl bg-white border border-brown/10 group hover:border-brown/30 hover:shadow-sm transition-all duration-300">
                    <span className="font-serif text-[1.4rem] text-brown/20 leading-none w-7 shrink-0 text-right select-none">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="w-px h-7 bg-brown/15 shrink-0" />
                    <p className="text-[0.97rem] text-text-dark leading-snug">
                      <span className="font-semibold text-brown">{item.bold}</span>{' '}
                      <span className="text-text-dark-soft">{item.rest}</span>
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Reveal direction="up" delay={0.5}>
            <div className="mt-6 flex items-start gap-4 px-6 py-5 rounded-2xl bg-brown/8 border border-brown/15">
              <Users size={18} className="text-brown shrink-0 mt-0.5" />
              <p className="text-[0.88rem] text-text-dark-soft leading-[1.65]">
                Работа проходит в малой группе, всего <span className="font-semibold text-text-dark">10 человек</span>, чтобы у каждого участника было время, внимание и возможность получить личный разбор своей ситуации.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

const ForWho = () => (
  <section id="for-who" className="scroll-mt-20 bg-[#f3ede4] relative overflow-hidden">
    {/* Фоновая сетка — еле заметная редакционная текстура */}
    <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{ backgroundImage: 'repeating-linear-gradient(0deg, #9a7d5a 0px, #9a7d5a 1px, transparent 1px, transparent 80px), repeating-linear-gradient(90deg, #9a7d5a 0px, #9a7d5a 1px, transparent 1px, transparent 80px)' }} />

    <div className="max-w-7xl mx-auto px-6 md:px-12">

      {/* Шапка с вводным текстом */}
      <div className="pt-20 md:pt-28 pb-14 md:pb-20 grid lg:grid-cols-[1fr_1.6fr] gap-10 lg:gap-20 items-end">
        <Reveal direction="up" delay={0.05}>
          <span className="text-[0.6rem] uppercase tracking-[0.38em] text-brown font-medium block mb-6">Для кого · 11 экран</span>
          <h2 className="font-serif text-[clamp(2.8rem,6vw,5rem)] leading-[0.95] text-[#0b1130] font-light">
            Кому это<br /><em className="italic">нужно сейчас</em>
          </h2>
        </Reveal>
        <Reveal direction="up" delay={0.15}>
          <p className="font-serif italic text-[clamp(1rem,1.6vw,1.15rem)] text-[#5c4f3d] leading-[1.75] max-w-[52ch]">
            Иногда в жизни наступает момент, когда внешне всё выглядит устойчиво и правильно, но внутри появляется тихий голос: «Я хочу большего от своей жизни. Но не понимаю, как это получить».
          </p>
        </Reveal>
      </div>

      {/* Разделитель */}
      <div className="h-px bg-[#9a7d5a]/20 mb-0" />

      {/* Основная сетка: фото + список признаний */}
      <div className="grid lg:grid-cols-[2fr_3fr] gap-0 items-stretch">

        {/* Левая колонка — портрет */}
        <div className="relative overflow-hidden" style={{ minHeight: '560px' }}>
          <video
            src="https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/img/rookkreslo.MP4"
            autoPlay muted playsInline loop
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Оверлей справа для плавного перехода к списку */}
          <div className="absolute inset-0 hidden lg:block"
            style={{ background: 'linear-gradient(to right, transparent 60%, #f3ede4 100%)' }} />
          {/* Оверлей снизу */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(243,237,228,0.6) 0%, transparent 40%)' }} />
          {/* Подпись внизу */}
          <div className="absolute bottom-7 left-7 right-7">
            <p className="text-[0.58rem] uppercase tracking-[0.28em] text-[#5c4f3d]/70 font-medium">
              Этот выезд для людей, которые:
            </p>
          </div>
        </div>

        {/* Правая колонка — 6 нумерованных признаний */}
        <div className="lg:pl-12 py-0 divide-y divide-[#9a7d5a]/15">
          {FOR_WHO.map((text, i) => (
            <Reveal key={i} direction="right" delay={0.08 + i * 0.06}>
              <div className="flex items-baseline gap-5 md:gap-8 py-6 md:py-7 group">
                <span
                  className="font-serif text-[clamp(2rem,3.5vw,2.8rem)] leading-none text-[#0b1130]/15 group-hover:text-[#0b1130]/35 transition-colors duration-300 shrink-0 select-none tabular-nums"
                  style={{ fontStyle: 'italic', fontFeatureSettings: '"lnum"', minWidth: '2.5ch', textAlign: 'right' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-[clamp(0.95rem,1.4vw,1.05rem)] text-[#3a2714] leading-[1.65] group-hover:text-[#0b1130] transition-colors duration-300">
                  {text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Нижний акцент */}
      <div className="h-px bg-[#9a7d5a]/20 mt-0 mb-16 md:mb-20" />
    </div>
  </section>
);

const Counter = ({ value, suffix = '', duration = 2, delay = 0 }: { value: number, suffix?: string, duration?: number, delay?: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, { 
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1]
      });
      return controls.stop;
    }
  }, [isInView, value, duration, count, delay]);

  useEffect(() => {
    return rounded.on("change", (latest) => setDisplayValue(latest));
  }, [rounded]);

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}{suffix}
    </span>
  );
};

const RESULTS_BGS = [
  "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/romamaya3.jpg",
  "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/romamaya4.jpg",
];

const Results = ({ onOpenModal }: any) => {
  const [bg] = useState(() => RESULTS_BGS[Math.floor(Math.random() * RESULTS_BGS.length)]);
  return (
  <section className="min-h-screen flex items-center py-12 bg-navy text-white relative overflow-hidden">
    <div className="absolute inset-0 z-0">
      <img src={bg} alt="" aria-hidden="true" className="w-full h-full object-cover object-[center_top] opacity-30" referrerPolicy="no-referrer" />
      <div className="absolute inset-0 bg-navy/80 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-transparent to-navy" />
    </div>
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12 relative z-10">
      <Reveal direction="up" delay={0.05}>
        <div className="text-center mb-8">
          <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown-light font-medium block mb-3">Результат</span>
          <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-white font-light">Что ты заберёшь с собой</h2>
        </div>
      </Reveal>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {RESULTS.map((r, i) => (
          <Reveal key={i} direction="up" delay={0.1 + i * 0.07}>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 hover:bg-white/[0.08] hover:border-brown-light/30 transition group">
              <div className="font-serif text-[2rem] text-brown-light/30 leading-none mb-4 group-hover:text-brown-light/60 transition tabular-nums select-none">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h4 className="font-serif text-[1.1rem] mb-1.5 group-hover:text-brown-light transition">{r.title}</h4>
              <p className="text-[0.85rem] text-white/60 leading-[1.6] group-hover:text-white/80 transition">{r.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal direction="up" delay={0.5}>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
          <Button variant="brown" onClick={onOpenModal} className="!px-10 shadow-2xl">
            Пройти индивидуальный разбор
          </Button>
          <Button variant="outline-light" href="#pricing" className="!px-10">
            Забронировать место
          </Button>
        </div>
      </Reveal>
    </div>
  </section>
  );
};

const FINAL_IMG_SRC = "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/romamaya.jpg";

const FinalBlock = ({ onOpenModal }: any) => (
  <section className="relative bg-navy text-white overflow-hidden">
    {/* video background */}
    <div className="absolute inset-0 z-0">
      <video src="https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/img/banya.MP4" autoPlay muted loop playsInline className="w-full h-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/60 to-navy/90" />
    </div>

    <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 py-28 md:py-36 text-center">
      <Reveal direction="up" delay={0.1}>
        <h2 className="font-serif text-[clamp(1.8rem,4vw,3rem)] leading-[1.2] font-light mb-6">
          Если ничего не менять —<br />
          <em className="not-italic text-brown-light">через год будет то же самое</em>
        </h2>
      </Reveal>

      <Reveal direction="up" delay={0.2}>
        <p className="text-[1rem] text-white/65 leading-[1.8] mb-3">
          Те же мысли. Те же решения. Те же сценарии.
        </p>
        <p className="font-serif italic text-[1.1rem] text-white/80 mb-10">
          Этот выезд — точка, где можно это остановить.
        </p>
      </Reveal>

      <Reveal direction="up" delay={0.3}>
        <div className="flex items-center justify-center mb-2">
          <span className="text-[0.72rem] uppercase tracking-[0.2em] text-brown-light font-medium">19–21 июня · Красная Поляна</span>
        </div>
        <p className="text-[0.88rem] text-white/45 mb-10">
          В группе всего 10 мест —<br className="sm:hidden" /> потому что это формат глубокой работы, где невозможно «быть одним из»
        </p>
      </Reveal>

      <Reveal direction="up" delay={0.4}>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="brown" onClick={() => onOpenModal?.()} className="!px-10 shadow-2xl">
            Пройти индивидуальный разбор
          </Button>
          <Button variant="outline-light" href="#pricing" className="!px-10">
            Забронировать место
          </Button>
        </div>
      </Reveal>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-navy text-white/70 py-14 border-t border-white/8">
    <div className="max-w-6xl mx-auto px-6 md:px-12">
      <div className="grid md:grid-cols-[1.4fr_1fr_1fr] gap-10">
        <div>
          <div className="font-serif text-[1.7rem] tracking-[0.1em] text-white mb-3">Отражение</div>
          <p className="text-[0.88rem] leading-[1.7] text-white/60 max-w-sm">{FOOTER_DESC}</p>
        </div>
        <div>
          <div className="text-[0.6rem] uppercase tracking-[0.25em] text-brown-light mb-3">Параметры</div>
          <ul className="space-y-2 text-[0.88rem] text-white/75">
            {FOOTER_META.map(([l, v]) => (
              <li key={l}><span className="text-white/45">{l}:</span> {v}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[0.6rem] uppercase tracking-[0.25em] text-brown-light mb-3">Даты</div>
          <div className="font-serif text-[1.6rem] text-white leading-tight mb-1">19—21<br />июня 2026</div>
          <p className="text-[0.78rem] text-white/50">Глэмпинг «Дзен рекавери», Красная Поляна</p>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-[0.65rem] uppercase tracking-[0.24em] text-white/35">
        <p>© 2026 «Отражение»</p>
        <p>Безопасное пространство · Глубинная работа с собой</p>
      </div>
    </div>
  </footer>
);

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('cookie-consent')) {
      const t = setTimeout(() => setVisible(true), 1800);
      return () => clearTimeout(t);
    }
  }, []);
  const accept = () => { localStorage.setItem('cookie-consent', 'accepted'); setVisible(false); };
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-4 right-4 z-[400] max-w-xl mx-auto bg-navy/96 backdrop-blur-md text-white rounded-2xl px-6 py-4 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <p className="text-[0.78rem] leading-[1.6] text-white/75 flex-1">
            Сайт использует файлы cookie для аналитики и корректной работы. Продолжая использование, вы соглашаетесь с{' '}
            <a href="/oferta" className="text-brown-light underline-offset-2 underline hover:no-underline">политикой обработки данных</a>.
          </p>
          <button onClick={accept} className="shrink-0 px-5 py-2.5 rounded-full bg-brown text-white text-[0.75rem] font-medium hover:bg-brown-dark transition-colors whitespace-nowrap">
            Принять
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Modal = ({ isOpen, onClose, selectedPlan }: any) => {
  const [step, setStep] = useState<'plan' | 'form' | 'confirm' | 'success'>('form');
  const [formData, setFormData] = useState({ name: '', contact: '', message: '', consent: false });
  const [errors, setErrors] = useState({ name: '', contact: '', consent: '' });

  const transition = { duration: 0.6, ease: [0.22, 1, 0.36, 1] };

  useEffect(() => {
    if (isOpen) {
      if (selectedPlan) {
        setStep('plan');
      } else {
        setStep('form');
      }
      setFormData({ name: '', contact: '', message: '', consent: false });
      setErrors({ name: '', contact: '', consent: '' });
    }
  }, [selectedPlan, isOpen]);

  const validate = () => {
    const newErrors = { name: '', contact: '', consent: '' };
    let isValid = true;

    if (formData.name.trim().length < 2) {
      newErrors.name = 'Имя слишком короткое';
      isValid = false;
    }

    if (formData.contact.trim().length < 5) {
      newErrors.contact = 'Введите корректный номер или ник';
      isValid = false;
    }

    if (!formData.consent) {
      newErrors.consent = 'Необходимо согласие на обработку данных';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInitialSubmit = (e: any) => {
    e.preventDefault();
    if (validate()) {
      ymGoal("form_submit", { plan: selectedPlan?.name });
      setStep('confirm');
    }
  };

  const handleFinalSubmit = async () => {
    // Always send lead to Telegram first
    try {
      await fetch('/api/telegram/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          contact: formData.contact,
          message: formData.message,
          tariffName: selectedPlan ? selectedPlan.name : 'Не выбран'
        })
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }

    // If plan selected — try to redirect to payment
    if (selectedPlan) {
      ymGoal("payment_start", { plan: selectedPlan.name, price: selectedPlan.price });
      try {
        const response = await fetch('/api/prodamus/pay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tariffName: selectedPlan.name,
            price: parseInt(selectedPlan.price.replace(/\D/g, '')),
            contact: formData.contact,
            name: formData.name
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.paymentUrl) {
            ymGoal("payment_redirect", { plan: selectedPlan.name });
            window.location.href = data.paymentUrl;
            return;
          }
        }
      } catch (error) {
        console.error("Error initiating payment:", error);
        // fall through to success screen
      }
    }

    ymGoal("form_confirm", { plan: selectedPlan?.name });
    setStep('success');
    setTimeout(() => {
      onClose();
      setTimeout(() => {
        setStep('form');
      }, 500);
    }, 4000);
  };

  const handleCancel = () => {
    if (step === 'confirm') {
      setStep('form');
    } else if (step === 'plan') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-navy/80 backdrop-blur-md" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20, filter: 'blur(10px)' }}
            transition={transition}
            className="relative z-10 bg-cream w-full max-w-lg rounded-3xl p-10 shadow-2xl overflow-hidden"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-text-dark/40 hover:text-text-dark transition-colors z-20">
              <X size={24} />
            </button>

            <AnimatePresence mode="wait">
              {step === 'success' ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05, y: -10 }}
                  transition={{ ...transition, type: 'spring', damping: 20, stiffness: 100 }}
                  className="text-center py-10"
                >
                  <motion.div 
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 12 }}
                    className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-green-600 shadow-inner"
                  >
                    <CheckCircle size={48} />
                  </motion.div>
                  <motion.h3 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="font-serif text-3xl md:text-4xl text-text-dark mb-4"
                  >
                    Спасибо за заявку!
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-text-dark-soft text-base md:text-lg max-w-sm mx-auto leading-relaxed"
                  >
                    Мы уже получили ваши данные. В ближайшее время с вами свяжется наш менеджер для подтверждения деталей и ответа на вопросы.
                  </motion.p>
                </motion.div>
              ) : step === 'confirm' ? (
                <motion.div 
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={transition}
                  className="py-6"
                >
                  <h3 className="font-serif text-2xl text-text-dark mb-2 px-2">
                    Всё готово — отправляем заявку
                  </h3>
                  <p className="text-text-dark-soft text-sm mb-6 px-2 leading-relaxed">
                    Проверьте данные. После подтверждения мы получим вашу заявку и свяжемся в ближайшее время.
                  </p>

                  <div className="space-y-3 mb-8">
                    {selectedPlan && (
                      <div className="p-4 rounded-2xl bg-white/50 border border-brown/10">
                        <p className="text-[0.6rem] uppercase tracking-widest text-brown font-bold mb-1">Выбранный тариф</p>
                        <p className="font-serif text-base text-text-dark">{selectedPlan.name} · {selectedPlan.price}</p>
                      </div>
                    )}
                    <div className="p-4 rounded-2xl bg-white/30 border border-brown/5 text-xs text-text-dark-soft space-y-2">
                      <p><span className="opacity-60 uppercase tracking-wider mr-2">Имя:</span> <span className="text-text-dark font-medium">{formData.name}</span></p>
                      <p><span className="opacity-60 uppercase tracking-wider mr-2">Контакт:</span> <span className="text-text-dark font-medium">{formData.contact}</span></p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button variant="brown" onClick={handleFinalSubmit} className="w-full !bg-[#7a6245] !border-[#7a6245] hover:!bg-[#5e4a32] hover:!border-[#5e4a32]">Подтвердить</Button>
                    <Button variant="outline-dark" onClick={handleCancel} className="w-full">Назад</Button>
                  </div>
                </motion.div>
              ) : step === 'plan' ? (
                <motion.div 
                  key="plan"
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={transition}
                  className="py-6"
                >
                  <h3 className="font-serif text-3xl text-text-dark mb-6">Подтверждение выбора</h3>
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-2xl bg-white border border-brown/10 mb-8 shadow-sm"
                  >
                    <h4 className="font-serif text-xl text-brown mb-2">{selectedPlan?.name}</h4>
                    <p className="text-2xl font-serif mb-4">{selectedPlan?.price}</p>
                    <p className="text-sm text-text-dark-soft">{selectedPlan?.desc}</p>
                  </motion.div>
                  <p className="text-text-dark-soft text-sm mb-8 leading-relaxed">
                    Вы выбрали тариф <strong>«{selectedPlan?.name}»</strong>. Мы зафиксируем ваш выбор и свяжемся для уточнения деталей.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button onClick={() => setStep('form')} className="w-full">Продолжить</Button>
                    <Button variant="ghost" onClick={handleCancel} className="w-full">Выбрать другой тариф</Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={transition}
                >
                  <h3 className="font-serif text-3xl text-text-dark mb-4">Оставить заявку</h3>
                  <p className="text-text-dark-soft text-sm mb-8 leading-relaxed">
                    Оставьте свои контакты, и мы свяжемся с вами, чтобы назначить время для индивидуального разбора.
                  </p>
                  <form onSubmit={handleInitialSubmit} className="space-y-5">
                    <div className="space-y-1.5 relative">
                      <input
                        type="text"
                        required
                        aria-label="Ваше имя"
                        placeholder="Ваше имя"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (e.target.value.trim().length >= 2) setErrors({ ...errors, name: '' });
                        }}
                        className={`w-full px-6 py-4 rounded-xl bg-white border ${errors.name ? 'border-red-400 focus:border-red-500' : formData.name.trim().length >= 2 ? 'border-green-400 focus:border-green-500' : 'border-brown/10 focus:border-brown'} outline-none transition-all text-sm`}
                      />
                      {formData.name.trim().length >= 2 && !errors.name && (
                        <CheckCircle className="absolute right-4 top-4 text-green-500" size={18} />
                      )}
                      {errors.name && <p className="text-[0.65rem] text-red-500 ml-2">{errors.name}</p>}
                    </div>
                    
                    <div className="space-y-1.5 relative">
                      <input
                        type="text"
                        required
                        aria-label="Телефон или Telegram"
                        placeholder="Телефон или Telegram"
                        value={formData.contact}
                        onChange={(e) => {
                          setFormData({ ...formData, contact: e.target.value });
                          if (e.target.value.trim().length >= 5) setErrors({ ...errors, contact: '' });
                        }}
                        className={`w-full px-6 py-4 rounded-xl bg-white border ${errors.contact ? 'border-red-400 focus:border-red-500' : formData.contact.trim().length >= 5 ? 'border-green-400 focus:border-green-500' : 'border-brown/10 focus:border-brown'} outline-none transition-all text-sm`}
                      />
                      {formData.contact.trim().length >= 5 && !errors.contact && (
                        <CheckCircle className="absolute right-4 top-4 text-green-500" size={18} />
                      )}
                      {errors.contact && <p className="text-[0.65rem] text-red-500 ml-2">{errors.contact}</p>}
                    </div>

                    <div className="space-y-1.5 relative">
                      <textarea
                        aria-label="Ваш запрос (коротко)"
                        placeholder="Ваш запрос (коротко)"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className={`w-full px-6 py-4 rounded-xl bg-white border ${formData.message.trim().length > 0 ? 'border-brown/30' : 'border-brown/10'} focus:border-brown outline-none transition-all text-sm h-32 resize-none`}
                      />
                      {formData.message.trim().length > 10 && (
                        <CheckCircle className="absolute right-4 top-4 text-brown/20" size={18} />
                      )}
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer mt-1 group">
                      <span className="relative shrink-0 mt-[1px]">
                        <input
                          type="checkbox"
                          checked={formData.consent}
                          onChange={(e) => { setFormData({ ...formData, consent: e.target.checked }); if (e.target.checked) setErrors({ ...errors, consent: '' }); }}
                          className="sr-only"
                        />
                        <span className={`flex items-center justify-center w-[18px] h-[18px] rounded-[4px] border transition-all duration-200 ${
                          formData.consent
                            ? 'bg-brown border-brown'
                            : errors.consent
                              ? 'border-red-400 bg-red-50'
                              : 'border-brown/30 bg-white group-hover:border-brown/60'
                        }`}>
                          {formData.consent && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </span>
                      </span>
                      <span className="text-[0.73rem] text-text-dark-soft leading-[1.55]">
                        Я согласен(-а) на{' '}
                        <a href="/oferta" target="_blank" rel="noopener noreferrer" className="text-brown underline underline-offset-2 hover:no-underline">обработку персональных данных</a>{' '}
                        согласно публичной оферте
                      </span>
                    </label>
                    {errors.consent && <p className="text-[0.65rem] text-red-500 ml-7 -mt-1">{errors.consent}</p>}
                    <Button type="submit" variant="brown" className="w-full mt-2 !bg-[#7a6245] !border-[#7a6245] hover:!bg-[#5e4a32] hover:!border-[#5e4a32]">Далее</Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={scrollToTop}
          className="hidden md:flex fixed bottom-6 right-8 z-[90] w-12 h-12 rounded-full bg-brown text-white shadow-lg items-center justify-center hover:bg-brown-dark transition-colors group"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} className="group-hover:-translate-y-1 transition-transform" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const ComparisonModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-navy/80 backdrop-blur-md" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-cream rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/50 hover:bg-white rounded-full flex items-center justify-center text-text-dark transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="p-8 md:p-12 overflow-y-auto no-scrollbar">
              <div className="text-center mb-12">
                <h2 className="font-serif text-3xl md:text-4xl text-text-dark mb-4">Тарифы на выбор</h2>
                <p className="text-text-dark-soft">Выберите удобный уровень участия в насыщенной двухдневной программе</p>
              </div>
              
              <div className="md:hidden text-center mb-4 text-brown/60 text-sm flex items-center justify-center gap-2">
                <ChevronLeft size={16} />
                <span>Свайпайте таблицу</span>
                <ChevronRight size={16} />
              </div>

              <div className="overflow-x-auto pb-6">
                <table className="w-full min-w-[800px] border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 text-left w-1/4"></th>
                      <th className="p-6 text-center w-1/4 bg-white rounded-tl-2xl">
                        <h3 className="font-serif text-xl text-text-dark">База</h3>
                      </th>
                      <th className="p-6 text-center w-1/4 bg-white/80">
                        <h3 className="font-serif text-xl text-brown">Полный</h3>
                      </th>
                      <th className="p-6 text-center w-1/4 bg-gradient-to-br from-[#e6d5c3] to-[#d4bca3] rounded-tr-2xl relative">
                        <div className="absolute top-4 right-4 bg-brown text-white text-[0.6rem] px-3 py-1 rounded-full uppercase tracking-widest font-bold shadow-md">ТОП</div>
                        <h3 className="font-serif text-xl text-white drop-shadow-sm">Премиум</h3>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-brown/10">
                      <td className="p-4 text-sm text-text-dark-soft flex items-center gap-3"><Calendar size={16} className="text-brown/60"/> Участие в 2-дневной программе</td>
                      <td className="p-4 text-center bg-white"><CheckCircle size={20} className="mx-auto text-brown" /></td>
                      <td className="p-4 text-center bg-white/80"><CheckCircle size={20} className="mx-auto text-brown" /></td>
                      <td className="p-4 text-center bg-gradient-to-br from-[#e6d5c3]/40 to-[#d4bca3]/40"><CheckCircle size={20} className="mx-auto text-brown" /></td>
                    </tr>
                    <tr className="border-b border-brown/10">
                      <td className="p-4 text-sm text-text-dark-soft flex items-center gap-3"><Users size={16} className="text-brown/60"/> Групповые разборы и практики</td>
                      <td className="p-4 text-center bg-white"><CheckCircle size={20} className="mx-auto text-brown" /></td>
                      <td className="p-4 text-center bg-white/80"><CheckCircle size={20} className="mx-auto text-brown" /></td>
                      <td className="p-4 text-center bg-gradient-to-br from-[#e6d5c3]/40 to-[#d4bca3]/40"><CheckCircle size={20} className="mx-auto text-brown" /></td>
                    </tr>
                    <tr className="border-b border-brown/10">
                      <td className="p-4 text-sm text-text-dark-soft flex items-center gap-3"><Home size={16} className="text-brown/60"/> Проживание в глэмпинге</td>
                      <td className="p-4 text-center text-xs font-bold tracking-widest uppercase text-text-dark bg-white">2 МЕСТНОЕ</td>
                      <td className="p-4 text-center text-xs font-bold tracking-widest uppercase text-text-dark bg-white/80">2 МЕСТНОЕ</td>
                      <td className="p-4 text-center text-xs font-bold tracking-widest uppercase text-brown bg-gradient-to-br from-[#e6d5c3]/40 to-[#d4bca3]/40">1 МЕСТНОЕ</td>
                    </tr>
                    <tr className="border-b border-brown/10">
                      <td className="p-4 text-sm text-text-dark-soft flex items-center gap-3"><Coffee size={16} className="text-brown/60"/> Банный день</td>
                      <td className="p-4 text-center bg-white"><CheckCircle size={20} className="mx-auto text-brown" /></td>
                      <td className="p-4 text-center bg-white/80"><CheckCircle size={20} className="mx-auto text-brown" /></td>
                      <td className="p-4 text-center bg-gradient-to-br from-[#e6d5c3]/40 to-[#d4bca3]/40"><CheckCircle size={20} className="mx-auto text-brown" /></td>
                    </tr>
                    <tr className="border-b border-brown/10">
                      <td className="p-4 text-sm text-text-dark-soft flex items-center gap-3"><Info size={16} className="text-brown/60"/> Материалы программы</td>
                      <td className="p-4 text-center text-sm text-text-dark bg-white">Базовые</td>
                      <td className="p-4 text-center text-sm text-text-dark bg-white/80">Расширенные</td>
                      <td className="p-4 text-center text-sm text-brown bg-gradient-to-br from-[#e6d5c3]/40 to-[#d4bca3]/40">Расширенные</td>
                    </tr>
                    <tr className="border-b border-brown/10">
                      <td className="p-4 text-sm text-text-dark-soft flex items-center gap-3"><Bus size={16} className="text-brown/60"/> Групповой трансфер</td>
                      <td className="p-4 text-center bg-white"><X size={20} className="mx-auto text-black/10" /></td>
                      <td className="p-4 text-center bg-white/80"><CheckCircle size={20} className="mx-auto text-brown" /></td>
                      <td className="p-4 text-center bg-gradient-to-br from-[#e6d5c3]/40 to-[#d4bca3]/40"><CheckCircle size={20} className="mx-auto text-brown" /></td>
                    </tr>
                    <tr className="border-b border-brown/10">
                      <td className="p-4 text-sm text-text-dark-soft flex items-center gap-3"><MessageCircle size={16} className="text-brown/60"/> Поддержка после выезда</td>
                      <td className="p-4 text-center bg-white"><X size={20} className="mx-auto text-black/10" /></td>
                      <td className="p-4 text-center text-sm text-text-dark bg-white/80">Групповая встреча</td>
                      <td className="p-4 text-center text-sm text-brown bg-gradient-to-br from-[#e6d5c3]/40 to-[#d4bca3]/40">Приоритетная</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm text-text-dark-soft flex items-center gap-3 rounded-bl-2xl"><Zap size={16} className="text-brown/60"/> Личный разбор с авторами</td>
                      <td className="p-4 text-center bg-white rounded-b-2xl"><X size={20} className="mx-auto text-black/10" /></td>
                      <td className="p-4 text-center bg-white/80 rounded-b-2xl"><X size={20} className="mx-auto text-black/10" /></td>
                      <td className="p-4 text-center bg-gradient-to-br from-[#e6d5c3]/40 to-[#d4bca3]/40 rounded-br-2xl"><CheckCircle size={20} className="mx-auto text-brown" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="text-center mt-8 text-sm text-text-dark-soft">
                10 человек в группе • Предприниматели и руководители
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Process Variants ---

const PROC_VIDEO = "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/intro2.mp4";
const WHAT_HAPPENS_VIDEO = "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/img/girlsswim.MP4";
const PROC_INTRO = "Мы создаём пространство, где честность становится инструментом, а группа — зеркалом, в котором невозможно не увидеть правду.";

// V1 — timeline vertical minimal
const ProcessV1 = () => (
  <section className="min-h-screen flex items-center py-16 bg-cream">
    <div className="max-w-5xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-6">Вариант 1 · Вертикальная ось</div>
      <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Процесс</span>
      <h2 className="font-serif text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.1] text-text-dark mb-4">Что происходит на кэмпе</h2>
      <p className="text-[0.98rem] text-text-dark-soft leading-[1.7] mb-10 max-w-2xl">{PROC_INTRO}</p>
      <ol className="relative border-l border-brown/30 pl-8 space-y-8">
        {WHAT_HAPPENS.map((item, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-cream border-2 border-brown" />
            <div className="font-serif text-brown text-[0.72rem] uppercase tracking-[0.25em] mb-1">Шаг 0{i + 1}</div>
            <p className="font-serif text-[1.15rem] text-text-dark leading-snug">
              {item.text} <span className="italic text-brown">{item.bold}</span>
            </p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

// V2 — horizontal steps with large numbers
const ProcessV2 = () => (
  <section className="min-h-screen flex items-center py-16 bg-cream-soft">
    <div className="max-w-7xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-6">Вариант 2 · Горизонтальные шаги</div>
      <div className="text-center mb-12">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Процесс</span>
        <h2 className="font-serif text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.1] text-text-dark mb-4">Что происходит на кэмпе</h2>
        <p className="text-[0.95rem] text-text-dark-soft leading-[1.7] max-w-2xl mx-auto">{PROC_INTRO}</p>
      </div>
      <div className="grid md:grid-cols-4 gap-6">
        {WHAT_HAPPENS.map((item, i) => (
          <div key={i} className="relative bg-white rounded-2xl p-6 shadow-[0_12px_40px_rgba(82,60,34,0.06)] border border-brown/5">
            <div className="font-serif text-[3.5rem] leading-none text-brown/25 mb-2">0{i + 1}</div>
            <div className="h-px bg-brown/20 w-10 mb-3" />
            <p className="text-[0.95rem] text-text-dark leading-[1.55]">
              {item.text} <span className="font-semibold text-brown">{item.bold}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V3 — dark split with video and quote
const ProcessV3 = () => (
  <section className="min-h-screen flex items-center py-16 bg-navy relative overflow-hidden">
    <video src={PROC_VIDEO} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-20" />
    <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-navy/40" />
    <div className="max-w-7xl w-full mx-auto px-6 md:px-12 relative z-10">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown-light/60 mb-6">Вариант 3 · Тёмный split</div>
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown-light font-medium block mb-3">Процесс</span>
          <h2 className="font-serif text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] text-white font-light mb-5">Что происходит на кэмпе</h2>
          <p className="font-serif italic text-[1.1rem] text-white/75 leading-[1.65] mb-8 max-w-md">
            «Это не просто отдых. Это глубокая хирургическая работа с вашей реальностью».
          </p>
          <p className="text-[0.92rem] text-white/60 leading-[1.7] max-w-md">{PROC_INTRO}</p>
        </div>
        <div className="space-y-4">
          {WHAT_HAPPENS.map((item, i) => (
            <div key={i} className="flex gap-5 items-start border-b border-white/10 pb-4">
              <div className="font-serif text-brown-light text-2xl leading-none shrink-0 w-10 pt-1">0{i + 1}</div>
              <p className="text-[0.98rem] text-white/85 leading-[1.55]">
                {item.text} <span className="text-brown-light font-medium">{item.bold}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// V4 — editorial card grid with icons
const ProcessV4 = () => {
  const icons: any = { Eye, Scale, Infinity, Key };
  return (
    <section className="min-h-screen flex items-center py-16 bg-cream relative overflow-hidden">
      <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
        <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-6">Вариант 4 · Иконки + журнальная сетка</div>
        <div className="mb-10 pb-6 border-b border-brown/20 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <span className="text-[0.68rem] uppercase tracking-[0.35em] text-brown font-medium block mb-3">Процесс · шаг за шагом</span>
            <h2 className="font-serif italic text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.05] text-text-dark max-w-[20ch]">
              Что происходит <span className="not-italic">на кэмпе</span>
            </h2>
          </div>
          <p className="text-[0.95rem] text-text-dark-soft leading-[1.7] max-w-sm">{PROC_INTRO}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
          {WHAT_HAPPENS.map((item, i) => {
            const Icon = icons[item.icon] || HelpCircle;
            return (
              <div key={i} className="flex gap-5 py-5 border-b border-text-dark/10">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full border border-brown/30 bg-white flex items-center justify-center text-brown">
                    <Icon size={20} strokeWidth={1.4} />
                  </div>
                </div>
                <div>
                  <div className="font-serif text-brown text-[0.72rem] uppercase tracking-[0.25em] mb-1">№ {i + 1}</div>
                  <p className="font-serif text-[1.1rem] text-text-dark leading-[1.4]">
                    {item.text} <span className="italic">{item.bold}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// V5 — refined current layout (video + quote + icon list)
const ProcessV5 = () => {
  const icons: any = { Eye, Scale, Infinity, Key };
  return (
    <section className="min-h-screen flex items-center py-16 bg-white relative overflow-hidden">
      <div className="max-w-7xl w-full mx-auto px-6 md:px-12">
        <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-8">Вариант 5 · Текущий (доработанный)</div>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative">
            <div className="rounded-[2rem] overflow-hidden aspect-[4/5] relative shadow-[0_24px_60px_rgba(58,39,20,0.18)]">
              <video src={PROC_VIDEO} autoPlay muted loop playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-navy/50 via-transparent to-navy/40" />
              <div className="absolute top-0 left-0 right-0 p-8 md:p-10">
                <span className="text-[0.65rem] uppercase tracking-[0.35em] text-white/70 font-medium block mb-3">Процесс</span>
                <h2 className="font-serif text-[clamp(1.8rem,3.5vw,2.6rem)] leading-[1.1] text-white font-light">Что происходит<br/>на кэмпе</h2>
                <div className="h-px w-14 bg-white/40 mt-4" />
              </div>
            </div>
            <div className="hidden md:block absolute -bottom-6 -right-6 max-w-[280px] bg-brown text-white px-6 py-5 rounded-2xl shadow-xl">
              <Quote className="text-white/25 mb-2" size={20} />
              <p className="font-serif italic text-[0.98rem] leading-snug">
                «Это не просто отдых. Это глубокая <span className="not-italic font-semibold">хирургическая работа</span> с вашей реальностью».
              </p>
            </div>
          </div>

          <div>
            <p className="text-[1.02rem] text-text-dark-soft leading-[1.7] mb-8 max-w-lg">
              Мы создаём пространство, где <span className="text-brown font-medium">честность становится инструментом</span>, а группа — зеркалом, в котором невозможно не увидеть правду.
            </p>
            <div className="space-y-5">
              {WHAT_HAPPENS.map((item, i) => {
                const Icon = icons[item.icon] || HelpCircle;
                return (
                  <div key={i} className="group flex gap-5 items-start">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-cream flex items-center justify-center text-brown transition-all duration-500 group-hover:bg-brown group-hover:text-white">
                        <Icon size={20} strokeWidth={1.5} />
                      </div>
                      <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-white border border-brown/15 flex items-center justify-center text-[0.55rem] font-bold text-brown">
                        0{i + 1}
                      </span>
                    </div>
                    <p className="pt-2 text-[1rem] text-text-dark-soft leading-snug transition-colors duration-300 group-hover:text-text-dark">
                      {item.text} <span className="font-semibold text-brown">{item.bold}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ProcessSectionsPage = () => (
  <div className="bg-cream min-h-screen">
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex items-center justify-between">
      <a href="/" className="font-serif text-[1.4rem] tracking-[0.08em] text-text-dark">Отражение</a>
      <span className="text-[0.7rem] uppercase tracking-[0.3em] text-text-dark-muted">Варианты секции «Процесс»</span>
    </div>
    <ProcessV1 />
    <ProcessV2 />
    <ProcessV3 />
    <ProcessV4 />
    <ProcessV5 />
  </div>
);

// --- /doc Documentation Page (password-protected) ---

const DOC_PASSWORD = "otragenie888camp";
const DOC_STORAGE_KEY = "otragenie_doc_auth_v1";
const DOC_MAGIC_TOKEN = "otragenie-doc-invite-2026";

export const DocPage = () => {
  const [authed, setAuthed] = useState(() => {
    if (typeof window === "undefined") return false;
    if (window.sessionStorage.getItem(DOC_STORAGE_KEY) === "1") return true;
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("token") === DOC_MAGIC_TOKEN) {
      window.sessionStorage.setItem(DOC_STORAGE_KEY, "1");
      // Clean token from URL so it does not leak via screenshots/sharing
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, "", cleanUrl);
      return true;
    }
    return false;
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === DOC_PASSWORD) {
      window.sessionStorage.setItem(DOC_STORAGE_KEY, "1");
      setAuthed(true);
      setError("");
    } else {
      setError("Неверный пароль");
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-navy text-white flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm bg-white/[0.04] border border-white/10 rounded-2xl p-8">
          <h1 className="font-serif text-[1.6rem] mb-2">Документация</h1>
          <p className="text-white/60 text-[0.88rem] mb-6">Доступ по паролю</p>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="пароль"
            className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-brown-light/60"
          />
          {error && <p className="text-red-300 text-sm mt-2">{error}</p>}
          <button type="submit" className="w-full mt-4 bg-brown hover:bg-brown-dark text-white font-medium py-3 rounded-xl transition">Войти</button>
          <a href="/" className="block text-center text-[0.75rem] uppercase tracking-[0.2em] text-white/40 hover:text-white/70 mt-4 transition">← На главную</a>
        </form>
      </div>
    );
  }

  const Section = ({ title, children, id }: { title: string; children: React.ReactNode; id: string }) => (
    <section id={id} className="mb-12 scroll-mt-16">
      <h2 className="font-serif text-[clamp(1.6rem,3vw,2.2rem)] text-text-dark mb-4 pb-2 border-b border-brown/20">{title}</h2>
      <div className="prose-doc">{children}</div>
    </section>
  );

  const SECTION_LINKS = [
    ["/hero-sections", "Hero"],
    ["/about-sections", "О проекте"],
    ["/process-sections", "Процесс"],
    ["/philosophy-sections", "Философия"],
    ["/authors-sections", "Авторы"],
    ["/metodology-sections", "Методология"],
    ["/program-sections", "Программа"],
    ["/location-sections", "Локация"],
    ["/testimonials-sections", "Кейсы"],
    ["/leadmagnit-sections", "Лид-магнит"],
    ["/for-who-sections", "Для кого"],
    ["/result-sections", "Результат"],
    ["/pricing-sections", "Стоимость"],
    ["/faq-sections", "Вопросы"],
    ["/final-sections", "Финальный выбор"],
    ["/footer-sections", "Футер"]
  ] as const;

  return (
    <div className="min-h-screen bg-cream text-text-dark">
      <header className="border-b border-brown/15 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="font-serif text-[1.2rem] tracking-[0.1em] text-text-dark hover:text-brown transition">Отражение</a>
            <span className="text-[0.62rem] uppercase tracking-[0.25em] text-brown font-bold">/ doc</span>
          </div>
          <button onClick={() => { window.sessionStorage.removeItem(DOC_STORAGE_KEY); setAuthed(false); }} className="text-[0.7rem] uppercase tracking-[0.2em] text-text-dark-muted hover:text-text-dark transition">Выйти</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 grid lg:grid-cols-[220px_1fr] gap-10">
        <nav className="lg:sticky lg:top-24 lg:self-start text-[0.85rem] space-y-2">
          <div className="text-[0.6rem] uppercase tracking-[0.25em] text-brown font-bold mb-2">Содержание</div>
          {[
            ["overview", "Что это за сайт"],
            ["pages", "Разделы и страницы"],
            ["dynamics", "Живые элементы"],
            ["bot", "Telegram-бот"],
            ["audio", "Загрузка аудио в бот"],
            ["chat", "AI-чат на сайте"],
            ["pay", "Оплата через Prodamus"],
            ["analytics", "Метрика и отчёты"],
            ["sections", "Варианты дизайна секций"],
            ["edit", "Как вносить правки"],
            ["contacts", "Контакты"]
          ].map(([id, t]) => (
            <a key={id} href={`#${id}`} className="block text-text-dark-soft hover:text-brown transition">{t}</a>
          ))}
        </nav>

        <main>
          <h1 className="font-serif italic text-[clamp(2rem,5vw,3.2rem)] text-text-dark leading-[1.05] mb-3">
            Документация <span className="not-italic">· Отражение Camp</span>
          </h1>
          <p className="text-text-dark-soft leading-[1.7] mb-10 max-w-prose">
            Краткая инструкция по сайту: что где находится, как работает Telegram-бот, как принимаются оплаты и где менять тексты. Без технических деталей — только то, что нужно знать, чтобы пользоваться проектом.
          </p>

          <Section id="overview" title="Что это за сайт">
            <p>
              <a className="text-brown hover:underline" href="https://otragenie-camp.ru" target="_blank" rel="noopener noreferrer"><strong>otragenie-camp.ru</strong></a> — промо-сайт выезда «Отражение»: <strong>19–21 июня 2026</strong>, Красная Поляна, глэмпинг «Дзен рекавери». Группа — 10 человек.
            </p>
            <p>
              <strong>Документы проекта:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <a className="text-brown hover:underline" href="https://docs.google.com/document/d/1hG7OHEBpvOMfqZQUBRg-CNE3EIJqsaav6VT_cWpRmqA/edit?usp=sharing" target="_blank" rel="noopener noreferrer">
                  Техническое задание (Google Docs)
                </a>
              </li>
              <li>
                <a className="text-brown hover:underline" href="https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/kp.html" target="_blank" rel="noopener noreferrer">
                  Коммерческое предложение
                </a>
              </li>
            </ul>
            <p>В сайт встроены три инструмента, работающие вместе:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Сам сайт</strong> с программой, авторами, кейсами и формой бронирования.</li>
              <li><strong>Telegram-бот @otrageniecamp_bot</strong> — короткая воронка с аудио-практикой «10 минут честности с собой» для лидов.</li>
              <li><strong>AI-чат</strong> в правом нижнем углу — отвечает на вопросы посетителей и помогает выбрать тариф.</li>
            </ul>
            <p>Сайт работает на сервере 24/7, без вмешательства не требуется.</p>
          </Section>

          <Section id="pages" title="Разделы и страницы">
            <p>На сайте есть служебные страницы, не указанные в меню:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <a className="text-brown hover:underline" href="/">otragenie-camp.ru</a> — основной сайт для посетителей.
              </li>
              <li>
                <a className="text-brown hover:underline" href="/v0">otragenie-camp.ru/v0</a> — <strong>бета-версия</strong> (самый ранний прототип, статическая HTML-страница до React-переработки).
              </li>
              <li>
                <a className="text-brown hover:underline" href="/v1">otragenie-camp.ru/v1</a> — замороженная первая версия текущего дизайна, чтобы можно было сравнивать.
              </li>
              <li>
                <a className="text-brown hover:underline" href="/sections">otragenie-camp.ru/sections</a> — индекс всех черновиков с вариантами оформления каждой секции (Hero, Авторы, Программа и т.д.).
              </li>
              <li>
                <a className="text-brown hover:underline" href="/doc">otragenie-camp.ru/doc</a> — эта страница (доступ по паролю).
              </li>
            </ul>
          </Section>

          <Section id="dynamics" title="Живые элементы сайта">
            <p>
              На сайте несколько мест, где каждый пользователь видит <strong>разное оформление</strong> — это делает сайт «живым»: при каждом новом открытии выбирается один из заготовленных вариантов.
            </p>

            <p className="mt-4"><strong>Hero-секция (первый экран)</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                На фоне первого экрана проигрывается короткое видео-клип.
              </li>
              <li>
                При каждой загрузке сайта случайным образом выбирается <strong>один из пяти</strong> видео-файлов (виды Красной Поляны, природа, занятия, фрагменты йоги и медитации).
              </li>
              <li>
                Для <strong>мобильных и для десктопов</strong> используются <strong>разные наборы видео</strong>: мобильный набор снят вертикально, чтобы не обрезался на узких экранах.
              </li>
              <li>
                Замена видео на другие (или расширение набора) — через разработчика.
              </li>
            </ul>

            <p className="mt-4"><strong>Фоны секций «Проблема в системе» и «Результат»</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                В обеих тёмных секциях под текстом видно фото, приглушённое затемнением.
              </li>
              <li>
                Фото выбирается случайно <strong>из двух вариантов</strong> при каждой загрузке сайта.
              </li>
              <li>
                Это даёт ощущение живого, не статичного ресурса — и одновременно позволяет использовать две разные эмоции/композиции без редизайна.
              </li>
            </ul>

            <p className="text-[0.85rem] text-text-dark-muted mt-3">
              Сравнить композиции и эволюцию дизайна:{" "}
              <a className="text-brown hover:underline" href="https://otragenie-camp.ru/v0" target="_blank" rel="noopener noreferrer">
                /v0
              </a>
              {" "}(бета) ·{" "}
              <a className="text-brown hover:underline" href="https://otragenie-camp.ru/v1" target="_blank" rel="noopener noreferrer">
                /v1
              </a>
              {" "}(первая React-версия).
            </p>
          </Section>

          <Section id="bot" title="Telegram-бот @otrageniecamp_bot">
            <p>
              <strong>Ссылка на бота:</strong>{" "}
              <a className="text-brown hover:underline" href="https://t.me/otrageniecamp_bot" target="_blank" rel="noopener noreferrer">
                t.me/otrageniecamp_bot
              </a>
              <br />
              <strong>Ссылка-приглашение в супергруппу с лидами:</strong>{" "}
              <a className="text-brown hover:underline break-all" href="https://t.me/+Y3OkTzH32uw1Zjgy" target="_blank" rel="noopener noreferrer">
                t.me/+Y3OkTzH32uw1Zjgy
              </a>
              <br />
              <span className="text-[0.85rem] text-text-dark-muted">
                В супергруппе под каждого лида создаётся отдельная ветка. Все, у кого есть приглашение, могут отвечать клиенту прямо из ветки — сообщения автоматически попадут ему в личный чат с ботом.
              </span>
            </p>
            <video
              src="https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/docs/tg.MOV"
              controls
              playsInline
              className="w-full max-w-sm rounded-xl my-4 shadow-md"
            />
            <p>Бот ведёт пользователя по короткому сценарию, чтобы получить лида и сразу дать ему пользу:</p>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Пользователь нажимает «Начать» (<code>/start</code>) — бот здоровается и спрашивает имя.</li>
              <li>Затем спрашивает роль (предприниматель / руководитель / другое).</li>
              <li>Затем спрашивает основную «боль».</li>
              <li>Высылает аудио-практику «10 минут честности с собой».</li>
              <li>Через 10 минут спрашивает «какое одно слово или чувство сейчас внутри?»</li>
              <li>Когда пользователь отвечает — в общей Telegram-группе автоматически создаётся отдельная ветка-карточка с информацией об этом человеке. Команда может писать ему прямо из этой ветки, и сообщения попадут пользователю в личку (и наоборот).</li>
              <li>Через 24 часа бот напомнит о себе.</li>
            </ol>
            <p>
              Кнопка «Послушать и понять себя» в блоке сайта про лид-магнит ведёт в этого же бота.
            </p>
          </Section>

          <Section id="audio" title="Как загрузить (или поменять) аудио-практику">
            <p>Аудио меняется через личные сообщения боту. Доступно только администраторам.</p>
            <p>
              <strong>Текущие администраторы бота</strong> (по Telegram ID):
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Роман Дусенко (id <code>389386707</code>)</li>
              <li>Мария Зубрицкая (id <code>200853681</code>)</li>
              <li>Aleksandr Uspeshnyy (id <code>65876198</code>)</li>
            </ul>
            <p className="text-[0.85rem] text-text-dark-muted">
              Чтобы добавить нового администратора — пришлите его Telegram ID разработчику. Узнать свой ID можно у бота{" "}
              <a className="text-brown hover:underline" href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer">@userinfobot</a>.
            </p>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Откройте чат с <strong>@otrageniecamp_bot</strong> в Telegram.</li>
              <li>Отправьте команду <code>/setaudio</code>. Бот ответит, что ждёт аудио.</li>
              <li>Запишите голосовое сообщение или прикрепите аудио-файл — бот сохранит его и подтвердит.</li>
              <li>Чтобы проверить, что новое аудио сохранилось — отправьте <code>/audiotest</code>, бот пришлёт его вам.</li>
            </ol>
            <p>Дополнительные команды:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><code>/audioinfo</code> — показать, какое аудио сейчас активно и когда обновлялось.</li>
              <li><code>/cancelaudio</code> — отменить, если передумали загружать.</li>
            </ul>
            <p>Новое аудио начнёт получать каждый новый пользователь сразу — без перезапуска и обновлений.</p>

            <p className="mt-6"><strong>Другие админ-команды бота:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li><code>/docs</code> — прислать кнопку «Открыть документацию». Ссылка содержит токен, поэтому открывается без пароля.</li>
              <li><code>/prices</code> — показать текущие тарифы (База 149 000 ₽ · Полный 179 000 ₽ · Премиум 249 000 ₽).</li>
              <li><code>/dates</code> — показать дату и локацию кэмпа (19—21 июня 2026, Красная Поляна, Глэмпинг «Дзен рекавери», до 10 человек).</li>
              <li><code>/analytics</code> (или <code>/stats</code>) — статистика сайта из Яндекс.Метрики за сегодня / неделю / месяц / квартал (визиты, посетители, просмотры, длительность, % отказов).</li>
            </ul>
          </Section>

          <Section id="analytics" title="Метрика и отчёты">
            <p>
              На сайте установлена <strong>Яндекс.Метрика</strong> (счётчик <code>108536568</code>). Она автоматически считает посещения, фиксирует клики, записывает Вебвизор и отслеживает ключевые события пользователя.
            </p>
            <p>
              <strong>Открыть дашборд:</strong>{" "}
              <a className="text-brown hover:underline" href="https://metrika.yandex.ru/dashboard?id=108536568" target="_blank" rel="noopener noreferrer">
                metrika.yandex.ru/dashboard?id=108536568
              </a>
            </p>

            <p className="mt-4"><strong>Отслеживаемые цели (события на сайте):</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li><code>cta_book_click</code> — клик по кнопке «Забронировать» / «Пройти разбор» в любой секции.</li>
              <li><code>compare_open</code> — открытие модалки «Сравнение тарифов».</li>
              <li><code>form_submit</code> — заполнение и отправка формы бронирования.</li>
              <li><code>payment_start</code> — подтверждение тарифа, начало оплаты.</li>
              <li><code>payment_redirect</code> — успешный переход на платёжную форму Prodamus.</li>
              <li><code>leadmagnet_click</code> — клик «Послушать и понять себя» (переход к боту).</li>
              <li><code>chat_open</code> — открытие AI-чата в правом нижнем углу.</li>
            </ul>
            <p className="text-[0.85rem] text-text-dark-muted">
              Каждое событие можно посмотреть в Метрике в разделе <em>Отчёты → Стандартные → Конверсии</em>, а также построить по нему воронку.
            </p>

            <p className="mt-4"><strong>Быстрый отчёт прямо в Telegram:</strong></p>
            <p>
              В личке у бота <a className="text-brown hover:underline" href="https://t.me/otrageniecamp_bot" target="_blank" rel="noopener noreferrer">@otrageniecamp_bot</a> отправьте команду{" "}
              <code>/analytics</code> — придёт сводный отчёт за <strong>сегодня</strong>, <strong>неделю</strong>, <strong>месяц</strong> и <strong>квартал</strong>:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>визиты</li>
              <li>посетители</li>
              <li>просмотры страниц</li>
              <li>средняя длительность визита</li>
              <li>процент отказов</li>
            </ul>
            <p className="text-[0.85rem] text-text-dark-muted">
              Команда доступна только администраторам бота (см. раздел «Загрузка аудио»).
            </p>
          </Section>

          <Section id="chat" title="AI-чат на сайте">
            <p>В правом нижнем углу сайта есть кнопка чата. Внутри — умный помощник на основе Google Gemini. Он:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Отвечает на вопросы о кэмпе, программе, авторах, локации.</li>
              <li>Помогает выбрать подходящий тариф.</li>
              <li>Может прямо в чате сгенерировать ссылку на оплату — нужно только назвать тариф, имя и контакт.</li>
            </ul>
            <p>
              Помощник работает автоматически. Если он чего-то не знает — честно говорит об этом и предлагает оставить заявку.
            </p>
          </Section>

          <Section id="pay" title="Оплата через Prodamus">
            <p>Когда посетитель сайта выбирает тариф и жмёт «Забронировать» (или просит ссылку у AI-чата), происходит следующее:</p>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Открывается короткая форма: имя и контакт (телефон или email).</li>
              <li>Сайт автоматически создаёт ссылку оплаты в Prodamus с уже подставленным тарифом и контактом.</li>
              <li>Пользователь переходит на платёжную форму Prodamus и оплачивает.</li>
              <li>После успешной оплаты Prodamus присылает уведомление сайту.</li>
              <li>В Telegram-группе автоматически появляется сообщение «🎉 Успешная оплата!» с именем, тарифом, суммой и контактами.</li>
            </ol>
            <p>
              <strong>Адрес для уведомлений в кабинете Prodamus:</strong>
              <br />
              <code className="break-all">https://otragenie-camp.ru/api/prodamus/webhook</code>
              <br />
              Этот адрес нужно один раз указать в настройках Prodamus.
            </p>
            <p>
              <strong>Сейчас:</strong> ждём от Романа адрес платёжного магазина (формат <code>https://имя-магазина.payform.ru</code>). Как только он появится — оплата на сайте заработает полностью <strong>(берём 100% предоплату или 10%?)</strong>. Без него ссылка пока не создаётся, и AI-чат честно говорит об этом пользователю.
            </p>
          </Section>

          <Section id="sections" title="Варианты дизайна секций">
            <p>
              Для каждой секции сайта подготовлены 4–5 разных вариантов оформления. Можно открыть страницу секции, посмотреть варианты бок-о-бок и выбрать понравившийся.
            </p>
            <div className="grid sm:grid-cols-2 gap-2 mt-3">
              {SECTION_LINKS.map(([href, title]) => (
                <a key={href} href={href} className="flex items-center justify-between gap-3 bg-white border border-brown/10 hover:border-brown/30 rounded-lg px-4 py-3 transition group">
                  <span className="text-[0.95rem] text-text-dark group-hover:text-brown transition">{title}</span>
                  <span className="text-[0.7rem] text-text-dark-muted">→</span>
                </a>
              ))}
            </div>
            <p className="mt-3">
              Все черновики собраны в одном месте: <a className="text-brown hover:underline" href="/sections">otragenie-camp.ru/sections</a>.
              <br />
              Первая версия дизайна для сравнения — <a className="text-brown hover:underline" href="/v1">otragenie-camp.ru/v1</a>.
            </p>
          </Section>

          <Section id="edit" title="Как вносить правки">
            <p>
              Все правки на сайте (тексты, цены, программа, добавление новых секций или изменение дизайна) делает разработчик. Чтобы что-то поправить — напишите, что и как нужно изменить, и приложите примеры или скриншоты, если есть.
            </p>
            <p>Удобный формат запроса:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Где:</strong> название секции или адрес страницы.</li>
              <li><strong>Что сейчас:</strong> текущий текст или скриншот.</li>
              <li><strong>Что нужно:</strong> новый текст или описание желаемого результата.</li>
            </ul>
            <p>После правок изменения появятся на сайте автоматически в течение нескольких минут.</p>
          </Section>

          <Section id="contacts" title="Контакты">
            <p>По всем вопросам по сайту, боту и оплате можно писать напрямую разработчику.</p>
            <p>
              <strong>Разработчик:</strong> Aleksandr Uspeshnyy
              <br />
              <strong>Telegram:</strong>{" "}
              <a className="text-brown hover:underline" href="https://t.me/uspeshnyy" target="_blank" rel="noopener noreferrer">
                t.me/uspeshnyy
              </a>
            </p>
            <p>
              <strong>Адрес сайта:</strong>{" "}
              <a className="text-brown hover:underline" href="https://otragenie-camp.ru" target="_blank" rel="noopener noreferrer">otragenie-camp.ru</a>
              <br />
              <strong>Telegram-бот:</strong>{" "}
              <a className="text-brown hover:underline" href="https://t.me/otrageniecamp_bot" target="_blank" rel="noopener noreferrer">@otrageniecamp_bot</a>
              <br />
              <strong>Супергруппа с лидами (приглашение):</strong>{" "}
              <a className="text-brown hover:underline break-all" href="https://t.me/+Y3OkTzH32uw1Zjgy" target="_blank" rel="noopener noreferrer">
                t.me/+Y3OkTzH32uw1Zjgy
              </a>
            </p>
          </Section>
        </main>
      </div>

      <footer className="mt-10 py-8 border-t border-brown/15 text-center text-[0.7rem] uppercase tracking-[0.22em] text-text-dark-muted">
        © Отражение Camp 2026 · Внутренний документ
      </footer>
    </div>
  );
};

// --- Sections Index ---

const SECTIONS_INDEX: { path: string; title: string; desc: string }[] = [
  { path: "/hero-sections", title: "Hero", desc: "Первый экран с видео и CTA" },
  { path: "/about-sections", title: "О проекте", desc: "Зачем мы создали этот кэмп" },
  { path: "/process-sections", title: "Процесс", desc: "Что происходит на кэмпе" },
  { path: "/philosophy-sections", title: "Философия", desc: "Глубина и структура" },
  { path: "/authors-sections", title: "Авторы", desc: "Майя и Роман" },
  { path: "/metodology-sections", title: "Методология", desc: "Как проходит работа" },
  { path: "/program-sections", title: "Программа", desc: "Три дня трансформации" },
  { path: "/location-sections", title: "Локация", desc: "Красная Поляна, Глэмпинг «Дзен рекавери»" },
  { path: "/testimonials-sections", title: "Кейсы", desc: "Истории трансформации" },
  { path: "/leadmagnit-sections", title: "Лид-магнит", desc: "10 минут, которые покажут почему" },
  { path: "/for-who-sections", title: "Для кого", desc: "Кому это нужно сейчас" },
  { path: "/result-sections", title: "Результат", desc: "Что вы заберёте с собой" },
  { path: "/pricing-sections", title: "Стоимость", desc: "Выберите формат участия" },
  { path: "/faq-sections", title: "Вопросы", desc: "Часто спрашивают" },
  { path: "/final-sections", title: "Финальный выбор", desc: "Точка, где можно остановить" },
  { path: "/footer-sections", title: "Футер", desc: "Подвал без соц-ссылок" }
];

export const SectionsIndexPage = () => (
  <div className="min-h-screen bg-cream">
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-14">
      <div className="mb-10 pb-6 border-b border-brown/20 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <span className="text-[0.68rem] uppercase tracking-[0.35em] text-brown font-medium block mb-3">Sections · черновики</span>
          <h1 className="font-serif italic text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] text-text-dark">
            Варианты <span className="not-italic">секций сайта</span>
          </h1>
        </div>
        <a href="/" className="text-[0.75rem] uppercase tracking-[0.2em] text-brown hover:text-brown-dark font-medium transition">← На главную</a>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECTIONS_INDEX.map((s, i) => (
          <a key={s.path} href={s.path} className="group bg-white rounded-2xl border border-brown/10 p-6 hover:border-brown/40 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="font-serif text-brown text-[0.72rem] uppercase tracking-[0.22em]">№ {String(i + 1).padStart(2, "0")}</span>
              <ArrowRight size={16} className="text-brown/50 group-hover:text-brown group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="font-serif text-[1.35rem] text-text-dark mb-1 group-hover:text-brown transition">{s.title}</h2>
            <p className="text-[0.85rem] text-text-dark-soft leading-[1.55] mb-3">{s.desc}</p>
            <code className="text-[0.7rem] text-text-dark-muted font-mono">{s.path}</code>
          </a>
        ))}
      </div>
      <p className="mt-10 text-center text-[0.72rem] uppercase tracking-[0.2em] text-text-dark-muted">Всего {SECTIONS_INDEX.length} страниц · на каждой по 4—5 вариантов</p>
    </div>
  </div>
);

// --- Hero Variants ---

const HERO_VIDEO = "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/img/intro-yoga.mp4";
const HERO_IMG = "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/romamaya.jpg";

// V1 — minimalist centered, full video
const HeroV1 = () => (
  <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-navy">
    <video src={HERO_VIDEO} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-45" />
    <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-transparent to-navy/80" />
    <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[0.65rem] uppercase tracking-[0.4em] text-white/70 z-20">Вариант 1 · Минимал-центр</div>
    <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
      <span className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/5 text-white/70 text-[0.7rem] tracking-[0.3em] uppercase mb-8">19 — 21 июня · Красная Поляна</span>
      <h1 className="font-serif text-[clamp(3rem,8vw,6rem)] leading-[0.95] text-white mb-6">Отражение</h1>
      <p className="font-serif italic text-[clamp(1rem,2vw,1.2rem)] text-white/75 max-w-md mx-auto mb-8 leading-[1.7]">О честности с собой. о честности с собой, о том, как увидеть свою жизнь без иллюзий и изменить то, что в ней не работает</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button className="px-8 py-3.5 rounded-full bg-brown text-white text-[0.8rem] uppercase tracking-[0.12em] font-medium hover:bg-brown-dark transition">Пройти разбор</button>
        <button className="px-8 py-3.5 rounded-full border border-white/30 text-white text-[0.8rem] uppercase tracking-[0.12em] font-medium hover:bg-white/10 transition">Забронировать</button>
      </div>
    </div>
  </section>
);

// V2 — split: video left, text right
const HeroV2 = () => (
  <section className="min-h-screen flex items-stretch relative overflow-hidden">
    <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 z-30">Вариант 2 · Сплит видео/текст</div>
    <div className="grid lg:grid-cols-2 w-full min-h-screen">
      <div className="relative overflow-hidden min-h-[40vh] lg:min-h-screen">
        <video src={HERO_VIDEO} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-navy/60 to-transparent" />
      </div>
      <div className="bg-cream flex items-center px-8 md:px-14 py-14">
        <div>
          <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-5">Выездной кэмп</span>
          <h1 className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.98] text-text-dark mb-5">Отражение</h1>
          <p className="font-serif italic text-[clamp(1.1rem,2vw,1.4rem)] text-brown mb-2">19 — 21 июня 2026</p>
          <p className="text-[0.98rem] text-text-dark-soft leading-[1.75] max-w-md mb-8">О честности с собой. о честности с собой, о том, как увидеть свою жизнь без иллюзий и изменить то, что в ней не работает</p>
          <div className="flex flex-wrap gap-3">
            <button className="px-7 py-3 rounded-full bg-brown text-white text-[0.8rem] uppercase tracking-[0.12em] font-medium hover:bg-brown-dark transition">Пройти разбор</button>
            <button className="px-7 py-3 rounded-full border border-brown/30 text-brown text-[0.8rem] uppercase tracking-[0.12em] font-medium hover:bg-brown hover:text-white transition">Забронировать</button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// V3 — editorial magazine, asymmetric with meta
const HeroV3 = () => (
  <section className="min-h-screen flex items-center py-14 bg-cream relative overflow-hidden">
    <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 z-20">Вариант 3 · Журнальная обложка</div>
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-10 items-center">
        <div>
          <div className="text-[0.62rem] uppercase tracking-[0.3em] text-brown font-bold mb-3">Выпуск · 2026 · № 01</div>
          <h1 className="font-serif italic text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.95] text-text-dark mb-4">
            Отражение<span className="not-italic text-brown">.</span>
          </h1>
          <div className="h-px w-24 bg-brown/40 mb-4" />
          <p className="font-serif text-[clamp(1.1rem,2vw,1.4rem)] text-text-dark leading-[1.55] mb-6 max-w-md">О честности с собой — о том, как увидеть свою жизнь без иллюзий и изменить то, что в ней не работает.</p>
          <div className="flex flex-wrap items-center gap-4 mb-7 text-[0.68rem] uppercase tracking-[0.22em] text-text-dark-muted">
            <span><span className="text-brown font-bold">Даты:</span> 19 — 21 июн</span>
            <span className="w-1 h-1 rounded-full bg-brown/40" />
            <span><span className="text-brown font-bold">Мест:</span> 10</span>
            <span className="w-1 h-1 rounded-full bg-brown/40" />
            <span><span className="text-brown font-bold">Место:</span> Красная Поляна</span>
          </div>
          <div className="flex gap-3">
            <button className="px-7 py-3 rounded-full bg-brown text-white text-[0.8rem] uppercase tracking-[0.12em] font-medium hover:bg-brown-dark transition">Пройти разбор</button>
            <button className="px-7 py-3 rounded-full border border-text-dark/20 text-text-dark text-[0.8rem] uppercase tracking-[0.12em] font-medium hover:bg-text-dark hover:text-cream transition">Программа</button>
          </div>
        </div>
        <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-navy shadow-2xl">
          <video src={HERO_VIDEO} autoPlay muted loop playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent" />
          <div className="absolute top-4 left-4 right-4 flex justify-between text-white text-[0.6rem] uppercase tracking-[0.25em]">
            <span>отражение</span>
            <span>camp · 2026</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// V4 — fullscreen image hero with centered caps + bottom meta bar
const HeroV4 = () => (
  <section className="min-h-screen flex items-stretch relative overflow-hidden bg-navy">
    <img src={HERO_IMG} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
    <div className="absolute inset-0 bg-gradient-to-b from-navy/30 via-navy/50 to-navy/95" />
    <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[0.65rem] uppercase tracking-[0.4em] text-white/70 z-20">Вариант 4 · Фото + мета-бар</div>
    <div className="relative z-10 w-full flex flex-col justify-end pb-20">
      <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
        <span className="block text-[0.68rem] uppercase tracking-[0.35em] text-brown-light mb-5">Терапевтический выезд · 19 — 21 июня</span>
        <h1 className="font-serif text-[clamp(3.5rem,11vw,9rem)] leading-[0.9] text-white uppercase tracking-[0.04em] mb-4">ОТРАЖЕНИЕ</h1>
        <p className="font-serif italic text-[clamp(1.1rem,2vw,1.5rem)] text-white/80 max-w-xl leading-[1.5] mb-7">Место, где можно увидеть свою жизнь без иллюзий — и пересобрать.</p>
        <div className="flex gap-3 flex-wrap mb-10">
          <button className="px-8 py-3.5 rounded-full bg-brown text-white text-[0.8rem] uppercase tracking-[0.12em] font-medium hover:bg-brown-dark transition">Пройти разбор</button>
          <button className="px-8 py-3.5 rounded-full border border-white/35 text-white text-[0.8rem] uppercase tracking-[0.12em] font-medium hover:bg-white/10 transition">Забронировать</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/15">
          {[["Формат", "2 дня"], ["Группа", "10 мест"], ["Место", "Красная Поляна"], ["Ведут", "Майя и Роман"]].map(([l, v]) => (
            <div key={l}>
              <div className="text-[0.58rem] uppercase tracking-[0.25em] text-brown-light mb-1">{l}</div>
              <div className="text-[0.88rem] text-white/80">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// V5 — refined current (video bg, centered, mirror reflection title)
const HeroV5 = () => (
  <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-navy">
    <video src={HERO_VIDEO} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-45" />
    <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-transparent to-navy/80" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
    <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[0.65rem] uppercase tracking-[0.4em] text-white/70 z-20">Вариант 5 · Текущий (доработанный)</div>
    <div className="relative z-10 max-w-[72rem] mx-auto px-6 text-center">
      <span className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white/70 text-[0.72rem] tracking-[0.3em] uppercase mb-9">19 — 21 июня · Красная Поляна</span>
      <div className="relative mb-7">
        <h1 className="font-serif text-[clamp(3.2rem,9vw,7rem)] leading-[0.95] text-white font-normal tracking-[0.02em] relative z-10">Отражение</h1>
        <h1 className="font-serif text-[clamp(3.2rem,9vw,7rem)] leading-[0.95] text-white font-normal tracking-[0.02em] absolute top-full left-0 right-0 opacity-[0.07] scale-y-[-1] blur-[2px] select-none pointer-events-none" style={{ maskImage: "linear-gradient(to bottom, transparent 20%, black 100%)" }}>Отражение</h1>
      </div>
      <p className="font-serif text-[clamp(1rem,2vw,1.2rem)] text-white/75 max-w-[32.5rem] mx-auto mb-5 italic leading-[1.7] font-light">О честности с собой. о честности с собой, о том, как увидеть свою жизнь без иллюзий и изменить то, что в ней не работает</p>
      <div className="flex gap-4 justify-center flex-wrap mb-9">
        <span className="px-5 py-2 rounded-full border border-white/30 text-white/80 text-[0.78rem] tracking-[0.03em]">10 мест в группе</span>
        <span className="px-5 py-2 rounded-full border border-white/30 text-white/80 text-[0.78rem] tracking-[0.03em]">Красная Поляна</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button className="px-10 py-3.5 rounded-full bg-brown text-white text-[0.78rem] uppercase tracking-[0.12em] font-medium hover:bg-brown-dark transition shadow-2xl">Пройти индивидуальный разбор</button>
        <button className="px-10 py-3.5 rounded-full border border-white/45 bg-white/10 text-white text-[0.78rem] uppercase tracking-[0.12em] font-medium hover:bg-white/20 transition">Забронировать место</button>
      </div>
      <p className="font-serif italic text-white/50 text-[0.95rem] leading-[1.6] max-w-[31.25rem] mx-auto mt-8">Участие проходит через индивидуальный разбор, чтобы вы точно поняли, зачем вам это и какой результат хотите получить.</p>
    </div>
  </section>
);

export const HeroSectionsPage = () => (
  <div className="bg-cream min-h-screen">
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex items-center justify-between">
      <a href="/" className="font-serif text-[1.4rem] tracking-[0.08em] text-text-dark">Отражение</a>
      <span className="text-[0.7rem] uppercase tracking-[0.3em] text-text-dark-muted">Варианты Hero</span>
    </div>
    <HeroV1 />
    <HeroV2 />
    <HeroV3 />
    <HeroV4 />
    <HeroV5 />
  </div>
);

// --- Footer Variants ---

const FOOTER_META: [string, string][] = [
  ["Формат", "2 дня глубокой работы"],
  ["Группа", "Всего 10 участников"],
  ["Фокус", "Ценности, отношения, жизнь"]
];
const FOOTER_DESC = "Пространство для тех, кто готов не просто пережить сильный опыт, а пересобрать свою жизнь через честную встречу с собой.";

// V1 — minimal cream, single line
const FooterV1 = () => (
  <footer className="bg-cream border-t border-brown/15 py-12">
    <div className="max-w-6xl mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-6">Вариант 1 · Минимал cream</div>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-brown/15">
        <div className="text-center md:text-left">
          <div className="font-serif text-[1.6rem] tracking-[0.1em] text-text-dark">Отражение</div>
          <p className="text-[0.82rem] text-text-dark-muted mt-1">Терапевтический кэмп · Красная Поляна</p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-center">
          {FOOTER_META.map(([l, v]) => (
            <div key={l}>
              <div className="text-[0.58rem] uppercase tracking-[0.22em] text-brown">{l}</div>
              <div className="text-[0.88rem] text-text-dark-soft">{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 pt-5 text-[0.7rem] uppercase tracking-[0.22em] text-text-dark-muted">
        <p>© 2026 «Отражение»</p>
        <p>Небольшая группа · Безопасное пространство</p>
      </div>
    </div>
  </footer>
);

// V2 — light editorial, centered logo + bullets
const FooterV2 = () => (
  <footer className="bg-[#f3ede4] border-t border-brown/15 py-14">
    <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
      <div className="text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-6">Вариант 2 · Центрированный редакционный</div>
      <div className="font-serif text-[2.2rem] tracking-[0.1em] text-text-dark">Отражение</div>
      <div className="inline-block text-[0.6rem] uppercase tracking-[0.28em] text-brown border border-brown/25 rounded-full px-3 py-1 mt-2 mb-6">Camp · Красная Поляна</div>
      <p className="font-serif italic text-[1.05rem] text-text-dark-soft leading-[1.7] max-w-xl mx-auto mb-8">{FOOTER_DESC}</p>
      <div className="flex flex-wrap items-center justify-center gap-4 text-[0.7rem] uppercase tracking-[0.2em] text-text-dark-muted">
        {FOOTER_META.map(([l, v], i) => (
          <div key={l} className="flex items-center gap-4">
            {i > 0 && <span className="w-1 h-1 rounded-full bg-brown/40" />}
            <span><span className="text-brown font-bold">{l}:</span> {v}</span>
          </div>
        ))}
      </div>
      <div className="mt-10 pt-6 border-t border-brown/15 text-[0.65rem] uppercase tracking-[0.24em] text-text-dark-muted">
        © 2026 Терапевтический кэмп «Отражение»
      </div>
    </div>
  </footer>
);

// V3 — dark columns (brand / about / contact-soft)
const FooterV3 = () => (
  <footer className="bg-navy text-white/70 py-14 border-t border-white/10">
    <div className="max-w-6xl mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown-light/60 mb-8">Вариант 3 · Тёмные колонки</div>
      <div className="grid md:grid-cols-[1.4fr_1fr_1fr] gap-10">
        <div>
          <div className="font-serif text-[1.7rem] tracking-[0.1em] text-white mb-3">Отражение</div>
          <p className="text-[0.88rem] leading-[1.7] text-white/60 max-w-sm">{FOOTER_DESC}</p>
        </div>
        <div>
          <div className="text-[0.6rem] uppercase tracking-[0.25em] text-brown-light mb-3">Параметры</div>
          <ul className="space-y-2 text-[0.88rem] text-white/75">
            {FOOTER_META.map(([l, v]) => (
              <li key={l}><span className="text-white/45">{l}:</span> {v}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[0.6rem] uppercase tracking-[0.25em] text-brown-light mb-3">Даты</div>
          <div className="font-serif text-[1.6rem] text-white leading-tight mb-1">19—21<br />июня 2026</div>
          <p className="text-[0.78rem] text-white/50">Глэмпинг «Дзен рекавери», Красная Поляна</p>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-[0.65rem] uppercase tracking-[0.24em] text-white/35">
        <p>© 2026 «Отражение»</p>
        <p>Безопасное пространство · Глубинная работа с собой</p>
      </div>
    </div>
  </footer>
);

// V4 — magazine masthead
const FooterV4 = () => (
  <footer className="bg-cream border-t border-text-dark/15 py-14">
    <div className="max-w-6xl mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-8">Вариант 4 · Журнальный masthead</div>
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 pb-6 border-b-2 border-text-dark">
        <div>
          <div className="text-[0.62rem] uppercase tracking-[0.35em] text-brown font-bold mb-2">Выпуск · апрель 2026</div>
          <div className="font-serif italic text-[clamp(2.2rem,5vw,3.6rem)] leading-none text-text-dark">
            Отражение<span className="not-italic text-brown">·</span> Camp
          </div>
        </div>
        <div className="text-right">
          <div className="font-serif italic text-[1.3rem] text-text-dark">19 — 21 июня</div>
          <div className="text-[0.7rem] uppercase tracking-[0.22em] text-brown">Красная Поляна</div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {FOOTER_META.map(([l, v]) => (
          <div key={l} className="border-t border-text-dark/20 pt-3">
            <div className="text-[0.62rem] uppercase tracking-[0.22em] text-brown font-bold mb-1">{l}</div>
            <p className="font-serif text-[1rem] text-text-dark leading-snug">{v}</p>
          </div>
        ))}
      </div>
      <p className="mt-10 text-[0.68rem] uppercase tracking-[0.22em] text-text-dark-muted">© 2026 «Отражение» · Все права защищены</p>
    </div>
  </footer>
);

// V5 — refined current (dark glass card, no socials)
const FooterV5 = () => (
  <footer className="relative overflow-hidden border-t border-white/8 bg-[#081026] py-14 text-white/55">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,179,140,0.16),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(76,97,145,0.22),transparent_38%)]" />
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown-light/60 mb-6">Вариант 5 · Текущий (доработанный)</div>
      <div className="grid gap-6 md:gap-8 rounded-[1.7rem] md:rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
        <div className="text-center lg:text-left">
          <div className="mb-4 inline-flex items-center rounded-full border border-[#d7bb9d]/25 bg-[#d7bb9d]/10 px-4 py-1.5 text-[0.62rem] uppercase tracking-[0.32em] text-[#e6c6a3]">
            Терапевтический выезд · Красная Поляна
          </div>
          <h2 className="mb-3 font-serif text-3xl text-white tracking-[0.12em] md:text-4xl">ОТРАЖЕНИЕ</h2>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-white/65 lg:mx-0">{FOOTER_DESC}</p>
        </div>
        <div className="grid gap-3 text-center sm:grid-cols-3">
          {FOOTER_META.map(([l, v]) => (
            <div key={l} className="rounded-[1.2rem] border border-white/10 bg-[#0c1632]/70 px-4 py-4">
              <div className="mb-1 text-[0.58rem] uppercase tracking-[0.28em] text-[#d6af88]">{l}</div>
              <p className="text-sm leading-6 text-white/68">{v}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/8 pt-5 text-center text-[0.62rem] uppercase tracking-[0.24em] text-white/32 md:flex-row">
        <p>© 2026 Кэмп «Отражение»</p>
        <p>Небольшая группа · Безопасное пространство · Глубинная работа с собой</p>
      </div>
    </div>
  </footer>
);

export const FooterSectionsPage = () => (
  <div className="bg-cream min-h-screen">
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex items-center justify-between">
      <a href="/" className="font-serif text-[1.4rem] tracking-[0.08em] text-text-dark">Отражение</a>
      <span className="text-[0.7rem] uppercase tracking-[0.3em] text-text-dark-muted">Варианты футера</span>
    </div>
    <FooterV1 />
    <FooterV2 />
    <FooterV3 />
    <FooterV4 />
    <FooterV5 />
  </div>
);

// --- FinalBlock Variants ---

const FINAL_IMG = "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/romamaya.jpg";

// V1 — centered minimal, hero-like
const FinalV1 = () => (
  <section className="min-h-screen flex items-center py-12 bg-cream">
    <div className="max-w-3xl w-full mx-auto px-6 md:px-12 text-center">
      <div className="text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 1 · Минимал-центр</div>
      <span className="inline-flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-brown font-bold bg-white/70 border border-brown/15 rounded-full px-4 py-1.5 mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-brown animate-pulse" />
        Финальный выбор
      </span>
      <h2 className="font-serif text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] text-text-dark mb-4">Если ничего не менять, через год будет то же самое</h2>
      <p className="text-[1rem] text-text-dark-soft mb-2">Те же мысли. Те же решения. Те же сценарии.</p>
      <p className="font-serif italic text-[clamp(1.15rem,2.2vw,1.5rem)] text-brown mb-8">Этот выезд — точка, где можно это остановить</p>
      <div className="flex items-center justify-center gap-3 mb-7">
        <div className="w-2 h-2 rounded-full bg-brown animate-pulse" />
        <span className="text-[0.65rem] uppercase tracking-[0.2em] font-bold text-brown">В группе всего 10 мест</span>
      </div>
      <button className="px-8 py-3.5 rounded-full bg-brown text-white text-[0.8rem] uppercase tracking-[0.12em] font-medium hover:bg-brown-dark transition">Забронировать место</button>
    </div>
  </section>
);

// V2 — dark moody split
const FinalV2 = () => (
  <section className="min-h-screen flex items-stretch relative overflow-hidden">
    <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[0.65rem] uppercase tracking-[0.4em] text-white/70 z-20">Вариант 2 · Тёмный эмоциональный</div>
    <div className="grid lg:grid-cols-2 w-full min-h-screen">
      <div className="relative overflow-hidden">
        <img src={FINAL_IMG} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-navy via-navy/50 lg:via-navy/20 to-navy/60 lg:to-transparent" />
      </div>
      <div className="bg-navy text-white flex items-center px-8 md:px-12 py-14">
        <div>
          <span className="inline-flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-brown-light font-bold border border-brown-light/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brown-light animate-pulse" />
            Финальный выбор
          </span>
          <h2 className="font-serif text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] mb-4 font-light">Если ничего не менять,<br /><span className="italic text-brown-light">через год будет то же самое</span></h2>
          <p className="text-[1rem] text-white/75 mb-1">Те же мысли. Те же решения. Те же сценарии.</p>
          <p className="font-serif italic text-[1.25rem] text-brown-light mb-8">Этот выезд — точка, где можно это остановить</p>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-brown-light animate-pulse" />
            <span className="text-[0.65rem] uppercase tracking-[0.2em] font-bold text-brown-light">В группе всего 10 мест</span>
          </div>
          <button className="px-8 py-3.5 rounded-full bg-brown text-white text-[0.82rem] uppercase tracking-[0.12em] font-medium hover:bg-brown-dark transition">Забронировать место</button>
        </div>
      </div>
    </div>
  </section>
);

// V3 — editorial asymmetric
const FinalV3 = () => (
  <section className="min-h-screen flex items-center py-12 bg-cream">
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 3 · Журнальная асимметрия</div>
      <div className="mb-8 pb-5 border-b border-brown/20 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <span className="text-[0.68rem] uppercase tracking-[0.35em] text-brown font-medium block mb-3">Финальный выбор · 2026</span>
          <h2 className="font-serif italic text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.05] text-text-dark max-w-[14ch]">
            Через год — <span className="not-italic">то же самое</span>?
          </h2>
        </div>
        <p className="text-[0.9rem] text-text-dark-soft leading-[1.65] max-w-sm">Те же мысли. Те же решения. Те же сценарии. Или — точка, где это можно остановить.</p>
      </div>
      <div className="grid lg:grid-cols-[1fr_1fr] gap-10 items-center">
        <div className="aspect-[4/5] overflow-hidden rounded-sm bg-navy">
          <img src={FINAL_IMG} alt="" aria-hidden="true" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div>
          <p className="font-serif italic text-[1.35rem] md:text-[1.6rem] text-brown mb-6 leading-snug">«Этот выезд — точка, где можно это остановить»</p>
          <div className="mb-6 pb-5 border-b border-brown/15">
            <div className="text-[0.68rem] uppercase tracking-[0.22em] text-brown font-bold mb-2">Ведут</div>
            <h3 className="font-serif text-[1.8rem] text-text-dark leading-[0.98] mb-1">Майя Дзодзатти<br />и Роман Дусенко</h3>
            <p className="text-[0.88rem] italic text-text-dark-soft">Помогаем найти свои ответы и наладить жизнь</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button className="px-7 py-3 rounded-full bg-brown text-white text-[0.78rem] uppercase tracking-[0.12em] font-medium hover:bg-brown-dark transition">Забронировать место</button>
            <span className="text-[0.65rem] uppercase tracking-[0.2em] font-bold text-brown">10 мест в группе</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// V4 — urgency countdown banner
const FinalV4 = () => (
  <section className="min-h-screen flex items-center py-12 bg-[linear-gradient(135deg,#1a1530_0%,#0b1130_60%,#1d1440_100%)] text-white relative overflow-hidden">
    <div className="absolute inset-0 opacity-40 pointer-events-none">
      <div className="absolute -top-20 right-[12%] h-72 w-72 rounded-full bg-brown/25 blur-3xl" />
      <div className="absolute bottom-0 left-[8%] h-80 w-80 rounded-full bg-brown-light/15 blur-3xl" />
    </div>
    <div className="max-w-4xl w-full mx-auto px-6 md:px-12 relative z-10 text-center">
      <div className="text-[0.65rem] uppercase tracking-[0.4em] text-brown-light/60 mb-5">Вариант 4 · Urgency-баннер</div>
      <span className="inline-flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-white font-bold bg-brown/30 border border-brown-light/40 rounded-full px-4 py-1.5 mb-6">
        <AlertTriangle size={12} />
        Финальный выбор · 19–21 июня
      </span>
      <h2 className="font-serif text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.02] mb-5 font-light">
        Если ничего не менять,<br /><span className="italic text-brown-light">через год будет то же самое</span>
      </h2>
      <p className="text-[1.05rem] text-white/70 max-w-xl mx-auto mb-10">Этот выезд — точка, где можно это остановить. В группе всего 10 мест.</p>
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-10">
        {[{ v: "10", l: "мест" }, { v: "3", l: "дня" }, { v: "2", l: "ведущих" }].map((x) => (
          <div key={x.l} className="border border-white/15 rounded-xl py-4">
            <div className="font-serif text-[2rem] text-brown-light">{x.v}</div>
            <div className="text-[0.6rem] uppercase tracking-[0.18em] text-white/50">{x.l}</div>
          </div>
        ))}
      </div>
      <button className="px-9 py-4 rounded-full bg-brown text-white text-[0.85rem] uppercase tracking-[0.14em] font-medium hover:bg-brown-dark transition shadow-[0_12px_30px_rgba(154,125,90,0.4)]">Забронировать место</button>
    </div>
  </section>
);

// V5 — refined current (portrait left + glass card right)
const FinalV5 = ({ onOpenModal }: any) => (
  <section className="min-h-screen flex items-center relative overflow-hidden py-12 bg-[linear-gradient(135deg,#efe4d4_0%,#f8f3ec_42%,#ede2d1_100%)]">
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div className="absolute -top-24 right-[10%] h-72 w-72 rounded-full bg-brown/10 blur-3xl" />
      <div className="absolute bottom-0 left-[8%] h-80 w-80 rounded-full bg-[#d8c1a3]/20 blur-3xl" />
    </div>
    <div className="absolute inset-y-0 left-0 w-full lg:w-[44%] z-0">
      <img src={FINAL_IMG} alt="" aria-hidden="true" className="w-full h-full object-cover object-left lg:object-[center_top]" referrerPolicy="no-referrer" />
      <div className="absolute inset-0 bg-[#f4ece2]/84 lg:hidden" />
      <div className="hidden lg:block absolute inset-y-0 right-0 w-1/2 bg-gradient-to-r from-transparent via-[#f4ece2]/72 to-[#f4ece2]" />
    </div>
    <div className="max-w-7xl w-full mx-auto px-5 md:px-10 relative z-10">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 5 · Текущий (доработанный)</div>
      <div className="grid lg:grid-cols-12 gap-6 items-center">
        <div className="hidden lg:block lg:col-span-5" />
        <div className="lg:col-span-7 lg:pl-4">
          <div className="w-full max-w-[620px] mx-auto lg:ml-auto rounded-[1.7rem] md:rounded-[2rem] border border-white/55 bg-[#fffaf4]/84 backdrop-blur-sm shadow-[0_30px_80px_-24px_rgba(78,56,30,0.24)] px-5 py-7 md:px-8 md:py-8">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <span className="mb-3 inline-flex items-center gap-3 rounded-full border border-brown/12 bg-white/55 px-4 py-2 text-[0.62rem] font-bold uppercase tracking-[0.24em] text-brown">
                <span className="h-2 w-2 rounded-full bg-brown animate-pulse" />
                Финальный выбор
              </span>
              <h2 className="font-serif text-[clamp(1.7rem,2.8vw,2.6rem)] leading-[1] text-text-dark mb-3 max-w-[12ch]">Если ничего не менять, через год будет то же самое</h2>
              <p className="text-[0.95rem] text-text-dark-soft mb-1">Те же мысли. Те же решения. Те же сценарии.</p>
              <p className="font-serif text-[clamp(1.05rem,2vw,1.35rem)] text-brown/80 italic mb-5">Этот выезд — точка, где можно это остановить</p>
              <div className="w-full">
                <div className="mb-5 rounded-[1.25rem] bg-white/62 border border-brown/10 px-5 py-4">
                  <h4 className="font-serif text-[0.95rem] text-text-dark/70 mb-1">Эксперты</h4>
                  <h3 className="font-serif text-[clamp(1.4rem,2.4vw,2rem)] leading-[0.98] text-text-dark mb-1">Майя Дзодзатти <br /> и Роман Дусенко</h3>
                  <p className="text-[0.88rem] text-text-dark-soft italic">Помогаем найти свои ответы и наладить жизнь</p>
                </div>
                <div className="inline-flex items-center gap-3 bg-[#f3e7d7] px-4 py-2 rounded-full border border-brown/10 mb-4">
                  <div className="w-2 h-2 rounded-full bg-brown animate-pulse" />
                  <span className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-brown">В группе всего 10 мест</span>
                </div>
                <div className="pt-2">
                  <button onClick={() => onOpenModal?.()} className="px-7 py-3 rounded-full bg-brown text-white text-[0.82rem] uppercase tracking-[0.12em] font-medium hover:bg-brown-dark transition">Забронировать место</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const FinalSectionsPage = () => (
  <div className="bg-cream min-h-screen">
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex items-center justify-between">
      <a href="/" className="font-serif text-[1.4rem] tracking-[0.08em] text-text-dark">Отражение</a>
      <span className="text-[0.7rem] uppercase tracking-[0.3em] text-text-dark-muted">Варианты секции «Финальный выбор»</span>
    </div>
    <FinalV1 />
    <FinalV2 />
    <FinalV3 />
    <FinalV4 />
    <FinalV5 />
  </div>
);

// --- FAQ Variants ---

const FAQ_ITEMS = [
  { q: "Как понять, подходит ли мне этот формат?", a: "Для этого мы проводим предварительный индивидуальный разбор. Это бесплатная 20-минутная встреча, где мы обсуждаем ваш запрос и понимаем, сможем ли мы быть полезны в рамках этого выезда." },
  { q: "Нужна ли специальная психологическая подготовка?", a: "Нет, специальная подготовка не требуется. Важна только ваша готовность к честному диалогу с собой и группой." },
  { q: "Что входит в стоимость проживания?", a: "В стоимость входит проживание в глэмпинге «Дзен рекавери», банный ритуал и все материалы программы." },
  { q: "Сколько человек будет в группе?", a: "Мы ограничиваем группу до 10 человек. Это оптимальное количество для того, чтобы каждый участник получил достаточно внимания и смог пройти глубокий личный процесс." }
];

// V1 — split: question list left, active answer right
const FAQV1 = () => {
  const [active, setActive] = useState(0);
  return (
    <section className="min-h-screen flex items-center py-12 bg-cream">
      <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
        <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 1 · Сплит вопрос/ответ</div>
        <div className="text-center mb-8">
          <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Вопросы</span>
          <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark">Часто спрашивают</h2>
        </div>
        <div className="grid lg:grid-cols-[360px_1fr] gap-6 items-start">
          <div className="space-y-1">
            {FAQ_ITEMS.map((f, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`w-full text-left px-5 py-4 rounded-xl transition ${active === i ? "bg-brown text-white" : "bg-white text-text-dark hover:bg-white/80"}`}>
                <div className={`text-[0.6rem] uppercase tracking-[0.2em] mb-1 ${active === i ? "text-white/70" : "text-brown/70"}`}>№ 0{i + 1}</div>
                <div className="font-serif text-[0.95rem] leading-snug">{f.q}</div>
              </button>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-8 border border-brown/10 min-h-[260px]">
            <div className="text-[0.62rem] uppercase tracking-[0.25em] text-brown mb-3">Ответ · 0{active + 1}</div>
            <h3 className="font-serif text-[1.35rem] text-text-dark mb-4 leading-snug">{FAQ_ITEMS[active].q}</h3>
            <p className="text-[0.95rem] text-text-dark-soft leading-[1.7]">{FAQ_ITEMS[active].a}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// V2 — two-column open card list
const FAQV2 = () => (
  <section className="min-h-screen flex items-center py-12 bg-white">
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 2 · Всё открыто (2 колонки)</div>
      <div className="text-center mb-10">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Вопросы</span>
        <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark">Часто спрашивают</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {FAQ_ITEMS.map((f, i) => (
          <div key={i} className="bg-[#faf7f2] rounded-2xl p-6 border border-brown/10">
            <div className="flex items-start gap-4">
              <div className="font-serif text-brown/40 text-[2rem] leading-none shrink-0">0{i + 1}</div>
              <div>
                <h3 className="font-serif text-[1.1rem] text-text-dark mb-2 leading-snug">{f.q}</h3>
                <p className="text-[0.88rem] text-text-dark-soft leading-[1.65]">{f.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V3 — dark with chat-bubble style
const FAQV3 = () => (
  <section className="min-h-screen flex items-center py-12 bg-navy text-white relative overflow-hidden">
    <div className="max-w-3xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown-light/60 mb-5">Вариант 3 · Диалог</div>
      <div className="text-center mb-8">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown-light font-medium block mb-3">Вопросы</span>
        <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-white font-light">Часто спрашивают</h2>
      </div>
      <div className="space-y-5">
        {FAQ_ITEMS.map((f, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-end">
              <div className="bg-brown text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%]">
                <p className="font-serif text-[0.98rem] leading-snug">{f.q}</p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-white/[0.05] border border-white/10 text-white/85 px-5 py-3 rounded-2xl rounded-tl-sm max-w-[82%]">
                <p className="text-[0.88rem] leading-[1.65]">{f.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V4 — editorial numbered Q&A list
const FAQV4 = () => (
  <section className="min-h-screen flex items-center py-12 bg-cream">
    <div className="max-w-4xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 4 · Журнальный Q&amp;A</div>
      <div className="mb-8 pb-5 border-b border-brown/20 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <span className="text-[0.68rem] uppercase tracking-[0.35em] text-brown font-medium block mb-3">Q&amp;A · Частые вопросы</span>
          <h2 className="font-serif italic text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.05] text-text-dark">Часто <span className="not-italic">спрашивают</span></h2>
        </div>
        <p className="text-[0.88rem] text-text-dark-soft leading-[1.65] max-w-sm">Если остались вопросы — напишите нам в Telegram, ответим лично.</p>
      </div>
      <div className="divide-y divide-text-dark/10">
        {FAQ_ITEMS.map((f, i) => (
          <div key={i} className="py-6">
            <div className="flex items-baseline gap-4 mb-3">
              <div className="font-serif text-brown text-[0.72rem] uppercase tracking-[0.22em]">Q · № 0{i + 1}</div>
              <h3 className="font-serif text-[1.15rem] text-text-dark flex-1 leading-snug">{f.q}</h3>
            </div>
            <div className="flex items-baseline gap-4 pl-0 md:pl-[84px]">
              <div className="hidden md:block font-serif italic text-brown/60 text-[0.72rem] uppercase tracking-[0.22em] -ml-[84px]">A</div>
              <p className="text-[0.92rem] text-text-dark-soft leading-[1.7]">{f.a}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V5 — refined current (accordion, cream)
const FAQV5 = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="min-h-screen flex items-center py-12 bg-cream">
      <div className="max-w-3xl w-full mx-auto px-6 md:px-12">
        <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 5 · Текущий (доработанный)</div>
        <div className="text-center mb-8">
          <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Вопросы</span>
          <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark">Часто спрашивают</h2>
          <div className="h-px w-16 bg-brown/30 mx-auto mt-4" />
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className={`rounded-2xl border transition-all ${isOpen ? "bg-white border-brown/30 shadow-md" : "bg-white/70 border-brown/10 hover:border-brown/20"}`}>
                <button onClick={() => setOpen(isOpen ? null : i)} className="w-full px-6 py-5 flex justify-between items-center text-left gap-4">
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif text-brown/50 text-[0.85rem]">0{i + 1}</span>
                    <span className="font-serif text-[1.05rem] text-text-dark leading-snug">{f.q}</span>
                  </div>
                  <ChevronDown size={18} className={`text-text-dark-muted shrink-0 transition-transform ${isOpen ? "rotate-180 text-brown" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-6 pb-5 pl-14 text-text-dark-soft text-[0.9rem] leading-[1.7]">{f.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const FAQSectionsPage = () => (
  <div className="bg-cream min-h-screen">
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex items-center justify-between">
      <a href="/" className="font-serif text-[1.4rem] tracking-[0.08em] text-text-dark">Отражение</a>
      <span className="text-[0.7rem] uppercase tracking-[0.3em] text-text-dark-muted">Варианты секции «Вопросы»</span>
    </div>
    <FAQV1 />
    <FAQV2 />
    <FAQV3 />
    <FAQV4 />
    <FAQV5 />
  </div>
);

// --- Pricing Variants ---

// V1 — minimal 3 columns, single highlighted plan
const PricingV1 = () => (
  <section className="min-h-screen flex items-center py-12 bg-white">
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 1 · Минимал, 3 колонки</div>
      <div className="text-center mb-10">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Стоимость</span>
        <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark">Выберите формат участия</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {PRICING.map((p, i) => {
          const featured = p.theme === "premium";
          return (
            <div key={i} className={`rounded-2xl p-7 flex flex-col border ${featured ? "bg-navy text-white border-brown shadow-xl" : "bg-[#faf8f3] border-brown/10"}`}>
              <div className="mb-5">
                <h3 className={`font-serif text-[1.5rem] mb-1 ${featured ? "text-white" : "text-text-dark"}`}>{p.name}</h3>
                <p className={`text-[0.82rem] leading-[1.55] ${featured ? "text-white/65" : "text-text-dark-soft"}`}>{p.desc}</p>
              </div>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="font-serif text-[2.2rem] text-brown-light">{p.price.split(" ")[0]}</span>
                <span className={`text-sm ${featured ? "text-white/40" : "text-text-dark-muted"}`}>{p.price.split(" ").slice(1).join(" ")}</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {p.feats.map((f: any, j: number) => (
                  <li key={j} className={`flex gap-2 text-[0.85rem] leading-snug ${featured ? "text-white/80" : "text-text-dark-soft"}`}>
                    <CheckCircle size={14} className={`shrink-0 mt-0.5 ${featured ? "text-brown-light" : "text-brown"}`} />{f.title}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-full text-[0.8rem] uppercase tracking-[0.1em] font-medium transition ${featured ? "bg-brown text-white hover:bg-brown-dark" : "border border-brown/30 text-brown hover:bg-brown hover:text-white"}`}>Забронировать</button>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

// V2 — horizontal comparison table (editorial)
const PricingV2 = () => (
  <section className="min-h-screen flex items-center py-12 bg-cream">
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 2 · Горизонтальная таблица</div>
      <div className="text-center mb-8">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Стоимость · 3 тарифа</span>
        <h2 className="font-serif italic text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark">Выберите <span className="not-italic">формат участия</span></h2>
      </div>
      <div className="divide-y divide-brown/15 border-y border-brown/20">
        {PRICING.map((p, i) => (
          <div key={i} className={`grid md:grid-cols-[180px_1fr_180px_180px] gap-4 md:gap-6 py-6 items-start ${p.theme === "premium" ? "bg-white/60" : ""} px-3 md:px-5 rounded`}>
            <div>
              <div className="font-serif text-brown text-[0.7rem] uppercase tracking-[0.22em] mb-1">№ 0{i + 1}</div>
              <h3 className="font-serif text-[1.4rem] text-text-dark">{p.name}</h3>
              {p.theme === "premium" && <span className="inline-block text-[0.58rem] uppercase tracking-[0.2em] text-brown bg-brown/10 px-2 py-0.5 rounded-full mt-1">Рекомендуем</span>}
            </div>
            <div>
              <p className="text-[0.88rem] text-text-dark-soft leading-[1.6] mb-2">{p.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.feats.slice(0, 4).map((f: any, j: number) => (
                  <span key={j} className="text-[0.68rem] border border-brown/20 rounded-full px-2.5 py-0.5 text-text-dark-muted">{f.title}</span>
                ))}
              </div>
            </div>
            <div className="flex md:flex-col md:items-end justify-between md:justify-start gap-2">
              <div className="font-serif text-[1.8rem] text-brown leading-none">{p.price.split(" ")[0]}</div>
              <div className="text-[0.65rem] uppercase tracking-[0.15em] text-text-dark-muted">{p.price.split(" ").slice(1).join(" ")}</div>
            </div>
            <button className="w-full py-2.5 rounded-full text-[0.75rem] uppercase tracking-[0.1em] font-medium border border-brown/30 text-brown hover:bg-brown hover:text-white transition">Забронировать</button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V3 — dark luxury, premium pinned-center
const PricingV3 = () => (
  <section className="min-h-screen flex items-center py-12 bg-navy text-white relative overflow-hidden">
    <div className="absolute inset-0 opacity-30 pointer-events-none">
      <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-brown/20 blur-3xl" />
      <div className="absolute right-1/4 bottom-20 h-80 w-80 rounded-full bg-brown-light/10 blur-3xl" />
    </div>
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12 relative z-10">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown-light/60 mb-5">Вариант 3 · Тёмный люкс</div>
      <div className="text-center mb-10">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown-light font-medium block mb-3">Стоимость</span>
        <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-white font-light">Выберите формат участия</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-5 items-end">
        {PRICING.map((p, i) => {
          const featured = p.theme === "premium";
          return (
            <div key={i} className={`relative rounded-[1.5rem] p-7 flex flex-col ${featured ? "bg-gradient-to-b from-[#1b2450] to-navy border border-brown-light/40 lg:scale-[1.06] shadow-2xl" : "bg-white/[0.04] border border-white/10"}`}>
              {featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brown text-white text-[0.58rem] px-4 py-1 rounded-full uppercase tracking-[0.22em] font-bold">Рекомендуем</div>}
              <h3 className="font-serif text-[1.55rem] mb-1">{p.name}</h3>
              <p className="text-[0.82rem] text-white/60 leading-[1.55] mb-5">{p.desc}</p>
              <div className="mb-5 flex items-baseline gap-1">
                <span className="font-serif text-[2.5rem] text-brown-light">{p.price.split(" ")[0]}</span>
                <span className="text-white/40 text-sm">{p.price.split(" ").slice(1).join(" ")}</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {p.feats.map((f: any, j: number) => (
                  <li key={j} className="flex gap-2 text-[0.85rem] text-white/80 leading-snug"><CheckCircle size={14} className="text-brown-light shrink-0 mt-0.5" />{f.title}</li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-full text-[0.78rem] uppercase tracking-[0.12em] font-semibold transition ${featured ? "bg-brown text-white hover:bg-brown-dark" : "border border-white/20 text-white hover:bg-white/10"}`}>Забронировать</button>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

// V4 — accordion single-column
const PricingV4 = () => {
  const [open, setOpen] = useState(2);
  return (
    <section className="min-h-screen flex items-center py-12 bg-cream">
      <div className="max-w-3xl w-full mx-auto px-6 md:px-12">
        <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 4 · Аккордеон</div>
        <div className="text-center mb-8">
          <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Стоимость</span>
          <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark">Выберите формат участия</h2>
        </div>
        <div className="space-y-3">
          {PRICING.map((p, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className={`rounded-2xl border transition-all ${isOpen ? "bg-white border-brown/30 shadow-md" : "bg-white/50 border-brown/10"}`}>
                <button onClick={() => setOpen(isOpen ? -1 : i)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
                  <div className="flex items-baseline gap-4">
                    <h3 className="font-serif text-[1.35rem] text-text-dark">{p.name}</h3>
                    {p.theme === "premium" && <span className="text-[0.58rem] uppercase tracking-[0.2em] text-brown bg-brown/10 px-2 py-0.5 rounded-full">★</span>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-serif text-[1.4rem] text-brown">{p.price}</span>
                    <ChevronDown size={18} className={`text-text-dark-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-[0.88rem] text-text-dark-soft leading-[1.65] mb-4">{p.desc}</p>
                    <ul className="space-y-2 mb-5">
                      {p.feats.map((f: any, j: number) => (
                        <li key={j} className="flex gap-2 text-[0.9rem] text-text-dark-soft"><CheckCircle size={14} className="text-brown shrink-0 mt-0.5" />{f.title}</li>
                      ))}
                    </ul>
                    <button className="px-6 py-3 rounded-full bg-brown text-white text-[0.8rem] uppercase tracking-[0.1em] font-medium hover:bg-brown-dark transition">Забронировать</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// V5 — refined current (3 columns, premium center with badge, tooltips)
const PricingV5 = ({ onOpenModal }: any) => {
  const getFeatIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("программе")) return <Calendar size={14} />;
    if (t.includes("групповую")) return <Users size={14} />;
    if (t.includes("проживание") || t.includes("размещение")) return <Home size={14} />;
    if (t.includes("банный")) return <Coffee size={14} />;
    if (t.includes("материалы")) return <Info size={14} />;
    if (t.includes("трансфер")) return <Bus size={14} />;
    if (t.includes("онлайн")) return <Video size={14} />;
    if (t.includes("место")) return <Star size={14} />;
    if (t.includes("рекомендации")) return <Target size={14} />;
    if (t.includes("разбор")) return <Zap size={14} />;
    return <CheckCircle size={14} />;
  };
  return (
    <section className="min-h-screen flex items-center py-12 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <path d="M0 1000 L200 800 L400 900 L600 700 L800 850 L1000 600 L1000 1000 Z" fill="currentColor" className="text-brown" />
          <path d="M0 1000 L150 700 L350 850 L550 600 L750 800 L1000 500 L1000 1000 Z" fill="currentColor" className="text-brown" opacity="0.5" />
        </svg>
      </div>
      <div className="max-w-7xl w-full mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 5 · Текущий (доработанный)</div>
        <div className="text-center mb-10">
          <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Стоимость</span>
          <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark">Выберите формат участия</h2>
          <div className="h-px w-16 bg-brown/30 mx-auto mt-4" />
        </div>
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">
          {PRICING.map((p, i) => {
            const featured = p.theme === "premium";
            return (
              <div key={i} className={`relative flex flex-col rounded-[1.5rem] p-7 md:p-8 transition-all duration-500 group ${featured ? "bg-navy text-white shadow-2xl lg:scale-[1.04] z-10 border border-brown/20" : "bg-[#fdfbf9] border border-brown/10 hover:border-brown/30 hover:shadow-lg hover:-translate-y-1"}`}>
                {featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brown text-white text-[0.58rem] px-4 py-1 rounded-full uppercase tracking-[0.22em] font-bold shadow">Рекомендуем</div>}
                <div className="mb-4">
                  <h3 className="font-serif text-[1.7rem] mb-1.5">{p.name}</h3>
                  <p className={`text-[0.82rem] leading-[1.55] ${featured ? "text-white/60" : "text-text-dark-soft"}`}>{p.desc}</p>
                </div>
                <div className="mb-5 flex items-baseline gap-1.5">
                  <span className="font-serif text-[2.2rem] md:text-[2.6rem] text-brown-light leading-none">{p.price.split(" ")[0]}</span>
                  <span className={`text-sm font-serif ${featured ? "text-white/40" : "text-text-dark-muted"}`}>{p.price.split(" ").slice(1).join(" ")}</span>
                </div>
                <ul className="flex-1 space-y-3 mb-6">
                  {p.feats.map((f: any, j: number) => (
                    <li key={j} className="flex gap-3 items-start group/feat">
                      <div className={`mt-0.5 shrink-0 ${featured ? "text-brown-light" : "text-brown"}`}>{getFeatIcon(f.title)}</div>
                      <p className={`text-[0.85rem] leading-snug ${featured ? "text-white/85" : "text-text-dark"}`}>
                        {f.title}
                        {f.desc && <span className="block text-[0.72rem] mt-0.5 opacity-60">{f.desc}</span>}
                      </p>
                    </li>
                  ))}
                </ul>
                {p.note && <p className={`text-[0.65rem] italic mb-4 leading-tight ${featured ? "text-brown-light" : "text-text-dark-muted"}`}>{p.note}</p>}
                <button onClick={() => onOpenModal?.(p)} className={`w-full py-3.5 rounded-full text-[0.78rem] uppercase tracking-[0.12em] font-semibold transition ${featured ? "bg-brown text-white hover:bg-brown-dark" : "border border-brown/30 text-brown hover:bg-brown hover:text-white"}`}>Забронировать</button>
              </div>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <button onClick={() => onOpenModal?.("compare")} className="text-[0.75rem] uppercase tracking-[0.2em] text-brown hover:underline font-medium">Сравнение тарифов →</button>
        </div>
      </div>
    </section>
  );
};

export const PricingSectionsPage = () => (
  <div className="bg-cream min-h-screen">
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex items-center justify-between">
      <a href="/" className="font-serif text-[1.4rem] tracking-[0.08em] text-text-dark">Отражение</a>
      <span className="text-[0.7rem] uppercase tracking-[0.3em] text-text-dark-muted">Варианты секции «Стоимость»</span>
    </div>
    <PricingV1 />
    <PricingV2 />
    <PricingV3 />
    <PricingV4 />
    <PricingV5 />
  </div>
);

// --- LeadMagnet Variants ---

const LM_VIDEO = "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/audiovideo.mp4";
const LM_IFS = ["откладываешь решения", "устаёшь от одних и тех же сценариев", "понимаешь, что что-то не так, но не видишь что"];
const LM_RES = ["увидишь свой повторяющийся сценарий", "поймёшь, откуда он", "получишь первый сдвиг"];

// V1 — centered audio-card
const LeadMagnetV1 = () => (
  <section className="min-h-screen flex items-center py-12 bg-cream">
    <div className="max-w-3xl w-full mx-auto px-6 md:px-12 text-center">
      <div className="text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 1 · Центрированная аудио-карточка</div>
      <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">10 минут тишины</span>
      <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark mb-3">Ты уже пробовал менять жизнь.</h2>
      <p className="font-serif italic text-[clamp(1.1rem,2.2vw,1.5rem)] text-brown mb-8">Но результат возвращается.</p>
      <div className="rounded-[1.5rem] overflow-hidden bg-navy relative aspect-video mb-6">
        <video src={LM_VIDEO} muted loop autoPlay playsInline className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 text-white text-left">
          <p className="font-serif italic text-[1.05rem] leading-snug">«Она задаёт вопросы, от которых невозможно отвернуться»</p>
        </div>
      </div>
      <p className="text-[0.95rem] text-text-dark-soft mb-6">Голосовое сообщение от Майи. Первый шаг перед программой.</p>
      <a href="#" className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-brown text-white hover:bg-brown-dark transition">
        <span className="font-medium text-[0.9rem]">Послушать и понять себя</span>
        <ArrowRight size={18} />
      </a>
    </div>
  </section>
);

// V2 — dark cinematic with audio wave
const LeadMagnetV2 = () => (
  <section className="min-h-screen flex items-center py-12 bg-navy text-white relative overflow-hidden">
    <video src={LM_VIDEO} muted loop autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-30" />
    <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/60 to-navy" />
    <div className="max-w-4xl w-full mx-auto px-6 md:px-12 relative z-10 text-center">
      <div className="text-[0.65rem] uppercase tracking-[0.4em] text-brown-light/60 mb-5">Вариант 2 · Тёмный кинематографичный</div>
      <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown-light font-medium block mb-4">От Майи · лично</span>
      <h2 className="font-serif text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] text-white font-light mb-4">
        Ты уже пробовал менять жизнь.<br /><span className="italic text-brown-light">Но результат возвращается.</span>
      </h2>
      <p className="text-[1rem] text-white/70 leading-[1.7] max-w-xl mx-auto mb-8">10 минут, которые покажут, почему привычные решения перестают работать — и что начать менять прямо сейчас.</p>
      <div className="flex items-center justify-center gap-1 h-12 mb-8">
        {[...Array(24)].map((_, i) => (
          <div key={i} className="w-1 rounded-full bg-brown-light/70" style={{ height: `${20 + Math.sin(i * 0.6) * 18 + Math.abs(((i % 5) - 2)) * 6}px` }} />
        ))}
      </div>
      <a href="#" className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-brown text-white hover:bg-brown-dark transition">
        <span className="font-medium text-[0.9rem]">Послушать сообщение</span>
        <ArrowRight size={18} />
      </a>
      <div className="mt-6 text-[0.7rem] uppercase tracking-[0.2em] text-white/45">1200+ уже прошли</div>
    </div>
  </section>
);

// V3 — two-column editorial list
const LeadMagnetV3 = () => (
  <section className="min-h-screen flex items-center py-12 bg-cream">
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 3 · Журнальный список</div>
      <div className="mb-8 pb-5 border-b border-brown/20 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <span className="text-[0.68rem] uppercase tracking-[0.35em] text-brown font-medium block mb-3">Голосовое от Майи · 10 мин</span>
          <h2 className="font-serif italic text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.05] text-text-dark max-w-[20ch]">
            Ты уже пробовал <span className="not-italic">менять жизнь</span>.
          </h2>
        </div>
        <p className="font-serif italic text-[1rem] text-brown max-w-sm">Но результат возвращается. 10 минут, которые покажут почему.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="text-[0.62rem] uppercase tracking-[0.24em] text-brown font-bold mb-4">Если ты</div>
          <ul className="divide-y divide-brown/15">
            {LM_IFS.map((t, i) => (
              <li key={i} className="py-4 flex gap-4">
                <div className="font-serif text-brown/50 text-[1.2rem]">0{i + 1}</div>
                <p className="text-[0.98rem] text-text-dark-soft leading-[1.6]">{t}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[0.62rem] uppercase tracking-[0.24em] text-brown font-bold mb-4">После сообщения ты</div>
          <ul className="divide-y divide-brown/15">
            {LM_RES.map((t, i) => (
              <li key={i} className="py-4 flex gap-4">
                <CheckCircle size={18} className="text-brown shrink-0 mt-1" />
                <p className="font-serif text-[1.05rem] text-text-dark leading-[1.5]">{t}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-brown/20">
        <p className="text-[0.88rem] text-text-dark-muted">Майя записала это сообщение лично · 1200+ уже прошли</p>
        <a href="#" className="inline-flex items-center gap-3 px-7 py-3 rounded-full bg-brown text-white hover:bg-brown-dark transition">
          <span className="font-medium text-[0.85rem]">Послушать сообщение</span>
          <ArrowRight size={16} />
        </a>
      </div>
    </div>
  </section>
);

// V4 — testimonial chip, tape-style interview
const LeadMagnetV4 = () => (
  <section className="min-h-screen flex items-center py-12 bg-[#faf4ea] relative overflow-hidden">
    <div className="max-w-5xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 4 · Интервью / тэйп</div>
      <div className="grid lg:grid-cols-[260px_1fr] gap-8 items-start">
        <div>
          <div className="aspect-square rounded-full overflow-hidden bg-navy mb-4 relative">
            <video src={LM_VIDEO} muted loop autoPlay playsInline className="w-full h-full object-cover" />
          </div>
          <div className="text-center">
            <div className="font-serif text-[1.25rem] text-text-dark">Майя</div>
            <div className="text-[0.65rem] uppercase tracking-[0.2em] text-brown">голосовое · 10 мин</div>
          </div>
        </div>
        <div>
          <Quote className="text-brown/40 mb-4" size={40} />
          <h2 className="font-serif text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.1] text-text-dark mb-3">
            Ты уже пробовал менять жизнь. <span className="italic text-brown">Но результат возвращается.</span>
          </h2>
          <p className="text-[1rem] text-text-dark-soft leading-[1.7] mb-6">За 10 минут я покажу, почему именно твои привычные решения перестают работать — и с какого шага начинать заново.</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {[...LM_IFS, ...LM_RES].map((t, i) => (
              <span key={i} className={`text-[0.72rem] uppercase tracking-[0.12em] rounded-full px-3 py-1 ${i < LM_IFS.length ? "border border-brown/30 text-brown" : "bg-brown text-white"}`}>{t}</span>
            ))}
          </div>
          <a href="#" className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-navy text-white hover:bg-brown transition">
            <span className="font-medium text-[0.9rem]">Послушать и понять себя</span>
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </div>
  </section>
);

// V5 — refined current (split card: video left, content right)
const LeadMagnetV5 = () => (
  <section className="min-h-screen flex items-center py-12 bg-cream relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none opacity-40">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-brown/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-navy/5 rounded-full blur-[110px]" />
    </div>
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12 relative z-10">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 5 · Текущий (доработанный)</div>
      <div className="bg-[#fdfbf9] rounded-[2rem] shadow-xl overflow-hidden border border-brown/10">
        <div className="grid lg:grid-cols-12">
          <div className="lg:col-span-5 relative min-h-[360px] lg:min-h-[520px] bg-navy overflow-hidden flex flex-col justify-end p-8 md:p-10">
            <video src={LM_VIDEO} muted loop autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510]/90 via-[#1a1510]/40 to-transparent" />
            <div className="relative z-10">
              <p className="font-serif italic text-[1.35rem] md:text-[1.55rem] text-white leading-snug mb-4 font-light">
                «Она задаёт вопросы, от которых невозможно отвернуться»
              </p>
              <div className="h-px w-full bg-white/20 mb-4" />
              <p className="text-white/80 text-[0.8rem] tracking-wide">Первый шаг перед участием в программе</p>
            </div>
          </div>
          <div className="lg:col-span-7 p-8 md:p-10 lg:p-12 flex flex-col justify-center">
            <h3 className="text-[1rem] md:text-[1.15rem] text-text-dark mb-2 font-serif leading-snug">
              Ты уже пробовал менять жизнь.<br />Но результат возвращается.
            </h3>
            <h2 className="font-serif text-[clamp(1.8rem,3.5vw,2.6rem)] leading-[1.1] text-text-dark mb-6">
              10 минут, <span className="italic text-brown">которые покажут почему</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-brown font-medium mb-3 text-[0.85rem] uppercase tracking-[0.15em]">Если ты</p>
                <ul className="space-y-2">
                  {LM_IFS.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-text-dark-soft text-[0.88rem] leading-[1.55]"><span className="text-brown mt-0.5">—</span>{t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-brown font-medium mb-3 text-[0.85rem] uppercase tracking-[0.15em]">После этого</p>
                <ul className="space-y-2">
                  {LM_RES.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-text-dark-soft text-[0.88rem] leading-[1.55]"><div className="w-1.5 h-1.5 rounded-full bg-brown/60 mt-2 shrink-0" />{t}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-5 border-t border-brown/10">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-[#fdfbf9] bg-cream overflow-hidden">
                      <img src={`https://picsum.photos/seed/user${i + 20}/80/80`} alt="" aria-hidden="true" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <span className="text-[0.72rem] text-text-dark-muted leading-tight"><span className="font-bold text-text-dark">1200+ человек</span> уже прошли</span>
              </div>
              <a href="https://t.me/otrageniecamp_bot" target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("leadmagnet_click")} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brown text-white hover:bg-brown-dark transition">
                <span className="font-medium text-[0.82rem]">Послушать и понять себя</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const LeadMagnitSectionsPage = () => (
  <div className="bg-cream min-h-screen">
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex items-center justify-between">
      <a href="/" className="font-serif text-[1.4rem] tracking-[0.08em] text-text-dark">Отражение</a>
      <span className="text-[0.7rem] uppercase tracking-[0.3em] text-text-dark-muted">Варианты · Лид-магнит</span>
    </div>
    <LeadMagnetV1 />
    <LeadMagnetV2 />
    <LeadMagnetV3 />
    <LeadMagnetV4 />
    <LeadMagnetV5 />
  </div>
);

// --- Results Variants ---

const RES_BG = "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/romamaya3.jpg";

// V1 — light grid, 6 cards with check icons
const ResultsV1 = () => (
  <section className="min-h-screen flex items-center py-12 bg-cream">
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 1 · Светлая сетка</div>
      <div className="text-center mb-10">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Результат</span>
        <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark">Что вы заберёте с собой</h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {RESULTS.map((r, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-brown/8 hover:border-brown/30 hover:shadow-md transition">
            <CheckCircle size={22} className="text-brown mb-4" />
            <h4 className="font-serif text-[1.2rem] text-text-dark mb-2">{r.title}</h4>
            <p className="text-[0.88rem] text-text-dark-soft leading-[1.6]">{r.desc}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 pt-6 border-t border-brown/15">
        {STATS.map((s, i) => (
          <div key={i} className="text-center">
            <div className="font-serif text-4xl text-brown mb-1">{s.value}{s.suffix}</div>
            <div className="text-[0.6rem] uppercase tracking-[0.2em] text-text-dark-muted">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V2 — editorial numbered with big stats header
const ResultsV2 = () => (
  <section className="min-h-screen flex items-center py-12 bg-cream-soft">
    <div className="max-w-5xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 2 · Журнальные номера</div>
      <div className="mb-8 pb-5 border-b border-brown/20 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <span className="text-[0.68rem] uppercase tracking-[0.35em] text-brown font-medium block mb-3">Результат · 6 пунктов</span>
          <h2 className="font-serif italic text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.05] text-text-dark max-w-[18ch]">
            Что вы заберёте <span className="not-italic">с собой</span>
          </h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-[1.5rem] text-brown">{s.value}{s.suffix}</div>
              <div className="text-[0.55rem] uppercase tracking-[0.15em] text-text-dark-muted leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-x-10 gap-y-2">
        {RESULTS.map((r, i) => (
          <div key={i} className="grid grid-cols-[50px_1fr] gap-4 py-4 border-b border-text-dark/10 last:border-0">
            <div className="font-serif text-brown text-[0.7rem] uppercase tracking-[0.22em] pt-1">№ 0{i + 1}</div>
            <div>
              <h4 className="font-serif text-[1.1rem] text-text-dark mb-1">{r.title}</h4>
              <p className="text-[0.88rem] text-text-dark-soft leading-[1.55]">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V3 — two-column split: stats left, results right
const ResultsV3 = () => (
  <section className="min-h-screen flex items-center py-12 bg-navy text-white relative overflow-hidden">
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown-light/60 mb-5">Вариант 3 · Сплит stats + результаты</div>
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 items-start">
        <div className="lg:sticky lg:top-12">
          <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown-light font-medium block mb-3">Результат</span>
          <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.05] text-white font-light mb-8">Что вы заберёте с собой</h2>
          <div className="grid grid-cols-2 gap-5">
            {STATS.map((s) => (
              <div key={s.label} className="border-t border-white/15 pt-3">
                <div className="font-serif text-[2.2rem] text-brown-light mb-1 leading-none">{s.value}{s.suffix}</div>
                <div className="text-[0.58rem] uppercase tracking-[0.18em] text-white/50">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {RESULTS.map((r, i) => (
            <div key={i} className="flex gap-5 items-start border border-white/10 rounded-xl px-5 py-4 bg-white/[0.03] hover:bg-white/[0.06] transition">
              <CheckCircle size={20} className="text-brown-light mt-0.5 shrink-0" />
              <div>
                <h4 className="font-serif text-[1.15rem] text-white leading-snug">{r.title}</h4>
                <p className="text-[0.88rem] text-white/65 leading-[1.55] mt-0.5">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// V4 — background image, minimal numbered list
const ResultsV4 = () => (
  <section className="min-h-screen flex items-center py-12 bg-navy text-white relative overflow-hidden">
    <img src={RES_BG} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover object-center opacity-25" referrerPolicy="no-referrer" />
    <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy/80 to-navy" />
    <div className="max-w-4xl w-full mx-auto px-6 md:px-12 relative z-10">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown-light/60 mb-5">Вариант 4 · Кинематографичный</div>
      <div className="text-center mb-10">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown-light font-medium block mb-3">Результат</span>
        <h2 className="font-serif text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] text-white font-light">Что вы заберёте с собой</h2>
        <div className="flex flex-wrap justify-center gap-6 mt-6 text-white/70 text-[0.8rem]">
          {STATS.map((s) => (
            <div key={s.label}><span className="font-serif text-brown-light text-xl">{s.value}{s.suffix}</span> <span className="uppercase tracking-[0.14em] text-[0.6rem]">{s.label}</span></div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {RESULTS.map((r, i) => (
          <div key={i} className="flex gap-5 items-baseline py-3 border-b border-white/10">
            <div className="font-serif italic text-brown-light text-[1.3rem] shrink-0 w-10">0{i + 1}</div>
            <div className="flex-1">
              <h4 className="font-serif text-[1.1rem] text-white inline">{r.title}. </h4>
              <span className="text-[0.92rem] text-white/70 leading-[1.55]">{r.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V5 — refined current (navy, stats counter + cards)
const ResultsV5 = () => (
  <section className="min-h-screen flex items-center py-12 bg-navy text-white relative overflow-hidden">
    <div className="absolute inset-0 z-0">
      <img src={RES_BG} alt="" aria-hidden="true" className="w-full h-full object-cover object-[center_top] opacity-30" referrerPolicy="no-referrer" />
      <div className="absolute inset-0 bg-navy/80 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-transparent to-navy" />
    </div>
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12 relative z-10">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown-light/60 mb-5">Вариант 5 · Текущий (доработанный)</div>
      <div className="text-center mb-8">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown-light font-medium block mb-3">Результат</span>
        <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-white font-light">Что вы заберёте с собой</h2>
        <div className="h-px w-16 bg-brown-light/40 mx-auto mt-4" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {STATS.map((s, i) => (
          <div key={i} className="text-center group">
            <div className="font-serif text-[2.5rem] md:text-[3rem] text-brown-light mb-1 transition-transform group-hover:scale-110">
              <Counter value={s.value} suffix={s.suffix} delay={i * 0.1} />
            </div>
            <div className="text-[0.62rem] uppercase tracking-[0.2em] text-white/45 font-medium max-w-[140px] mx-auto leading-snug">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {RESULTS.map((r, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 hover:bg-white/[0.08] hover:border-brown-light/40 transition group">
            <div className="w-11 h-11 rounded-xl bg-brown/15 flex items-center justify-center text-brown-light mb-4 group-hover:bg-brown group-hover:text-white transition">
              <CheckCircle size={22} />
            </div>
            <h4 className="font-serif text-[1.1rem] mb-1.5 group-hover:text-brown-light transition">{r.title}</h4>
            <p className="text-[0.85rem] text-white/60 leading-[1.6] group-hover:text-white/80 transition">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const ResultSectionsPage = () => (
  <div className="bg-cream min-h-screen">
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex items-center justify-between">
      <a href="/" className="font-serif text-[1.4rem] tracking-[0.08em] text-text-dark">Отражение</a>
      <span className="text-[0.7rem] uppercase tracking-[0.3em] text-text-dark-muted">Варианты секции «Результат»</span>
    </div>
    <ResultsV1 />
    <ResultsV2 />
    <ResultsV3 />
    <ResultsV4 />
    <ResultsV5 />
  </div>
);

// --- ForWho Variants ---

const FORWHO_IMG = "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/romamaya2.jpg";

// V1 — numbered cards grid
const ForWhoV1 = () => (
  <section className="min-h-screen flex items-center py-12 bg-white">
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 1 · Карточки-номера</div>
      <div className="text-center mb-10">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Для кого</span>
        <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark">Кому это нужно сейчас</h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {FOR_WHO.map((text, i) => (
          <div key={i} className="bg-[#faf7f2] rounded-2xl p-6 border border-brown/10 hover:border-brown/30 transition">
            <div className="font-serif text-brown/50 text-[2.5rem] leading-none mb-3">0{i + 1}</div>
            <p className="text-[0.95rem] text-text-dark-soft leading-[1.65]">{text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V2 — checklist with portrait
const ForWhoV2 = () => (
  <section className="min-h-screen flex items-center py-12 bg-cream">
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 2 · Чек-лист с портретом</div>
      <div className="grid lg:grid-cols-[1fr_1fr] gap-10 items-center">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-navy">
          <img src={FORWHO_IMG} alt="" aria-hidden="true" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
        </div>
        <div>
          <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Для кого</span>
          <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark mb-6">Кому это нужно сейчас</h2>
          <ul className="space-y-3">
            {FOR_WHO.map((text, i) => (
              <li key={i} className="flex gap-3 text-[0.95rem] text-text-dark-soft leading-[1.6]">
                <CheckCircle size={18} className="text-brown shrink-0 mt-0.5" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

// V3 — dark quotes column
const ForWhoV3 = () => (
  <section className="min-h-screen flex items-center py-12 bg-navy text-white relative overflow-hidden">
    <div className="max-w-5xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown-light/60 mb-5">Вариант 3 · Тёмные цитаты</div>
      <div className="text-center mb-10">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown-light font-medium block mb-3">Для кого</span>
        <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-white font-light">Кому это нужно сейчас</h2>
      </div>
      <div className="space-y-3">
        {FOR_WHO.map((text, i) => (
          <div key={i} className="flex gap-6 items-start rounded-xl border border-white/8 bg-white/[0.03] px-6 py-4 hover:border-brown-light/30 transition">
            <div className="font-serif italic text-brown-light text-[1.3rem] leading-none pt-1 shrink-0">“{String(i + 1).padStart(2, "0")}</div>
            <p className="font-serif italic text-[1.05rem] text-white/85 leading-[1.55]">{text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V4 — editorial numbered list with divider lines
const ForWhoV4 = () => (
  <section className="min-h-screen flex items-center py-12 bg-cream">
    <div className="max-w-5xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 4 · Журнальный список</div>
      <div className="mb-8 pb-5 border-b border-brown/20 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <span className="text-[0.68rem] uppercase tracking-[0.35em] text-brown font-medium block mb-3">Для кого · 6 признаков</span>
          <h2 className="font-serif italic text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.05] text-text-dark max-w-[18ch]">
            Кому это нужно <span className="not-italic">сейчас</span>
          </h2>
        </div>
        <p className="text-[0.9rem] text-text-dark-soft leading-[1.65] max-w-sm">Узнаете себя хотя бы в трёх пунктах — формат точно для вас.</p>
      </div>
      <div>
        {FOR_WHO.map((text, i) => (
          <div key={i} className="grid grid-cols-[60px_1fr] md:grid-cols-[80px_1fr] gap-6 py-4 border-b border-text-dark/10 last:border-0 items-start">
            <div className="font-serif text-brown text-[0.7rem] uppercase tracking-[0.22em] pt-1">№ 0{i + 1}</div>
            <p className="font-serif text-[1.05rem] text-text-dark leading-[1.5]">{text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V5 — refined current (portrait + timeline)
const ForWhoV5 = () => (
  <section className="min-h-screen flex items-center py-12 bg-white relative overflow-hidden">
    <div className="absolute inset-y-0 left-0 w-full lg:w-1/2 z-0">
      <img src={FORWHO_IMG} alt="" aria-hidden="true" className="w-full h-full object-cover object-left" referrerPolicy="no-referrer" />
      <div className="absolute inset-0 bg-white/80 lg:hidden" />
      <div className="hidden lg:block absolute inset-y-0 right-0 w-1/3 bg-gradient-to-r from-transparent to-white" />
    </div>
    <div className="max-w-7xl w-full mx-auto px-6 md:px-12 relative z-10">
      <div className="text-center lg:text-left text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5 lg:ml-[50%] lg:pl-6">Вариант 5 · Текущий (доработанный)</div>
      <div className="grid lg:grid-cols-12 gap-10">
        <div className="hidden lg:block lg:col-span-6" />
        <div className="lg:col-span-6">
          <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Для кого</span>
          <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark mb-8">Кому это нужно<br />сейчас</h2>
          <div className="relative pl-7 border-l border-brown/25 space-y-4">
            {FOR_WHO.map((text, i) => (
              <div key={i} className="relative group">
                <div className="absolute -left-[33px] top-2 w-2.5 h-2.5 rounded-full bg-brown/50 group-hover:bg-brown transition" />
                <p className="text-[0.98rem] text-text-dark-soft leading-[1.65]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const ForWhoSectionsPage = () => (
  <div className="bg-cream min-h-screen">
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex items-center justify-between">
      <a href="/" className="font-serif text-[1.4rem] tracking-[0.08em] text-text-dark">Отражение</a>
      <span className="text-[0.7rem] uppercase tracking-[0.3em] text-text-dark-muted">Варианты секции «Для кого»</span>
    </div>
    <ForWhoV1 />
    <ForWhoV2 />
    <ForWhoV3 />
    <ForWhoV4 />
    <ForWhoV5 />
  </div>
);

// --- Location Variants ---

const LOC_VIDEO = "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/intro5.mp4";
const LOC_EXT = "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/img/ext.jpg";
const LOC_INT = "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/img/int.jpg";

const LOC_FEATURES = [
  { icon: Brain, title: "Глубокая работа" },
  { icon: Users, title: "Индивидуальные разборы" },
  { icon: Flame, title: "Баня и восстановление" },
  { icon: MessageSquare, title: "Пространство диалога" }
];

// V1 — full-bleed hero video with text overlay
const LocationV1 = () => (
  <section className="min-h-screen flex items-stretch relative overflow-hidden">
    <div className="absolute inset-0 text-center text-[0.65rem] uppercase tracking-[0.4em] text-white/70 pt-6 z-20">Вариант 1 · Full-bleed hero</div>
    <video src={LOC_VIDEO} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-navy/30" />
    <div className="relative z-10 w-full flex items-end pb-14">
      <div className="max-w-6xl w-full mx-auto px-6 md:px-12 text-white">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown-light block mb-3">Локация</span>
        <h2 className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] mb-2 font-light">Красная Поляна</h2>
        <h3 className="font-serif italic text-[clamp(1.4rem,3vw,2.2rem)] text-brown-light/85 mb-6">Глэмпинг «Дзен рекавери»</h3>
        <p className="max-w-xl text-[1rem] text-white/80 leading-[1.7] mb-8">Горы. Тишина. Отсутствие шума. Когда исчезает привычный контекст — появляется возможность увидеть себя.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-3xl">
          {LOC_FEATURES.map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <f.icon size={20} className="text-brown-light shrink-0" />
              <span className="text-[0.85rem] text-white/85 leading-tight">{f.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// V2 — split: video left, content right
const LocationV2 = () => (
  <section className="min-h-screen flex items-center py-12 bg-cream">
    <div className="max-w-7xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 2 · Сплит с видео</div>
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-navy">
          <video src={LOC_VIDEO} autoPlay muted loop playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.25em] text-brown-light mb-2">
              <MapPin size={14} /> Сочи · Красная Поляна
            </div>
            <p className="font-serif italic text-[1.1rem] leading-snug">«Место, где замедляется жизнь»</p>
          </div>
        </div>
        <div>
          <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Локация</span>
          <h2 className="font-serif text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] text-text-dark mb-2">Красная Поляна</h2>
          <h3 className="font-serif italic text-[clamp(1.2rem,2.5vw,1.8rem)] text-brown/70 mb-6">Глэмпинг «Дзен рекавери»</h3>
          <p className="text-[1rem] text-text-dark leading-[1.7] mb-4">Горы. Тишина. Отсутствие шума.</p>
          <p className="text-[0.95rem] text-text-dark-soft leading-[1.7] mb-8">Когда исчезает привычный контекст — появляется возможность увидеть себя.</p>
          <div className="grid grid-cols-2 gap-5">
            {LOC_FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-brown/10 text-brown flex items-center justify-center shrink-0"><f.icon size={18} /></div>
                <span className="text-[0.92rem] text-text-dark-soft leading-tight pt-1">{f.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

// V3 — gallery collage editorial
const LocationV3 = () => (
  <section className="min-h-screen flex items-center py-12 bg-cream">
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 3 · Коллаж-галерея</div>
      <div className="mb-8 pb-5 border-b border-brown/20 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <span className="text-[0.68rem] uppercase tracking-[0.35em] text-brown font-medium block mb-3">Локация</span>
          <h2 className="font-serif italic text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] text-text-dark">
            Красная Поляна · <span className="not-italic">Глэмпинг «Дзен рекавери»</span>
          </h2>
        </div>
        <p className="text-[0.9rem] text-text-dark-soft leading-[1.65] max-w-sm">Горы, тишина, отсутствие шума — контекст, в котором становится видно себя.</p>
      </div>
      <div className="grid grid-cols-6 grid-rows-2 gap-3 h-[52vh]">
        <div className="col-span-4 row-span-2 rounded-xl overflow-hidden bg-navy relative">
          <video src={LOC_VIDEO} autoPlay muted loop playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-5 left-5 text-white font-serif italic text-[1.05rem]">Место, где замедляется жизнь</div>
        </div>
        <div className="col-span-2 rounded-xl overflow-hidden">
          <img src={LOC_EXT} alt="Exterior" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="col-span-2 rounded-xl overflow-hidden">
          <img src={LOC_INT} alt="Interior" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-6 pt-5 border-t border-brown/15">
        {LOC_FEATURES.map((f) => (
          <div key={f.title} className="flex items-center gap-3">
            <f.icon size={20} className="text-brown shrink-0" />
            <span className="text-[0.88rem] text-text-dark-soft leading-tight">{f.title}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V4 — dark cinematic with side panel
const LocationV4 = () => (
  <section className="min-h-screen flex items-center py-0 bg-navy text-white relative overflow-hidden">
    <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[0.65rem] uppercase tracking-[0.4em] text-brown-light/60 z-20">Вариант 4 · Кинематографичный</div>
    <div className="grid lg:grid-cols-[1.4fr_1fr] w-full min-h-screen">
      <div className="relative overflow-hidden">
        <video src={LOC_VIDEO} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-navy/70 lg:to-navy" />
        <div className="absolute bottom-8 left-8 right-8 lg:right-auto lg:max-w-md">
          <div className="inline-flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.24em] text-brown-light mb-3">
            <MapPin size={14} /> Красная Поляна · Глэмпинг «Дзен рекавери»
          </div>
          <p className="font-serif italic text-white/85 text-[1.2rem] leading-snug">«Место, где замедляется жизнь»</p>
        </div>
      </div>
      <div className="flex items-center px-8 md:px-12 py-12">
        <div>
          <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown-light block mb-3">Локация</span>
          <h2 className="font-serif text-[clamp(2.2rem,4vw,3.4rem)] leading-[1.05] font-light mb-4">Красная Поляна</h2>
          <p className="text-[0.98rem] text-white/75 leading-[1.7] mb-3">Горы. Тишина. Отсутствие шума.</p>
          <p className="text-[0.92rem] text-white/60 leading-[1.7] mb-8">Когда исчезает привычный контекст — появляется возможность увидеть себя.</p>
          <div className="space-y-3">
            {LOC_FEATURES.map((f) => (
              <div key={f.title} className="flex items-center gap-3 py-2 border-b border-white/10">
                <f.icon size={18} className="text-brown-light shrink-0" />
                <span className="text-[0.9rem] text-white/80">{f.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

// V5 — refined current (cream, big hero-video + gallery + features)
const LocationV5 = () => (
  <section className="min-h-screen flex items-center py-12 bg-[#f3ede4] relative overflow-hidden">
    <div className="max-w-7xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 5 · Текущий (доработанный)</div>
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5">
          <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Локация</span>
          <h2 className="font-serif text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.05] text-text-dark mb-2">Красная Поляна</h2>
          <h3 className="font-serif italic text-[clamp(1.3rem,3vw,2rem)] text-brown/65 mb-6">Глэмпинг «Дзен рекавери»</h3>
          <p className="text-[1.05rem] text-text-dark leading-[1.65] mb-2">Горы. Тишина. Отсутствие шума.</p>
          <p className="text-[0.95rem] text-text-dark-soft leading-[1.7] mb-7 max-w-md">Когда исчезает привычный контекст — появляется возможность увидеть себя.</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {LOC_FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3 group">
                <f.icon size={20} className="text-brown mt-1 shrink-0 transition-transform group-hover:scale-110" />
                <span className="text-[0.95rem] text-text-dark-soft font-medium leading-tight">{f.title}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-7">
          <div className="relative aspect-[16/9] rounded-[1.5rem] overflow-hidden shadow-xl mb-4 group">
            <video src={LOC_VIDEO} autoPlay muted loop playsInline className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center px-8">
              <h3 className="font-serif text-white text-[clamp(1.6rem,3.2vw,2.6rem)] leading-tight text-center max-w-md drop-shadow-lg">Место, где замедляется жизнь</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-md group">
              <img src={LOC_EXT} alt="Exterior" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
            </div>
            <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-md group">
              <img src={LOC_INT} alt="Interior" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const LocationSectionsPage = () => (
  <div className="bg-cream min-h-screen">
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex items-center justify-between">
      <a href="/" className="font-serif text-[1.4rem] tracking-[0.08em] text-text-dark">Отражение</a>
      <span className="text-[0.7rem] uppercase tracking-[0.3em] text-text-dark-muted">Варианты секции «Локация»</span>
    </div>
    <LocationV1 />
    <LocationV2 />
    <LocationV3 />
    <LocationV4 />
    <LocationV5 />
  </div>
);

// --- Testimonials / Cases Variants ---

const FLAT_CASES = CASES.flat();

// V1 — grid of quote cards
const CasesV1 = () => (
  <section className="min-h-screen flex items-center py-12 bg-cream">
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 1 · Сетка цитат</div>
      <div className="text-center mb-8">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Кейсы</span>
        <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark">Истории трансформации</h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {FLAT_CASES.slice(0, 6).map((c, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-brown/5 flex flex-col">
            <Quote className="text-brown/30 mb-3" size={22} />
            <p className="font-serif italic text-[0.95rem] text-text-dark leading-[1.55] mb-5 flex-1">«{c.resText}»</p>
            <div className="flex items-center gap-3 pt-4 border-t border-brown/10">
              <div className="w-11 h-11 rounded-full bg-brown/10 overflow-hidden shrink-0">
                {c.img ? <img src={c.img} alt={c.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <span className="w-full h-full flex items-center justify-center text-brown font-serif">{c.name[0]}</span>}
              </div>
              <div className="min-w-0">
                <div className="font-serif text-[0.95rem] text-text-dark leading-snug truncate">{c.name}</div>
                <div className="text-[0.62rem] uppercase tracking-[0.15em] text-brown/70 truncate">{c.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V2 — before/after split, one case focus
const CasesV2 = () => {
  const [i, setI] = useState(0);
  const c = FLAT_CASES[i];
  return (
    <section className="min-h-screen flex items-center py-12 bg-white">
      <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
        <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 2 · До/После, фокус-кейс</div>
        <div className="text-center mb-8">
          <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Кейсы</span>
          <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark">Истории трансформации</h2>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-brown/10 shrink-0">
            {c.img ? <img src={c.img} alt={c.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : null}
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-[1.3rem] text-text-dark leading-snug">{c.name}</h3>
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-brown font-bold">{c.role}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setI((i - 1 + FLAT_CASES.length) % FLAT_CASES.length)} className="w-10 h-10 rounded-full border border-brown/20 text-brown hover:bg-brown hover:text-white transition"><ArrowRight size={16} className="rotate-180 mx-auto" /></button>
            <button onClick={() => setI((i + 1) % FLAT_CASES.length)} className="w-10 h-10 rounded-full border border-brown/20 text-brown hover:bg-brown hover:text-white transition"><ArrowRight size={16} className="mx-auto" /></button>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden">
          <div className="bg-[#faf6f0] p-6">
            <div className="text-[0.62rem] uppercase tracking-[0.2em] font-bold text-text-dark-muted mb-3">До участия</div>
            <ul className="space-y-2">
              {c.before.map((x, j) => (
                <li key={j} className="flex gap-2 text-[0.88rem] text-text-dark-soft leading-[1.55]"><span className="text-brown/50 shrink-0">—</span>{x}</li>
              ))}
            </ul>
          </div>
          <div className="bg-brown text-white p-6">
            <div className="text-[0.62rem] uppercase tracking-[0.2em] font-bold text-white/70 mb-3">Результат</div>
            <ul className="space-y-2">
              {c.after.map((x, j) => (
                <li key={j} className="flex gap-2 text-[0.88rem] leading-[1.55]"><CheckCircle size={15} className="shrink-0 mt-0.5 text-white" />{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

// V3 — masonry magazine quotes, dark
const CasesV3 = () => (
  <section className="min-h-screen flex items-center py-12 bg-navy text-white">
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown-light/60 mb-5">Вариант 3 · Тёмная мозаика</div>
      <div className="text-center mb-8">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown-light font-medium block mb-3">Кейсы</span>
        <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-white font-light">Истории трансформации</h2>
      </div>
      <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
        {FLAT_CASES.slice(0, 7).map((c, i) => (
          <div key={i} className="break-inside-avoid rounded-2xl border border-white/8 bg-white/[0.035] p-5 backdrop-blur-sm">
            <Quote className="text-brown-light/40 mb-2" size={20} />
            <p className="font-serif italic text-[0.95rem] text-white/85 leading-[1.55] mb-4">«{c.resText}»</p>
            <div className="flex items-center gap-3 pt-3 border-t border-white/10">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10 shrink-0">
                {c.img ? <img src={c.img} alt={c.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : null}
              </div>
              <div className="min-w-0">
                <div className="font-serif text-[0.9rem] text-white truncate">{c.name}</div>
                <div className="text-[0.58rem] uppercase tracking-[0.15em] text-brown-light truncate">{c.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V4 — editorial list with large portraits
const CasesV4 = () => (
  <section className="min-h-screen flex items-center py-12 bg-cream">
    <div className="max-w-5xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 4 · Журнальный список</div>
      <div className="mb-8 pb-5 border-b border-brown/20 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <span className="text-[0.68rem] uppercase tracking-[0.35em] text-brown font-medium block mb-3">Кейсы · 2025</span>
          <h2 className="font-serif italic text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.05] text-text-dark max-w-[18ch]">
            Истории <span className="not-italic">трансформации</span>
          </h2>
        </div>
        <p className="text-[0.88rem] text-text-dark-soft leading-[1.65] max-w-sm">Результаты участников прошлых выездов — до и после, своими словами.</p>
      </div>
      <div className="divide-y divide-text-dark/10">
        {FLAT_CASES.slice(0, 5).map((c, i) => (
          <div key={i} className="grid grid-cols-[80px_1fr] md:grid-cols-[100px_1fr_1fr] gap-5 py-5">
            <div className="w-20 h-24 md:w-24 md:h-28 overflow-hidden rounded-sm bg-brown/10 shrink-0">
              {c.img ? <img src={c.img} alt={c.name} className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" /> : null}
            </div>
            <div>
              <div className="font-serif text-brown text-[0.7rem] uppercase tracking-[0.22em] mb-1">№ 0{i + 1}</div>
              <h3 className="font-serif text-[1.25rem] text-text-dark leading-snug mb-1">{c.name}</h3>
              <p className="text-[0.7rem] uppercase tracking-[0.14em] text-text-dark-muted mb-2">{c.role}</p>
              <p className="font-serif italic text-[0.92rem] text-text-dark-soft leading-[1.55] line-clamp-4">«{c.resText}»</p>
            </div>
            <div className="hidden md:block">
              <div className="text-[0.6rem] uppercase tracking-[0.2em] font-bold text-brown mb-2">Результат</div>
              <ul className="space-y-1">
                {c.after.slice(0, 3).map((x, j) => (
                  <li key={j} className="text-[0.82rem] text-text-dark-soft leading-[1.5] flex gap-2"><CheckCircle size={13} className="shrink-0 mt-1 text-brown" />{x}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V5 — refined current (slider with before/after + navy quote)
const CasesV5 = () => {
  const [i, setI] = useState(0);
  const c = FLAT_CASES[i];
  return (
    <section className="min-h-screen flex items-center py-12 bg-cream relative overflow-hidden">
      <div className="max-w-7xl w-full mx-auto px-6 md:px-12">
        <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 5 · Текущий (доработанный)</div>
        <div className="text-center mb-7">
          <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Кейсы</span>
          <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark">Истории трансформации</h2>
          <div className="h-px w-16 bg-brown/30 mx-auto mt-4" />
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-brown/10 shrink-0">
                  {c.img ? <img src={c.img} alt={c.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <span className="w-full h-full flex items-center justify-center font-serif text-brown text-2xl">{c.name[0]}</span>}
                </div>
                <div>
                  <h3 className="font-serif text-[1.6rem] text-text-dark leading-tight">{c.name}</h3>
                  <p className="text-brown text-[0.72rem] uppercase tracking-[0.18em] font-bold">{c.role}</p>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-[0.6rem] uppercase tracking-[0.2em] font-bold text-text-dark-muted mb-2 block">До участия</span>
                <ul className="space-y-1.5">
                  {c.before.map((x, j) => (
                    <li key={j} className="flex gap-2 text-[0.88rem] text-text-dark-soft leading-[1.55]"><span className="text-brown/50 shrink-0">—</span>{x}</li>
                  ))}
                </ul>
              </div>
              <div className="p-5 rounded-xl bg-white border border-brown/10">
                <span className="text-[0.6rem] uppercase tracking-[0.2em] font-bold text-brown mb-2 block">Результат</span>
                <ul className="space-y-1.5">
                  {c.after.map((x, j) => (
                    <li key={j} className="flex gap-2 text-[0.88rem] text-text-dark leading-[1.55] font-medium"><CheckCircle size={14} className="shrink-0 mt-0.5 text-brown" />{x}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="bg-navy text-white p-8 md:p-10 rounded-[1.5rem] relative">
              <div className="absolute top-0 right-0 w-28 h-28 bg-brown/15 rounded-full blur-3xl" />
              <Quote className="text-brown mb-4 opacity-70" size={34} />
              <p className="font-serif italic text-[1.1rem] md:text-[1.25rem] leading-[1.45] mb-5">«{c.resText}»</p>
              <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                <div className="h-px w-10 bg-brown" />
                <span className="text-[0.62rem] uppercase tracking-[0.18em] text-brown-light font-bold">{c.resLabel}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setI((i - 1 + FLAT_CASES.length) % FLAT_CASES.length)} className="w-11 h-11 rounded-full border border-brown/25 text-brown hover:bg-brown hover:text-white transition"><ArrowRight size={16} className="rotate-180 mx-auto" /></button>
          <div className="flex items-center gap-2 mx-4">
            {FLAT_CASES.map((_, j) => (
              <button key={j} onClick={() => setI(j)} className={`h-1.5 rounded-full transition-all ${i === j ? "w-7 bg-brown" : "w-2 bg-brown/25"}`} />
            ))}
          </div>
          <button onClick={() => setI((i + 1) % FLAT_CASES.length)} className="w-11 h-11 rounded-full border border-brown/25 text-brown hover:bg-brown hover:text-white transition"><ArrowRight size={16} className="mx-auto" /></button>
        </div>
      </div>
    </section>
  );
};

export const TestimonialsSectionsPage = () => (
  <div className="bg-cream min-h-screen">
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex items-center justify-between">
      <a href="/" className="font-serif text-[1.4rem] tracking-[0.08em] text-text-dark">Отражение</a>
      <span className="text-[0.7rem] uppercase tracking-[0.3em] text-text-dark-muted">Варианты секции «Кейсы»</span>
    </div>
    <CasesV1 />
    <CasesV2 />
    <CasesV3 />
    <CasesV4 />
    <CasesV5 />
  </div>
);

// --- Program Variants ---

// V1 — vertical timeline, all days visible
const ProgramV1 = () => (
  <section className="min-h-screen flex items-center py-12 bg-white">
    <div className="max-w-4xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 1 · Единая вертикальная таймлайн</div>
      <div className="text-center mb-8">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Программа</span>
        <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark">Три дня трансформации</h2>
      </div>
      <div className="relative border-l border-brown/25 pl-7 space-y-7">
        {PROGRAM.map((day, di) => (
          <div key={di} className="relative">
            <span className="absolute -left-[34px] top-1 w-3 h-3 rounded-full bg-brown" />
            <div className="font-serif italic text-brown text-[1.1rem] mb-3">{day.day}</div>
            <div className="space-y-3">
              {day.items.map((it, j) => (
                <div key={j} className="flex gap-4">
                  <div className="w-20 shrink-0 text-[0.62rem] uppercase tracking-[0.18em] text-brown/70 font-bold pt-1">{it.label}</div>
                  <div>
                    <h4 className="font-serif text-[1rem] text-text-dark leading-snug">{it.title}</h4>
                    {it.desc && <p className="text-[0.82rem] text-text-dark-soft leading-[1.55] mt-0.5">{it.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V2 — three columns (one per day)
const ProgramV2 = () => (
  <section className="min-h-screen flex items-center py-12 bg-cream">
    <div className="max-w-7xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 2 · Три колонки (день=колонка)</div>
      <div className="text-center mb-8">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Программа</span>
        <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark">Три дня трансформации</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {PROGRAM.map((day, di) => (
          <div key={di} className="bg-white rounded-2xl p-6 shadow-sm border border-brown/5 flex flex-col">
            <div className="text-[0.62rem] uppercase tracking-[0.25em] text-brown font-bold mb-2">День {di + 1}</div>
            <h3 className="font-serif italic text-[1.15rem] text-brown leading-snug mb-5 pb-4 border-b border-brown/10">{day.day}</h3>
            <ul className="space-y-4 flex-1">
              {day.items.map((it, j) => (
                <li key={j}>
                  <div className="text-[0.58rem] uppercase tracking-[0.18em] font-bold text-brown/60 mb-1">{it.label}</div>
                  <h4 className="font-serif text-[0.98rem] text-text-dark leading-snug mb-1">{it.title}</h4>
                  {it.desc && <p className="text-[0.78rem] text-text-dark-soft leading-[1.55]">{it.desc}</p>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V3 — dark hero-style with day pill-selector
const ProgramV3 = () => {
  const [active, setActive] = useState(0);
  return (
    <section className="min-h-screen flex items-center py-12 bg-navy text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[10%] top-10 h-56 w-56 rounded-full bg-brown/10 blur-3xl" />
        <div className="absolute right-[10%] bottom-10 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      </div>
      <div className="max-w-5xl w-full mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown-light/60 mb-5">Вариант 3 · Тёмный с табами</div>
        <div className="text-center mb-8">
          <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown-light font-medium block mb-3">Программа</span>
          <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-white font-light">Три дня трансформации</h2>
        </div>
        <div className="flex justify-center gap-2 mb-8">
          {PROGRAM.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`px-6 py-2.5 rounded-full text-[0.62rem] uppercase tracking-[0.2em] font-semibold transition-all ${active === i ? "bg-brown text-white" : "text-white/60 border border-white/15 hover:border-brown-light/40"}`}>
              День {i + 1}
            </button>
          ))}
        </div>
        <div>
          <h3 className="font-serif italic text-brown-light text-center text-[1.3rem] mb-6">{PROGRAM[active].day}</h3>
          <div className="space-y-3">
            {PROGRAM[active].items.map((it, j) => (
              <div key={j} className="flex gap-5 rounded-xl border border-white/8 bg-white/[0.03] px-5 py-4">
                <div className="w-24 shrink-0 text-[0.6rem] uppercase tracking-[0.2em] text-brown-light font-bold pt-1">{it.label}</div>
                <div className="flex-1">
                  <h4 className="font-serif text-[1.1rem] text-white leading-snug mb-1">{it.title}</h4>
                  {it.desc && <p className="text-[0.85rem] text-white/65 leading-[1.6]">{it.desc}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// V4 — editorial program schedule as table
const ProgramV4 = () => (
  <section className="min-h-screen flex items-center py-12 bg-cream">
    <div className="max-w-5xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 4 · Журнальное расписание</div>
      <div className="mb-8 pb-5 border-b border-brown/20 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <span className="text-[0.68rem] uppercase tracking-[0.35em] text-brown font-medium block mb-3">Программа · 19–21 июня</span>
          <h2 className="font-serif italic text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.05] text-text-dark max-w-[18ch]">
            Три дня <span className="not-italic">трансформации</span>
          </h2>
        </div>
        <p className="text-[0.9rem] text-text-dark-soft leading-[1.7] max-w-sm">Полный план выезда: от заезда в пятницу до финального плана в воскресенье.</p>
      </div>
      <div className="space-y-8">
        {PROGRAM.map((day, di) => (
          <div key={di}>
            <div className="flex items-baseline gap-4 mb-3">
              <div className="font-serif text-brown/40 text-[2.5rem] leading-none">0{di + 1}</div>
              <h3 className="font-serif italic text-[1.15rem] text-brown">{day.day}</h3>
            </div>
            <div>
              {day.items.map((it, j) => (
                <div key={j} className="grid grid-cols-[90px_1fr] gap-4 py-2.5 border-b border-text-dark/10 last:border-0">
                  <div className="text-[0.62rem] uppercase tracking-[0.18em] text-brown/70 font-bold pt-1">{it.label}</div>
                  <div>
                    <h4 className="font-serif text-[1rem] text-text-dark leading-snug">{it.title}</h4>
                    {it.desc && <p className="text-[0.82rem] text-text-dark-soft leading-[1.55]">{it.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V5 — refined current (tabbed, compact)
const ProgramV5 = () => {
  const [active, setActive] = useState(0);
  return (
    <section className="min-h-screen flex items-center py-12 bg-white relative overflow-hidden">
      <div className="max-w-5xl w-full mx-auto px-6 md:px-12">
        <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 5 · Текущий (доработанный)</div>
        <div className="text-center mb-7">
          <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Программа</span>
          <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark">Три дня трансформации</h2>
          <div className="h-px w-16 bg-brown/30 mx-auto mt-4" />
        </div>
        <div role="tablist" aria-label="Программа по дням" className="flex justify-center gap-2 mb-7 bg-cream/50 p-1.5 rounded-full w-fit mx-auto">
          {PROGRAM.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              id={`program-tab-${i}`}
              aria-selected={active === i}
              aria-controls={`program-panel-${i}`}
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
              className={`px-6 py-2.5 rounded-full text-[0.65rem] uppercase tracking-[0.2em] font-bold transition-all ${active === i ? "bg-[#ebe3db] text-text-dark shadow-sm" : "text-text-dark-muted hover:bg-cream"}`}>
              День {i + 1}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            role="tabpanel"
            id={`program-panel-${active}`}
            aria-labelledby={`program-tab-${active}`}
            tabIndex={0}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }}>
            <h3 className="font-serif text-[1.25rem] text-brown text-center italic mb-5">{PROGRAM[active].day}</h3>
            <div className="grid gap-3">
              {PROGRAM[active].items.map((it, j) => (
                <div key={j} className="px-5 py-4 md:px-6 md:py-5 rounded-2xl bg-[#faf8f5] border border-brown/8 flex flex-col md:flex-row gap-3 md:gap-6 md:items-center hover:border-brown/25 hover:shadow-sm transition-all">
                  <div className="md:w-28 shrink-0">
                    <span className="text-[0.62rem] uppercase tracking-[0.2em] font-bold text-brown/70">{it.label}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif text-[1.05rem] md:text-[1.15rem] text-text-dark leading-snug mb-1">{it.title}</h4>
                    {it.desc && <p className="text-[0.82rem] text-text-dark-soft leading-[1.55]">{it.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export const ProgramSectionsPage = () => (
  <div className="bg-cream min-h-screen">
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex items-center justify-between">
      <a href="/" className="font-serif text-[1.4rem] tracking-[0.08em] text-text-dark">Отражение</a>
      <span className="text-[0.7rem] uppercase tracking-[0.3em] text-text-dark-muted">Варианты секции «Программа»</span>
    </div>
    <ProgramV1 />
    <ProgramV2 />
    <ProgramV3 />
    <ProgramV4 />
    <ProgramV5 />
  </div>
);

// --- Methodology Variants ---

const METH_ICONS: any = { Eye, RefreshCw, Zap, Compass };

// V1 — minimal 4 columns with top border
const MethodologyV1 = () => (
  <section className="min-h-screen flex items-center py-16 bg-cream">
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-6">Вариант 1 · Минимал, 4 колонки</div>
      <div className="text-center mb-10">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Методология</span>
        <h2 className="font-serif text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.1] text-text-dark">Как проходит работа</h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {PROCESS.map((item, i) => {
          const Icon = METH_ICONS[item.icon] || HelpCircle;
          return (
            <div key={i} className="border-t border-brown/25 pt-5">
              <div className="flex items-center justify-between mb-4">
                <Icon size={22} strokeWidth={1.3} className="text-brown" />
                <span className="font-serif text-brown/50 text-sm">0{i + 1}</span>
              </div>
              <h3 className="font-serif text-[1.15rem] text-text-dark mb-2 leading-snug">{item.title}</h3>
              <p className="text-[0.85rem] text-text-dark-soft leading-[1.6] mb-3">{item.desc}</p>
              <ul className="space-y-1">
                {item.points?.map((p, j) => (
                  <li key={j} className="text-[0.68rem] uppercase tracking-[0.12em] text-text-dark-muted">— {p}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

// V2 — zigzag steps with large numbers
const MethodologyV2 = () => (
  <section className="min-h-screen flex items-center py-16 bg-cream-soft">
    <div className="max-w-5xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-6">Вариант 2 · Зигзаг-шаги</div>
      <div className="text-center mb-10">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Методология</span>
        <h2 className="font-serif text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.1] text-text-dark">Как проходит работа</h2>
      </div>
      <div className="space-y-6">
        {PROCESS.map((item, i) => {
          const Icon = METH_ICONS[item.icon] || HelpCircle;
          const reverse = i % 2 !== 0;
          return (
            <div key={i} className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-start gap-6 md:gap-10 pb-6 border-b border-brown/15 last:border-0`}>
              <div className={`shrink-0 flex items-center gap-4 ${reverse ? "md:text-right" : ""}`}>
                <div className="font-serif text-[3.5rem] leading-none text-brown/30">0{i + 1}</div>
                <div className="w-12 h-12 rounded-full bg-white border border-brown/20 flex items-center justify-center text-brown">
                  <Icon size={20} strokeWidth={1.4} />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-[1.35rem] text-text-dark mb-2">{item.title}</h3>
                <p className="text-[0.92rem] text-text-dark-soft leading-[1.7] mb-2">{item.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {item.points?.map((p, j) => (
                    <span key={j} className="text-[0.65rem] uppercase tracking-[0.12em] text-brown border border-brown/25 rounded-full px-2.5 py-0.5">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

// V3 — dark with accent cards
const MethodologyV3 = () => (
  <section className="min-h-screen flex items-center py-16 bg-navy text-white relative overflow-hidden">
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12 relative z-10">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown-light/60 mb-6">Вариант 3 · Тёмный с акцентами</div>
      <div className="text-center mb-10">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown-light font-medium block mb-3">Методология</span>
        <h2 className="font-serif text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.1] text-white font-light">Как проходит работа</h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PROCESS.map((item, i) => {
          const Icon = METH_ICONS[item.icon] || HelpCircle;
          return (
            <div key={i} className={`rounded-2xl p-6 ${item.brown ? "bg-brown text-white" : "bg-white/[0.04] border border-white/8"}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.brown ? "bg-white/15" : "bg-brown-light/15 text-brown-light"}`}>
                  <Icon size={20} strokeWidth={1.4} />
                </div>
                <span className={`font-serif text-2xl ${item.brown ? "text-white/50" : "text-brown-light/40"}`}>0{i + 1}</span>
              </div>
              <h3 className="font-serif text-[1.1rem] leading-snug mb-2">{item.title}</h3>
              <p className={`text-[0.82rem] leading-[1.6] mb-3 ${item.brown ? "text-white/80" : "text-white/65"}`}>{item.desc}</p>
              <ul className="space-y-1">
                {item.points?.map((p, j) => (
                  <li key={j} className={`text-[0.62rem] uppercase tracking-[0.15em] ${item.brown ? "text-white/70" : "text-white/50"}`}>— {p}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

// V4 — editorial table/rows
const MethodologyV4 = () => (
  <section className="min-h-screen flex items-center py-16 bg-cream">
    <div className="max-w-5xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-6">Вариант 4 · Журнальная таблица</div>
      <div className="mb-8 pb-5 border-b border-brown/20 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <span className="text-[0.68rem] uppercase tracking-[0.35em] text-brown font-medium block mb-3">Методология</span>
          <h2 className="font-serif italic text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.05] text-text-dark max-w-[20ch]">
            Как проходит <span className="not-italic">работа</span>
          </h2>
        </div>
        <p className="text-[0.9rem] text-text-dark-soft leading-[1.7] max-w-sm">Четыре уровня, на которых мы работаем с каждым участником — от диагностики до стратегии.</p>
      </div>
      <div>
        {PROCESS.map((item, i) => {
          const Icon = METH_ICONS[item.icon] || HelpCircle;
          return (
            <div key={i} className="grid grid-cols-[60px_40px_1fr] md:grid-cols-[70px_50px_1fr_260px] gap-4 md:gap-6 py-5 border-b border-text-dark/10 items-start">
              <div className="font-serif text-brown text-[0.72rem] uppercase tracking-[0.25em] pt-1">№ 0{i + 1}</div>
              <div className="w-10 h-10 rounded-full border border-brown/25 bg-white flex items-center justify-center text-brown">
                <Icon size={18} strokeWidth={1.4} />
              </div>
              <div>
                <h3 className="font-serif text-[1.15rem] text-text-dark mb-1.5">{item.title}</h3>
                <p className="text-[0.9rem] text-text-dark-soft leading-[1.65]">{item.desc}</p>
              </div>
              <div className="hidden md:block">
                <ul className="space-y-1 pt-1">
                  {item.points?.map((p, j) => (
                    <li key={j} className="text-[0.7rem] uppercase tracking-[0.12em] text-text-dark-muted">— {p}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

// V5 — refined current: keeps stagger, brown-accent cards, big ghost numbers,
// connecting line, and the "10 мест" footer chip — just tightened for one screen.
const MethodologyV5 = () => (
  <section className="min-h-screen flex items-center py-12 bg-cream relative overflow-hidden">
    <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 1000 1000" fill="none" preserveAspectRatio="none">
        <path d="M0 200C200 100 400 300 600 200C800 100 1000 300 1200 200" stroke="currentColor" strokeWidth="1" />
        <path d="M0 500C200 400 400 600 600 500C800 400 1000 600 1200 500" stroke="currentColor" strokeWidth="1" />
        <path d="M0 800C200 700 400 900 600 800C800 700 1000 900 1200 800" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>

    <div className="max-w-7xl w-full mx-auto px-6 md:px-12 relative z-10">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-5">Вариант 5 · Текущий (доработанный)</div>
      <div className="text-center mb-8">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Методология</span>
        <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.1] text-text-dark">Как проходит работа</h2>
        <div className="h-px w-16 bg-brown/30 mx-auto mt-4" />
      </div>

      <div className="relative">
        <div className="hidden lg:block absolute top-1/2 left-[5%] right-[5%] h-px bg-gradient-to-r from-transparent via-brown/15 to-transparent -translate-y-1/2 z-0" />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 relative z-10">
          {PROCESS.map((item, i) => {
            const Icon = METH_ICONS[item.icon] || HelpCircle;
            const staggered = i % 2 !== 0;
            return (
              <div
                key={i}
                className={`relative rounded-[1.5rem] p-5 md:p-6 h-full flex flex-col group transition-all duration-500
                  ${staggered ? "lg:mt-8" : ""}
                  ${item.brown
                    ? "bg-brown text-white shadow-[0_18px_48px_rgba(154,125,90,0.3)] lg:scale-[1.04] z-20"
                    : "bg-white border border-brown/8 shadow-sm hover:shadow-lg hover:border-brown/20"}`}
              >
                <span className={`absolute top-3 right-5 font-serif text-[3.5rem] leading-none opacity-[0.08] pointer-events-none select-none ${item.brown ? "text-white" : "text-brown"}`}>
                  0{i + 1}
                </span>

                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-500 group-hover:rotate-3 group-hover:scale-105 ${item.brown ? "bg-white/15 text-white" : "bg-brown/10 text-brown"}`}>
                  <Icon size={20} strokeWidth={1.3} />
                </div>

                <h3 className="font-serif text-[1.15rem] leading-[1.2] mb-2">{item.title}</h3>
                <p className={`text-[0.82rem] leading-[1.55] mb-3 ${item.brown ? "text-white/80" : "text-text-dark-soft"}`}>{item.desc}</p>

                <div className="mt-auto space-y-1.5">
                  {item.points?.map((p, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <div className={`mt-[7px] w-1 h-1 rounded-full shrink-0 ${item.brown ? "bg-white/45" : "bg-brown/35"}`} />
                      <span className={`text-[0.62rem] uppercase tracking-[0.14em] font-medium leading-tight ${item.brown ? "text-white/65" : "text-text-dark-muted"}`}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-14 text-center">
        <div className="inline-flex items-center gap-4 px-7 py-3.5 rounded-full bg-white/60 backdrop-blur-md border border-brown/10 shadow-sm bg-gradient-to-r from-white/60 to-white/60 hover:from-navy hover:to-brown hover:text-white hover:border-transparent transition-all duration-500 group cursor-default">
          <div className="relative">
            <Users size={18} className="text-brown group-hover:text-white transition-colors" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-brown rounded-full animate-ping group-hover:bg-white" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-brown rounded-full group-hover:bg-white" />
          </div>
          <span className="text-[0.78rem] font-medium tracking-wide text-text-dark group-hover:text-white transition-colors">Всего 10 мест для максимальной глубины</span>
        </div>
      </div>
    </div>
  </section>
);

export const MethodologySectionsPage = () => (
  <div className="bg-cream min-h-screen">
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex items-center justify-between">
      <a href="/" className="font-serif text-[1.4rem] tracking-[0.08em] text-text-dark">Отражение</a>
      <span className="text-[0.7rem] uppercase tracking-[0.3em] text-text-dark-muted">Варианты секции «Методология»</span>
    </div>
    <MethodologyV1 />
    <MethodologyV2 />
    <MethodologyV3 />
    <MethodologyV4 />
    <MethodologyV5 />
  </div>
);

// --- Authors Variants ---

const A0 = AUTHORS[0];
const A1 = AUTHORS[1];

// V1 — light editorial, large portraits side-by-side
const AuthorsV1 = () => (
  <section className="min-h-screen flex items-center py-16 bg-cream">
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-6">Вариант 1 · Светлый editorial</div>
      <div className="text-center mb-10">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Авторы</span>
        <h2 className="font-serif text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.1] text-text-dark">Кто ведёт кэмп</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-10">
        {[A0, A1].map((a, i) => (
          <div key={a.name}>
            <div className="aspect-[4/5] overflow-hidden rounded-[1.5rem] mb-5 bg-navy">
              <img src={a.img} alt={a.name} className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
            </div>
            <div className="text-[0.65rem] uppercase tracking-[0.25em] text-brown mb-2">{i === 0 ? "Глубина" : "Структура"}</div>
            <h3 className="font-serif text-[1.75rem] text-text-dark mb-2">{a.name}</h3>
            <p className="text-[0.85rem] uppercase tracking-[0.12em] text-text-dark-muted mb-3">{a.role}</p>
            <p className="text-[0.95rem] text-text-dark-soft leading-[1.7]">{a.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V2 — dark dramatic hero-portraits
const AuthorsV2 = () => (
  <section className="min-h-screen flex items-center py-16 bg-navy text-white relative overflow-hidden">
    <div className="max-w-7xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown-light/60 mb-6">Вариант 2 · Тёмный, драматичный</div>
      <div className="grid md:grid-cols-2 gap-0 rounded-[2rem] overflow-hidden">
        {[A0, A1].map((a, i) => (
          <div key={a.name} className="relative aspect-[4/5] group overflow-hidden">
            <img src={a.img} alt={a.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
              <div className="text-[0.62rem] uppercase tracking-[0.28em] text-brown-light mb-3">{i === 0 ? "Глубина" : "Структура"}</div>
              <h3 className="font-serif text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.02] mb-2">{a.name}</h3>
              <p className="text-brown-light/90 text-[0.72rem] uppercase tracking-[0.12em] mb-4">{a.role}</p>
              <p className="text-white/80 text-[0.92rem] leading-[1.65] max-w-md">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V3 — journal columns with quotes
const AuthorsV3 = () => (
  <section className="min-h-screen flex items-center py-16 bg-cream-soft">
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-6">Вариант 3 · Журнальный</div>
      <div className="mb-10 pb-6 border-b border-brown/20 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="text-[0.68rem] uppercase tracking-[0.35em] text-brown font-medium block mb-3">Авторы · 2026</span>
          <h2 className="font-serif italic text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.05] text-text-dark max-w-[18ch]">
            Двое, которые ведут <span className="not-italic">работу</span>.
          </h2>
        </div>
        <p className="text-[0.9rem] text-text-dark-soft leading-[1.7] max-w-sm">Вместе соединяют женскую глубину и мужскую структуру — чтобы внутренняя работа становилась устойчивой опорой.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-12">
        {[A0, A1].map((a, i) => (
          <div key={a.name} className="flex gap-6">
            <div className="w-28 h-36 sm:w-32 sm:h-40 overflow-hidden rounded-sm shrink-0 bg-navy">
              <img src={a.img} alt={a.name} className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1">
              <div className="font-serif text-brown text-[0.72rem] uppercase tracking-[0.25em] mb-2">№ 0{i + 1}</div>
              <h3 className="font-serif text-[1.5rem] text-text-dark mb-1">{a.name}</h3>
              <p className="text-[0.78rem] uppercase tracking-[0.12em] text-text-dark-muted mb-3">{a.role}</p>
              <p className="text-[0.92rem] text-text-dark-soft leading-[1.7]">{a.desc}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {a.tags.slice(0, 3).map((t) => (
                  <span key={t} className="text-[0.65rem] uppercase tracking-[0.15em] text-brown border border-brown/25 rounded-full px-2.5 py-1">{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V4 — asymmetric split with stats
const AuthorsV4 = () => (
  <section className="min-h-screen flex items-center py-16 bg-cream relative">
    <div className="max-w-7xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-6">Вариант 4 · Асимметрия + статы</div>
      <div className="grid lg:grid-cols-[1fr_1fr] gap-10 items-stretch">
        {[A0, A1].map((a, i) => (
          <div key={a.name} className={`relative rounded-[2rem] overflow-hidden ${i === 0 ? "bg-white" : "bg-navy text-white"} shadow-[0_16px_48px_rgba(82,60,34,0.08)]`}>
            <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] gap-0">
              <div className="relative overflow-hidden bg-navy">
                <img src={a.img} alt={a.name} className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
              </div>
              <div className="p-6 sm:p-8">
                <div className={`text-[0.62rem] uppercase tracking-[0.28em] mb-3 ${i === 0 ? "text-brown" : "text-brown-light"}`}>{i === 0 ? "Глубина" : "Структура"}</div>
                <h3 className={`font-serif text-[1.6rem] leading-[1.05] mb-1 ${i === 0 ? "text-text-dark" : "text-white"}`}>{a.name}</h3>
                <p className={`text-[0.7rem] uppercase tracking-[0.12em] mb-4 ${i === 0 ? "text-text-dark-muted" : "text-white/50"}`}>{a.role}</p>
                <p className={`text-[0.9rem] leading-[1.65] ${i === 0 ? "text-text-dark-soft" : "text-white/75"}`}>{a.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-center">
        <div>
          <div className="font-serif text-3xl text-brown">500+</div>
          <div className="text-[0.62rem] uppercase tracking-[0.2em] text-text-dark-muted mt-1">участников</div>
        </div>
        <div className="w-px h-10 bg-brown/20" />
        <div>
          <div className="font-serif text-3xl text-brown">10+</div>
          <div className="text-[0.62rem] uppercase tracking-[0.2em] text-text-dark-muted mt-1">лет практики</div>
        </div>
        <div className="w-px h-10 bg-brown/20" />
        <div>
          <div className="font-serif text-3xl text-brown">100%</div>
          <div className="text-[0.62rem] uppercase tracking-[0.2em] text-text-dark-muted mt-1">честности</div>
        </div>
      </div>
    </div>
  </section>
);

// V5 — refined current (navy, полушторки)
const AuthorsV5 = () => (
  <section className="min-h-screen flex items-center py-16 bg-navy text-white relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute left-[10%] bottom-16 h-56 w-56 rounded-full bg-brown/10 blur-3xl" />
      <div className="absolute right-[8%] top-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
    </div>
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12 relative z-10">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown-light/60 mb-6">Вариант 5 · Текущий (доработанный)</div>
      <div className="text-center mb-10">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown-light font-medium block mb-3">Авторы</span>
        <h2 className="font-serif text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.05] text-white font-light">Двое, которые ведут работу</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {[A0, A1].map((a, i) => (
          <div key={a.name} className="rounded-[1.7rem] border border-white/8 bg-white/[0.04] overflow-hidden backdrop-blur-sm">
            <div className="aspect-[16/10] overflow-hidden">
              <img src={a.img} alt={a.name} className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
            </div>
            <div className="px-6 py-6 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-brown/10 border border-brown/25 px-3 py-1 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brown-light" />
                <span className="text-[0.6rem] uppercase tracking-[0.22em] text-brown-light font-medium">{i === 0 ? "глубина" : "структура"}</span>
              </div>
              <h3 className="font-serif text-[1.6rem] mb-1">{a.name}</h3>
              <p className="text-brown-light/85 text-[0.66rem] tracking-[0.2em] uppercase font-medium mb-3">{a.role}</p>
              <p className="text-white/72 text-[0.9rem] leading-[1.7] mb-4 max-w-md mx-auto">{a.desc}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {a.tags.slice(0, 3).map((t) => (
                  <span key={t} className="rounded-full border border-white/12 bg-white/[0.03] px-3 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-white/65">{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const AuthorsSectionsPage = () => (
  <div className="bg-cream min-h-screen">
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex items-center justify-between">
      <a href="/" className="font-serif text-[1.4rem] tracking-[0.08em] text-text-dark">Отражение</a>
      <span className="text-[0.7rem] uppercase tracking-[0.3em] text-text-dark-muted">Варианты секции «Авторы»</span>
    </div>
    <AuthorsV1 />
    <AuthorsV2 />
    <AuthorsV3 />
    <AuthorsV4 />
    <AuthorsV5 />
  </div>
);

// --- Philosophy Variants ---

const PHIL_TITLE = "Мы соединяем внутреннюю глубину и ясную структуру,";
const PHIL_SUB = "чтобы изменения становились устойчивыми";
const PHIL_DESC = "Мы объединяем женскую глубину и мужскую структуру, чтобы внутренняя работа не оставалась на уровне слов, а давала опору, ясность и внутреннее согласие.";
const PHIL_ITEMS = [
  { title: "Глубина", text: "Помогает увидеть то, что давно живёт внутри: чувства, потребности и скрытые сценарии." },
  { title: "Структура", text: "Помогает собрать переживание в ясность, чтобы внутренние открытия становились решениями." },
  { title: "Изменения", text: "Помогает перевести понимание в новую опору, поведение и следующий этап жизни." }
];

// V1 — light airy, centered with divider
const PhilosophyV1 = () => (
  <section className="min-h-screen flex items-center py-16 bg-cream">
    <div className="max-w-5xl w-full mx-auto px-6 md:px-12 text-center">
      <div className="text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-6">Вариант 1 · Светлый, центрированный</div>
      <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-4">Философия</span>
      <h2 className="font-serif text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.1] text-text-dark mb-3">{PHIL_TITLE}</h2>
      <p className="font-serif italic text-[clamp(1.05rem,2vw,1.35rem)] text-brown leading-[1.55] mb-6">{PHIL_SUB}</p>
      <div className="h-px w-20 bg-brown/30 mx-auto mb-6" />
      <p className="text-[0.98rem] text-text-dark-soft leading-[1.8] max-w-2xl mx-auto mb-10">{PHIL_DESC}</p>
      <div className="grid md:grid-cols-3 gap-6 text-left">
        {PHIL_ITEMS.map((it) => (
          <div key={it.title} className="border-t border-brown/20 pt-5">
            <div className="font-serif text-[1.3rem] text-brown mb-2">{it.title}</div>
            <p className="text-[0.9rem] text-text-dark-soft leading-[1.65]">{it.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V2 — side-by-side two pillars (feminine/masculine)
const PhilosophyV2 = () => (
  <section className="min-h-screen flex items-center py-16 bg-cream-soft">
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-6">Вариант 2 · Два столпа</div>
      <div className="text-center mb-12">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown font-medium block mb-3">Философия</span>
        <h2 className="font-serif text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.1] text-text-dark">Глубина <span className="italic text-brown">×</span> Структура</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-stretch">
        <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_16px_48px_rgba(82,60,34,0.08)]">
          <div className="text-[0.65rem] uppercase tracking-[0.3em] text-brown-light mb-4">Женское начало</div>
          <h3 className="font-serif text-[1.6rem] text-text-dark mb-4">Глубина</h3>
          <p className="text-[0.95rem] text-text-dark-soft leading-[1.7]">{PHIL_ITEMS[0].text}</p>
        </div>
        <div className="bg-navy text-white rounded-[2rem] p-8 md:p-10 shadow-[0_16px_48px_rgba(11,17,48,0.3)]">
          <div className="text-[0.65rem] uppercase tracking-[0.3em] text-brown-light mb-4">Мужское начало</div>
          <h3 className="font-serif text-[1.6rem] mb-4">Структура</h3>
          <p className="text-[0.95rem] text-white/75 leading-[1.7]">{PHIL_ITEMS[1].text}</p>
        </div>
      </div>
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full border border-brown/25 bg-white/60">
          <span className="text-[0.65rem] uppercase tracking-[0.24em] text-brown">Вместе</span>
          <span className="font-serif italic text-[1.05rem] text-text-dark">{PHIL_ITEMS[2].title.toLowerCase()} становятся устойчивыми</span>
        </div>
      </div>
    </div>
  </section>
);

// V3 — manifesto: giant quote
const PhilosophyV3 = () => (
  <section className="min-h-screen flex items-center py-16 bg-navy relative overflow-hidden">
    <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #b8996e 0%, transparent 50%), radial-gradient(circle at 80% 70%, #b8996e 0%, transparent 50%)' }} />
    <div className="max-w-4xl w-full mx-auto px-6 md:px-12 relative z-10 text-center">
      <div className="text-[0.65rem] uppercase tracking-[0.4em] text-brown-light/60 mb-6">Вариант 3 · Манифест</div>
      <span className="text-[0.68rem] uppercase tracking-[0.3em] text-brown-light font-medium block mb-8">Философия</span>
      <Quote className="mx-auto text-brown-light/40 mb-4" size={40} />
      <blockquote className="font-serif italic text-[clamp(1.5rem,3.5vw,2.6rem)] leading-[1.25] text-white font-light mb-6">
        Мы соединяем <span className="text-brown-light not-italic">глубину</span> и <span className="text-brown-light not-italic">структуру</span>,
        чтобы изменения становились <span className="underline decoration-brown-light/50 underline-offset-[10px]">устойчивыми</span>.
      </blockquote>
      <p className="text-[0.98rem] text-white/60 leading-[1.8] max-w-xl mx-auto mb-10">{PHIL_DESC}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {PHIL_ITEMS.map((it) => (
          <span key={it.title} className="px-5 py-2 rounded-full border border-brown-light/30 text-brown-light text-[0.75rem] uppercase tracking-[0.2em]">{it.title}</span>
        ))}
      </div>
    </div>
  </section>
);

// V4 — editorial with numbered columns
const PhilosophyV4 = () => (
  <section className="min-h-screen flex items-center py-16 bg-cream">
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown/60 mb-6">Вариант 4 · Журнальный</div>
      <div className="mb-10 pb-6 border-b border-brown/20 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="text-[0.68rem] uppercase tracking-[0.35em] text-brown font-medium block mb-3">Философия · принципы</span>
          <h2 className="font-serif italic text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.05] text-text-dark max-w-[18ch]">
            Глубина и <span className="not-italic">структура</span> в одной работе.
          </h2>
        </div>
        <p className="text-[0.9rem] text-text-dark-soft leading-[1.7] max-w-sm">{PHIL_DESC}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-10">
        {PHIL_ITEMS.map((it, i) => (
          <div key={it.title}>
            <div className="font-serif text-[3rem] leading-none text-brown/40 mb-3">0{i + 1}</div>
            <h3 className="font-serif text-[1.5rem] text-text-dark mb-3">{it.title}</h3>
            <p className="text-[0.93rem] text-text-dark-soft leading-[1.7]">{it.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// V5 — refined current (navy polished)
const PhilosophyV5 = () => (
  <section className="min-h-screen flex items-center py-16 bg-navy text-white relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute left-[10%] top-10 h-56 w-56 rounded-full bg-brown/10 blur-3xl" />
      <div className="absolute right-[8%] bottom-10 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
    </div>
    <div className="max-w-6xl w-full mx-auto px-6 md:px-12 relative z-10">
      <div className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-brown-light/60 mb-6">Вариант 5 · Текущий (доработанный)</div>
      <div className="max-w-3xl mx-auto text-center mb-12">
        <span className="inline-flex items-center rounded-full border border-brown-light/25 bg-white/[0.04] px-4 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.25em] text-brown-light/85">Философия</span>
        <h2 className="mt-5 font-serif text-[clamp(1.9rem,4.5vw,3.2rem)] leading-[1.05] text-white font-light">{PHIL_TITLE}</h2>
        <p className="mt-3 font-serif italic text-[clamp(1.05rem,1.9vw,1.3rem)] text-brown-light/90 leading-[1.5]">{PHIL_SUB}</p>
        <div className="h-px w-16 bg-brown-light/40 mx-auto mt-6" />
        <p className="mt-6 text-[0.98rem] leading-[1.8] text-white/70 max-w-2xl mx-auto">{PHIL_DESC}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3 md:gap-5">
        {PHIL_ITEMS.map((it) => (
          <div key={it.title} className="rounded-[1.5rem] border border-white/8 bg-white/[0.035] px-6 py-6 backdrop-blur-sm">
            <div className="text-[0.62rem] uppercase tracking-[0.25em] text-brown-light/80 font-medium mb-3">{it.title}</div>
            <p className="text-[0.93rem] leading-[1.7] text-white/72">{it.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const PhilosophySectionsPage = () => (
  <div className="bg-cream min-h-screen">
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex items-center justify-between">
      <a href="/" className="font-serif text-[1.4rem] tracking-[0.08em] text-text-dark">Отражение</a>
      <span className="text-[0.7rem] uppercase tracking-[0.3em] text-text-dark-muted">Варианты секции «Философия»</span>
    </div>
    <PhilosophyV1 />
    <PhilosophyV2 />
    <PhilosophyV3 />
    <PhilosophyV4 />
    <PhilosophyV5 />
  </div>
);

// --- About Sections Preview Page ---

export const AboutSectionsPage = () => (
  <div className="bg-cream min-h-screen">
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex items-center justify-between">
      <a href="/" className="font-serif text-[1.4rem] tracking-[0.08em] text-text-dark">Отражение</a>
      <span className="text-[0.7rem] uppercase tracking-[0.3em] text-text-dark-muted">Варианты секции «О проекте»</span>
    </div>
    <AboutV1 />
    <AboutV2 />
    <AboutV3 />
    <AboutV4 />
  </div>
);

// --- Main App ---

export default function AppV3() {
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const handleOpenModal = (plan?: any) => {
    if (plan === 'compare') {
      ymGoal("compare_open");
      setIsCompareModalOpen(true);
    } else {
      ymGoal("cta_book_click", { plan: plan?.name || "generic" });
      setSelectedPlan(plan || null);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="font-sans text-text-dark selection:bg-brown/20">
      <AnimatePresence mode="wait">
        {isLoading && <Preloader key="preloader" onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <Navbar onOpenModal={() => handleOpenModal()} />
      <Hero onOpenModal={() => handleOpenModal()} />
      <JourneyPath />
      <WhenYouNeedCamp />
      <SystemProblem />
      <WhatHappens />
      <Authors onOpenModal={() => handleOpenModal()} />
      <HowItWorks />
      <Program />
      <Location />
      <Testimonials />
      <ForWho />
      <Results onOpenModal={handleOpenModal} />
      <Pricing onOpenModal={handleOpenModal} />
      <FinalBlock onOpenModal={() => handleOpenModal()} />
      <Footer />
      <ScrollToTop />
      <LiveChat />
      <CookieBanner />
      {/* <ChatAssistant /> */}
      <ComparisonModal 
        isOpen={isCompareModalOpen} 
        onClose={() => setIsCompareModalOpen(false)} 
      />
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        selectedPlan={selectedPlan}
      />
    </div>
  );
}

// ─── Oferta Page ────────────────────────────────────────────────────────────

export const OfertaPage = () => {
  const Section = ({ num, title, children }: { num: string; title: string; children: React.ReactNode }) => (
    <section className="mb-10">
      <h2 className="font-serif text-[1.25rem] md:text-[1.45rem] text-[#2c1f14] mb-3 flex items-baseline gap-2">
        <span className="text-brown/50 font-sans text-[0.85rem] font-semibold shrink-0">{num}.</span>
        {title}
      </h2>
      <div className="space-y-2 text-[0.92rem] leading-relaxed text-[#3d2e21]/80">{children}</div>
    </section>
  );

  const P = ({ children }: { children: React.ReactNode }) => (
    <p className="pl-4 border-l border-brown/15">{children}</p>
  );

  return (
    <div className="min-h-screen bg-[#faf7f3]">
      <header className="sticky top-0 z-40 bg-[#faf7f3]/90 backdrop-blur-sm border-b border-brown/10">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <a href="/v3" className="text-[0.78rem] uppercase tracking-[0.18em] text-brown/60 hover:text-brown transition font-semibold">
            ← На сайт
          </a>
          <span className="font-serif text-[0.95rem] text-[#2c1f14]/70">Публичная оферта</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-12 md:py-16">
        <div className="mb-10">
          <h1 className="font-serif text-[clamp(1.8rem,4vw,2.6rem)] text-[#2c1f14] leading-tight mb-3">
            Публичная оферта
          </h1>
          <p className="text-[0.88rem] text-[#3d2e21]/55 leading-relaxed">
            на участие в интенсиве «Отражение» (19–21 июня 2026)
          </p>
          <div className="mt-4 h-px bg-gradient-to-r from-brown/25 to-transparent" />
        </div>

        <Section num="1" title="Общие положения">
          <P>Настоящий документ является публичной офертой (далее — «Оферта») и адресован любому физическому лицу, выразившему намерение принять участие в интенсиве «Отражение» (далее — «Мероприятие»).</P>
          <P>Акцептом настоящей Оферты является оплата участия в Мероприятии любым из предложенных способов. С момента поступления оплаты Договор считается заключённым на условиях, изложенных в настоящей Оферте.</P>
          <P>Организатор оставляет за собой право в одностороннем порядке изменять условия настоящей Оферты. Актуальная редакция всегда размещена на сайте otragenie-camp.ru/oferta. Оплата, произведённая до изменения условий, регулируется редакцией, действовавшей на момент оплаты.</P>
        </Section>

        <Section num="2" title="Организатор">
          <P><span className="font-medium text-[#2c1f14]">[РЕКВИЗИТЫ ОРГАНИЗАТОРА]</span></P>
          <p className="pl-4 text-[0.82rem] text-brown/50 italic">Заполнить: полное наименование / ФИО, ИНН, ОГРНИП/ОГРН, адрес, e-mail для обращений.</p>
        </Section>

        <Section num="3" title="Предмет договора">
          <P>Организатор обязуется провести Мероприятие — выездной интенсив «Отражение» — в период с 19 по 21 июня 2026 года включительно на базе глэмпинга «Дзен рекавери», Красная Поляна, и обеспечить Участнику доступ к программе в соответствии с оплаченным тарифом.</P>
          <P>Состав услуг, включённых в каждый тариф («База», «Полный», «Премиум»), определяется описанием на сайте otragenie-camp.ru и является частью настоящего Договора.</P>
        </Section>

        <Section num="4" title="Стоимость и порядок оплаты">
          <P>Стоимость участия определяется выбранным тарифом:</P>
          <ul className="pl-4 space-y-1 list-none">
            {[
              { name: 'База', price: '149 000 ₽' },
              { name: 'Полный', price: '179 000 ₽' },
              { name: 'Премиум', price: '249 000 ₽' },
            ].map(t => (
              <li key={t.name} className="flex items-baseline gap-2 text-[0.92rem]">
                <span className="w-1.5 h-1.5 rounded-full bg-brown/40 shrink-0 mt-[0.35em]" />
                <span>«{t.name}» — <strong className="text-[#2c1f14]">{t.price}</strong></span>
              </li>
            ))}
          </ul>
          <P>Оплата производится в рублях через платёжный сервис Prodamus. Место нахождения оферты (акцепт) — Российская Федерация.</P>
          <P>Оплата подтверждается электронным чеком, направляемым на указанный Участником контакт.</P>
        </Section>

        <Section num="5" title="Права и обязанности сторон">
          <p className="pl-4 font-medium text-[#2c1f14]">Организатор обязуется:</p>
          <ul className="pl-4 space-y-1 list-none">
            {[
              'провести Мероприятие в заявленные сроки;',
              'обеспечить размещение и питание в соответствии с выбранным тарифом;',
              'информировать Участника об изменениях программы не позднее чем за 5 дней до начала.',
            ].map((t, i) => (
              <li key={i} className="flex items-baseline gap-2 text-[0.92rem]">
                <span className="w-1.5 h-1.5 rounded-full bg-brown/40 shrink-0 mt-[0.35em]" />
                {t}
              </li>
            ))}
          </ul>
          <p className="pl-4 font-medium text-[#2c1f14] mt-3">Участник обязуется:</p>
          <ul className="pl-4 space-y-1 list-none">
            {[
              'своевременно произвести оплату;',
              'прибыть в место проведения в установленное время;',
              'соблюдать правила проживания на территории глэмпинга;',
              'не записывать и не распространять материалы программы без согласия Организатора и других Участников.',
            ].map((t, i) => (
              <li key={i} className="flex items-baseline gap-2 text-[0.92rem]">
                <span className="w-1.5 h-1.5 rounded-full bg-brown/40 shrink-0 mt-[0.35em]" />
                {t}
              </li>
            ))}
          </ul>
        </Section>

        <Section num="6" title="Отказ от участия и возврат средств">
          <P>Участник вправе отказаться от участия, направив уведомление Организатору в письменной форме (e-mail).</P>
          <ul className="pl-4 space-y-1 list-none">
            {[
              'Более чем за 30 дней до начала — возврат 90% стоимости.',
              'От 14 до 30 дней включительно — возврат 50% стоимости.',
              'Менее чем за 14 дней — возврат не производится.',
            ].map((t, i) => (
              <li key={i} className="flex items-baseline gap-2 text-[0.92rem]">
                <span className="w-1.5 h-1.5 rounded-full bg-brown/40 shrink-0 mt-[0.35em]" />
                {t}
              </li>
            ))}
          </ul>
          <P>Возврат осуществляется в течение 10 рабочих дней с момента получения уведомления тем же способом, которым была произведена оплата.</P>
          <P>В случае отмены Мероприятия по инициативе Организатора Участнику возвращается полная стоимость участия в течение 10 рабочих дней.</P>
        </Section>

        <Section num="7" title="Ограничение ответственности">
          <P>Организатор не несёт ответственности за неисполнение обязательств, вызванное обстоятельствами непреодолимой силы (форс-мажор): стихийные бедствия, эпидемии, действия государственных органов, иные события, находящиеся вне разумного контроля сторон.</P>
          <P>Интенсив не является медицинской, психотерапевтической или иной лицензируемой услугой в области здравоохранения. Организатор не несёт ответственности за субъективное восприятие результатов программы каждым Участником.</P>
        </Section>

        <Section num="8" title="Персональные данные">
          <P>Акцептируя настоящую Оферту, Участник выражает согласие на обработку своих персональных данных (имя, контактный номер телефона, адрес электронной почты) в целях исполнения Договора, информирования о Мероприятии и направления организационных материалов.</P>
          <P>Обработка данных осуществляется в соответствии с Федеральным законом № 152-ФЗ «О персональных данных». Данные не передаются третьим лицам, за исключением случаев, необходимых для исполнения Договора (платёжный сервис, средство размещения).</P>
          <P>Участник вправе отозвать согласие, направив соответствующее уведомление Организатору.</P>
        </Section>

        <Section num="9" title="Разрешение споров">
          <P>Все споры и разногласия, возникающие из настоящего Договора, стороны стремятся урегулировать путём переговоров.</P>
          <P>При недостижении соглашения спор передаётся в суд по месту нахождения Организатора в соответствии с действующим законодательством Российской Федерации.</P>
        </Section>

        <Section num="10" title="Срок действия оферты">
          <P>Настоящая Оферта вступает в силу с момента публикации на сайте otragenie-camp.ru и действует до момента отзыва или замены новой редакцией.</P>
        </Section>

        <div className="mt-12 pt-6 border-t border-brown/15 text-[0.8rem] text-[#3d2e21]/45 leading-relaxed">
          <p>Редакция от апреля 2026 г. По вопросам: info@otragenie-camp.ru</p>
        </div>
      </main>
    </div>
  );
};
