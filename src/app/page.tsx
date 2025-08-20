'use client';

import Image from "next/image";
import { useCallback, useEffect, useState, lazy, memo } from "react";
import Particles from "@tsparticles/react";
import { loadFull } from "tsparticles";
import { initParticlesEngine } from "@tsparticles/react";


import { FaRobot, FaComments, FaCogs, FaChartLine, FaCloud, FaPhoneAlt, FaUser, FaEnvelope, FaCommentDots, FaMapMarkerAlt, FaBrain, FaChevronRight, FaStar, FaCheck, FaCode, FaMicrophone, FaHeadset, FaCog, FaChartBar, FaServer, FaWifi, FaPhoneVolume, FaGlobe, FaUserTie, FaTabletAlt, FaDesktop, FaShieldAlt, FaSearch, FaLightbulb, FaMobileAlt, FaSatelliteDish, FaShoppingCart } from "react-icons/fa";
import { SiReact, SiPython, SiAmazon, SiNodedotjs, SiNextdotjs, SiDjango, SiLaravel, SiFlutter, SiTwilio, SiDocker, SiKubernetes, SiMongodb, SiPostgresql, SiMysql, SiRedis, SiGooglecloud, SiTypescript } from "react-icons/si";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaLinkedin, FaTwitter, FaFacebook } from "react-icons/fa";
import PerformanceMonitor from "./PerformanceMonitor";
import { prefersReducedMotion } from "../utils/performance";

// Performance optimization: Check device capabilities
const useDeviceCapabilities = () => {
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [userPrefersReducedMotion, setUserPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check device performance
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
    const isLowEndDevice = hardwareConcurrency <= 2 || deviceMemory <= 2;
    setIsLowEnd(isLowEndDevice);

    // Check motion preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setUserPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setUserPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return { isLowEnd, userPrefersReducedMotion };
};

// Performance optimization: Lazy load heavy components
const LazySwiper = lazy(() => import('swiper/react').then(module => ({ default: module.Swiper })));
const LazySwiperSlide = lazy(() => import('swiper/react').then(module => ({ default: module.SwiperSlide })));

// Performance optimization: Debounced scroll handler
const useDebouncedScroll = (callback: () => void, delay: number) => {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, delay);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [callback, delay]);
};

// Performance optimization: Memoized particles options
const getParticlesOptions = (reducedMotion: boolean) => ({
  fullScreen: false,
  background: { color: "transparent" },
  fpsLimit: reducedMotion ? 30 : 60, // Reduce FPS for better performance
  particles: {
    color: { 
      value: ["#ffffff", "#f0f8ff", "#e6f3ff", "#87ceeb"] 
    },
    links: { 
      enable: !reducedMotion, // Disable links if reduced motion
      color: "#00e6fe", 
      distance: 300, 
      opacity: 0.2,
      width: 1,
      triangles: {
        enable: false
      }
    },
    move: { 
      enable: !reducedMotion, // Disable movement if reduced motion
      speed: reducedMotion ? 0 : 0.2,
      direction: "none" as const,
      random: true,
      straight: false,
      outModes: { default: "bounce" as const },
      attract: {
        enable: false
      }
    },
    number: { 
      value: reducedMotion ? 50 : 150, // Reduce particle count for better performance
      density: {
        enable: true,
        value_area: 1200
      }
    },
    opacity: { 
      value: { min: 0.1, max: 0.6 },
      animation: {
        enable: !reducedMotion, // Disable opacity animation if reduced motion
        speed: 0.3,
        minimumValue: 0.05
      }
    },
    shape: { 
      type: ["circle"],
      stroke: {
        width: 0,
        color: "#000000"
      }
    },
    size: { 
      value: { min: 1, max: 4 },
      animation: {
        enable: !reducedMotion, // Disable size animation if reduced motion
        speed: 0.5,
        minimumValue: 0.1
      }
    },
    twinkle: {
      particles: {
        enable: !reducedMotion, // Disable twinkle if reduced motion
        color: "#ffffff",
        frequency: 0.02,
        opacity: 0.8
      }
    },
    interactivity: {
      events: {
        onHover: {
          enable: !reducedMotion, // Disable hover effects if reduced motion
          mode: "repulse"
        },
        onClick: {
          enable: !reducedMotion, // Disable click effects if reduced motion
          mode: "push"
        },
        resize: { enable: true }
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4
        },
        push: {
          particles_nb: 2
        }
      }
    }
  },
  detectRetina: true,
});

// Performance optimization: Intersection Observer for animations
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, {
      threshold: 0.1,
      ...options
    });

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, options]);

  return [setRef, isIntersecting];
};

// Performance optimization: Memoized service card
interface ServiceCardProps {
  service: {
    id: number;
    title: string;
    desc: string;
    color: string;
    icon: React.ReactNode;
    features: string[];
    benefits: string[];
    tech: string[];
  };
  index: number;
  onHover: (id: number | null) => void;
  isHovered: boolean;
}

