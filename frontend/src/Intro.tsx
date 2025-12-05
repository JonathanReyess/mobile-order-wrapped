import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

// --- Components ---

/**
 * NoiseOverlay adds a grainy texture to the screen to give it that "printed/grunge" look
 * seen in the reference images.
 */
const NoiseOverlay = () => (
  <div className="pointer-events-none fixed inset-0 z-40 opacity-[0.08] mix-blend-overlay">
    <svg className="h-full w-full">
      <filter id="noiseFilter">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.8"
          numOctaves="3"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  </div>
);

/**
 * CurvedText uses SVG to render the "Wrapped" text on a bezier curve path.
 */
const CurvedText = ({ text, color }: { text: string; color: string }) => {
  return (
    <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
      <path
        id="curvePath"
        d="M 10,120 Q 250,20 490,120"
        fill="transparent"
      />
      <text width="500">
        <textPath
          xlinkHref="#curvePath"
          startOffset="50%"
          textAnchor="middle"
          className="font-black tracking-tighter uppercase fill-current"
          style={{ fontSize: "110px", fontFamily: "'Anton', sans-serif" }}
          fill={color}
        >
          {text}
        </textPath>
      </text>
    </svg>
  );
};

export default function Intro() {
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  
  // Animation refs
  const stripesRef = useRef<HTMLDivElement[]>([]);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const bigYearRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  
  const [isHovering, setIsHovering] = useState(false);

  // -- Animation Setup --
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Initial Intro Animation Timeline
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    // Stagger in the background racing stripes
    tl.fromTo(
      stripesRef.current,
      { yPercent: -100, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.05, ease: "expo.inOut" }
    )
    .fromTo(
      bigYearRef.current, 
      { scale: 0.8, opacity: 0, rotation: -5 },
      { scale: 1, opacity: 1, rotation: 0, duration: 1.5, ease: "elastic.out(1, 0.5)" },
      "-=0.5"
    )
    .fromTo(
      contentRef.current,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 },
      "-=1"
    )
    .fromTo(
      buttonRef.current,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" },
      "-=0.5"
    );

    // 2. Mouse Movement Parallax Logic (3D Card Effect)
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate rotation based on mouse position
      // Increased multiplier for more dramatic effect
      const rotateY = ((x - centerX) / centerX) * 15; 
      const rotateX = (-(y - centerY) / centerY) * 15;

      gsap.to(cardRef.current, {
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 1000,
        transformOrigin: "center",
        ease: "power2.out",
        duration: 0.5,
      });
      
      // Also slight parallax on the year background
      if (bigYearRef.current) {
        gsap.to(bigYearRef.current, {
          x: (x - centerX) * 0.05,
          y: (y - centerY) * 0.05,
          duration: 1
        });
      }
    };

    const resetMouseMove = () => {
      if (!cardRef.current) return;
      gsap.to(cardRef.current, {
        rotateX: 0,
        rotateY: 0,
        ease: "power2.out",
        duration: 0.6,
      });
       if (bigYearRef.current) {
        gsap.to(bigYearRef.current, { x: 0, y: 0, duration: 1 });
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", resetMouseMove);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", resetMouseMove);
      tl.kill();
    };
  }, []);

  const handleStart = () => {
    // Exit Animation
    const tl = gsap.timeline({
      onComplete: () => {
        // Navigate to the correct upload page route
        navigate("/upload"); 
      }
    });

    // Zoom everything out and fade to white
    tl.to([cardRef.current, bigYearRef.current], {
      scale: 5,
      opacity: 0,
      duration: 0.8,
      ease: "power2.in"
    })
    .to(stripesRef.current, {
      yPercent: 100,
      stagger: 0.02,
      duration: 0.5
    }, "<")
    .to(overlayRef.current, {
      opacity: 1,
      duration: 0.3
    }, "-=0.2");
  };

  // --- Render Helpers ---

  // Generate the background racing stripes (Panels)
  const renderStripes = () => {
    const stripes = [];
    const count = 10;
    for (let i = 0; i < count; i++) {
      stripes.push(
        <div
          key={i}
          ref={(el) => {
            if (el) stripesRef.current[i] = el;
          }}
          className={`h-full flex-1 transform origin-top ${
            i % 2 === 0 ? "bg-[#e0e0e0]" : "bg-white"
          }`}
          style={{
             // Add a subtle skew to make it look fast
            transform: 'skewX(-10deg) scale(1.2)'
          }}
        />
      );
    }
    return (
      <div className="absolute inset-0 flex flex-row -mx-20 pointer-events-none opacity-20 z-0">
        {stripes}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen bg-[#0a0a0a] overflow-hidden flex items-center justify-center font-sans selection:bg-[#ff1e1e] selection:text-white"
    >
      <NoiseOverlay />

      {/* Background Pattern Layer */}
      <div className="absolute inset-0 bg-checkered opacity-10 z-0" />
      
      {/* Animated Stripes Background */}
      {renderStripes()}

      {/* Flash Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-white z-[60] pointer-events-none opacity-0"
      />

      {/* Main 3D Container */}
      <div className="relative w-full max-w-5xl aspect-video flex items-center justify-center perspective-1000 z-10 px-4">
        
        {/* The Card (Tilts on mousemove) */}
        <div
          ref={cardRef}
          className="relative w-full h-full transform-style-3d flex items-center justify-center"
        >
          {/* Giant Background Year - Stays flat relative to card but behind text */}
          <div 
            ref={bigYearRef}
            className="absolute z-0 select-none pointer-events-none"
          >
             <h1 className="text-[30vw] md:text-[30rem] leading-none font-black text-transparent italic tracking-tighter"
                 style={{ 
                   WebkitTextStroke: '2px #202020', 
                   opacity: 0.75
                 }}>
              2025
            </h1>
          </div>

          {/* Foreground Content */}
          <div ref={contentRef} className="z-10 flex flex-col items-center relative">
            
            {/* Top Tagline */}
            <div className="bg-[#ff1e1e] text-white px-3 py-1 mb-14 transform -skew-x-12 inline-block shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              <p className="font-bold text-sm md:text-lg uppercase tracking-widest transform skew-x-12">
                End of Semester
              </p>
            </div>

            {/* Curved 'Wrapped' Text */}
            <div className="w-[90vw] md:w-[600px] h-[100px] md:h-[180px] relative -mt-4 md:-mt-8">
              {/* Stroke Layer (Behind) */}
              <div className="absolute inset-0 z-0 translate-x-1 translate-y-1">
                 <CurvedText text="WRAPPED" color="#333" />
              </div>
              {/* Fill Layer */}
              <div className="absolute inset-0 z-10">
                 <CurvedText text="WRAPPED" color="#fff" />
              </div>
            </div>

            {/* Subtitle - Bigger size (text-3xl md:text-5xl) and moved button down (mb-24) */}
             <p className="text-[#ff1e1e] font-black italic text-3xl md:text-5xl uppercase tracking-tighter mb-24 mix-blend-difference">
               Fall Edition
            </p>

            {/* Start Button */}
            <div className="relative group">
              {/* Decorative checkerboard border for button */}
              <div className={`absolute -inset-2 bg-checkered opacity-50 transition-all duration-300 ${isHovering ? 'scale-110 opacity-100 rotate-2' : ''}`} />
              
              <button
                ref={buttonRef}
                type="button" // <--- FIX APPLIED HERE: Prevents page refresh
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={handleStart}
                className={`
                  relative px-8 py-4 md:px-12 md:py-6 
                  font-black italic text-xl md:text-3xl uppercase tracking-wider
                  border-4 transition-all duration-300 transform
                  shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                  bg-[#ff1e1e] text-white border-white hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)] cursor-pointer
                `}
              >
                <span className="flex items-center gap-2">
                  START 
                  {/* Simple chevron icon */}
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>

          </div>
        </div>
      </div>
      
      {/* Decorative Corners */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-4 border-t-4 border-white opacity-20"></div>
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-4 border-b-4 border-[#ff1e1e] opacity-50"></div>
      
      {/* Floating abstract element (F1 Wheel visual metaphor) */}
      <div className="absolute bottom-10 left-10 hidden md:block opacity-30 animate-spin-slow" style={{ animationDuration: '10s' }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
           <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="none" stroke="white" strokeWidth="2" />
           <circle cx="50" cy="50" r="20" fill="none" stroke="#ff1e1e" strokeWidth="4" />
        </svg>
      </div>

    </div>
  );
}