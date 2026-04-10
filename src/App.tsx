import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView, useMotionValue, useMotionTemplate, animate } from 'motion/react';
import { X, CheckCircle, ChevronRight, ChevronDown, ChevronLeft, MapPin, Calendar, Users, Star, ArrowRight, ArrowUp, Quote, Info, Play, Pause, Volume2, VolumeX, AlertTriangle, Home, Coffee, Bus, Video, Zap, Target, HelpCircle, Brain, Flame, MessageSquare, Eye, RefreshCw, Compass, Clock, Scale, Infinity, Key, Send, MessageCircle, Menu } from 'lucide-react';
import { PAINS, WHAT_HAPPENS, AUTHORS, PROCESS, PROGRAM, CASES, FOR_WHO, RESULTS, STATS, PRICING } from './data';
import { ChatAssistant } from './components/ChatAssistant';

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
  const base = "inline-flex items-center justify-center gap-2 font-sans text-[0.75rem] tracking-[0.1em] uppercase px-8 py-3.5 font-semibold rounded-full transition-all duration-500 relative overflow-hidden text-center group hover:scale-[1.02] active:scale-[0.98]";
  const variants: any = {
    'brown': "bg-brown text-white hover:bg-brown-dark hover:shadow-[0_8px_25px_rgba(154,125,90,0.35)]",
    'olive': "bg-[#5c6b5e] text-white hover:bg-[#4a574b] hover:shadow-[0_8px_25px_rgba(92,107,94,0.3)]",
    'navy': "bg-[#0f172a] text-white hover:bg-[#1e293b] border border-white/10 hover:border-white/30 hover:shadow-[0_8px_25px_rgba(15,23,42,0.5)]",
    'outline-light': "border border-white/30 text-white bg-transparent hover:bg-white/10 hover:border-white/60",
    'outline-dark': "border border-brown text-brown bg-transparent hover:bg-brown hover:text-white",
    'ghost': "text-brown hover:bg-brown/5"
  };
  const cls = `${base} ${variants[variant]} ${className}`;
  
  const content = (
    <>
      <span className="relative z-10">{children}</span>
      <motion.div 
        className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"
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
      <span className={`text-[0.7rem] tracking-[0.3em] uppercase font-medium mb-4 block ${light ? 'text-white/60' : 'text-brown'}`}>
        {subtitle}
      </span>
    </Reveal>
    <Reveal delay={0.2}>
      <h2 className={`font-serif text-[clamp(2.5rem,5vw,4rem)] leading-[1.1] mb-6 ${light ? 'text-white' : 'text-text-dark'}`}>
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
          <a href="#" className={`font-serif text-2xl tracking-widest transition-colors duration-500 flex items-center gap-3 ${isPastHero ? 'text-text-dark' : 'text-white'}`}>
            ОТРАЖЕНИЕ
            <span className={`text-[0.55rem] uppercase tracking-[0.2em] px-2 py-1 rounded-md font-sans font-bold border transition-colors duration-500 ${isPastHero ? 'border-brown text-brown' : 'border-white/40 text-white'}`}>camp</span>
          </a>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((item, i) => (
              <a 
                key={i} 
                href={`#${item.id}`}
                className={`text-[0.65rem] uppercase tracking-[0.2em] font-semibold transition-colors hover:text-brown ${isPastHero ? 'text-text-dark/70' : 'text-white/80'}`}
              >
                {item.name}
              </a>
            ))}
          </div>
          
          <div className="hidden md:block">
            <Button 
              variant={scrolled ? 'brown' : 'outline-light'} 
              className="!px-6 !py-2.5 !text-[0.65rem]"
              onClick={onOpenModal}
            >
              Участвовать
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`md:hidden p-2 -mr-2 transition-colors ${isPastHero ? 'text-text-dark' : 'text-white'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
            className="fixed inset-0 z-[90] bg-navy/95 backdrop-blur-xl flex flex-col items-center justify-center pt-20"
          >
            <div className="flex flex-col items-center gap-8 w-full px-6">
              {navLinks.map((item, i) => (
                <a 
                  key={i} 
                  href={`#${item.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white text-xl uppercase tracking-[0.2em] font-serif hover:text-brown transition-colors"
                >
                  {item.name}
                </a>
              ))}
              <div className="w-full h-px bg-white/10 my-4" />
              <Button 
                variant="olive" 
                className="w-full max-w-xs !py-4"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenModal();
                }}
              >
                Участвовать
              </Button>
            </div>
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
  const scale = useTransform(scrollY, [0, 1000], [1.05, 1.2]); // Ken Burns effect
  
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
      "https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/intro_m.mp4"
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
        
        {/* Interactive Spotlight Effect */}
        <motion.div 
          className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover/hero:opacity-100 transition-opacity duration-1000"
          style={{
            background: useMotionTemplate`radial-gradient(600px circle at ${spotlightX} ${spotlightY}, rgba(255,255,255,0.08), transparent 80%)`
          }}
        />
        
        {/* Soft Radial Glow for readability */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
        
        {/* Video Controls */}
        <div className="absolute bottom-10 right-10 z-20 flex gap-4 opacity-0 group-hover/hero:opacity-100 transition-opacity duration-500">
          <button 
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
          </button>
          <button 
            onClick={toggleMute}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </motion.div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <Reveal delay={2.4} direction="down">
          <span className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white/70 text-[0.65rem] tracking-[0.3em] uppercase mb-10">
            17 — 19 апреля • Красная Поляна
          </span>
        </Reveal>
        
        <Reveal delay={2.6}>
          <div className="relative mb-8">
            <h1 className="font-serif text-[clamp(2.5rem,10vw,8.5rem)] leading-[0.9] text-white font-light tracking-tight relative z-10">
              ОТРАЖЕНИЕ
            </h1>
            {/* Mirror Reflection */}
            <h1 className="font-serif text-[clamp(2.5rem,10vw,8.5rem)] leading-[0.9] text-white font-light tracking-tight absolute top-full left-0 right-0 opacity-[0.07] scale-y-[-1] blur-[2px] select-none pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, transparent 20%, black 100%)' }}>
              ОТРАЖЕНИЕ
            </h1>
          </div>
        </Reveal>

        <Reveal delay={2.8}>
          <p className="font-serif text-[clamp(1.1rem,2.5vw,1.6rem)] text-white/80 max-w-2xl mx-auto mb-14 italic leading-[1.6] font-light">
            О честности с собой. Двухдневный терапевтический выезд для тех, кто готов увидеть свою жизнь без иллюзий.
          </p>
        </Reveal>

        <Reveal delay={3.0}>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button variant="olive" onClick={onOpenModal} className="!px-10 shadow-2xl">
              Записаться на разбор
            </Button>
            <Button variant="outline-light" href="#program" className="!px-10">
              Программа выезда
            </Button>
          </div>
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

const About = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-2, 2]);

  return (
    <section id="about" ref={sectionRef} className="py-24 md:py-32 bg-cream relative overflow-hidden">
      {/* Paper Texture Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }} />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          {/* Left Column: Visual with Organic Mask & Parallax */}
          <div className="lg:col-span-6 relative">
            <Reveal direction="left">
              <motion.div 
                className="relative z-10 overflow-hidden shadow-2xl aspect-[4/5] bg-navy"
                style={{ 
                  y, 
                  rotate,
                  borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' // Organic stone-like shape
                }}
              >
                <video 
                  src="https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/intro2.mp4" 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-1000"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </Reveal>
            
            {/* Decorative Elements */}
            <div className="absolute -bottom-12 -right-12 w-72 h-72 bg-brown/10 rounded-full blur-3xl -z-0" />
            <div className="absolute -top-8 -left-8 w-48 h-48 border border-brown/20 rounded-[3rem] -z-0 rotate-12" />
          </div>

          {/* Right Column: Content with Overlap */}
          <div className="lg:col-span-6 lg:-ml-20 relative z-20">
            <Reveal direction="up">
              <SectionHeading 
                subtitle="О проекте" 
                title="Зачем мы создали этот кэмп?" 
                centered={false} 
              />
            </Reveal>
            
            <Reveal delay={0.4}>
              <p className="text-xl text-text-dark-soft mb-10 leading-relaxed">
                Мы часто живем в автоматических сценариях, не замечая, как они управляют нашими решениями, отношениями и бизнесом. «Отражение» — это пространство, где вы можете остановиться и <span className="text-text-dark font-semibold underline decoration-brown/30 underline-offset-4">увидеть реальность такой, какая она есть</span>.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-1 gap-8 mb-12">
              {WHAT_HAPPENS.map((item, i) => (
                <Reveal key={i} delay={0.5 + i * 0.1} direction="right">
                  <div className="flex gap-5 items-start">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-brown/40 shrink-0" />
                    <p className="text-base text-text-dark-soft leading-relaxed">
                      {item.text} <span className="font-bold text-text-dark">{item.bold}</span>
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.8} direction="up">
              <a 
                href="#program" 
                className="inline-flex items-center gap-3 text-brown font-bold tracking-widest uppercase text-[0.7rem] group"
              >
                Посмотреть программу ретрита
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />
                <div className="absolute bottom-[-4px] left-0 w-0 h-[1px] bg-brown transition-all group-hover:w-full" />
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

const Program = () => {
  const [activeDay, setActiveDay] = useState(0);

  return (
    <section id="program" className="relative py-24 md:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
        <div className="flex flex-col items-center">
          <Reveal direction="up">
            <span className="text-[0.7rem] uppercase tracking-[0.4em] text-brown font-bold mb-8 block text-center">Программа</span>
            <h2 className="font-serif text-[clamp(2.5rem,5vw,4rem)] leading-[1.1] text-text-dark mb-6 text-center">
              Три дня трансформации
            </h2>
            <div className="w-24 h-[1px] bg-brown/20 mx-auto mb-12" />
          </Reveal>

          <Reveal delay={0.2} direction="up">
            <div className="flex justify-center gap-3 mb-12 bg-cream/30 p-1.5 rounded-full w-fit mx-auto">
              {PROGRAM.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setActiveDay(i)}
                  className={`px-8 py-3 rounded-full text-[0.7rem] tracking-widest uppercase font-bold transition-all ${activeDay === i ? 'bg-[#ebe3db] text-text-dark shadow-sm' : 'text-text-dark-muted hover:bg-cream/50'}`}
                >
                  День {i + 1}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="relative w-full max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDay}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-10"
                style={{ willChange: "transform, opacity" }}
              >
                <Reveal delay={0.3} direction="up">
                  <h3 className="font-serif text-2xl md:text-3xl text-brown mb-12 text-center italic">{PROGRAM[activeDay].day}</h3>
                </Reveal>
                
                <div className="grid gap-4">
                  {PROGRAM[activeDay].items.map((item, j) => (
                    <Reveal key={j} delay={0.1 * j} direction="up">
                      <div className="p-8 md:p-10 rounded-[2.5rem] bg-[#f9f7f5] border border-brown/5 flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <div className="w-32 shrink-0">
                          <span className="text-[0.7rem] uppercase tracking-[0.2em] font-bold text-brown/70">{item.label}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-serif text-xl md:text-2xl text-text-dark mb-2">{item.title}</h4>
                          {item.desc && <p className="text-sm md:text-base text-text-dark-soft leading-relaxed">{item.desc}</p>}
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

const Philosophy = () => (
  <section className="py-24 bg-navy text-white text-center px-6">
    <Reveal direction="up">
      <span className="text-[0.7rem] uppercase tracking-[0.5em] text-brown-light font-bold mb-8 block">Философия</span>
      <h2 className="font-serif text-[clamp(1.8rem,3vw,2.5rem)] leading-[1.2] mb-8 max-w-4xl mx-auto">
        Когда глубина встречается со стратегией — <span className="italic text-brown-light">происходят изменения</span>
      </h2>
      <p className="text-lg md:text-xl text-white/60 font-light max-w-2xl mx-auto">
        Мы объединяем женскую <span className="text-white font-medium">глубину</span> и мужскую <span className="text-white font-medium">структуру</span> для решений, которые меняют систему жизни.
      </p>
    </Reveal>
  </section>
);

const Authors = ({ onOpenModal }: any) => (
  <section id="authors" className="relative bg-navy text-white overflow-hidden lg:h-screen flex flex-col pt-24 lg:pt-0">
    {/* Top Half: Images */}
    <div className="relative flex-none h-[40vh] lg:h-[50vh] flex flex-row">
      {/* Central Connection Labels (Desktop) */}
      <div className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex-col items-center gap-4 pointer-events-none">
        <div className="flex items-center gap-4">
          <span className="text-[0.65rem] uppercase tracking-[0.3em] text-brown-light/60">эмоции</span>
          <div className="w-12 h-[1px] bg-brown/30" />
          <span className="text-[0.65rem] uppercase tracking-[0.3em] text-brown-light/60">решения</span>
        </div>
      </div>

      {/* Maya Image */}
      <div className="w-1/2 lg:w-1/2 h-full relative overflow-hidden">
        <img 
          src={AUTHORS[0].img} 
          alt={AUTHORS[0].name} 
          className="w-full h-full object-cover object-top"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-navy/50" />
      </div>

      {/* Roman Image */}
      <div className="w-1/2 lg:w-1/2 h-full relative overflow-hidden">
        <img 
          src={AUTHORS[1].img} 
          alt={AUTHORS[1].name} 
          className="w-full h-full object-cover object-top"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:to-navy/50" />
      </div>
    </div>

    {/* Bottom Half: Content */}
    <div className="flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-6 md:px-12 py-12 lg:py-0 relative z-10">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 mb-12">
        {/* Maya Content */}
        <Reveal direction="up" className="text-center">
          <h3 className="font-serif text-3xl md:text-4xl mb-4">{AUTHORS[0].name}</h3>
          <p className="text-brown-light text-[0.65rem] md:text-[0.7rem] tracking-[0.2em] md:tracking-[0.3em] uppercase font-bold mb-6">
            Помогает увидеть то, что ты не замечаешь
          </p>
          <div className="space-y-4 text-white/80 text-sm font-light">
            <p>Психолог. Автор терапевтических программ.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-brown" /> 10+ лет практики
              </span>
              <span className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-brown" /> 500+ разборов
              </span>
            </div>
          </div>
        </Reveal>

        {/* Roman Content */}
        <Reveal delay={0.2} direction="up" className="text-center">
          <h3 className="font-serif text-3xl md:text-4xl mb-4">{AUTHORS[1].name}</h3>
          <p className="text-brown-light text-[0.65rem] md:text-[0.7rem] tracking-[0.2em] md:tracking-[0.3em] uppercase font-bold mb-6">
            Помогает понять, что с этим делать
          </p>
          <div className="space-y-4 text-white/80 text-sm font-light">
            <p>Предприниматель, консультант первых лиц.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-brown" /> 15+ лет опыта
              </span>
              <span className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-brown" /> работа с собственниками
              </span>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Buttons */}
      <Reveal delay={0.4} direction="up" className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-12">
        <Button variant="navy" onClick={onOpenModal} className="w-full sm:w-auto !px-8">
          Подходит ли мне этот формат? <ArrowRight size={16} className="ml-2 inline" />
        </Button>
        <Button variant="outline-light" href="#program" className="w-full sm:w-auto !px-8">
          Понять, как это работает
        </Button>
      </Reveal>

      {/* Stats */}
      <Reveal delay={0.6} direction="up" className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 text-center">
        <span className="text-[0.65rem] uppercase tracking-[0.3em] text-white/40 font-bold">
          Доверие в цифрах:
        </span>
        <div className="flex gap-8 md:gap-16">
          <div>
            <div className="font-serif text-2xl md:text-3xl text-white mb-1">500+</div>
            <div className="text-[0.55rem] uppercase tracking-[0.2em] text-white/40">разборов</div>
          </div>
          <div>
            <div className="font-serif text-2xl md:text-3xl text-white mb-1">10+</div>
            <div className="text-[0.55rem] uppercase tracking-[0.2em] text-white/40">лет опыта</div>
          </div>
          <div>
            <div className="font-serif text-2xl md:text-3xl text-white mb-1">100%</div>
            <div className="text-[0.55rem] uppercase tracking-[0.2em] text-white/40">честности</div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

const Location = () => (
  <section id="location" className="py-24 md:py-32 bg-[#f3ede4] overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 md:px-12">
      <div className="grid lg:grid-cols-12 gap-16 items-start">
        {/* Left Column: Text and Features */}
        <div className="lg:col-span-5">
          <Reveal direction="left">
            <span className="text-[0.7rem] uppercase tracking-[0.4em] text-brown font-bold mb-8 block">Локация</span>
            <h2 className="font-serif text-[clamp(3rem,6vw,4.5rem)] leading-[1.1] text-text-dark mb-4">Красная Поляна</h2>
            <h3 className="font-serif text-[clamp(1.8rem,4vw,2.8rem)] text-brown/60 mb-12 italic">Глэмпинг «Лес»</h3>
            
            <div className="space-y-8 mb-12">
              <p className="text-xl text-text-dark leading-relaxed">
                Горы. Тишина. Отсутствие шума.
              </p>
              <p className="text-lg text-text-dark-soft leading-relaxed">
                Когда исчезает привычный контекст — появляется возможность увидеть себя.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-10">
              {[
                { icon: <Brain size={24} />, title: "Глубокая работа" },
                { icon: <Users size={24} />, title: "Индивидуальные разборы" },
                { icon: <Flame size={24} />, title: "Баня и восстановление" },
                { icon: <MessageSquare size={24} />, title: "Пространство диалога" }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="text-brown mt-1 transition-transform group-hover:scale-110 duration-500">
                    {item.icon}
                  </div>
                  <span className="text-lg text-text-dark-soft font-medium leading-tight">{item.title}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Right Column: Visuals */}
        <div className="lg:col-span-7">
          <div className="space-y-6">
            <Reveal direction="up" delay={0.1}>
              <div className="relative aspect-[16/9] rounded-[2rem] overflow-hidden shadow-2xl group">
                <video 
                  src="https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/intro5.mp4" 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                <div className="absolute inset-0 flex items-center justify-center p-12">
                  <h3 className="font-serif text-white text-[clamp(2rem,4vw,3.5rem)] leading-tight text-center max-w-md drop-shadow-lg">
                    Место, где замедляется жизнь
                  </h3>
                </div>
              </div>
            </Reveal>

            <div className="grid grid-cols-2 gap-6">
              <Reveal direction="up" delay={0.2}>
                <div className="aspect-[4/3] rounded-[1.5rem] overflow-hidden shadow-xl group">
                  <img 
                    src="https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/img/ext.jpg" 
                    alt="Location Exterior" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
              </Reveal>
              <Reveal direction="up" delay={0.3}>
                <div className="aspect-[4/3] rounded-[1.5rem] overflow-hidden shadow-xl group">
                  <img 
                    src="https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/img/int.jpg" 
                    alt="Location Interior" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const sectionRef = useRef(null);
  const flatCases = CASES.flat();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const next = () => setCurrentIndex((prev) => (prev + 1) % flatCases.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + flatCases.length) % flatCases.length);

  useEffect(() => {
    if (isLoading) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading]);

  return (
    <section id="testimonials" ref={sectionRef} className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Parallax Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          style={{ y: y1, rotate }}
          className="absolute top-20 -left-20 w-96 h-96 bg-brown/5 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: y2, rotate: -rotate }}
          className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-navy/5 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02]"
        >
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="testimonials-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="currentColor" className="text-brown" />
            </pattern>
            <rect width="100" height="100" fill="url(#testimonials-grid)" />
          </svg>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <Reveal direction="up">
          <SectionHeading subtitle="Кейсы" title="Истории трансформации" />
        </Reveal>
        
        <div className="relative">
          {isLoading ? (
            <div className="min-h-[500px] grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 animate-pulse">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-brown/10 border border-brown/5" />
                  <div className="space-y-3">
                    <div className="w-48 h-8 bg-brown/10 rounded-lg" />
                    <div className="w-32 h-4 bg-brown/5 rounded" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="w-full h-4 bg-brown/5 rounded" />
                  <div className="w-full h-4 bg-brown/5 rounded" />
                  <div className="w-3/4 h-4 bg-brown/5 rounded" />
                </div>
                <div className="h-40 bg-cream/30 rounded-2xl border border-brown/5" />
              </div>
              <div className="h-[400px] bg-navy/5 rounded-3xl border border-brown/5 animate-pulse" />
            </div>
          ) : (
            <>
              <motion.div 
                style={{ y: y1 }}
                className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-brown/5 pointer-events-none"
              >
                <Quote size={200} fill="currentColor" />
              </motion.div>

              <div className="relative z-10 min-h-[500px] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => {
                      const swipeThreshold = 50;
                      if (info.offset.x > swipeThreshold) prev();
                      else if (info.offset.x < -swipeThreshold) next();
                    }}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="grid lg:grid-cols-2 gap-16 items-center cursor-grab active:cursor-grabbing"
                    style={{ willChange: "transform, opacity" }}
                  >
                    <div>
                      <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 rounded-2xl bg-brown/10 flex items-center justify-center overflow-hidden border border-brown/10">
                          {flatCases[currentIndex].img ? (
                            <img 
                              src={flatCases[currentIndex].img} 
                              alt={flatCases[currentIndex].name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-brown font-serif text-3xl">{flatCases[currentIndex].name[0]}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-serif text-3xl text-text-dark mb-1">{flatCases[currentIndex].name}</h3>
                          <p className="text-brown text-sm tracking-widest uppercase font-bold">{flatCases[currentIndex].role}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-8">
                        <div>
                          <span className="text-[0.6rem] uppercase tracking-[0.2em] font-bold text-text-dark-muted mb-4 block">До участия:</span>
                          <ul className="space-y-3">
                            {flatCases[currentIndex].before.map((item, i) => (
                              <li key={i} className="flex gap-3 text-sm text-text-dark-soft leading-relaxed">
                                <span className="text-brown/40 shrink-0">—</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="p-8 rounded-2xl bg-cream/50 border border-brown/10">
                          <span className="text-[0.6rem] uppercase tracking-[0.2em] font-bold text-brown mb-4 block">Результат:</span>
                          <ul className="space-y-3">
                            {flatCases[currentIndex].after.map((item, i) => (
                              <li key={i} className="flex gap-3 text-sm text-text-dark font-medium leading-relaxed">
                                <CheckCircle className="text-brown shrink-0" size={16} />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="bg-navy p-10 md:p-16 rounded-3xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brown/10 rounded-full blur-3xl" />
                        <Quote className="text-brown mb-8 opacity-50" size={48} />
                        <h4 className="font-serif text-2xl mb-6 italic leading-relaxed">
                          «{flatCases[currentIndex].resText}»
                        </h4>
                        <div className="flex items-center gap-3">
                          <div className="h-[1px] w-12 bg-brown" />
                          <span className="text-[0.7rem] uppercase tracking-widest text-brown-light font-bold">
                            {flatCases[currentIndex].resLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex justify-center md:justify-start gap-4 mt-16">
                <button 
                  onClick={prev}
                  className="w-14 h-14 rounded-full border border-brown/20 flex items-center justify-center text-brown hover:bg-brown hover:text-white transition-all duration-500 group"
                >
                  <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={20} />
                </button>
                <button 
                  onClick={next}
                  className="w-14 h-14 rounded-full border border-brown/20 flex items-center justify-center text-brown hover:bg-brown hover:text-white transition-all duration-500 group"
                >
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
                <div className="hidden md:flex items-center gap-3 ml-8">
                  {flatCases.map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`h-1.5 transition-all duration-500 rounded-full ${currentIndex === i ? 'w-8 bg-brown' : 'w-2 bg-brown/20'}`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

const LeadMagnet = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="py-24 md:py-32 bg-cream relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-brown/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-navy/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="bg-[#fdfbf9] rounded-[2.5rem] shadow-2xl overflow-hidden border border-brown/10 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-12 items-stretch">
            {/* Left Side: Visual */}
            <div className="lg:col-span-5 relative min-h-[500px] bg-navy overflow-hidden flex flex-col justify-end p-8 md:p-10">
              <img 
                src="https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/maya5.jpg" 
                alt="Майя Дзодзатти" 
                className="absolute inset-0 w-full h-full object-cover object-top grayscale-[0.2] hover:grayscale-0 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510]/90 via-[#1a1510]/40 to-transparent opacity-90" />
              
              <div className="relative z-10">
                <p className="font-serif text-2xl md:text-[1.75rem] text-white leading-snug mb-6 italic font-light">
                  Она задаёт вопросы,<br />
                  от которых невозможно<br />
                  отвернуться
                </p>
                <div className="h-[1px] w-full bg-white/20 mb-5" />
                <p className="text-white/80 text-sm tracking-wide font-light">
                  Это первый шаг перед участием в программе
                </p>
              </div>
            </div>

            {/* Right Side: Content */}
            <div className="lg:col-span-7 p-8 md:p-12 lg:p-14 flex flex-col justify-center">
              <Reveal direction="up">
                <h3 className="text-xl md:text-[1.35rem] text-text-dark mb-4 font-serif leading-snug">
                  Ты уже пробовал менять жизнь.<br />
                  Но результат возвращается.
                </h3>
                <h2 className="font-serif text-[clamp(2.2rem,4vw,3.2rem)] leading-[1.1] text-text-dark mb-10">
                  10 минут, <span className="italic text-[#9a7d5a]">которые<br />покажут почему</span>
                </h2>
                
                <div className="space-y-8 mb-10">
                  <div>
                    <p className="text-[#9a7d5a] font-medium mb-4 text-base md:text-lg">Если ты:</p>
                    <ul className="space-y-3">
                      {['откладываешь решения', 'устаёшь от одних и тех же сценариев', 'понимаешь, что что-то не так, но не видишь что'].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-text-dark-soft text-sm md:text-base">
                          <span className="text-[#9a7d5a] mt-0.5">—</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-[#9a7d5a] font-medium mb-4 text-base md:text-lg">После этого сообщения ты:</p>
                    <ul className="space-y-3">
                      {['увидишь свой повторяющийся сценарий', 'поймёшь, откуда он', 'получишь первый сдвиг'].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-text-dark-soft text-sm md:text-base">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#9a7d5a]/60 mt-2 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex justify-end mb-8">
                  <motion.a
                    href="https://t.me/your_bot_link" // Replace with actual link
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group w-full sm:w-auto px-8 py-3.5 bg-[#9a7d5a] text-white rounded-full flex items-center justify-center gap-3 shadow-lg shadow-[#9a7d5a]/20 transition-all duration-300 hover:bg-[#826849] hover:-translate-y-0.5"
                  >
                    <span className="font-medium text-sm md:text-base">Послушать и понять себя</span>
                    <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </motion.a>
                </div>

                <div className="h-[1px] w-full bg-[#9a7d5a]/10 mb-6" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <p className="text-[#9a7d5a] font-medium text-sm">
                    Майя записала это сообщение лично
                  </p>
                  
                  <div className="flex items-center gap-3 text-text-dark-muted">
                    <div className="flex -space-x-3 shrink-0">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#fdfbf9] bg-cream overflow-hidden">
                          <img src={`https://picsum.photos/seed/user${i+20}/100/100`} alt="user" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                    <span className="text-[0.65rem] md:text-xs leading-tight">
                      <span className="font-bold text-text-dark">1200+ человек</span> уже прошли<br />
                      и увидели, почему их решения не работают
                    </span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const getFeatIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('программе')) return <Calendar size={16} />;
    if (t.includes('групповую')) return <Users size={16} />;
    if (t.includes('проживание')) return <Home size={16} />;
    if (t.includes('банный')) return <Coffee size={16} />;
    if (t.includes('материалы')) return <Info size={16} />;
    if (t.includes('трансфер')) return <Bus size={16} />;
    if (t.includes('онлайн')) return <Video size={16} />;
    if (t.includes('место')) return <Star size={16} />;
    if (t.includes('рекомендации')) return <Target size={16} />;
    if (t.includes('разбор')) return <Zap size={16} />;
    return <CheckCircle size={16} />;
  };

  return (
    <section id="pricing" className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Paper Texture Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }} />
      
      {/* Background Mountain Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <path d="M0 1000 L200 800 L400 900 L600 700 L800 850 L1000 600 L1000 1000 Z" fill="currentColor" className="text-brown" />
          <path d="M0 1000 L150 700 L350 850 L550 600 L750 800 L1000 500 L1000 1000 Z" fill="currentColor" className="text-brown" opacity="0.5" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <Reveal direction="up">
          <SectionHeading subtitle="Стоимость" title="Выберите формат участия" />
        </Reveal>
        
        {isLoading ? (
          <div className="flex lg:grid lg:grid-cols-3 gap-6 overflow-x-auto pb-8 no-scrollbar snap-x snap-mandatory lg:overflow-visible lg:pb-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[85vw] sm:min-w-[400px] lg:min-w-0 snap-center h-[650px] rounded-3xl bg-cream/10 border border-brown/5 animate-pulse flex flex-col p-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent -translate-y-full animate-[shimmer_2s_infinite]" />
                <div className="w-32 h-8 bg-brown/10 rounded-lg mb-4" />
                <div className="w-full h-4 bg-brown/5 rounded mb-8" />
                <div className="w-40 h-12 bg-brown/10 rounded-lg mb-12" />
                <div className="flex-1 space-y-6">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="flex gap-3">
                      <div className="w-5 h-5 bg-brown/10 rounded-full shrink-0" />
                      <div className="flex-1 h-4 bg-brown/5 rounded" />
                    </div>
                  ))}
                </div>
                <div className="w-full h-14 bg-brown/10 rounded-full mt-8" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex lg:grid lg:grid-cols-3 gap-8 items-stretch overflow-x-auto pb-12 no-scrollbar snap-x snap-mandatory lg:overflow-visible lg:pb-0">
            {PRICING.map((plan, i) => (
              <Reveal key={i} delay={i * 0.1} scale className="min-w-[85vw] sm:min-w-[400px] lg:min-w-0 snap-center">
                <div className={`relative h-full flex flex-col p-8 md:p-10 rounded-[2.5rem] transition-all duration-700 group ${
                  plan.theme === 'premium' 
                    ? 'bg-navy text-white shadow-[0_30px_60px_-15px_rgba(11,17,48,0.3)] scale-105 z-10 border border-brown/20' 
                    : 'bg-[#fdfbf9] border border-brown/10 hover:border-brown/30 hover:shadow-2xl hover:-translate-y-2'
                }`}>
                  {plan.theme === 'premium' && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-brown text-white text-[0.65rem] px-6 py-1.5 rounded-full uppercase tracking-[0.2em] font-bold shadow-lg">
                      Рекомендуем
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <h3 className="font-serif text-3xl mb-3">{plan.name}</h3>
                    <p className={`text-sm leading-relaxed ${plan.theme === 'premium' ? 'text-white/60' : 'text-text-dark-soft'}`}>
                      {plan.desc}
                    </p>
                  </div>

                  <div className="mb-10 flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-serif text-brown-light">{plan.price.split(' ')[0]}</span>
                    <span className={`text-lg font-serif ${plan.theme === 'premium' ? 'text-white/40' : 'text-text-dark-muted'}`}>
                      {plan.price.split(' ').slice(1).join(' ')}
                    </span>
                  </div>

                  <div className="flex-1 space-y-6 mb-12">
                    {plan.feats.map((feat: any, j: number) => (
                      <div key={j} className="flex gap-4 group/feat">
                        <div className={`mt-1 shrink-0 ${plan.theme === 'premium' ? 'text-brown-light' : 'text-brown'} transition-transform duration-500 group-hover/feat:scale-110`}>
                          {getFeatIcon(feat.title)}
                        </div>
                        <div className="relative">
                          <p className="text-sm font-medium leading-snug flex items-center gap-2">
                            {feat.title}
                            {feat.desc && (
                              <span className="opacity-40 hover:opacity-100 transition-opacity cursor-help group/tip">
                                <HelpCircle size={12} />
                                <span className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-navy text-[0.65rem] text-white rounded-lg opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl border border-white/10">
                                  {feat.desc}
                                </span>
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto">
                    {plan.note && (
                      <p className="text-[0.65rem] text-brown-light italic mb-6 leading-tight">
                        {plan.note}
                      </p>
                    )}
                    <Button 
                      variant={plan.theme === 'premium' ? 'brown' : 'outline-dark'} 
                      className={`w-full !py-4 ${plan.theme === 'premium' ? 'shadow-[0_10px_30px_rgba(154,125,90,0.3)]' : ''}`}
                      onClick={() => onOpenModal(plan)}
                    >
                      Забронировать
                    </Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        <Reveal direction="up" delay={0.4}>
          <div className="mt-16 text-center">
            <Button variant="outline-dark" onClick={() => onOpenModal('compare')}>
              Сравнение тарифов
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = [
    { q: "Как понять, подходит ли мне этот формат?", a: "Для этого мы проводим предварительный индивидуальный разбор. Это бесплатная 20-минутная встреча, где мы обсуждаем ваш запрос и понимаем, сможем ли мы быть полезны в рамках этого выезда." },
    { q: "Нужна ли специальная психологическая подготовка?", a: "Нет, специальная подготовка не требуется. Важна только ваша готовность к честному диалогу с собой и группой." },
    { q: "Что входит в стоимость проживания?", a: "В стоимость входит проживание в премиальном глэмпинге «Лес», трехразовое питание от шеф-повара, банный ритуал и все материалы программы." },
    { q: "Сколько человек будет в группе?", a: "Мы ограничиваем группу до 10 человек. Это оптимальное количество для того, чтобы каждый участник получил достаточно внимания и смог пройти глубокий личный процесс." }
  ];

  return (
    <section className="py-24 md:py-32 bg-cream">
      <div className="max-w-3xl mx-auto px-6">
        <Reveal direction="up">
          <SectionHeading subtitle="Вопросы" title="Часто спрашивают" />
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-brown/5 shadow-sm">
                <button 
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full px-8 py-6 flex justify-between items-center text-left"
                >
                  <span className="font-serif text-lg text-text-dark">{faq.q}</span>
                  <ChevronDown className={`transition-transform duration-500 ${openIndex === i ? 'rotate-180' : ''}`} size={20} />
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-8 text-text-dark-soft text-sm leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const Pains = () => (
  <section id="pains" className="py-24 md:py-32 bg-white">
    <div className="max-w-7xl mx-auto px-6 md:px-12">
      <Reveal direction="up">
        <SectionHeading subtitle="Проблематика" title="Почему вы здесь?" />
      </Reveal>
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          {PAINS.map((pain, i) => (
            <Reveal key={i} delay={i * 0.1} direction="left">
              <div className="flex gap-4 p-6 rounded-2xl bg-cream/20 border border-brown/5 hover:border-brown/20 transition-all">
                <div className="w-8 h-8 rounded-full bg-brown/10 flex items-center justify-center shrink-0">
                  <X className="text-brown/40" size={16} />
                </div>
                <p className="text-text-dark-soft leading-relaxed">{pain}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal direction="right">
          <div className="p-12 rounded-3xl bg-navy text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brown/10 rounded-full blur-3xl" />
            <Quote className="text-brown mb-8 opacity-50" size={48} />
            <p className="font-serif text-2xl italic leading-relaxed mb-8">
              «Когда работа, деньги и даже отдых перестают приносить радость, проблема не в них. Проблема в системе, из которой вы действуете».
            </p>
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-12 bg-brown" />
              <span className="text-[0.7rem] uppercase tracking-widest text-brown-light font-bold">Майя Дзодзатти</span>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

const SystemProblem = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-[#f5f0eb] overflow-hidden min-h-[80vh] flex items-center">
      {/* Background Image Aligned to Left */}
      <Reveal direction="left" className="absolute inset-0 z-0">
        <motion.img 
          style={{ y }}
          src="https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/maya3.jpg" 
          alt="Maya" 
          className="w-full h-[130%] object-cover object-left opacity-40 lg:opacity-100 lg:w-1/2 absolute -top-[15%]"
          referrerPolicy="no-referrer"
        />
        {/* Subtle fade to background color */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f5f0eb]/20 to-[#f5f0eb]" />
      </Reveal>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full text-center flex flex-col items-center">
      <Reveal direction="up">
        <span className="text-[0.7rem] uppercase tracking-[0.4em] text-brown font-bold mb-8 block">Суть</span>
        <h2 className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.1] text-text-dark mb-6">
          Проблема в системе
        </h2>
        <div className="w-24 h-[1px] bg-brown/20 mx-auto mb-10" />
      </Reveal>
      
      <Reveal delay={0.2} direction="up">
        <p className="text-lg md:text-xl text-text-dark-soft leading-relaxed mb-12 max-w-2xl mx-auto">
          Мы привыкли решать проблемы на уровне действий: сменить работу, уехать в отпуск, найти нового партнера. Но если система (ваши внутренние сценарии) остается прежней — вы просто переносите старые проблемы в новые декорации.
        </p>
      </Reveal>
      
      <div className="grid sm:grid-cols-2 gap-6 w-full max-w-3xl mx-auto">
            <Reveal delay={0.3} direction="up">
              <div className="p-10 rounded-3xl bg-white shadow-sm border border-brown/5 text-left h-full">
                <h4 className="font-serif text-2xl mb-6 text-brown">Сценарий «Выживание»</h4>
                <p className="text-sm text-text-dark-soft leading-relaxed">
                  Когда каждое достижение дается через сверхусилие, а отдых воспринимается как слабость.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.4} direction="up">
              <div className="p-10 rounded-3xl bg-white shadow-sm border border-brown/5 text-left h-full">
                <h4 className="font-serif text-2xl mb-6 text-brown">Сценарий «Одиночество»</h4>
                <p className="text-sm text-text-dark-soft leading-relaxed">
                  Когда вокруг много людей, но нет ощущения близости и понимания.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
  </section>
  );
};

const WhatHappens = () => {
  const icons: any = { Eye, Scale, Infinity, Key };

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      {/* Subtle Background Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0">
        <svg width="100%" height="100%">
          <filter id="grainy">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grainy)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <Reveal direction="left">
            <div className="relative">
              <div className="rounded-[2.5rem] shadow-2xl overflow-hidden aspect-[4/5] relative group">
                <video 
                  src="https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/intro2.mp4" 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/10 to-navy/60" />
                
                <div className="absolute top-0 left-0 right-0 p-10 md:p-12 z-20 pointer-events-none">
                  <SectionHeading subtitle="Процесс" title="Что происходит на кэмпе" centered={false} light={true} />
                </div>
              </div>

              {/* Redesigned Quote Box */}
              <div className="absolute -bottom-10 right-4 left-4 md:left-auto md:-right-12 bg-brown text-white p-8 md:p-12 rounded-[2rem] shadow-2xl md:max-w-sm z-30 border border-white/10">
                <Quote className="text-white/20 mb-4 md:mb-6" size={32} />
                <p className="font-serif text-lg md:text-2xl leading-relaxed italic">
                  «Это не просто отдых. Это глубокая <span className="text-white font-bold underline decoration-white/30 underline-offset-4">хирургическая работа</span> с вашей реальностью».
                </p>
              </div>
            </div>
          </Reveal>

          <div className="mt-20 lg:mt-0">
            <div className="space-y-12">
              <Reveal direction="up" delay={0.1}>
                <p className="text-xl text-text-dark-soft leading-relaxed mb-12 font-light">
                  Мы создаем пространство, где <span className="text-brown font-medium">честность становится инструментом</span>, а группа — зеркалом, в котором невозможно не увидеть правду.
                </p>
              </Reveal>

              {WHAT_HAPPENS.map((item, i) => {
                const Icon = icons[item.icon] || HelpCircle;
                return (
                  <Reveal key={i} delay={0.2 + i * 0.1} direction="right">
                    <div className="flex gap-8 items-start group">
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-cream flex items-center justify-center text-brown transition-all duration-500 group-hover:bg-brown group-hover:text-white group-hover:rotate-6 shadow-sm">
                          <Icon size={24} strokeWidth={1.5} />
                        </div>
                        <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-white border border-brown/10 flex items-center justify-center text-[0.6rem] font-bold text-brown shadow-sm">
                          0{i + 1}
                        </span>
                      </div>
                      <div className="pt-2">
                        <p className="text-lg md:text-xl text-text-dark-soft leading-snug transition-colors duration-500 group-hover:text-text-dark">
                          {item.text} <span className="font-bold text-brown">{item.bold}</span>
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const icons: any = { Eye, RefreshCw, Zap, Compass };
  const sectionRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-cream relative overflow-hidden">
      {/* Background Decorative Elements with Parallax */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
      >
        <svg className="w-full h-full" viewBox="0 0 1000 1000" fill="none">
          <path d="M0 200C200 100 400 300 600 200C800 100 1000 300 1200 200" stroke="currentColor" strokeWidth="1" />
          <path d="M0 500C200 400 400 600 600 500C800 400 1000 600 1200 500" stroke="currentColor" strokeWidth="1" />
          <path d="M0 800C200 700 400 900 600 800C800 700 1000 900 1200 800" stroke="currentColor" strokeWidth="1" />
        </svg>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <Reveal direction="up">
          <SectionHeading subtitle="Методология" title="Как проходит работа" />
        </Reveal>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brown/10 to-transparent -translate-y-1/2 z-0" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 relative z-10">
            {PROCESS.map((item, i) => {
              const Icon = icons[item.icon] || HelpCircle;
              const isStaggered = i % 2 !== 0;

              return (
                <Reveal key={i} delay={i * 0.1} direction="up">
                  <div 
                    className={`relative p-10 rounded-[2.5rem] h-full flex flex-col transition-all duration-700 group
                      ${isStaggered ? 'lg:mt-16' : ''}
                      ${item.brown 
                        ? 'bg-brown text-white shadow-2xl lg:scale-110 z-20' 
                        : 'bg-white border border-brown/5 hover:border-brown/20 shadow-sm hover:shadow-xl'
                      }`}
                  >
                    {/* Background Number */}
                    <span className={`absolute top-6 right-8 font-serif text-7xl opacity-[0.05] pointer-events-none select-none transition-opacity duration-500 group-hover:opacity-10 ${item.brown ? 'text-white' : 'text-brown'}`}>
                      0{i + 1}
                    </span>

                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${item.brown ? 'bg-white/10 text-white' : 'bg-brown/5 text-brown'}`}>
                      <Icon size={28} strokeWidth={1.2} />
                    </div>

                    <h4 className="font-serif text-2xl mb-6 leading-tight">{item.title}</h4>
                    
                    <p className={`text-sm leading-relaxed mb-8 ${item.brown ? 'text-white/70' : 'text-text-dark-soft'}`}>
                      {item.desc}
                    </p>

                    <div className="mt-auto space-y-3">
                      {item.points?.map((point, j) => (
                        <div key={j} className="flex items-start gap-3">
                          <div className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${item.brown ? 'bg-white/40' : 'bg-brown/30'}`} />
                          <span className={`text-[0.7rem] uppercase tracking-wider font-medium leading-tight ${item.brown ? 'text-white/60' : 'text-text-dark-soft/80'}`}>
                            {point}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        <Reveal delay={0.5} className="mt-32 text-center">
          <div className="inline-flex items-center gap-5 px-8 py-4 rounded-full bg-white/40 backdrop-blur-md border border-brown/10 text-text-dark text-sm group hover:bg-navy hover:text-white transition-all duration-500 shadow-sm">
            <div className="relative">
              <Users size={20} className="text-brown group-hover:text-white transition-colors" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-brown rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-brown rounded-full" />
            </div>
            <span className="font-medium tracking-wide">Всего 10 мест для максимальной глубины и персонального внимания</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const ForWho = () => (
  <section id="for-who" className="relative py-24 md:py-32 bg-white overflow-hidden lg:h-screen flex items-center">
    {/* Background Image Aligned to Left */}
    <Reveal direction="left" className="absolute inset-y-0 left-0 w-full lg:w-1/2 z-0">
      <img 
        src="https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/romamaya2.jpg" 
        alt="Maya and Roman" 
        className="w-full h-full object-cover object-left"
        referrerPolicy="no-referrer"
      />
      {/* Strong fade to white on mobile/tablet for text readability */}
      <div className="absolute inset-0 bg-white/80 lg:hidden" />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent lg:hidden" />
      {/* Gradient fade to white on desktop to blend with the right side */}
      <div className="hidden lg:block absolute inset-y-0 right-0 w-1/3 bg-gradient-to-r from-transparent to-white" />
    </Reveal>

    <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
      <div className="grid lg:grid-cols-12 gap-12">
        {/* Spacer for the left-aligned background image */}
        <div className="hidden lg:block lg:col-span-6" />

        {/* Content on the Right */}
        <div className="lg:col-span-6">
          <Reveal direction="up">
            <div className="mb-12">
              <span className="text-[0.7rem] tracking-[0.3em] uppercase font-medium mb-4 block text-brown">
                Для кого
              </span>
              <h2 className="font-serif text-[clamp(2.5rem,5vw,4rem)] leading-[1.1] text-text-dark">
                Кому это нужно<br />сейчас
              </h2>
            </div>
          </Reveal>
          
          <div className="relative pl-8 border-l border-brown/20 space-y-8">
            {FOR_WHO.map((text, i) => (
              <Reveal key={i} delay={i * 0.1} direction="left">
                <div className="relative">
                  {/* Bullet Point on the line */}
                  <div className="absolute -left-[37px] top-2.5 w-2 h-2 rounded-full bg-brown/40" />
                  <p className="text-text-dark-soft leading-relaxed text-lg">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
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

const Results = () => (
  <section className="py-24 md:py-32 bg-navy text-white relative overflow-hidden">
    {/* Background Image with Overlay */}
    <div className="absolute inset-0 z-0">
      <img 
        src="https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/romamaya3.jpg" 
        alt="Background" 
        className="w-full h-full object-cover object-bottom opacity-40"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-navy/80 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-transparent to-navy" />
    </div>
    
    <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
      <Reveal direction="up">
        <SectionHeading subtitle="Результат" title="Что вы заберете с собой" light />
      </Reveal>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {STATS.map((stat, i) => (
          <Reveal key={i} delay={i * 0.1} direction="up">
            <div className="text-center group">
              <div className="font-serif text-5xl md:text-6xl text-brown mb-4 transition-transform duration-500 group-hover:scale-110">
                <Counter value={stat.value} suffix={stat.suffix} delay={i * 0.1 + 0.2} />
              </div>
              <div className="text-[0.7rem] uppercase tracking-[0.2em] text-white/40 font-bold max-w-[150px] mx-auto leading-relaxed">
                {stat.label}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {RESULTS.map((res, i) => (
          <Reveal key={i} delay={i * 0.1} direction="up">
            <div className="p-10 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brown/30 transition-all duration-500 h-full group">
              <div className="w-14 h-14 rounded-2xl bg-brown/10 flex items-center justify-center text-brown mb-8 group-hover:bg-brown group-hover:text-white transition-all duration-500">
                <CheckCircle size={28} />
              </div>
              <h4 className="font-serif text-2xl mb-4 group-hover:text-brown transition-colors">{res.title}</h4>
              <p className="text-sm text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">{res.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const FinalBlock = ({ onOpenModal }: any) => (
  <section className="relative lg:h-screen flex items-center bg-[#fdfbf9] overflow-hidden py-24 md:py-32">
    {/* Background Image Aligned to Left */}
    <Reveal direction="left" className="absolute inset-y-0 left-0 w-full lg:w-1/2 z-0">
      <img 
        src="https://storage.googleapis.com/uspeshnyy-projects/smit/billing/otrazhenie-camp.ru/romamaya.jpg" 
        alt="Maya and Roman" 
        className="w-full h-full object-cover object-left lg:object-[center_top]"
        referrerPolicy="no-referrer"
      />
      {/* Strong fade to background color on mobile/tablet for text readability */}
      <div className="absolute inset-0 bg-[#fdfbf9]/80 lg:hidden" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#fdfbf9] via-[#fdfbf9]/80 to-transparent lg:hidden" />
      {/* Gradient fade to background color on desktop to blend with the right side */}
      <div className="hidden lg:block absolute inset-y-0 right-0 w-1/3 bg-gradient-to-r from-transparent to-[#fdfbf9]" />
    </Reveal>

    <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        {/* Spacer for the left-aligned background image */}
        <div className="hidden lg:block lg:col-span-5" />

        {/* Content on the Right */}
        <div className="lg:col-span-7 flex flex-col items-center text-center lg:pl-10">
          <Reveal direction="up">
            <h2 className="font-serif text-[clamp(2.2rem,4vw,3.5rem)] leading-[1.1] text-text-dark mb-6">
              Если ничего не менять — через год <br className="hidden md:block" /> будет то же самое
            </h2>
          </Reveal>
          <Reveal delay={0.2} direction="up">
            <p className="text-lg md:text-xl text-text-dark-soft mb-2 tracking-wide">
              Те же мысли. Те же решения. Те же сценарии.
            </p>
          </Reveal>
          <Reveal delay={0.3} direction="up">
            <p className="font-serif text-lg md:text-2xl text-brown/70 italic mb-16">
              Этот выезд — точка, где можно это остановить
            </p>
          </Reveal>

          <div className="w-full text-left">
            <Reveal delay={0.5} direction="left">
              <div className="space-y-4 mb-12">
                <h4 className="font-serif text-xl text-text-dark/80">Эксперты:</h4>
                <h3 className="font-serif text-[clamp(2rem,3.5vw,3rem)] leading-tight text-text-dark">
                  Майя Дзодзатти <br /> и Роман Дусенко
                </h3>
                <p className="text-lg text-text-dark-soft italic">
                  Помогаем найти свои ответы и наладить жизнь
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.7} direction="up">
              <div className="inline-flex items-center gap-3 bg-brown/5 px-6 py-3 rounded-full border border-brown/10">
                <div className="w-2 h-2 rounded-full bg-brown animate-pulse" />
                <span className="text-xs font-bold tracking-widest uppercase text-brown">
                  В группе всего 10 мест
                </span>
              </div>
            </Reveal>
            
            <Reveal delay={0.8} direction="up">
              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Button 
                  onClick={() => onOpenModal()} 
                  className="!px-10 !py-4"
                >
                  Забронировать место
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-20 bg-navy text-white/40 text-center border-t border-white/5">
    <div className="max-w-7xl mx-auto px-6">
      <h2 className="font-serif text-2xl text-white tracking-widest mb-8">ОТРАЖЕНИЕ</h2>
      <div className="flex justify-center gap-8 mb-12">
        {['Instagram', 'Telegram', 'WhatsApp'].map((item, i) => (
          <a key={i} href="#" className="text-[0.7rem] uppercase tracking-widest hover:text-white transition-colors">{item}</a>
        ))}
      </div>
      <p className="text-[0.65rem] tracking-widest uppercase">© 2026 Терапевтический кэмп «Отражение»</p>
    </div>
  </footer>
);

const Modal = ({ isOpen, onClose, selectedPlan }: any) => {
  const [step, setStep] = useState<'plan' | 'form' | 'confirm' | 'success'>('form');
  const [formData, setFormData] = useState({ name: '', contact: '', message: '' });
  const [errors, setErrors] = useState({ name: '', contact: '' });

  const transition = { duration: 0.6, ease: [0.22, 1, 0.36, 1] };

  useEffect(() => {
    if (isOpen) {
      if (selectedPlan) {
        setStep('plan');
      } else {
        setStep('form');
      }
      setFormData({ name: '', contact: '', message: '' });
      setErrors({ name: '', contact: '' });
    }
  }, [selectedPlan, isOpen]);

  const validate = () => {
    const newErrors = { name: '', contact: '' };
    let isValid = true;

    if (formData.name.trim().length < 2) {
      newErrors.name = 'Имя слишком короткое';
      isValid = false;
    }

    if (formData.contact.trim().length < 5) {
      newErrors.contact = 'Введите корректный номер или ник';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInitialSubmit = (e: any) => {
    e.preventDefault();
    if (validate()) {
      setStep('confirm');
    }
  };

  const handleFinalSubmit = async () => {
    if (selectedPlan) {
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
        
        if (!response.ok) {
          throw new Error('Payment initiation failed');
        }
        
        const data = await response.json();
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
          return;
        }
      } catch (error) {
        console.error("Error initiating payment:", error);
        alert("Произошла ошибка при переходе к оплате. Пожалуйста, попробуйте позже или свяжитесь с нами.");
        return;
      }
    }

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
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600">
                    <AlertTriangle size={32} />
                  </div>
                  <h3 className="font-serif text-2xl text-center text-text-dark mb-8 px-4">Вы уверены, что хотите отправить заявку?</h3>
                  
                  <div className="space-y-4 mb-10">
                    {selectedPlan && (
                      <div className="p-4 rounded-2xl bg-white/50 border border-brown/10">
                        <p className="text-[0.6rem] uppercase tracking-widest text-brown font-bold mb-1">Выбранный тариф:</p>
                        <p className="font-serif text-base text-text-dark">{selectedPlan.name}</p>
                      </div>
                    )}

                    <div className="p-4 rounded-2xl bg-white/30 border border-brown/5 text-xs text-text-dark-soft space-y-2">
                      <p><span className="opacity-60 uppercase tracking-wider mr-2">Имя:</span> <span className="text-text-dark font-medium">{formData.name}</span></p>
                      <p><span className="opacity-60 uppercase tracking-wider mr-2">Контакт:</span> <span className="text-text-dark font-medium">{formData.contact}</span></p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button onClick={handleFinalSubmit} className="w-full">Подтвердить</Button>
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
                        placeholder="Ваш запрос (коротко)" 
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className={`w-full px-6 py-4 rounded-xl bg-white border ${formData.message.trim().length > 0 ? 'border-brown/30' : 'border-brown/10'} focus:border-brown outline-none transition-all text-sm h-32 resize-none`}
                      />
                      {formData.message.trim().length > 10 && (
                        <CheckCircle className="absolute right-4 top-4 text-brown/20" size={18} />
                      )}
                    </div>
                    <Button type="submit" className="w-full mt-4">Далее</Button>
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
          className="hidden md:flex fixed bottom-24 right-8 z-[90] w-12 h-12 rounded-full bg-brown text-white shadow-lg items-center justify-center hover:bg-brown-dark transition-colors group"
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

// --- Main App ---

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const handleOpenModal = (plan?: any) => {
    if (plan === 'compare') {
      setIsCompareModalOpen(true);
    } else {
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
      <About />
      <Pains />
      <SystemProblem />
      <WhatHappens />
      <Philosophy />
      <Authors onOpenModal={() => handleOpenModal()} />
      <HowItWorks />
      <Program />
      <Location />
      <Testimonials />
      <ForWho />
      <Results />
      <LeadMagnet />
      <Pricing onOpenModal={handleOpenModal} />
      <FAQ />
      <FinalBlock onOpenModal={() => handleOpenModal()} />
      <Footer />
      <ScrollToTop />
      <ChatAssistant />
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