const ServiceCard = memo(({ service, index, onHover, isHovered }: ServiceCardProps) => (
  <div
    className="group relative rounded-2xl p-8 shadow-xl border border-cyan-900/50 transform transition-all duration-500 hover:scale-105 overflow-hidden animate-fadein backdrop-blur-xl bg-gradient-to-br from-white/5 via-white/10 to-white/5 hover:from-white/10 hover:via-white/15 hover:to-white/10 hover:shadow-cyan-400/20"
    style={{ animationDelay: `${index * 100}ms` }}
    onMouseEnter={() => onHover(service.id)}
    onMouseLeave={() => onHover(null)}
  >
    {/* Animated Border */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    {/* Service Number */}
    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-400/20 flex items-center justify-center text-xs font-bold text-cyan-300">
      {service.id.toString().padStart(2, '0')}
    </div>

    {/* Icon */}
    <div className="relative z-10 flex flex-col items-center text-center mb-6">
      <div className={`w-20 h-20 flex items-center justify-center rounded-2xl mb-4 bg-gradient-to-tr ${service.color} shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110`}>
        {service.icon}
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 group-hover:text-xl transition-all duration-300">
        {service.title}
      </h3>
      
      {/* Description */}
      <p className="text-gray-300 text-sm leading-relaxed mb-6">
        {service.desc}
      </p>
    </div>

    {/* Features */}
    <div className="relative z-10 mb-6">
      <h4 className="text-sm font-semibold text-cyan-300 mb-3 flex items-center gap-2">
        <FaCheck className="text-xs" />
        Key Features
      </h4>
      <div className="space-y-2">
        {service.features.map((feature: string, idx: number) => (
          <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400"></div>
            {feature}
          </div>
        ))}
      </div>
    </div>

    {/* Benefits */}
    <div className="relative z-10 mb-6">
      <h4 className="text-sm font-semibold text-green-300 mb-3 flex items-center gap-2">
        <FaChartLine className="text-xs" />
        Business Impact
      </h4>
      <div className="space-y-2">
        {service.benefits.map((benefit: string, idx: number) => (
          <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-400"></div>
            {benefit}
          </div>
        ))}
      </div>
    </div>

    {/* Technology Stack */}
    <div className="relative z-10">
      <h4 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
        <FaCode className="text-xs" />
        Technology Stack
      </h4>
      <div className="flex flex-wrap gap-2">
        {service.tech.map((tech: string, idx: number) => (
          <span key={idx} className="px-2 py-1 text-xs bg-gradient-to-r from-purple-400/20 to-pink-400/20 text-purple-300 rounded-full border border-purple-400/30">
            {tech}
          </span>
        ))}
      </div>
    </div>

    {/* Hover Overlay */}
    {isHovered && (
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-purple-400/5 to-pink-400/5 rounded-2xl transition-all duration-300"></div>
    )}
  </div>
));

ServiceCard.displayName = 'ServiceCard';

// Performance optimization: Memoized technology card
interface TechnologyCardProps {
  tech: {
    id: number;
    name: string;
    description: string;
    icon: React.ReactNode;
    category: string;
    level: string;
  };
  index: number;
  onHover: (id: number | null) => void;
  isHovered: boolean;
}

const TechnologyCard = memo(({ tech, index, onHover, isHovered }: TechnologyCardProps) => (
  <div
    className="group relative rounded-2xl p-6 shadow-xl border border-cyan-900/50 transform transition-all duration-500 hover:scale-105 overflow-hidden animate-fadein backdrop-blur-xl bg-gradient-to-br from-white/5 via-white/10 to-white/5 hover:from-white/10 hover:via-white/15 hover:to-white/10 hover:shadow-cyan-400/20"
    style={{ animationDelay: `${index * 80}ms` }}
    onMouseEnter={() => onHover(tech.id)}
    onMouseLeave={() => onHover(null)}
  >
    {/* Animated Border */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    {/* Technology Number */}
    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-400/20 flex items-center justify-center text-xs font-bold text-cyan-300">
      {tech.id.toString().padStart(2, '0')}
    </div>

    {/* Icon */}
    <div className="relative z-10 flex flex-col items-center text-center mb-4">
      <div className={`w-16 h-16 flex items-center justify-center rounded-2xl mb-3 bg-gradient-to-tr ${tech.color} shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110`}>
        {tech.icon}
      </div>
      
      {/* Title */}
      <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 group-hover:text-lg transition-all duration-300">
        {tech.name}
      </h3>
      
      {/* Description */}
      <p className="text-gray-300 text-xs leading-relaxed mb-4">
        {tech.description}
      </p>
    </div>

    {/* Expertise Level */}
    <div className="relative z-10 mb-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Expertise:</span>
        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
          tech.expertise === 'Expert' 
            ? 'bg-gradient-to-r from-green-400/20 to-emerald-400/20 text-green-300 border border-green-400/30'
            : 'bg-gradient-to-r from-blue-400/20 to-indigo-400/20 text-blue-300 border border-blue-400/30'
        }`}>
          {tech.expertise}
        </span>
      </div>
    </div>

    {/* Use Cases */}
    <div className="relative z-10 mb-4">
      <h4 className="text-xs font-semibold text-cyan-300 mb-2 flex items-center gap-1">
        <FaCheck className="text-xs" />
        Use Cases
      </h4>
      <div className="space-y-1">
        {tech.useCases.slice(0, 3).map((useCase: string, idx: number) => (
          <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-1 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400"></div>
            {useCase}
          </div>
        ))}
        {tech.useCases.length > 3 && (
          <div className="text-xs text-gray-500 italic">
            +{tech.useCases.length - 3} more...
          </div>
        )}
      </div>
    </div>

    {/* Projects Count */}
    <div className="relative z-10">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Projects:</span>
        <span className="text-xs font-semibold text-purple-300">
          {tech.projects}+ completed
        </span>
      </div>
    </div>

    {/* Hover Overlay */}
    {isHovered && (
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-purple-400/5 to-pink-400/5 rounded-2xl transition-all duration-300"></div>
    )}
  </div>
));

TechnologyCard.displayName = 'TechnologyCard';

// HEADER
function Header() {
  const [reducedMotion] = useState(prefersReducedMotion());
  
  // Performance optimization: Debounced scroll handler
  useDebouncedScroll(() => {
    if (typeof window !== "undefined") {
      const header = document.getElementById("main-header");
      if (header) {
        if (window.scrollY > 10) {
          header.classList.add("shadow-xl", "bg-[#0a192f]/95");
        } else {
          header.classList.remove("shadow-xl", "bg-[#0a192f]/95");
        }
      }
    }
  }, 16); // 60fps equivalent

  return (
    <header id="main-header" className="w-full sticky top-0 z-50 bg-[#0a192f]/80 backdrop-blur-md flex justify-between items-center py-4 px-8 border-b border-white/10 transition-all duration-300">
      <div className="flex items-center h-16">
        <Image 
          src="/logo.png" 
          alt="JarvysAI Logo" 
          width={56} 
          height={56} 
          className="rounded-full shadow-md" 
          priority 
          loading="eager"
        />
      </div>
      <nav className="hidden md:flex space-x-6 text-gray-200 text-sm font-medium">
        {[
          { href: "#about", label: "About" },
          { href: "#services", label: "Services" },
          { href: "#technologies", label: "Technologies" },
          { href: "#portfolio", label: "Portfolio" },
          { href: "#testimonials", label: "Testimonials" },
          { href: "#faq", label: "FAQ" },
          { href: "#contact", label: "Contact" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="relative px-1 hover:text-cyan-400 transition group"
          >
            {item.label}
            <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 rounded-full" />
          </a>
        ))}
      </nav>
      <a href="#contact" className="ml-6 px-5 py-2 bg-gradient-to-tr from-cyan-500 to-purple-500 text-white rounded-full font-semibold shadow-lg hover:scale-105 hover:shadow-cyan-500/30 transition-transform hidden md:inline-block">Let&apos;s Talk</a>
    </header>
  );
}

// HERO SECTION
function Hero() {
  const [particlesLoaded, setParticlesLoaded] = useState(false);
  
  useEffect(() => {
    if (!reducedMotion) {
      initParticlesEngine(async (engine) => {
        await loadFull(engine);
        setParticlesLoaded(true);
      });
    }
  }, [reducedMotion]);
  
  const particlesOptions = getParticlesOptions(reducedMotion);

  return (
    <section className="w-full flex flex-col items-center justify-center text-center py-32 bg-gradient-to-b from-[#0a192f] via-[#0f1a2e] to-[#111827] relative overflow-hidden min-h-screen">
      {/* Performance optimization: Only render particles if not reduced motion and loaded */}
      {!reducedMotion && particlesLoaded && (
        <div className="absolute inset-0 z-0">
          <Particles id="tsparticles" options={particlesOptions} className="w-full h-full" />
        </div>
      )}
      
      {/* Performance optimization: Conditional background animations */}
      {!reducedMotion && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Deep Space Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-slate-900/30 to-black/90"></div>
          
          {/* Starlink Constellation - Realistic Train */}
          <div className="absolute top-20 left-0 w-full">
            <div className="absolute top-0 left-1/4 w-40 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-starlink-train-1 blur-sm"></div>
            <div className="absolute top-2 left-1/4 w-40 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent animate-starlink-train-2 blur-sm"></div>
            <div className="absolute top-4 left-1/4 w-40 h-0.5 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent animate-starlink-train-3 blur-sm"></div>
            <div className="absolute top-6 left-1/4 w-40 h-0.5 bg-gradient-to-r from-transparent via-pink-400/20 to-transparent animate-starlink-train-4 blur-sm"></div>
            <div className="absolute top-8 left-1/4 w-40 h-0.5 bg-gradient-to-r from-transparent via-green-400/15 to-transparent animate-starlink-train-5 blur-sm"></div>
          </div>
          
          {/* Individual Satellites - More Realistic */}
          <div className="absolute top-10 left-1/6 w-2 h-1 bg-gradient-to-r from-white/70 to-cyan-400/50 animate-satellite-1 blur-sm"></div>
          <div className="absolute top-15 right-1/4 w-1.5 h-0.5 bg-gradient-to-r from-white/60 to-purple-400/40 animate-satellite-2 blur-sm"></div>
          <div className="absolute top-25 left-1/3 w-2 h-0.5 bg-gradient-to-r from-white/50 to-pink-400/30 animate-satellite-3 blur-sm"></div>
          <div className="absolute top-35 right-1/3 w-1.5 h-0.5 bg-gradient-to-r from-white/55 to-green-400/35 animate-satellite-4 blur-sm"></div>
          <div className="absolute top-45 left-2/3 w-2.5 h-0.5 bg-gradient-to-r from-white/65 to-blue-400/45 animate-satellite-5 blur-sm"></div>
          
          {/* Communication Signals - Organic Beams */}
          <div className="absolute top-1/4 left-1/4 w-0.5 h-24 bg-gradient-to-b from-cyan-400/50 to-transparent animate-beam-1 blur-sm"></div>
          <div className="absolute top-1/3 right-1/4 w-0.5 h-20 bg-gradient-to-b from-purple-400/50 to-transparent animate-beam-2 blur-sm"></div>
          <div className="absolute top-1/2 left-1/3 w-0.5 h-28 bg-gradient-to-b from-pink-400/50 to-transparent animate-beam-3 blur-sm"></div>
          <div className="absolute top-2/3 right-1/3 w-0.5 h-22 bg-gradient-to-b from-green-400/50 to-transparent animate-beam-4 blur-sm"></div>
          
          {/* Data Streams - Natural Flow */}
          <div className="absolute top-0 left-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-cyan-400/25 to-transparent animate-data-transmission-1 blur-sm"></div>
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-purple-400/25 to-transparent animate-data-transmission-2 blur-sm"></div>
          <div className="absolute top-0 right-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-pink-400/25 to-transparent animate-data-transmission-3 blur-sm"></div>
          <div className="absolute top-0 right-1/3 w-0.5 h-full bg-gradient-to-b from-transparent via-green-400/25 to-transparent animate-data-transmission-4 blur-sm"></div>
          
          {/* Ground Stations - More Organic */}
          <div className="absolute bottom-10 left-1/4 w-12 h-6 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 animate-pulse blur-sm">
            <div className="w-1 h-1 bg-cyan-400/90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse blur-sm"></div>
          </div>
          <div className="absolute bottom-15 right-1/4 w-10 h-5 bg-gradient-to-r from-purple-500/15 to-pink-500/15 animate-pulse delay-1000 blur-sm">
            <div className="w-1 h-1 bg-purple-400/90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse blur-sm"></div>
          </div>
          <div className="absolute bottom-20 left-1/2 w-14 h-7 bg-gradient-to-r from-green-500/15 to-cyan-500/15 animate-pulse delay-2000 blur-sm">
            <div className="w-1 h-1 bg-green-400/90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse blur-sm"></div>
          </div>
          
          {/* Signal Pulses - Natural Energy */}
          <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-gradient-to-r from-cyan-400/30 to-transparent animate-signal-pulse-1 blur-sm"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-gradient-to-r from-purple-400/30 to-transparent animate-signal-pulse-2 blur-sm"></div>
          <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-gradient-to-r from-pink-400/30 to-transparent animate-signal-pulse-3 blur-sm"></div>
          <div className="absolute top-2/3 right-1/4 w-2.5 h-2.5 bg-gradient-to-r from-green-400/30 to-transparent animate-signal-pulse-4 blur-sm"></div>
          
          {/* Atmospheric Energy Waves */}
          <div className="absolute top-1/6 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent animate-atmospheric-wave-1 blur-sm"></div>
          <div className="absolute top-1/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400/15 to-transparent animate-atmospheric-wave-2 blur-sm"></div>
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-400/15 to-transparent animate-atmospheric-wave-3 blur-sm"></div>
          
          {/* Network Energy Fields */}
          <div className="absolute top-1/3 left-1/4 w-16 h-16 bg-gradient-to-r from-cyan-400/5 to-blue-500/5 animate-pulse blur-sm"></div>
          <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-gradient-to-r from-purple-400/5 to-pink-500/5 animate-pulse delay-500 blur-sm"></div>
          <div className="absolute top-2/3 left-1/3 w-20 h-20 bg-gradient-to-r from-pink-400/5 to-cyan-500/5 animate-pulse delay-1000 blur-sm"></div>
          
          {/* Status Indicators - Subtle */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 flex space-x-4">
            <div className="w-1 h-1 bg-green-400/60 rounded-full animate-pulse blur-sm"></div>
            <div className="w-1 h-1 bg-blue-400/60 rounded-full animate-pulse delay-300 blur-sm"></div>
            <div className="w-1 h-1 bg-purple-400/60 rounded-full animate-pulse delay-600 blur-sm"></div>
            <div className="w-1 h-1 bg-cyan-400/60 rounded-full animate-pulse delay-900 blur-sm"></div>
            <div className="w-1 h-1 bg-pink-400/60 rounded-full animate-pulse delay-1200 blur-sm"></div>
          </div>
        </div>
      )}
      
      {/* Performance optimization: Conditional star animations */}
      {!reducedMotion && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Star group 1 - moving from left to right */}
          <div className="absolute top-24 left-0 w-full h-4 animate-star-group-1">
            <div className="flex justify-between">
              <div className="star-shape-1 animate-pulse"></div>
              <div className="star-shape-2 animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="star-shape-3 animate-pulse" style={{ animationDelay: '2s' }}></div>
              <div className="star-shape-2 animate-pulse" style={{ animationDelay: '3s' }}></div>
              <div className="star-shape-1 animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>
          </div>
          
          {/* Star group 2 - moving diagonally */}
          <div className="absolute top-40 left-0 w-full h-4 animate-star-group-2">
            <div className="flex justify-between">
              <div className="star-shape-2 animate-pulse"></div>
              <div className="star-shape-3 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              <div className="star-shape-1 animate-pulse" style={{ animationDelay: '3s' }}></div>
              <div className="star-shape-2 animate-pulse" style={{ animationDelay: '4.5s' }}></div>
              <div className="star-shape-3 animate-pulse" style={{ animationDelay: '6s' }}></div>
            </div>
          </div>
          
          {/* Star group 3 - moving from right to left */}
          <div className="absolute top-56 right-0 w-full h-4 animate-star-group-3">
            <div className="flex justify-between">
              <div className="star-shape-1 animate-pulse"></div>
              <div className="star-shape-3 animate-pulse" style={{ animationDelay: '2s' }}></div>
              <div className="star-shape-2 animate-pulse" style={{ animationDelay: '4s' }}></div>
              <div className="star-shape-3 animate-pulse" style={{ animationDelay: '6s' }}></div>
              <div className="star-shape-1 animate-pulse" style={{ animationDelay: '8s' }}></div>
            </div>
          </div>
          
          {/* Star group 4 - moving slowly across */}
          <div className="absolute top-72 left-0 w-full h-4 animate-star-group-4">
            <div className="flex justify-between">
              <div className="star-shape-2 animate-pulse"></div>
              <div className="star-shape-3 animate-pulse" style={{ animationDelay: '3s' }}></div>
              <div className="star-shape-1 animate-pulse" style={{ animationDelay: '6s' }}></div>
              <div className="star-shape-2 animate-pulse" style={{ animationDelay: '9s' }}></div>
              <div className="star-shape-3 animate-pulse" style={{ animationDelay: '12s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a192f]/20 to-[#0a192f]/40 z-0"></div>
      
      <div className="relative z-10 flex flex-col items-center max-w-5xl mx-auto px-4">
        {/* Animated badge */}
        <div className="mb-6 animate-fadein">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-300 backdrop-blur-sm">
            <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
            AI-Powered Solutions
          </span>
        </div>

        {/* Enhanced main heading with gradient text */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight animate-fadein">
          <span className="bg-gradient-to-r from-white via-cyan-300 to-purple-400 bg-clip-text text-transparent">
            Empowering
          </span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Businesses
          </span>
          <br />
          <span className="text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
            with AI Solutions
          </span>
        </h1>

        {/* Enhanced subtitle */}
        <p className="text-xl md:text-2xl lg:text-3xl text-cyan-200 mb-10 max-w-4xl animate-fadein delay-200 leading-relaxed">
          We build modern, scalable, and intelligent software that transforms businesses and drives innovation.
        </p>

        {/* Enhanced CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fadein delay-300">
          <a
            href="#contact"
            className="group relative px-10 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full font-bold text-lg shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
          >
            <span className="relative z-10">Get Started Today</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-700 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
          </a>
          
          <a
            href="#portfolio"
            className="group relative px-10 py-4 border-2 border-cyan-500 text-cyan-300 rounded-full font-bold text-lg hover:bg-cyan-500/10 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden backdrop-blur-sm"
          >
            <span className="relative z-10">View Our Work</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </a>
        </div>

        {/* Stats section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fadein delay-400">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">50+</div>
            <div className="text-gray-400 text-sm">Projects Delivered</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">95%</div>
            <div className="text-gray-400 text-sm">Client Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">24/7</div>
            <div className="text-gray-400 text-sm">Support Available</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">3+</div>
            <div className="text-gray-400 text-sm">Years Experience</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator - only show if not reduced motion */}
      {!reducedMotion && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-cyan-500 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-cyan-500 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      )}
    </section>
  );
}

// ABOUT SECTION
function About() {
  // Robotic/galaxy/starlink particles config
  const aboutParticlesOptions = {
    fullScreen: false,
    background: { color: "transparent" },
    fpsLimit: 60,
    particles: {
      color: { value: ["#00e6fe", "#7f5af0", "#ff6b6b", "#4ecdc4"] },
      number: { value: 60, density: { enable: true, value_area: 900 } },
      size: { value: { min: 1, max: 2.5 } },
      opacity: { value: { min: 0.18, max: 0.6 } },
      move: { enable: true, speed: 0.5, direction: "none" as const, random: true, straight: false, outModes: { default: "bounce" as const }, angle: { value: 45, offset: 0 }, attract: { enable: true, rotateX: 600, rotateY: 1200 } },
      shape: { type: ["circle", "star"], stroke: { width: 0 } },
      links: { enable: true, color: "#00e6fe", distance: 140, opacity: 0.22, width: 1.2 },
      twinkle: { particles: { enable: true, color: "#fff", frequency: 0.12, opacity: 0.7 } },
    },
    detectRetina: true,
  };
  return (
    <section id="about" className="w-full max-w-4xl mx-auto py-20 px-4 text-center relative overflow-hidden">
      {/* Realistic Satellite Network Ecosystem */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Particles id="about-particles" options={aboutParticlesOptions} className="w-full h-full" />
        
        {/* Deep Space Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-slate-900/30 to-black/90"></div>
        
        {/* Starlink Constellation - Realistic Train */}
        <div className="absolute top-20 left-0 w-full">
          <div className="absolute top-0 left-1/4 w-40 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-starlink-train-1 blur-sm"></div>
          <div className="absolute top-2 left-1/4 w-40 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent animate-starlink-train-2 blur-sm"></div>
          <div className="absolute top-4 left-1/4 w-40 h-0.5 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent animate-starlink-train-3 blur-sm"></div>
          <div className="absolute top-6 left-1/4 w-40 h-0.5 bg-gradient-to-r from-transparent via-pink-400/20 to-transparent animate-starlink-train-4 blur-sm"></div>
          <div className="absolute top-8 left-1/4 w-40 h-0.5 bg-gradient-to-r from-transparent via-green-400/15 to-transparent animate-starlink-train-5 blur-sm"></div>
        </div>
        
        {/* Individual Satellites - More Realistic */}
        <div className="absolute top-10 left-1/6 w-2 h-1 bg-gradient-to-r from-white/70 to-cyan-400/50 animate-satellite-1 blur-sm"></div>
        <div className="absolute top-15 right-1/4 w-1.5 h-0.5 bg-gradient-to-r from-white/60 to-purple-400/40 animate-satellite-2 blur-sm"></div>
        <div className="absolute top-25 left-1/3 w-2 h-0.5 bg-gradient-to-r from-white/50 to-pink-400/30 animate-satellite-3 blur-sm"></div>
        <div className="absolute top-35 right-1/3 w-1.5 h-0.5 bg-gradient-to-r from-white/55 to-green-400/35 animate-satellite-4 blur-sm"></div>
        <div className="absolute top-45 left-2/3 w-2.5 h-0.5 bg-gradient-to-r from-white/65 to-blue-400/45 animate-satellite-5 blur-sm"></div>
        
        {/* Communication Signals - Organic Beams */}
        <div className="absolute top-1/4 left-1/4 w-0.5 h-24 bg-gradient-to-b from-cyan-400/50 to-transparent animate-beam-1 blur-sm"></div>
        <div className="absolute top-1/3 right-1/4 w-0.5 h-20 bg-gradient-to-b from-purple-400/50 to-transparent animate-beam-2 blur-sm"></div>
        <div className="absolute top-1/2 left-1/3 w-0.5 h-28 bg-gradient-to-b from-pink-400/50 to-transparent animate-beam-3 blur-sm"></div>
        <div className="absolute top-2/3 right-1/3 w-0.5 h-22 bg-gradient-to-b from-green-400/50 to-transparent animate-beam-4 blur-sm"></div>
        
        {/* Data Streams - Natural Flow */}
        <div className="absolute top-0 left-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-cyan-400/25 to-transparent animate-data-transmission-1 blur-sm"></div>
        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-purple-400/25 to-transparent animate-data-transmission-2 blur-sm"></div>
        <div className="absolute top-0 right-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-pink-400/25 to-transparent animate-data-transmission-3 blur-sm"></div>
        <div className="absolute top-0 right-1/3 w-0.5 h-full bg-gradient-to-b from-transparent via-green-400/25 to-transparent animate-data-transmission-4 blur-sm"></div>
        
        {/* Ground Stations - More Organic */}
        <div className="absolute bottom-10 left-1/4 w-12 h-6 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 animate-pulse blur-sm">
          <div className="w-1 h-1 bg-cyan-400/90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse blur-sm"></div>
        </div>
        <div className="absolute bottom-15 right-1/4 w-10 h-5 bg-gradient-to-r from-purple-500/15 to-pink-500/15 animate-pulse delay-1000 blur-sm">
          <div className="w-1 h-1 bg-purple-400/90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse blur-sm"></div>
        </div>
        <div className="absolute bottom-20 left-1/2 w-14 h-7 bg-gradient-to-r from-green-500/15 to-cyan-500/15 animate-pulse delay-2000 blur-sm">
          <div className="w-1 h-1 bg-green-400/90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse blur-sm"></div>
        </div>
        
        {/* Signal Pulses - Natural Energy */}
        <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-gradient-to-r from-cyan-400/30 to-transparent animate-signal-pulse-1 blur-sm"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-gradient-to-r from-purple-400/30 to-transparent animate-signal-pulse-2 blur-sm"></div>
        <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-gradient-to-r from-pink-400/30 to-transparent animate-signal-pulse-3 blur-sm"></div>
        <div className="absolute top-2/3 right-1/4 w-2.5 h-2.5 bg-gradient-to-r from-green-400/30 to-transparent animate-signal-pulse-4 blur-sm"></div>
        
        {/* Atmospheric Energy Waves */}
        <div className="absolute top-1/6 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent animate-atmospheric-wave-1 blur-sm"></div>
        <div className="absolute top-1/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400/15 to-transparent animate-atmospheric-wave-2 blur-sm"></div>
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-400/15 to-transparent animate-atmospheric-wave-3 blur-sm"></div>
        
        {/* Network Energy Fields */}
        <div className="absolute top-1/3 left-1/4 w-16 h-16 bg-gradient-to-r from-cyan-400/5 to-blue-500/5 animate-pulse blur-sm"></div>
        <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-gradient-to-r from-purple-400/5 to-pink-500/5 animate-pulse delay-500 blur-sm"></div>
        <div className="absolute top-2/3 left-1/3 w-20 h-20 bg-gradient-to-r from-pink-400/5 to-cyan-500/5 animate-pulse delay-1000 blur-sm"></div>
        
        {/* Status Indicators - Subtle */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 flex space-x-4">
          <div className="w-1 h-1 bg-green-400/60 rounded-full animate-pulse blur-sm"></div>
          <div className="w-1 h-1 bg-blue-400/60 rounded-full animate-pulse delay-300 blur-sm"></div>
          <div className="w-1 h-1 bg-purple-400/60 rounded-full animate-pulse delay-600 blur-sm"></div>
          <div className="w-1 h-1 bg-cyan-400/60 rounded-full animate-pulse delay-900 blur-sm"></div>
          <div className="w-1 h-1 bg-pink-400/60 rounded-full animate-pulse delay-1200 blur-sm"></div>
        </div>
      </div>
      <h2 className="text-4xl font-bold text-cyan-400 mb-2 relative z-10 animate-fadein">About Us</h2>
      {/* Animated gradient bar for visual flair */}
      <div className="mx-auto mb-6 flex justify-center relative z-10">
        <div className="h-1 w-28 rounded-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-pulse animate-gradient-x shadow-lg" style={{ animationDuration: '2.5s' }} />
      </div>
      <div className="text-center text-gray-300 mb-10 text-xl max-w-3xl mx-auto relative z-10 animate-fadein delay-200 font-medium">Pioneering the future of business with next-gen AI, automation, and digital transformation.</div>
      <div className="text-gray-300 text-xl font-medium leading-relaxed mb-6 space-y-4 relative z-10">
        <p>JarvysAI is rewriting the rules of intelligent automation and digital infrastructure.</p>
        <p>We are a next-generation AI company building hyper-intelligent voicebots, smart dialers, scalable cloud platforms, and advanced automation systems. Our solutions blend cutting-edge artificial intelligence, real-time data, and seamless integrations to break down barriers between humans and technology—empowering businesses to operate smarter, faster, and at scale.</p>
        <p>From AI-powered outbound campaigns and autonomous agents to IoT, SaaS, and digital transformation for enterprises, we deliver production-ready technology that transforms how industries work, connect, and grow. Our mission is to disrupt the status quo across BPO, telecom, SaaS, retail, and beyond—enabling a new era of business powered by AI.</p>
        <p className="font-semibold text-cyan-300">We are not just automating tasks.<br/>We&apos;re reimagining the infrastructure of how businesses think, talk, and operate.</p>
      </div>
      {/* Vision block */}
      <div className="bg-gradient-to-r from-cyan-900/40 via-purple-900/30 to-cyan-900/40 rounded-xl p-6 mt-8 mb-2 max-w-2xl mx-auto shadow-lg border border-cyan-800/30 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">🔹</span>
          <span className="text-lg font-bold text-cyan-300">Our Vision</span>
        </div>
        <div className="text-gray-200 text-base">To become the go-to platform for businesses seeking intelligent, fully autonomous solutions that are secure, scalable, and indistinguishable from human expertise—across every industry.</div>
      </div>
      {/* Floating robot icon background (already included above) */}
    </section>
  );
}

// SERVICES SECTION
function Services() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredService, setHoveredService] = useState<number | null>(null);

  const serviceCategories = [
    { id: 'all', name: 'All Services', count: 14 },
    { id: 'ai', name: 'AI & ML', count: 6 },
    { id: 'automation', name: 'Automation', count: 3 },
    { id: 'development', name: 'Development', count: 3 },
    { id: 'communication', name: 'Communication', count: 2 },
  ];

  const services = [
    { 
      id: 1,
      category: 'ai',
      icon: (
        <div className="relative">
          <FaMicrophone className="text-3xl text-cyan-400 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
        </div>
      ), 
      title: "Conversational AI & Voicebots", 
      desc: "Next-gen AI voice & chat agents for sales, support, and lead gen. Human-like, 24/7, multilingual.",
      features: ["Natural Language Processing", "Multi-language Support", "24/7 Availability", "CRM Integration"],
      benefits: ["Increase conversion rates by 300%", "Reduce support costs by 60%", "Handle 1000+ conversations simultaneously"],
      tech: ["OpenAI GPT", "Whisper", "Custom NLP", "WebRTC"],
      color: "from-cyan-400 to-blue-500"
    },
    { 
      id: 2,
      category: 'ai',
      icon: (
        <div className="relative">
          <FaHeadset className="text-3xl text-purple-400 animate-bounce" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-pink-400 rounded-full animate-ping"></div>
        </div>
      ), 
      title: "Smart Chatbots & Virtual Assistants", 
      desc: "GPT/LLM-powered bots for web, WhatsApp, Messenger, and more. Seamless, context-aware, always-on.",
      features: ["Context Awareness", "Multi-platform Support", "Sentiment Analysis", "Seamless Handoff"],
      benefits: ["Improve customer satisfaction by 85%", "Reduce response time to 2 seconds", "Scale support without hiring"],
      tech: ["GPT-4", "Claude", "WhatsApp API", "Facebook Messenger"],
      color: "from-purple-400 to-pink-500"
    },
    { 
      id: 3,
      category: 'automation',
      icon: (
        <div className="relative">
          <FaCog className="text-3xl text-green-400 animate-spin-slow" />
          <div className="absolute top-0 left-0 w-6 h-6 border-2 border-green-400 rounded-full animate-spin-slow-reverse"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-2 border-emerald-400 rounded-full animate-spin-slow"></div>
        </div>
      ), 
      title: "AI Automation & RPA", 
      desc: "Automate workflows, CRMs, and business ops with AI, RPA, and custom integrations. Work smarter, not harder.",
      features: ["Workflow Automation", "CRM Integration", "Custom APIs", "Process Optimization"],
      benefits: ["Reduce manual work by 80%", "Improve accuracy by 95%", "Save 40+ hours per week"],
      tech: ["UiPath", "Zapier", "Custom APIs", "Machine Learning"],
      color: "from-green-400 to-emerald-500"
    },
    { 
      id: 4,
      category: 'ai',
      icon: (
        <div className="relative">
          <FaChartBar className="text-3xl text-pink-400 animate-pulse" />
          <div className="absolute -top-2 -right-2 w-2 h-8 bg-gradient-to-b from-pink-400 to-transparent animate-pulse"></div>
          <div className="absolute -bottom-2 -left-2 w-8 h-2 bg-gradient-to-r from-rose-400 to-transparent animate-pulse delay-1000"></div>
        </div>
      ), 
      title: "Generative AI & LLM Solutions", 
      desc: "Custom tools with GPT, Whisper, Claude, and more for content, legal, medical, and finance.",
      features: ["Content Generation", "Document Analysis", "Code Generation", "Custom Training"],
      benefits: ["Generate content 10x faster", "Reduce research time by 70%", "Improve content quality"],
      tech: ["GPT-4", "Claude", "Whisper", "Custom Models"],
      color: "from-pink-400 to-rose-500"
    },
    { 
      id: 5,
      category: 'ai',
      icon: (
        <div className="relative">
          <FaServer className="text-3xl text-blue-400 animate-pulse" />
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-gradient-to-b from-blue-400 to-transparent animate-pulse"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gradient-to-r from-indigo-400 to-transparent animate-pulse delay-500"></div>
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-1 h-4 bg-gradient-to-b from-blue-400 to-transparent animate-pulse delay-1000"></div>
        </div>
      ), 
      title: "Data Labeling & AI Training", 
      desc: "End-to-end data pipelines: labeling, pre-processing, analytics, and ML model training.",
      features: ["Data Annotation", "Model Training", "Quality Assurance", "Performance Monitoring"],
      benefits: ["Improve model accuracy by 40%", "Reduce training time by 60%", "Ensure data quality"],
      tech: ["TensorFlow", "PyTorch", "Label Studio", "Custom Tools"],
      color: "from-blue-400 to-indigo-500"
    },
    { 
      id: 6,
      category: 'automation',
      icon: (
        <div className="relative">
          <FaWifi className="text-3xl text-yellow-400 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 -right-2 w-1 h-1 bg-yellow-300 rounded-full animate-ping delay-500"></div>
        </div>
      ), 
      title: "IoT & Smart Device Integration", 
      desc: "Connect, automate, and monitor devices in real-time for industry, enterprise, and home.",
      features: ["Device Connectivity", "Real-time Monitoring", "Automation Rules", "Data Analytics"],
      benefits: ["Monitor 1000+ devices simultaneously", "Reduce energy costs by 30%", "Predictive maintenance"],
      tech: ["MQTT", "Node.js", "Python", "Cloud Platforms"],
      color: "from-yellow-400 to-orange-500"
    },
    { 
      id: 7,
      category: 'communication',
      icon: (
        <div className="relative">
          <FaPhoneVolume className="text-3xl text-red-400 animate-bounce" />
          <div className="absolute -top-2 -right-2 w-4 h-4 border-2 border-red-400 rounded-full animate-ping"></div>
          <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 -right-3 w-1 h-1 bg-red-300 rounded-full animate-ping delay-1000"></div>
        </div>
      ), 
      title: "Cloud Call Center Tech", 
      desc: "Hosted dialers, SIP trunking, Twilio/Asterisk/Vicidial, and AI agents for next-level call centers.",
      features: ["Auto-dialing", "Call Recording", "Analytics Dashboard", "AI Agents"],
      benefits: ["Increase call volume by 500%", "Reduce costs by 50%", "Improve agent productivity"],
      tech: ["Twilio", "Asterisk", "Vicidial", "Custom Solutions"],
      color: "from-red-400 to-pink-500"
    },
    { 
      id: 8,
      category: 'communication',
      icon: (
        <div className="relative">
          <FaGlobe className="text-3xl text-indigo-400 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-400 rounded-full animate-ping"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 -right-2 w-1 h-1 bg-indigo-300 rounded-full animate-ping delay-500"></div>
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-300 rounded-full animate-ping delay-1000"></div>
        </div>
      ), 
      title: "VoIP & Communication APIs", 
      desc: "Global calling, programmable voice, SMS, and video with Twilio, Asterisk, and custom APIs.",
      features: ["Global Calling", "SMS Integration", "Video Calls", "Custom APIs"],
      benefits: ["Reduce communication costs by 70%", "Global reach", "Scalable infrastructure"],
      tech: ["Twilio", "Asterisk", "WebRTC", "Custom APIs"],
      color: "from-indigo-400 to-purple-500"
    },
    { 
      id: 9,
      category: 'ai',
      icon: (
        <div className="relative">
          <FaUserTie className="text-3xl text-teal-400 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-400 rounded-full animate-ping"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 -right-2 w-1 h-1 bg-teal-300 rounded-full animate-ping delay-500"></div>
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-300 rounded-full animate-ping delay-1000"></div>
        </div>
      ), 
      title: "AI Agents & Virtual Closers", 
      desc: "AI voicebots that qualify leads, handle objections, and close deals—no human needed.",
      features: ["Lead Qualification", "Objection Handling", "Deal Closing", "Follow-up Automation"],
      benefits: ["Close 3x more deals", "Work 24/7", "Reduce sales cycle by 60%"],
      tech: ["Advanced NLP", "Sales Psychology", "CRM Integration", "Custom AI"],
      color: "from-teal-400 to-cyan-500"
    },
    { 
      id: 10,
      category: 'development',
      icon: (
        <div className="relative">
          <FaTabletAlt className="text-3xl text-emerald-400 animate-bounce" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 -right-2 w-1 h-1 bg-emerald-300 rounded-full animate-ping delay-500"></div>
        </div>
      ), 
      title: "Mobile App Engineering", 
      desc: "Stunning cross-platform apps with Flutter, React Native, or native stacks. Fast, beautiful, robust.",
      features: ["Cross-platform Development", "Native Performance", "UI/UX Design", "App Store Optimization"],
      benefits: ["Launch 50% faster", "Reduce development costs", "Reach both platforms"],
      tech: ["Flutter", "React Native", "Swift", "Kotlin"],
      color: "from-emerald-400 to-green-500"
    },
    { 
      id: 11,
      category: 'development',
      icon: (
        <div className="relative">
          <FaDesktop className="text-3xl text-violet-400 animate-pulse" />
          <div className="absolute -top-2 -right-2 w-1 h-6 bg-gradient-to-b from-violet-400 to-transparent animate-pulse"></div>
          <div className="absolute -bottom-2 -left-2 w-6 h-1 bg-gradient-to-r from-purple-400 to-transparent animate-pulse delay-500"></div>
          <div className="absolute top-1/2 -right-3 w-1 h-1 bg-violet-300 rounded-full animate-ping delay-1000"></div>
        </div>
      ), 
      title: "Web & SaaS Product Dev", 
      desc: "Modern, scalable web apps & SaaS platforms with React, Next.js, Django, and more.",
      features: ["Full-stack Development", "Scalable Architecture", "Cloud Deployment", "Performance Optimization"],
      benefits: ["Scale to millions of users", "99.9% uptime", "Lightning-fast performance"],
      tech: ["React", "Next.js", "Django", "Node.js"],
      color: "from-violet-400 to-purple-500"
    },
    { 
      id: 12,
      category: 'development',
      icon: (
        <div className="relative">
          <FaShieldAlt className="text-3xl text-amber-400 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-amber-300 rounded-full animate-ping delay-500"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-300 rounded-full animate-ping delay-1000"></div>
        </div>
      ), 
      title: "Custom SaaS & Platform Builds", 
      desc: "Multi-tenant SaaS, billing, analytics, user roles, APIs—engineered for scale and security.",
      features: ["Multi-tenancy", "Subscription Billing", "User Management", "API Development"],
      benefits: ["Generate recurring revenue", "Scale globally", "Enterprise-grade security"],
      tech: ["AWS", "Stripe", "OAuth", "Microservices"],
      color: "from-amber-400 to-orange-500"
    },
    { 
      id: 13,
      category: 'automation',
      icon: (
        <div className="relative">
          <FaSearch className="text-3xl text-rose-400 animate-pulse" />
          <div className="absolute -top-2 -right-2 w-4 h-4 border-2 border-rose-400 rounded-full animate-ping"></div>
          <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 -right-3 w-1 h-1 bg-rose-300 rounded-full animate-ping delay-500"></div>
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-300 rounded-full animate-ping delay-1000"></div>
        </div>
      ), 
      title: "SEO, Analytics & Digital Growth", 
      desc: "Technical, content, and local SEO plus analytics for measurable business impact.",
      features: ["Technical SEO", "Content Strategy", "Analytics Setup", "Performance Monitoring"],
      benefits: ["Increase organic traffic by 200%", "Improve search rankings", "Data-driven decisions"],
      tech: ["Google Analytics", "Search Console", "Custom Tools", "AI Optimization"],
      color: "from-rose-400 to-red-500"
    },
    { 
      id: 14,
      category: 'development',
      icon: (
        <div className="relative">
          <FaLightbulb className="text-3xl text-sky-400 animate-bounce" />
          <div className="absolute -top-2 -right-2 w-1 h-6 bg-gradient-to-b from-sky-400 to-transparent animate-pulse"></div>
          <div className="absolute -bottom-2 -left-2 w-6 h-1 bg-gradient-to-r from-blue-400 to-transparent animate-pulse delay-500"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-sky-400 rounded-full animate-ping"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
        </div>
      ), 
      title: "Startup MVPs & Product Rescue", 
      desc: "Rapid MVPs, product rescue, and expert consulting for founders and enterprises.",
      features: ["Rapid Prototyping", "Product Strategy", "Technical Consulting", "Team Building"],
      benefits: ["Launch in 4-8 weeks", "Validate ideas quickly", "Expert guidance"],
      tech: ["Lean Methodology", "Modern Stack", "Cloud Services", "Best Practices"],
      color: "from-sky-400 to-blue-500"
    },
  ];

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);
  return (
    <section id="services" className="w-full py-20 px-4 relative overflow-hidden">
      {/* AI-Generated Neural Network Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Deep Neural Network Base */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-slate-900/20 to-black/95"></div>
        
        {/* Neural Network Nodes - Evolving Pattern */}
        <div className="absolute top-10 left-1/6 w-2 h-2 bg-gradient-to-r from-cyan-400/80 to-blue-400/60 animate-neural-pulse-1 blur-sm"></div>
        <div className="absolute top-20 right-1/4 w-1.5 h-1.5 bg-gradient-to-r from-purple-400/70 to-pink-400/50 animate-neural-pulse-2 blur-sm"></div>
        <div className="absolute top-30 left-1/3 w-2.5 h-2.5 bg-gradient-to-r from-green-400/75 to-cyan-400/55 animate-neural-pulse-3 blur-sm"></div>
        <div className="absolute top-40 right-1/3 w-1.8 h-1.8 bg-gradient-to-r from-pink-400/65 to-purple-400/45 animate-neural-pulse-4 blur-sm"></div>
        <div className="absolute top-50 left-2/3 w-2.2 h-2.2 bg-gradient-to-r from-blue-400/70 to-green-400/50 animate-neural-pulse-5 blur-sm"></div>
        <div className="absolute top-60 right-1/6 w-1.6 h-1.6 bg-gradient-to-r from-cyan-400/60 to-pink-400/40 animate-neural-pulse-6 blur-sm"></div>
        <div className="absolute top-70 left-1/2 w-2.8 h-2.8 bg-gradient-to-r from-purple-400/80 to-cyan-400/60 animate-neural-pulse-7 blur-sm"></div>
        <div className="absolute top-80 right-2/3 w-1.9 h-1.9 bg-gradient-to-r from-green-400/65 to-blue-400/45 animate-neural-pulse-8 blur-sm"></div>
        
        {/* Synaptic Connections - Dynamic Links */}
        <div className="absolute top-15 left-1/4 w-0.5 h-16 bg-gradient-to-b from-cyan-400/40 to-transparent animate-synaptic-flow-1 blur-sm"></div>
        <div className="absolute top-25 right-1/3 w-0.5 h-12 bg-gradient-to-b from-purple-400/35 to-transparent animate-synaptic-flow-2 blur-sm"></div>
        <div className="absolute top-35 left-1/2 w-0.5 h-20 bg-gradient-to-b from-green-400/45 to-transparent animate-synaptic-flow-3 blur-sm"></div>
        <div className="absolute top-45 right-1/2 w-0.5 h-14 bg-gradient-to-b from-pink-400/30 to-transparent animate-synaptic-flow-4 blur-sm"></div>
        <div className="absolute top-55 left-1/4 w-0.5 h-18 bg-gradient-to-b from-blue-400/40 to-transparent animate-synaptic-flow-5 blur-sm"></div>
        <div className="absolute top-65 right-1/4 w-0.5 h-15 bg-gradient-to-b from-cyan-400/35 to-transparent animate-synaptic-flow-6 blur-sm"></div>
        
        {/* Data Streams - Intelligent Flow */}
        <div className="absolute top-0 left-1/5 w-0.5 h-full bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-data-stream-1 blur-sm"></div>
        <div className="absolute top-0 left-2/5 w-0.5 h-full bg-gradient-to-b from-transparent via-purple-400/20 to-transparent animate-data-stream-2 blur-sm"></div>
        <div className="absolute top-0 left-3/5 w-0.5 h-full bg-gradient-to-b from-transparent via-green-400/20 to-transparent animate-data-stream-3 blur-sm"></div>
        <div className="absolute top-0 left-4/5 w-0.5 h-full bg-gradient-to-b from-transparent via-pink-400/20 to-transparent animate-data-stream-4 blur-sm"></div>
        
        {/* AI Processing Centers - Neural Hubs */}
        <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-gradient-to-r from-cyan-400/8 to-blue-400/8 animate-neural-hub-1 blur-sm">
          <div className="w-2 h-2 bg-cyan-400/90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse blur-sm"></div>
        </div>
        <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-gradient-to-r from-purple-400/8 to-pink-400/8 animate-neural-hub-2 blur-sm">
          <div className="w-1.5 h-1.5 bg-purple-400/90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse delay-500 blur-sm"></div>
        </div>
        <div className="absolute top-3/4 left-1/3 w-14 h-14 bg-gradient-to-r from-green-400/8 to-cyan-400/8 animate-neural-hub-3 blur-sm">
          <div className="w-2.5 h-2.5 bg-green-400/90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse delay-1000 blur-sm"></div>
        </div>
        
        {/* Thought Patterns - Evolving Ideas */}
        <div className="absolute top-1/6 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/12 to-transparent animate-thought-wave-1 blur-sm"></div>
        <div className="absolute top-1/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400/12 to-transparent animate-thought-wave-2 blur-sm"></div>
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400/12 to-transparent animate-thought-wave-3 blur-sm"></div>
        <div className="absolute top-2/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-400/12 to-transparent animate-thought-wave-4 blur-sm"></div>
        
        {/* Learning Algorithms - Adaptive Patterns */}
        <div className="absolute top-1/4 left-1/3 w-20 h-20 bg-gradient-to-r from-cyan-400/6 to-blue-500/6 animate-learning-pattern-1 blur-sm"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-r from-purple-400/6 to-pink-500/6 animate-learning-pattern-2 blur-sm"></div>
        <div className="absolute top-3/4 left-1/2 w-18 h-18 bg-gradient-to-r from-green-400/6 to-cyan-500/6 animate-learning-pattern-3 blur-sm"></div>
        
        {/* AI Consciousness Indicators */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 flex space-x-3">
          <div className="w-1 h-1 bg-cyan-400/70 rounded-full animate-ai-pulse-1 blur-sm"></div>
          <div className="w-1 h-1 bg-purple-400/70 rounded-full animate-ai-pulse-2 blur-sm"></div>
          <div className="w-1 h-1 bg-green-400/70 rounded-full animate-ai-pulse-3 blur-sm"></div>
          <div className="w-1 h-1 bg-pink-400/70 rounded-full animate-ai-pulse-4 blur-sm"></div>
          <div className="w-1 h-1 bg-blue-400/70 rounded-full animate-ai-pulse-5 blur-sm"></div>
        </div>
        
        {/* Quantum Processing Units */}
        <div className="absolute top-1/3 left-1/6 w-8 h-8 bg-gradient-to-r from-cyan-400/10 to-transparent animate-quantum-pulse-1 blur-sm"></div>
        <div className="absolute top-2/3 right-1/6 w-6 h-6 bg-gradient-to-r from-purple-400/10 to-transparent animate-quantum-pulse-2 blur-sm"></div>
        <div className="absolute top-1/2 left-4/5 w-10 h-10 bg-gradient-to-r from-green-400/10 to-transparent animate-quantum-pulse-3 blur-sm"></div>
      </div>
      
      {/* Enhanced Header */}
      <div className="relative z-10 text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <FaCogs className="text-4xl text-cyan-400 animate-spin-slow" />
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Our Services</h2>
          <FaCogs className="text-4xl text-purple-400 animate-spin-slow-reverse" />
        </div>
        <div className="h-1.5 w-32 rounded-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-pulse animate-gradient-x shadow-lg mx-auto mb-4"></div>
        <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
          AI-powered, industry-driven solutions for modern businesses. Explore what JarvysAI can build for you.
        </p>
      </div>

      {/* Category Filter */}
      <div className="relative z-10 mb-12">
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {serviceCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-gray-600/50'
              }`}
            >
              <span className="flex items-center gap-2">
                {category.name}
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedCategory === category.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-600/50 text-gray-300'
                }`}>
                  {category.count}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10">
        {filteredServices.map((service, i) => (
          <ServiceCard key={service.id} service={service} index={i} onHover={setHoveredService} isHovered={hoveredService === service.id} />
        ))}
      </div>

      {/* Call to Action */}
      <div className="relative z-10 text-center mt-16">
        <div className="bg-gradient-to-r from-cyan-400/10 via-purple-400/10 to-pink-400/10 rounded-2xl p-8 border border-cyan-400/20 backdrop-blur-xl">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Ready to Transform Your Business?
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Let&apos;s discuss how our AI solutions can revolutionize your operations, boost efficiency, and drive growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact" className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-full font-semibold hover:scale-105 transition-transform duration-300 shadow-lg shadow-cyan-500/25">
              Get Free Consultation
            </a>
            <a href="#portfolio" className="px-8 py-3 border border-cyan-400/50 text-cyan-300 rounded-full font-semibold hover:bg-cyan-400/10 transition-all duration-300">
              View Our Work
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// TECHNOLOGIES SECTION
function Technologies() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredTech, setHoveredTech] = useState<number | null>(null);

  const techCategories = [
    { id: 'all', name: 'All Technologies', count: 25 },
    { id: 'ai-ml', name: 'AI & Machine Learning', count: 3 },
    { id: 'web-dev', name: 'Web Development', count: 6 },
    { id: 'mobile', name: 'Mobile Development', count: 3 },
    { id: 'cloud', name: 'Cloud & DevOps', count: 4 },
    { id: 'database', name: 'Databases', count: 4 },
    { id: 'communication', name: 'Communication', count: 3 },
    { id: 'automation', name: 'Automation & IoT', count: 2 },
  ];

  const techs = [
    // AI & Machine Learning
    { 
      id: 1,
      category: 'ai-ml',
      icon: <SiPython className="text-4xl text-cyan-400" />, 
      name: "Python (AI/ML)", 
      description: "Advanced AI/ML development with TensorFlow, PyTorch, and custom models",
      expertise: "Expert",
      useCases: ["Machine Learning", "Deep Learning", "Data Science", "AI Development"],
      projects: 15,
      color: "from-cyan-400 to-blue-500"
    },
    { 
      id: 2,
      category: 'ai-ml',
      icon: <FaRobot className="text-4xl text-purple-400" />, 
      name: "AI/ML/LLM/RL", 
      description: "Cutting-edge AI solutions including Large Language Models and Reinforcement Learning",
      expertise: "Expert",
      useCases: ["Natural Language Processing", "Computer Vision", "Predictive Analytics", "AI Agents"],
      projects: 12,
      color: "from-purple-400 to-pink-500"
    },
    { 
      id: 3,
      category: 'ai-ml',
      icon: <FaBrain className="text-4xl text-green-400" />, 
      name: "Neural Networks", 
      description: "Custom neural network architectures and deep learning solutions",
      expertise: "Expert",
      useCases: ["Deep Learning", "Neural Networks", "AI Training", "Model Optimization"],
      projects: 8,
      color: "from-green-400 to-emerald-500"
    },
    
    // Web Development
    { 
      id: 4,
      category: 'web-dev',
      icon: <SiReact className="text-4xl text-blue-400" />, 
      name: "React (Web/SaaS)", 
      description: "Modern React applications with hooks, context, and advanced state management",
      expertise: "Expert",
      useCases: ["Single Page Applications", "Web Dashboards", "E-commerce", "SaaS Platforms"],
      projects: 20,
      color: "from-blue-400 to-indigo-500"
    },
    { 
      id: 5,
      category: 'web-dev',
      icon: <SiNextdotjs className="text-4xl text-black" />, 
      name: "Next.js (Web/SaaS)", 
      description: "Full-stack React framework with SSR, SSG, and API routes",
      expertise: "Expert",
      useCases: ["SEO-Optimized Websites", "E-commerce", "Blog Platforms", "SaaS Applications"],
      projects: 18,
      color: "from-gray-400 to-black"
    },
    { 
      id: 6,
      category: 'web-dev',
      icon: <SiNodedotjs className="text-4xl text-green-400" />, 
      name: "Node.js (APIs)", 
      description: "Server-side JavaScript with Express, REST APIs, and real-time applications",
      expertise: "Expert",
      useCases: ["REST APIs", "Real-time Applications", "Microservices", "Backend Services"],
      projects: 25,
      color: "from-green-400 to-emerald-500"
    },
    { 
      id: 7,
      category: 'web-dev',
      icon: <SiDjango className="text-4xl text-green-600" />, 
      name: "Django (Backend)", 
      description: "Python web framework with admin panel, ORM, and rapid development",
      expertise: "Expert",
      useCases: ["Content Management", "E-commerce", "Admin Panels", "REST APIs"],
      projects: 12,
      color: "from-green-600 to-green-800"
    },
    { 
      id: 8,
      category: 'web-dev',
      icon: <SiLaravel className="text-4xl text-red-400" />, 
      name: "Laravel (Backend)", 
      description: "PHP framework with elegant syntax, ORM, and robust features",
      expertise: "Advanced",
      useCases: ["Web Applications", "API Development", "E-commerce", "CMS"],
      projects: 8,
      color: "from-red-400 to-red-600"
    },
    { 
      id: 9,
      category: 'web-dev',
      icon: <SiTypescript className="text-4xl text-blue-500" />, 
      name: "TypeScript (Web)", 
      description: "Typed JavaScript for better development experience and code quality",
      expertise: "Expert",
      useCases: ["Type Safety", "Large Applications", "Team Development", "API Integration"],
      projects: 22,
      color: "from-blue-500 to-blue-700"
    },
    
    // Mobile Development
    { 
      id: 10,
      category: 'mobile',
      icon: <SiFlutter className="text-4xl text-blue-400" />, 
      name: "Flutter (Mobile)", 
      description: "Cross-platform mobile development with beautiful UI and native performance",
      expertise: "Expert",
      useCases: ["Cross-platform Apps", "Mobile UI", "Native Performance", "Rapid Development"],
      projects: 15,
      color: "from-blue-400 to-indigo-500"
    },
    { 
      id: 11,
      category: 'mobile',
      icon: <FaMobileAlt className="text-4xl text-green-400" />, 
      name: "iOS App Development", 
      description: "Native iOS applications with Swift and modern iOS features",
      expertise: "Advanced",
      useCases: ["Native iOS Apps", "App Store", "iOS Features", "Performance"],
      projects: 6,
      color: "from-green-400 to-emerald-500"
    },
    { 
      id: 12,
      category: 'mobile',
      icon: <FaMobileAlt className="text-4xl text-green-400" />, 
      name: "Android App Development", 
      description: "Native Android applications with Kotlin and Material Design",
      expertise: "Advanced",
      useCases: ["Native Android Apps", "Google Play", "Android Features", "Material Design"],
      projects: 5,
      color: "from-green-400 to-emerald-500"
    },
    
    // Cloud & DevOps
    { 
      id: 13,
      category: 'cloud',
      icon: <SiAmazon className="text-4xl text-orange-400" />, 
      name: "AWS (Cloud/IoT)", 
      description: "Amazon Web Services for scalable cloud infrastructure and IoT solutions",
      expertise: "Expert",
      useCases: ["Cloud Infrastructure", "IoT Solutions", "Serverless", "Scalability"],
      projects: 18,
      color: "from-orange-400 to-orange-600"
    },
    { 
      id: 14,
      category: 'cloud',
      icon: <SiGooglecloud className="text-4xl text-blue-400" />, 
      name: "Google Cloud (AI/Infra)", 
      description: "Google Cloud Platform for AI/ML infrastructure and cloud services",
      expertise: "Advanced",
      useCases: ["AI/ML Infrastructure", "Cloud Services", "Data Analytics", "Machine Learning"],
      projects: 10,
      color: "from-blue-400 to-indigo-500"
    },
    { 
      id: 15,
      category: 'cloud',
      icon: <SiDocker className="text-4xl text-blue-500" />, 
      name: "Docker (DevOps)", 
      description: "Containerization platform for consistent deployment and development",
      expertise: "Expert",
      useCases: ["Containerization", "DevOps", "Microservices", "Deployment"],
      projects: 20,
      color: "from-blue-500 to-blue-700"
    },
    { 
      id: 16,
      category: 'cloud',
      icon: <SiKubernetes className="text-4xl text-blue-400" />, 
      name: "Kubernetes (DevOps)", 
      description: "Container orchestration for scalable and resilient applications",
      expertise: "Advanced",
      useCases: ["Container Orchestration", "Scalability", "High Availability", "Microservices"],
      projects: 8,
      color: "from-blue-400 to-indigo-500"
    },
    
    // Databases
    { 
      id: 17,
      category: 'database',
      icon: <SiMongodb className="text-4xl text-green-400" />, 
      name: "MongoDB (NoSQL)", 
      description: "Document-based NoSQL database for flexible data storage",
      expertise: "Expert",
      useCases: ["Document Storage", "Big Data", "Real-time Applications", "Scalable Data"],
      projects: 15,
      color: "from-green-400 to-emerald-500"
    },
    { 
      id: 18,
      category: 'database',
      icon: <SiPostgresql className="text-4xl text-blue-400" />, 
      name: "PostgreSQL (DB)", 
      description: "Advanced open-source relational database with ACID compliance",
      expertise: "Expert",
      useCases: ["Relational Data", "ACID Compliance", "Complex Queries", "Data Integrity"],
      projects: 12,
      color: "from-blue-400 to-indigo-500"
    },
    { 
      id: 19,
      category: 'database',
      icon: <SiMysql className="text-4xl text-blue-500" />, 
      name: "MySQL (DB)", 
      description: "Popular relational database for web applications and data storage",
      expertise: "Advanced",
      useCases: ["Web Applications", "Data Storage", "E-commerce", "Content Management"],
      projects: 10,
      color: "from-blue-500 to-blue-700"
    },
    { 
      id: 20,
      category: 'database',
      icon: <SiRedis className="text-4xl text-red-400" />, 
      name: "Redis (Cache)", 
      description: "In-memory data structure store for caching and real-time applications",
      expertise: "Expert",
      useCases: ["Caching", "Session Storage", "Real-time Data", "Performance"],
      projects: 18,
      color: "from-red-400 to-red-600"
    },
    
    // Communication
    { 
      id: 21,
      category: 'communication',
      icon: <SiTwilio className="text-4xl text-red-400" />, 
      name: "Twilio (Voice/SMS)", 
      description: "Cloud communications platform for voice, SMS, and messaging",
      expertise: "Expert",
      useCases: ["Voice Calls", "SMS", "Messaging", "Communication APIs"],
      projects: 12,
      color: "from-red-400 to-red-600"
    },
    { 
      id: 22,
      category: 'communication',
      icon: <FaPhoneAlt className="text-4xl text-green-400" />, 
      name: "Asterisk (Call Center)", 
      description: "Open-source telephony platform for call centers and VoIP",
      expertise: "Advanced",
      useCases: ["Call Centers", "VoIP", "Telephony", "Communication Systems"],
      projects: 8,
      color: "from-green-400 to-emerald-500"
    },
    { 
      id: 23,
      category: 'communication',
      icon: <FaCloud className="text-4xl text-blue-400" />, 
      name: "Vicidial (Dialer)", 
      description: "Open-source call center dialer for outbound campaigns",
      expertise: "Advanced",
      useCases: ["Outbound Calls", "Call Centers", "Campaign Management", "Lead Generation"],
      projects: 6,
      color: "from-blue-400 to-indigo-500"
    },
    
    // Automation & IoT
    { 
      id: 24,
      category: 'automation',
      icon: <FaSatelliteDish className="text-4xl text-yellow-400" />, 
      name: "IoT (Internet of Things)", 
      description: "Internet of Things solutions for device connectivity and automation",
      expertise: "Advanced",
      useCases: ["Device Connectivity", "Smart Homes", "Industrial IoT", "Automation"],
      projects: 8,
      color: "from-yellow-400 to-orange-500"
    },
    { 
      id: 25,
      category: 'automation',
      icon: <FaCogs className="text-4xl text-gray-400" />, 
      name: "Automation", 
      description: "Business process automation and workflow optimization",
      expertise: "Expert",
      useCases: ["Process Automation", "Workflow Optimization", "RPA", "Business Efficiency"],
      projects: 15,
      color: "from-gray-400 to-gray-600"
    },
  ];

  const filteredTechs = selectedCategory === 'all' 
    ? techs 
    : techs.filter(tech => tech.category === selectedCategory);
  return (
    <section id="technologies" className="w-full py-20 px-4 relative overflow-hidden">
      {/* AI-Generated Neural Network Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Deep Neural Network Base */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-slate-900/20 to-black/95"></div>
        
        {/* Neural Network Nodes - Evolving Pattern */}
        <div className="absolute top-10 left-1/6 w-2 h-2 bg-gradient-to-r from-cyan-400/80 to-blue-400/60 animate-neural-pulse-1 blur-sm"></div>
        <div className="absolute top-20 right-1/4 w-1.5 h-1.5 bg-gradient-to-r from-purple-400/70 to-pink-400/50 animate-neural-pulse-2 blur-sm"></div>
        <div className="absolute top-30 left-1/3 w-2.5 h-2.5 bg-gradient-to-r from-green-400/75 to-cyan-400/55 animate-neural-pulse-3 blur-sm"></div>
        <div className="absolute top-40 right-1/3 w-1.8 h-1.8 bg-gradient-to-r from-pink-400/65 to-purple-400/45 animate-neural-pulse-4 blur-sm"></div>
        <div className="absolute top-50 left-2/3 w-2.2 h-2.2 bg-gradient-to-r from-blue-400/70 to-green-400/50 animate-neural-pulse-5 blur-sm"></div>
        <div className="absolute top-60 right-1/6 w-1.6 h-1.6 bg-gradient-to-r from-cyan-400/60 to-pink-400/40 animate-neural-pulse-6 blur-sm"></div>
        <div className="absolute top-70 left-1/2 w-2.8 h-2.8 bg-gradient-to-r from-purple-400/80 to-cyan-400/60 animate-neural-pulse-7 blur-sm"></div>
        <div className="absolute top-80 right-2/3 w-1.9 h-1.9 bg-gradient-to-r from-green-400/65 to-blue-400/45 animate-neural-pulse-8 blur-sm"></div>
        
        {/* Synaptic Connections - Dynamic Links */}
        <div className="absolute top-15 left-1/4 w-0.5 h-16 bg-gradient-to-b from-cyan-400/40 to-transparent animate-synaptic-flow-1 blur-sm"></div>
        <div className="absolute top-25 right-1/3 w-0.5 h-12 bg-gradient-to-b from-purple-400/35 to-transparent animate-synaptic-flow-2 blur-sm"></div>
        <div className="absolute top-35 left-1/2 w-0.5 h-20 bg-gradient-to-b from-green-400/45 to-transparent animate-synaptic-flow-3 blur-sm"></div>
        <div className="absolute top-45 right-1/2 w-0.5 h-14 bg-gradient-to-b from-pink-400/30 to-transparent animate-synaptic-flow-4 blur-sm"></div>
        <div className="absolute top-55 left-1/4 w-0.5 h-18 bg-gradient-to-b from-blue-400/40 to-transparent animate-synaptic-flow-5 blur-sm"></div>
        <div className="absolute top-65 right-1/4 w-0.5 h-15 bg-gradient-to-b from-cyan-400/35 to-transparent animate-synaptic-flow-6 blur-sm"></div>
        
        {/* Data Streams - Intelligent Flow */}
        <div className="absolute top-0 left-1/5 w-0.5 h-full bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-data-stream-1 blur-sm"></div>
        <div className="absolute top-0 left-2/5 w-0.5 h-full bg-gradient-to-b from-transparent via-purple-400/20 to-transparent animate-data-stream-2 blur-sm"></div>
        <div className="absolute top-0 left-3/5 w-0.5 h-full bg-gradient-to-b from-transparent via-green-400/20 to-transparent animate-data-stream-3 blur-sm"></div>
        <div className="absolute top-0 left-4/5 w-0.5 h-full bg-gradient-to-b from-transparent via-pink-400/20 to-transparent animate-data-stream-4 blur-sm"></div>
        
        {/* AI Processing Centers - Neural Hubs */}
        <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-gradient-to-r from-cyan-400/8 to-blue-400/8 animate-neural-hub-1 blur-sm">
          <div className="w-2 h-2 bg-cyan-400/90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse blur-sm"></div>
        </div>
        <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-gradient-to-r from-purple-400/8 to-pink-400/8 animate-neural-hub-2 blur-sm">
          <div className="w-1.5 h-1.5 bg-purple-400/90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse delay-500 blur-sm"></div>
        </div>
        <div className="absolute top-3/4 left-1/3 w-14 h-14 bg-gradient-to-r from-green-400/8 to-cyan-400/8 animate-neural-hub-3 blur-sm">
          <div className="w-2.5 h-2.5 bg-green-400/90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse delay-1000 blur-sm"></div>
        </div>
        
        {/* Thought Patterns - Evolving Ideas */}
        <div className="absolute top-1/6 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/12 to-transparent animate-thought-wave-1 blur-sm"></div>
        <div className="absolute top-1/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400/12 to-transparent animate-thought-wave-2 blur-sm"></div>
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400/12 to-transparent animate-thought-wave-3 blur-sm"></div>
        <div className="absolute top-2/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-400/12 to-transparent animate-thought-wave-4 blur-sm"></div>
        
        {/* Learning Algorithms - Adaptive Patterns */}
        <div className="absolute top-1/4 left-1/3 w-20 h-20 bg-gradient-to-r from-cyan-400/6 to-blue-500/6 animate-learning-pattern-1 blur-sm"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-r from-purple-400/6 to-pink-500/6 animate-learning-pattern-2 blur-sm"></div>
        <div className="absolute top-3/4 left-1/2 w-18 h-18 bg-gradient-to-r from-green-400/6 to-cyan-500/6 animate-learning-pattern-3 blur-sm"></div>
        
        {/* AI Consciousness Indicators */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 flex space-x-3">
          <div className="w-1 h-1 bg-cyan-400/70 rounded-full animate-ai-pulse-1 blur-sm"></div>
          <div className="w-1 h-1 bg-purple-400/70 rounded-full animate-ai-pulse-2 blur-sm"></div>
          <div className="w-1 h-1 bg-green-400/70 rounded-full animate-ai-pulse-3 blur-sm"></div>
          <div className="w-1 h-1 bg-pink-400/70 rounded-full animate-ai-pulse-4 blur-sm"></div>
          <div className="w-1 h-1 bg-blue-400/70 rounded-full animate-ai-pulse-5 blur-sm"></div>
        </div>
        
        {/* Quantum Processing Units */}
        <div className="absolute top-1/3 left-1/6 w-8 h-8 bg-gradient-to-r from-cyan-400/10 to-transparent animate-quantum-pulse-1 blur-sm"></div>
        <div className="absolute top-2/3 right-1/6 w-6 h-6 bg-gradient-to-r from-purple-400/10 to-transparent animate-quantum-pulse-2 blur-sm"></div>
        <div className="absolute top-1/2 left-4/5 w-10 h-10 bg-gradient-to-r from-green-400/10 to-transparent animate-quantum-pulse-3 blur-sm"></div>
      </div>
      


      {/* Category Filter */}
      <div className="relative z-10 mb-12">
        <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
          {techCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-gray-600/50'
              }`}
            >
              <span className="flex items-center gap-2">
                {category.name}
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedCategory === category.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-600/50 text-gray-300'
                }`}>
                  {category.count}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Technology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto relative z-10">
        {filteredTechs.map((tech, i) => (
          <TechnologyCard key={tech.id} tech={tech} index={i} onHover={setHoveredTech} isHovered={hoveredTech === tech.id} />
        ))}
      </div>

      {/* Call to Action */}
      <div className="relative z-10 text-center mt-16">
        <div className="bg-gradient-to-r from-cyan-400/10 via-purple-400/10 to-pink-400/10 rounded-2xl p-8 border border-cyan-400/20 backdrop-blur-xl">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Ready to Build Something Amazing?
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Let&apos;s leverage our technology expertise to create innovative solutions that drive your business forward.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact" className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-full font-semibold hover:scale-105 transition-transform duration-300 shadow-lg shadow-cyan-500/25">
              Start Your Project
            </a>
            <a href="#portfolio" className="px-8 py-3 border border-cyan-400/50 text-cyan-300 rounded-full font-semibold hover:bg-cyan-400/10 transition-all duration-300">
              View Our Work
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// PORTFOLIO SECTION
function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  const categories = [
    { id: 'all', name: 'All Projects', count: 13 },
    { id: 'ai', name: 'AI & Automation', count: 5 },
    { id: 'fintech', name: 'FinTech', count: 3 },
    { id: 'ecommerce', name: 'E-commerce', count: 2 },
    { id: 'iot', name: 'IoT & Hardware', count: 2 },
    { id: 'retail', name: 'Retail & POS', count: 1 },
  ];

  const projects = [
    {
      id: 1,
      category: 'ai',
      name: "AI Voicebot for FinTech BPO",
      shortDesc: "Human-like outbound voicebot for loan qualification",
      fullDesc: "Deployed a production-ready AI voicebot that handles 15,000+ daily calls for loan qualification and lead generation. The system integrates with existing CRM platforms and provides real-time analytics.",

      tag: "AI/FinTech",
      metrics: {
        callsPerDay: "15,000+",
        conversionRate: "32%",
        costReduction: "60%",
        roi: "400%"
      },
      technologies: ["OpenAI GPT-4", "Whisper", "WebRTC", "Asterisk ARI"],

      client: "Leading FinTech BPO",
      results: [
        "Increased conversion rates by 32%",
        "Reduced operational costs by 60%",
        "Handles 1000+ simultaneous conversations",
        "24/7 availability with 99.9% uptime"
      ]
    },
    {
      id: 2,
      category: 'fintech',
      name: "VoIP Integration for Global Retailer",
      shortDesc: "International calling & AI voice agents",
      fullDesc: "Integrated Twilio SIP trunking and AI voice agents for a global retailer, enabling seamless international calling and automated order confirmations across 15 countries.",

      tag: "VoIP/E-commerce",
      metrics: {
        countries: "15",
        callsPerMonth: "50,000+",
        costSavings: "45%",
        setupTime: "3 weeks"
      },
      technologies: ["Twilio", "Asterisk", "AI Voice Agents", "SIP Trunking"],

      client: "Global Retail Chain",
      results: [
        "45% reduction in international calling costs",
        "Automated order confirmations in 8 languages",
        "Seamless integration with existing systems",
        "Real-time call analytics and reporting"
      ]
    },
    {
      id: 3,
      category: 'iot',
      name: "IoT Solutions & Automation",
      shortDesc: "Industrial automation & smart monitoring",
      fullDesc: "Delivered end-to-end IoT projects: industrial automation, connected devices, smart dashboards, and real-time monitoring for manufacturing and logistics enterprises.",

      tag: "IoT/Automation",
      metrics: {
        devices: "500+",
        efficiency: "78%",
        costSavings: "35%",
        uptime: "99.5%"
      },
      technologies: ["MQTT", "Node.js", "React", "MongoDB", "Docker"],

      client: "Manufacturing Enterprise",
      results: [
        "78% improvement in operational efficiency",
        "35% reduction in energy costs",
        "Real-time monitoring of 500+ devices",
        "Predictive maintenance alerts"
      ]
    },
    {
      id: 4,
      category: 'ai',
      name: "AI Chatbot for Healthcare",
      shortDesc: "HIPAA-compliant patient triage system",
      fullDesc: "Deployed a HIPAA-compliant AI chatbot for patient triage and appointment scheduling, improving efficiency and patient satisfaction while maintaining security standards.",

      tag: "Healthcare/AI",
      metrics: {
        patients: "10,000+",
        accuracy: "94%",
        waitTime: "85%",
        satisfaction: "92%"
      },
      technologies: ["OpenAI GPT", "HIPAA Compliance", "React", "Node.js"],

      client: "Healthcare Network",
      results: [
        "94% accuracy in patient triage",
        "85% reduction in wait times",
        "10,000+ patients served monthly",
        "92% patient satisfaction rate"
      ]
    },
    {
      id: 5,
      category: 'ecommerce',
      name: "E-commerce Automation Suite",
      shortDesc: "Scalable platform with full automation",
      fullDesc: "Built a scalable e-commerce platform with inventory automation, payment integration, marketing tools, and AI-powered product recommendations.",

      tag: "E-commerce/Automation",
      metrics: {
        products: "50,000+",
        revenue: "2.5M+",
        conversion: "18%",
        growth: "300%"
      },
      technologies: ["Next.js", "Stripe", "MongoDB", "Redis", "AI/ML"],

      client: "E-commerce Startup",
      results: [
        "300% revenue growth in 6 months",
        "18% conversion rate improvement",
        "50,000+ products managed automatically",
        "AI-powered product recommendations"
      ]
    },
    {
      id: 6,
      category: 'fintech',
      name: "Mobile Banking App",
      shortDesc: "Secure banking with biometric login",
      fullDesc: "Designed and launched a secure, user-friendly mobile banking app with biometric login, instant transfers, and real-time fraud detection.",

      tag: "FinTech/Mobile",
      metrics: {
        users: "25,000+",
        transactions: "100K+",
        security: "100%",
        rating: "4.8/5"
      },
      technologies: ["React Native", "Biometric Auth", "Blockchain", "AWS"],

      client: "Digital Bank",
      results: [
        "25,000+ active users in 3 months",
        "100% security record (zero breaches)",
        "4.8/5 app store rating",
        "100,000+ monthly transactions"
      ]
    },
    {
      id: 7,
      category: 'retail',
      name: "POS System for Retail Chain",
      shortDesc: "Custom POS with inventory & analytics",
      fullDesc: "Developed a comprehensive Point of Sale system for a multi-location retail chain, featuring real-time inventory management, advanced analytics, and seamless payment integration.",
      tag: "Retail/POS",
      metrics: {
        locations: "25+",
        transactions: "500K+",
        efficiency: "85%",
        costSavings: "40%"
      },
      technologies: ["React", "Node.js", "PostgreSQL", "Stripe", "Redis"],
      client: "Multi-Location Retail Chain",
      results: [
        "25+ store locations connected",
        "85% improvement in checkout efficiency",
        "40% reduction in operational costs",
        "500,000+ monthly transactions processed"
      ]
    }
  ];

  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  return (
    <section id="portfolio" className="w-full max-w-7xl mx-auto py-24 px-4 relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/30 to-black/90"></div>
        
        {/* Floating Tech Icons */}
        <div className="absolute top-20 left-10 text-cyan-400/10 text-6xl animate-float">
          <FaRobot />
        </div>
        <div className="absolute top-40 right-20 text-purple-400/10 text-5xl animate-float-delayed">
          <FaCode />
        </div>
        <div className="absolute bottom-40 left-20 text-pink-400/10 text-4xl animate-float">
          <FaCloud />
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-cyan-400/5 to-blue-500/5 rounded-full animate-pulse blur-xl"></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-r from-purple-400/5 to-pink-500/5 rounded-full animate-pulse delay-1000 blur-xl"></div>
        <div className="absolute bottom-1/4 left-1/2 w-28 h-28 bg-gradient-to-r from-green-400/5 to-cyan-500/5 rounded-full animate-pulse delay-2000 blur-xl"></div>
      </div>
      
      {/* Header */}
      <div className="relative z-10 text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
          Our Work
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          Real projects. Real results. See how we&apos;ve transformed businesses with cutting-edge technology.
        </p>
        
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600/50'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {filteredProjects.map((project, index) => (
          <div
            key={project.id}
            className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl border border-gray-700/50 overflow-hidden backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/20"
            onMouseEnter={() => setHoveredProject(project.id)}
            onMouseLeave={() => setHoveredProject(null)}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Project Image */}
            <div className="h-48 w-full overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/20 z-10"></div>
              
              {/* Project Images */}
              {project.category === 'ai' && project.id === 1 && (
                <img 
                  src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center&q=80" 
                  alt="AI Voicebot Technology" 
                  className="w-full h-full object-cover"
                />
              )}
              {project.category === 'ai' && project.id === 4 && (
                <img 
                  src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center&q=80" 
                  alt="Healthcare AI Chatbot" 
                  className="w-full h-full object-cover"
                />
              )}
              {project.category === 'fintech' && project.id === 2 && (
                <img 
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop&crop=center&q=80" 
                  alt="VoIP Communication" 
                  className="w-full h-full object-cover"
                />
              )}
              {project.category === 'fintech' && project.id === 6 && (
                <img 
                  src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop&crop=center&q=80" 
                  alt="Mobile Banking App" 
                  className="w-full h-full object-cover"
                />
              )}
              {project.category === 'ecommerce' && project.id === 5 && (
                <img 
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&crop=center&q=80" 
                  alt="E-commerce Platform" 
                  className="w-full h-full object-cover"
                />
              )}
              {project.category === 'iot' && project.id === 3 && (
                <img 
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop&crop=center&q=80" 
                  alt="IoT Automation" 
                  className="w-full h-full object-cover"
                />
              )}
              {project.category === 'retail' && project.id === 7 && (
                <img 
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&crop=center&q=80" 
                  alt="POS System for Retail" 
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Fallback Icon for any missing images */}
              {!project.category && (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-6xl text-gray-400">
                    <FaCode />
                  </div>
                </div>
              )}
              
              {/* Category Badge */}
              <div className="absolute top-4 left-4 z-20">
                <span className="px-3 py-1 text-xs rounded-full bg-cyan-600/80 text-white font-semibold backdrop-blur-sm">
                  {project.tag}
                </span>
              </div>
              

            </div>

            {/* Project Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-cyan-200 mb-3 group-hover:text-cyan-300 transition-colors">
                {project.name}
              </h3>
              <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                {project.shortDesc}
              </p>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {Object.entries(project.metrics).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-lg font-bold text-cyan-300">{value}</div>
                    <div className="text-xs text-gray-500 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Technologies */}
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">Technologies</div>
                <div className="flex flex-wrap gap-1">
                  {project.technologies.slice(0, 3).map((tech, i) => (
                    <span key={i} className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded">
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>
              </div>
              
              {/* CTA Button */}
              <button className="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg font-semibold hover:from-cyan-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 shadow-lg">
                View Case Study
              </button>
            </div>

            {/* Hover Effect Border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="relative z-10 text-center">
        <div className="bg-gradient-to-r from-cyan-900/20 via-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-cyan-500/20 backdrop-blur-xl">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Ready to See Your Project Here?
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Let&apos;s build something amazing together. Our team is ready to turn your vision into reality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact" className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-full font-semibold hover:scale-105 transition-transform duration-300 shadow-lg shadow-cyan-500/25">
              Start Your Project
            </a>
            <a href="#contact" className="px-8 py-3 border border-cyan-400/50 text-cyan-300 rounded-full font-semibold hover:bg-cyan-400/10 transition-all duration-300">
              Get Free Consultation
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// TESTIMONIALS SECTION
function Testimonials() {
  const testimonials = [
    {
      name: "Ali Raza",
      position: "CEO, TechFlow Solutions",
      feedback: "JarvysAI's voicebot solution helped us double our lead conversion rate. Highly recommended!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      tag: "AI Voicebot",
      rating: 5
    },
    {
      name: "Sarah Khan",
      position: "Operations Manager, CallCenter Pro",
      feedback: "Their team automated our call center workflows—our support costs dropped and customer satisfaction soared!",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      tag: "Call Center Automation",
      rating: 5
    },
    {
      name: "John Matthews",
      position: "CTO, SaaSFlow Inc",
      feedback: "The AI-powered chatbots from JarvysAI are a game changer for our SaaS onboarding. Seamless and smart!",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      tag: "Chatbot",
      rating: 5
    },
    {
      name: "Adeel Ahmed",
      position: "IoT Director, SmartFactory",
      feedback: "Our IoT devices are now connected, monitored, and automated in real-time. JarvysAI's IoT team is brilliant!",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      tag: "IoT Automation",
      rating: 5
    },
    {
      name: "Maria Gomez",
      position: "Product Manager, HomeSmart",
      feedback: "We launched a smart home app with JarvysAI's help—our users love the seamless device control!",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      tag: "IoT Smart Home",
      rating: 5
    },
    {
      name: "Bilal Siddiqui",
      position: "Marketing Director, LocalBiz",
      feedback: "Their SEO team ranked our business #1 locally and boosted our online leads. True digital partners!",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
      tag: "SEO",
      rating: 5
    },
    {
      name: "Jessica Lee",
      position: "Founder, AppStudio",
      feedback: "Our iOS app is beautiful, fast, and user-friendly. The JarvysAI team delivered beyond expectations!",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
      tag: "iOS App Development",
      rating: 5
    },
    {
      name: "Omar Farooq",
      position: "Operations Director, RetailChain",
      feedback: "The POS system JarvysAI built for our retail chain is rock-solid and easy for our staff. Sales and reporting are a breeze now!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      tag: "POS System",
      rating: 5
    },
    {
      name: "Emily Chen",
      position: "Plant Manager, IndustrialCorp",
      feedback: "We automated our entire factory floor with JarvysAI's IoT solutions. Real-time monitoring and control has transformed our operations.",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      tag: "Industrial IoT",
      rating: 5
    },
    {
      name: "David Wilson",
      position: "CEO, StartupHub",
      feedback: "JarvysAI helped us build our MVP in just 3 weeks. Their development speed and quality are unmatched!",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      tag: "MVP Development",
      rating: 5
    },
    {
      name: "Lisa Rodriguez",
      position: "CTO, FinTech Solutions",
      feedback: "Their AI integration transformed our financial platform. We're now processing 10x more transactions efficiently!",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      tag: "AI Integration",
      rating: 5
    },
    {
      name: "Ahmed Hassan",
      position: "Technical Lead, CloudTech",
      feedback: "JarvysAI's cloud migration expertise saved us months of work and significantly reduced our infrastructure costs.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      tag: "Cloud Migration",
      rating: 5
    }
  ];

  // Auto-scroll functionality
  useEffect(() => {
    const scrollContainer = document.getElementById('testimonials-scroll');
    if (!scrollContainer) return;

    let scrollPosition = 0;
    const scrollSpeed = 1; // pixels per frame
    const scrollInterval = setInterval(() => {
      scrollPosition += scrollSpeed;
      if (scrollPosition >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollPosition = 0;
      }
      scrollContainer.scrollLeft = scrollPosition;
    }, 50); // 50ms = 20fps

    return () => clearInterval(scrollInterval);
  }, []);

  return (
    <section id="testimonials" className="w-full py-16 px-4 relative overflow-hidden">
      {/* Train track background effect */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-slate-900/20 to-black/90"></div>
        
        {/* Train tracks - horizontal lines */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent transform -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400/15 to-transparent transform -translate-y-1/2 mt-2"></div>
        
        {/* Moving train lights effect */}
        <div className="absolute top-1/2 left-0 w-4 h-4 bg-cyan-400/40 rounded-full animate-pulse transform -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute top-1/2 right-0 w-4 h-4 bg-purple-400/40 rounded-full animate-pulse transform -translate-y-1/2 translate-x-1/2"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-3xl font-bold text-cyan-400 text-center mb-4">What Our Clients Say</h2>
        <div className="h-1 w-24 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mx-auto mb-8 rounded-full"></div>
        <p className="text-center text-gray-400 mb-12 text-lg max-w-2xl mx-auto">
          Real results. Real partnerships. Here's what our clients love about JarvysAI.
        </p>

        {/* Train-style horizontal scrolling testimonials */}
        <div className="relative">
          {/* Left gradient fade */}
          <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
          
          {/* Right gradient fade */}
          <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
          
          {/* Scrolling testimonials container */}
          <div 
            id="testimonials-scroll"
            className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth testimonials-container" 
            style={{ scrollBehavior: 'smooth' }}
          >
            {testimonials.map((t, i) => (
              <div key={i} className="flex-shrink-0 w-80 bg-gradient-to-br from-[#181f2a] via-[#1a2332] to-[#151e2e] rounded-2xl p-6 shadow-xl border border-cyan-900/30 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 group">
                {/* Tag */}
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                    {t.tag}
                  </span>
                  {/* Star rating */}
                  <div className="flex space-x-1">
                    {[...Array(t.rating)].map((_, star) => (
                      <FaStar key={star} className="text-yellow-400 text-sm" />
                    ))}
                  </div>
                </div>
                
                {/* Client photo and info */}
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4 ring-2 ring-cyan-400/30 group-hover:ring-cyan-400/60 transition-all duration-300">
                    <img 
                      src={t.avatar} 
                      alt={t.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <div className="text-cyan-300 font-semibold text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.position}</div>
                  </div>
                </div>
                
                {/* Feedback */}
                <p className="text-gray-300 text-sm leading-relaxed italic">
                  "{t.feedback}"
                </p>
              </div>
            ))}
          </div>
          
          {/* Scroll indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>

        {/* Bottom message */}
        <div className="text-center text-gray-300 mt-8 text-base">
          <span className="text-cyan-400 font-semibold">We love building long-term partnerships.</span>
          <span className="text-gray-400"> Your success is our success!</span>
        </div>
      </div>
    </section>
  );
}

// FAQ SECTION
function FAQ() {
  const faqs = [
    {
      q: "What kind of businesses do you work with?",
      a: "We serve startups, BPOs, call centers, SaaS platforms, and enterprises looking for AI, automation, and custom tech solutions.",
    },
    {
      q: "Can you help us build a product from scratch?",
      a: "Absolutely. Whether it's just an idea or you're stuck with an unfinished MVP, we help design, develop, and launch complete solutions.",
    },
    {
      q: "Do you offer dialer + voicebot packages for call centers?",
      a: "Yes — we offer fully integrated solutions including DDV data, hosted dialer setup (Vicidial/GoAutoDial), and AI-powered voice agents.",
    },
    {
      q: "How long does it take to build a custom solution?",
      a: "Timelines vary by scope. A small MVP can take 2–4 weeks, while full SaaS platforms may take 1–2 months. We give clear timelines after a free consultation.",
    },
    {
      q: "Is your AI voicebot compatible with our existing SIP or Vicidial setup?",
      a: "Yes. Our voicebots are built with Asterisk ARI, making them fully compatible with SIP trunks, Vicidial, and other dialers.",
    },
    {
      q: "How do I get started with JarvysAI?",
      a: "Just contact us. We'll schedule a free discovery call to understand your goals and recommend the best solution — no strings attached.",
    },
  ];
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (idx: number) => setOpenIndex(openIndex === idx ? null : idx);
  return (
    <section id="faq" className="w-full max-w-3xl mx-auto py-20 px-4 relative overflow-hidden">
      {/* Satellite Network Background for FAQ */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Deep Space Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-slate-900/30 to-black/90"></div>
        
        {/* Starlink Constellation - Realistic Train */}
        <div className="absolute top-20 left-0 w-full">
          <div className="absolute top-0 left-1/4 w-40 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-starlink-train-1 blur-sm"></div>
          <div className="absolute top-2 left-1/4 w-40 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent animate-starlink-train-2 blur-sm"></div>
          <div className="absolute top-4 left-1/4 w-40 h-0.5 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent animate-starlink-train-3 blur-sm"></div>
          <div className="absolute top-6 left-1/4 w-40 h-0.5 bg-gradient-to-r from-transparent via-pink-400/20 to-transparent animate-starlink-train-4 blur-sm"></div>
          <div className="absolute top-8 left-1/4 w-40 h-0.5 bg-gradient-to-r from-transparent via-green-400/15 to-transparent animate-starlink-train-5 blur-sm"></div>
        </div>
        
        {/* Individual Satellites - More Realistic */}
        <div className="absolute top-10 left-1/6 w-2 h-1 bg-gradient-to-r from-white/70 to-cyan-400/50 animate-satellite-1 blur-sm"></div>
        <div className="absolute top-15 right-1/4 w-1.5 h-0.5 bg-gradient-to-r from-white/60 to-purple-400/40 animate-satellite-2 blur-sm"></div>
        <div className="absolute top-25 left-1/3 w-2 h-0.5 bg-gradient-to-r from-white/50 to-pink-400/30 animate-satellite-3 blur-sm"></div>
        <div className="absolute top-35 right-1/3 w-1.5 h-0.5 bg-gradient-to-r from-white/55 to-green-400/35 animate-satellite-4 blur-sm"></div>
        <div className="absolute top-45 left-2/3 w-2.5 h-0.5 bg-gradient-to-r from-white/65 to-blue-400/45 animate-satellite-5 blur-sm"></div>
        
        {/* Communication Signals - Organic Beams */}
        <div className="absolute top-1/4 left-1/4 w-0.5 h-24 bg-gradient-to-b from-cyan-400/50 to-transparent animate-beam-1 blur-sm"></div>
        <div className="absolute top-1/3 right-1/4 w-0.5 h-20 bg-gradient-to-b from-purple-400/50 to-transparent animate-beam-2 blur-sm"></div>
        <div className="absolute top-1/2 left-1/3 w-0.5 h-28 bg-gradient-to-b from-pink-400/50 to-transparent animate-beam-3 blur-sm"></div>
        <div className="absolute top-2/3 right-1/3 w-0.5 h-22 bg-gradient-to-b from-green-400/50 to-transparent animate-beam-4 blur-sm"></div>
        
        {/* Data Streams - Natural Flow */}
        <div className="absolute top-0 left-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-cyan-400/25 to-transparent animate-data-transmission-1 blur-sm"></div>
        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-purple-400/25 to-transparent animate-data-transmission-2 blur-sm"></div>
        <div className="absolute top-0 right-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-pink-400/25 to-transparent animate-data-transmission-3 blur-sm"></div>
        <div className="absolute top-0 right-1/3 w-0.5 h-full bg-gradient-to-b from-transparent via-green-400/25 to-transparent animate-data-transmission-4 blur-sm"></div>
        
        {/* Ground Stations - More Organic */}
        <div className="absolute bottom-10 left-1/4 w-12 h-6 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 animate-pulse blur-sm">
          <div className="w-1 h-1 bg-cyan-400/90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse blur-sm"></div>
        </div>
        <div className="absolute bottom-15 right-1/4 w-10 h-5 bg-gradient-to-r from-purple-500/15 to-pink-500/15 animate-pulse delay-1000 blur-sm">
          <div className="w-1 h-1 bg-purple-400/90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse blur-sm"></div>
        </div>
        <div className="absolute bottom-20 left-1/2 w-14 h-7 bg-gradient-to-r from-green-500/15 to-cyan-500/15 animate-pulse delay-2000 blur-sm">
          <div className="w-1 h-1 bg-green-400/90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse blur-sm"></div>
        </div>
        
        {/* Signal Pulses - Natural Energy */}
        <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-gradient-to-r from-cyan-400/30 to-transparent animate-signal-pulse-1 blur-sm"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-gradient-to-r from-purple-400/30 to-transparent animate-signal-pulse-2 blur-sm"></div>
        <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-gradient-to-r from-pink-400/30 to-transparent animate-signal-pulse-3 blur-sm"></div>
        <div className="absolute top-2/3 right-1/4 w-2.5 h-2.5 bg-gradient-to-r from-green-400/30 to-transparent animate-signal-pulse-4 blur-sm"></div>
        
        {/* Atmospheric Energy Waves */}
        <div className="absolute top-1/6 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent animate-atmospheric-wave-1 blur-sm"></div>
        <div className="absolute top-1/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400/15 to-transparent animate-atmospheric-wave-2 blur-sm"></div>
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-400/15 to-transparent animate-atmospheric-wave-3 blur-sm"></div>
        
        {/* Network Energy Fields */}
        <div className="absolute top-1/3 left-1/4 w-16 h-16 bg-gradient-to-r from-cyan-400/5 to-blue-500/5 animate-pulse blur-sm"></div>
        <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-gradient-to-r from-purple-400/5 to-pink-500/5 animate-pulse delay-500 blur-sm"></div>
        <div className="absolute top-2/3 left-1/3 w-20 h-20 bg-gradient-to-r from-pink-400/5 to-cyan-500/5 animate-pulse delay-1000 blur-sm"></div>
        
        {/* Status Indicators - Subtle */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 flex space-x-4">
          <div className="w-1 h-1 bg-green-400/60 rounded-full animate-pulse blur-sm"></div>
          <div className="w-1 h-1 bg-blue-400/60 rounded-full animate-pulse delay-300 blur-sm"></div>
          <div className="w-1 h-1 bg-purple-400/60 rounded-full animate-pulse delay-600 blur-sm"></div>
          <div className="w-1 h-1 bg-cyan-400/60 rounded-full animate-pulse delay-900 blur-sm"></div>
          <div className="w-1 h-1 bg-pink-400/60 rounded-full animate-pulse delay-1200 blur-sm"></div>
        </div>
      </div>
      
      <h2 className="text-4xl font-bold text-cyan-400 text-center mb-6 flex items-center justify-center gap-3 relative z-10">
        <FaRobot className="text-cyan-400 text-3xl animate-pulse" />
        Frequently Asked Questions
      </h2>
      
      {/* Enhanced gradient bar */}
      <div className="mx-auto mb-12 flex justify-center relative z-10">
        <div className="h-1.5 w-32 rounded-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-pulse animate-gradient-x shadow-lg" style={{ animationDuration: '3s' }} />
      </div>
      
      <div className="text-center text-gray-300 mb-12 text-lg max-w-2xl mx-auto relative z-10">
        Got questions? We've got answers. Everything you need to know about working with JarvysAI.
      </div>
      
      <div className="space-y-6 max-w-4xl mx-auto relative z-10">
        {faqs.map((f, i) => (
          <div 
            key={i} 
            className="group bg-gradient-to-br from-[#181f2a] via-[#1a2332] to-[#151e2e] rounded-2xl border border-cyan-900/50 overflow-hidden transition-all duration-500 hover:border-cyan-400/60 hover:shadow-[0_0_20px_0_rgba(0,255,255,0.15)] backdrop-blur-xl animate-fadein"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <button
              className="w-full flex justify-between items-center px-8 py-6 text-left text-cyan-200 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-400/50 group-hover:text-cyan-100 transition-all duration-300"
              onClick={() => toggle(i)}
              aria-expanded={openIndex === i}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-cyan-400/30 group-hover:to-purple-400/30 transition-all duration-300">
                  <span className="text-cyan-400 text-sm font-bold">{i + 1}</span>
                </div>
                <span className="text-lg group-hover:text-xl transition-all duration-300">{f.q}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`transform transition-all duration-500 ${openIndex === i ? 'rotate-90 text-cyan-400 scale-110' : 'rotate-0 text-gray-400'}`}>
                  <FaChevronRight className="text-xl" />
                </span>
              </div>
            </button>
            <div
              className={`px-8 transition-all duration-500 ease-in-out overflow-hidden ${
                openIndex === i 
                  ? 'max-h-96 opacity-100 pb-6' 
                  : 'max-h-0 opacity-0 pb-0'
              }`}
            >
              <div className="border-t border-cyan-900/50 pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 mt-2 flex-shrink-0"></div>
                  <p className="text-gray-200 text-base leading-relaxed">
                    {f.a}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Enhanced bottom section */}
      <div className="text-center mt-16 relative z-10">
        <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-cyan-400/20 backdrop-blur-xl">
          <h3 className="text-2xl font-bold text-cyan-300 mb-4">Still Have Questions?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our team is here to help. Reach out and we'll get back to you within 24 hours.
          </p>
          <a 
            href="#contact" 
            className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-3 rounded-full font-semibold hover:from-cyan-400 hover:to-purple-400 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 hover:scale-105"
          >
            <FaComments className="text-lg" />
            Get In Touch
          </a>
        </div>
      </div>
    </section>
  );
}

// CONTACT SECTION
function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs: { name?: string; email?: string; message?: string } = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = "Invalid email";
    if (!form.message.trim()) errs.message = "Message is required";
    return errs;
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSuccess(true);
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setSuccess(false), 3500);
    }
  };
  return (
    <section id="contact" className="w-full max-w-2xl mx-auto py-20 px-4 relative overflow-hidden">
      {/* Satellite Network Background for Contact */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Deep Space Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-slate-900/30 to-black/90"></div>
        
        {/* Starlink Constellation - Realistic Train */}
        <div className="absolute top-20 left-0 w-full">
          <div className="absolute top-0 left-1/4 w-40 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-starlink-train-1 blur-sm"></div>
          <div className="absolute top-2 left-1/4 w-40 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent animate-starlink-train-2 blur-sm"></div>
          <div className="absolute top-4 left-1/4 w-40 h-0.5 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent animate-starlink-train-3 blur-sm"></div>
          <div className="absolute top-6 left-1/4 w-40 h-0.5 bg-gradient-to-r from-transparent via-pink-400/20 to-transparent animate-starlink-train-4 blur-sm"></div>
          <div className="absolute top-8 left-1/4 w-40 h-0.5 bg-gradient-to-r from-transparent via-green-400/15 to-transparent animate-starlink-train-5 blur-sm"></div>
        </div>
        
        {/* Individual Satellites - More Realistic */}
        <div className="absolute top-10 left-1/6 w-2 h-1 bg-gradient-to-r from-white/70 to-cyan-400/50 animate-satellite-1 blur-sm"></div>
        <div className="absolute top-15 right-1/4 w-1.5 h-0.5 bg-gradient-to-r from-white/60 to-purple-400/40 animate-satellite-2 blur-sm"></div>
        <div className="absolute top-25 left-1/3 w-2 h-0.5 bg-gradient-to-r from-white/50 to-pink-400/30 animate-satellite-3 blur-sm"></div>
        <div className="absolute top-35 right-1/3 w-1.5 h-0.5 bg-gradient-to-r from-white/55 to-green-400/35 animate-satellite-4 blur-sm"></div>
        <div className="absolute top-45 left-2/3 w-2.5 h-0.5 bg-gradient-to-r from-white/65 to-blue-400/45 animate-satellite-5 blur-sm"></div>
        
        {/* Communication Signals - Organic Beams */}
        <div className="absolute top-1/4 left-1/4 w-0.5 h-24 bg-gradient-to-b from-cyan-400/50 to-transparent animate-beam-1 blur-sm"></div>
        <div className="absolute top-1/3 right-1/4 w-0.5 h-20 bg-gradient-to-b from-purple-400/50 to-transparent animate-beam-2 blur-sm"></div>
        <div className="absolute top-1/2 left-1/3 w-0.5 h-28 bg-gradient-to-b from-pink-400/50 to-transparent animate-beam-3 blur-sm"></div>
        <div className="absolute top-2/3 right-1/3 w-0.5 h-22 bg-gradient-to-b from-green-400/50 to-transparent animate-beam-4 blur-sm"></div>
        
        {/* Data Streams - Natural Flow */}
        <div className="absolute top-0 left-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-cyan-400/25 to-transparent animate-data-transmission-1 blur-sm"></div>
        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-purple-400/25 to-transparent animate-data-transmission-2 blur-sm"></div>
        <div className="absolute top-0 right-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-pink-400/25 to-transparent animate-data-transmission-3 blur-sm"></div>
        <div className="absolute top-0 right-1/3 w-0.5 h-full bg-gradient-to-b from-transparent via-green-400/25 to-transparent animate-data-transmission-4 blur-sm"></div>
        
        {/* Ground Stations - More Organic */}
        <div className="absolute bottom-10 left-1/4 w-12 h-6 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 animate-pulse blur-sm">
          <div className="w-1 h-1 bg-cyan-400/90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse blur-sm"></div>
        </div>
        <div className="absolute bottom-15 right-1/4 w-10 h-5 bg-gradient-to-r from-purple-500/15 to-pink-500/15 animate-pulse delay-1000 blur-sm">
          <div className="w-1 h-1 bg-purple-400/90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse blur-sm"></div>
        </div>
        <div className="absolute bottom-20 left-1/2 w-14 h-7 bg-gradient-to-r from-green-500/15 to-cyan-500/15 animate-pulse delay-2000 blur-sm">
          <div className="w-1 h-1 bg-green-400/90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse blur-sm"></div>
        </div>
        
        {/* Signal Pulses - Natural Energy */}
        <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-gradient-to-r from-cyan-400/30 to-transparent animate-signal-pulse-1 blur-sm"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-gradient-to-r from-purple-400/30 to-transparent animate-signal-pulse-2 blur-sm"></div>
        <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-gradient-to-r from-pink-400/30 to-transparent animate-signal-pulse-3 blur-sm"></div>
        <div className="absolute top-2/3 right-1/4 w-2.5 h-2.5 bg-gradient-to-r from-green-400/30 to-transparent animate-signal-pulse-4 blur-sm"></div>
        
        {/* Atmospheric Energy Waves */}
        <div className="absolute top-1/6 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent animate-atmospheric-wave-1 blur-sm"></div>
        <div className="absolute top-1/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400/15 to-transparent animate-atmospheric-wave-2 blur-sm"></div>
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-400/15 to-transparent animate-atmospheric-wave-3 blur-sm"></div>
        
        {/* Network Energy Fields */}
        <div className="absolute top-1/3 left-1/4 w-16 h-16 bg-gradient-to-r from-cyan-400/5 to-blue-500/5 animate-pulse blur-sm"></div>
        <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-gradient-to-r from-purple-400/5 to-pink-500/5 animate-pulse delay-500 blur-sm"></div>
        <div className="absolute top-2/3 left-1/3 w-20 h-20 bg-gradient-to-r from-pink-400/5 to-cyan-500/5 animate-pulse delay-1000 blur-sm"></div>
        
        {/* Status Indicators - Subtle */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 flex space-x-4">
          <div className="w-1 h-1 bg-green-400/60 rounded-full animate-pulse blur-sm"></div>
          <div className="w-1 h-1 bg-blue-400/60 rounded-full animate-pulse delay-300 blur-sm"></div>
          <div className="w-1 h-1 bg-purple-400/60 rounded-full animate-pulse delay-600 blur-sm"></div>
          <div className="w-1 h-1 bg-cyan-400/60 rounded-full animate-pulse delay-900 blur-sm"></div>
          <div className="w-1 h-1 bg-pink-400/60 rounded-full animate-pulse delay-1200 blur-sm"></div>
        </div>
      </div>
      <h2 className="text-3xl font-bold text-cyan-400 text-center mb-2 flex items-center justify-center gap-2 relative z-10"><FaRobot className="text-cyan-400 text-2xl mr-2" />Contact Us</h2>
      {/* Animated gradient bar for visual flair */}
      <div className="mx-auto mb-8 flex justify-center relative z-10">
        <div className="h-1 w-28 rounded-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-pulse animate-gradient-x shadow-lg" style={{ animationDuration: '2.5s' }} />
      </div>
      <div className="relative z-10">
        <div className="backdrop-blur-xl bg-[#181f2a]/80 border border-cyan-900 rounded-2xl shadow-2xl p-8 max-w-xl mx-auto glass-card animate-fadein">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit} autoComplete="off" noValidate>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 text-lg" />
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                className={`pl-10 p-3 rounded bg-[#181f2a]/80 border ${errors.name ? "border-red-500 animate-shake" : "border-cyan-900"} text-white transition-all w-full focus:border-cyan-400 focus:ring-2 focus:ring-cyan-700/30`}
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <div className="text-red-400 text-xs animate-fadein-fast text-left pl-1 mt-1">{errors.name}</div>}
            </div>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 text-lg" />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                className={`pl-10 p-3 rounded bg-[#181f2a]/80 border ${errors.email ? "border-red-500 animate-shake" : "border-cyan-900"} text-white transition-all w-full focus:border-cyan-400 focus:ring-2 focus:ring-cyan-700/30`}
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <div className="text-red-400 text-xs animate-fadein-fast text-left pl-1 mt-1">{errors.email}</div>}
            </div>
            <div className="relative">
              <FaCommentDots className="absolute left-3 top-4 text-cyan-400 text-lg" />
              <textarea
                name="message"
                placeholder="Your Message"
                className={`pl-10 p-3 rounded bg-[#181f2a]/80 border ${errors.message ? "border-red-500 animate-shake" : "border-cyan-900"} text-white transition-all w-full focus:border-cyan-400 focus:ring-2 focus:ring-cyan-700/30`}
                rows={4}
                value={form.message}
                onChange={handleChange}
              />
              {errors.message && <div className="text-red-400 text-xs animate-fadein-fast text-left pl-1 mt-1">{errors.message}</div>}
            </div>
            <button
              type="submit"
              className="bg-gradient-to-tr from-cyan-500 to-purple-500 text-white font-semibold py-3 rounded-full hover:from-cyan-400 hover:to-purple-400 transition shadow-lg glow-btn flex items-center justify-center gap-2 text-lg animate-gradient-shimmer"
            >
              <FaRobot className="text-xl animate-float-slow" /> Send Message
            </button>
            {success && (
              <div className="text-green-400 text-base mt-2 flex items-center gap-2 animate-fadein-fast"><span className="text-2xl">✅</span> Thank you! Your message has been sent.</div>
            )}
          </form>
        </div>
        <div className="mt-10 text-left text-gray-300 space-y-2 animate-fadein delay-200 max-w-xl mx-auto">
          <div className="flex items-center gap-2"><span className="font-semibold text-cyan-300"><FaEnvelope className="inline mr-1" /> Email:</span> info@jarvysai.com</div>
          <div className="flex items-center gap-2"><span className="font-semibold text-cyan-300"><FaPhoneAlt className="inline mr-1" /> Phone:</span> +923155126625</div>
          <div className="flex items-center gap-2"><span className="font-semibold text-cyan-300"><FaMapMarkerAlt className="inline mr-1" /> Office:</span> Gulshanabad Sector 1, Rawalpindi, Pakistan</div>
          <div className="flex gap-4 mt-2">
            <a href="#" className="hover:text-cyan-400 text-xl" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="https://x.com/JarvysAiTech" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 text-xl" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://www.facebook.com/people/JarvysAi-Agency/61578293887427/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 text-xl" aria-label="Facebook"><FaFacebook /></a>
          </div>
        </div>
      </div>
    </section>
  );
}

// FOOTER
function Footer() {
  // Animated particles config for background
  const footerParticlesOptions = {
    fullScreen: false,
    background: { color: "transparent" },
    fpsLimit: 60,
    particles: {
      color: { value: ["#00e6fe", "#7f5af0", "#ff6b6b", "#4ecdc4"] },
      number: { value: 25, density: { enable: true, value_area: 800 } },
      size: { value: { min: 1, max: 3 } },
      opacity: { value: { min: 0.1, max: 0.3 } },
      move: { enable: true, speed: 0.3, direction: "none" as const, random: true, straight: false, outModes: { default: "bounce" as const } },
      shape: { type: ["circle", "star"], stroke: { width: 0 } },
      links: { enable: true, color: "#00e6fe", distance: 120, opacity: 0.06, width: 1 },
      twinkle: { particles: { enable: true, color: "#fff", frequency: 0.1, opacity: 0.5 } },
    },
    detectRetina: true,
  };
  return (
    <footer className="w-full bg-gradient-to-b from-black via-[#0a0a0a] to-[#000000] py-16 px-4 text-gray-300 relative overflow-hidden">
      {/* Enhanced animated particles background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Particles id="footer-particles" options={footerParticlesOptions} className="w-full h-full" />
      </div>
      
      {/* Animated gradient border at the top */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 via-purple-500 via-pink-500 to-transparent animate-gradient-x opacity-60"></div>
      
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top section with logo and social */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12">
                     {/* Company description */}
           <div className="flex flex-col items-center lg:items-start gap-4">
             <div className="text-center lg:text-left">
               <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-wider mb-2">
                 JarvysAI
               </h3>
               <p className="text-gray-400 text-sm max-w-md">
                 Empowering businesses with cutting-edge AI, automation, and modern technology solutions.
               </p>
             </div>
            {/* Social links with enhanced hover effects */}
            <div className="flex gap-6 mt-4">
              <a href="#" className="group relative p-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300 hover:scale-110" aria-label="LinkedIn">
                <FaLinkedin className="text-xl text-cyan-400 group-hover:text-white transition-colors" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </a>
              <a href="https://x.com/JarvysAiTech" target="_blank" rel="noopener noreferrer" className="group relative p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 hover:scale-110" aria-label="Twitter">
                <FaTwitter className="text-xl text-purple-400 group-hover:text-white transition-colors" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </a>
              <a href="https://www.facebook.com/people/JarvysAi-Agency/61578293887427/" target="_blank" rel="noopener noreferrer" className="group relative p-3 rounded-full bg-gradient-to-r from-pink-500/20 to-cyan-500/20 border border-pink-500/30 hover:border-pink-400/60 transition-all duration-300 hover:scale-110" aria-label="Facebook">
                <FaFacebook className="text-xl text-pink-400 group-hover:text-white transition-colors" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </a>
            </div>
          </div>
          
          {/* Contact info with enhanced styling */}
          <div className="flex flex-col items-center lg:items-end gap-6">
            <div className="text-center lg:text-right">
              <h3 className="text-lg font-semibold text-cyan-300 mb-4">Get In Touch</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 justify-center lg:justify-end">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                    <FaEnvelope className="text-cyan-400 text-sm" />
                  </div>
                  <span className="text-gray-300 hover:text-cyan-400 transition-colors">info@jarvysai.com</span>
                </div>
                <div className="flex items-center gap-3 justify-center lg:justify-end">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <FaPhoneAlt className="text-purple-400 text-sm" />
                  </div>
                  <span className="text-gray-300 hover:text-purple-400 transition-colors">+923155126625</span>
                </div>
                <div className="flex items-center gap-3 justify-center lg:justify-end">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500/20 to-cyan-500/20 flex items-center justify-center">
                    <FaMapMarkerAlt className="text-pink-400 text-sm" />
                  </div>
                  <span className="text-gray-300 hover:text-pink-400 transition-colors">Rawalpindi, Pakistan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        

        
        {/* Bottom section with copyright */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm">
              <FaRobot className="text-cyan-400 animate-pulse" />
              <span className="text-gray-400">
                Powered by <span className="font-bold text-cyan-400 tracking-wider">JarvysAI</span>
              </span>
            </div>
            <div className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} JarvysAI. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="hover:text-cyan-400 transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-purple-400 transition-colors cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const { isLowEnd, userPrefersReducedMotion } = useDeviceCapabilities();
  
  // Performance optimization: Conditional rendering based on device capabilities
  
  // Performance optimization: Conditional rendering of heavy components
  const shouldRenderParticles = !isLowEnd && !userPrefersReducedMotion;
  const shouldRenderComplexAnimations = !isLowEnd && !userPrefersReducedMotion;
  
  // Performance optimization: Debounced scroll for better performance
  useDebouncedScroll(() => {
    // Scroll handling optimized
  }, 16); // 60fps scroll handling

  // Particles initialization
  const particlesInit = useCallback(async (engine: unknown) => {
    await loadFull(engine);
  }, []);
  
  const particlesLoaded = useCallback(async (container: unknown) => {
    // Particles are loaded and ready
    console.log('Particles loaded successfully');
  }, []);

  return (
    <main className="w-full bg-gradient-to-b from-black via-[#0a0a0a] to-[#000000] relative overflow-hidden">
      {/* Performance Monitor */}
      <PerformanceMonitor />
      
      {/* Global animated particles background - Conditional rendering for performance */}
      {shouldRenderParticles && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Particles 
            id="global-particles" 
            init={particlesInit}
            options={getParticlesOptions(userPrefersReducedMotion)}
            particlesLoaded={particlesLoaded}
          />
        </div>
      )}
      
      {/* Global animated gradient border at the top - Conditional rendering for performance */}
      {shouldRenderComplexAnimations && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 via-purple-500 via-pink-500 to-transparent animate-gradient-x opacity-40"></div>
      )}
      
      <div className="relative z-10">
        <Header />
        <Hero />
        <Services />
        <Technologies />
        <Portfolio />
        <Testimonials />
        <About />
        <FAQ />
        <Contact />
        <Footer />
      </div>
    </main>
  );
}
