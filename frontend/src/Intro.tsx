import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

export default function Intro() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const exitTl = useRef<gsap.core.Timeline | null>(null);

  // panels config
  const numberOfPanels = 12;
  const rotationCoef = 5;
  const panelGradient = `linear-gradient(
    105deg,
    #F5FBFF 0%,
    #ADD8E6 6%,
    #0059b3 19%,
    #003366 72%,
    black 100%
  )`;

  useEffect(() => {
    const panels = document.querySelectorAll<HTMLDivElement>(".panel1");
    const textCall = document.querySelector<HTMLDivElement>(".callout")!;
    const textSub = document.querySelector<HTMLDivElement>(".subtitle")!;
    const startBtn = document.querySelector<HTMLButtonElement>(".start-button")!;
    const overlay = overlayRef.current!;
    const card = cardRef.current;
    const container = containerRef.current;

    let elHeight = window.innerHeight / numberOfPanels;
    let elWidth = window.innerWidth / numberOfPanels;

    //
    // 1) panelTl – loops forever
    //
    const panelTl = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } });
    function buildPanelTimeline() {
      panelTl.clear();
      panels.forEach((panel, i) => {
        const wi = window.innerWidth - elWidth * (numberOfPanels - i) + elWidth;
        const he = window.innerHeight - elHeight * (numberOfPanels - i) + elHeight;

        panelTl
          .fromTo(
            panel,
            {
              y: elHeight * 5.5,
              x: elWidth * 5.5,
              width: 0,
              height: 0,
              rotation: -360,
              background: panelGradient,
            },
            {
              width: wi,
              height: he,
              y: -elHeight / 1.33 + ((numberOfPanels - i) * elHeight) / 1.33,
              x: 0,
              rotation: 0,
              duration: 1 + 0.1 * (numberOfPanels - i),
            },
            0
          )
          .to(
            panel,
            {
              rotation: 12 * rotationCoef - (i + 1) * rotationCoef,
              duration: 3,
              background: panelGradient,
            },
            ">"
          )
          .to(
            panel,
            {
              rotation: 360,
              y: -elHeight / 6 + ((numberOfPanels - i) * elHeight) / 6,
              x: -elWidth / 1.2 + ((numberOfPanels - i) * elWidth) / 1.2,
              duration: 1,
            },
            ">"
          )
          .to(
            panel,
            {
              rotation: 12 * rotationCoef - (i + 1) * rotationCoef + 360,
              duration: 4,
            },
            ">"
          );
      });
    }
    buildPanelTimeline();

    //
    // 2) introTl – runs once on mount
    //
    const introTl = gsap.timeline({ defaults: { ease: "expo.out" } });
    introTl
      .fromTo(textCall, { left: "150%" }, { left: "50%", duration: 1, delay: 1.2 }, 0)
      .to(textCall, { y: "-60px", duration: 0.5, delay: 3 }, 0)
      .fromTo(textSub, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.5, delay: 3 }, 0)
      .fromTo(startBtn, { opacity: 0, scale: 0.5, y: 100 }, { opacity: 1, scale: 1, y: -50, duration: 1 }, 2);

    //
    // 3) exitTl – paused until handleStart()
    //
    exitTl.current = gsap.timeline({
      paused: true,
      defaults: { ease: "power1.inOut" },
      onComplete: () => {
        navigate("/upload");
      },
    });

    exitTl.current
      .to([textCall, textSub, startBtn], { opacity: 0, y: 30, stagger: 0.1, duration: 0.4 })
      .to(panels, { opacity: 0, duration: 0.8 }, "<")
      .to(overlay, { opacity: 1, duration: 0.5 }, "<0.2");

    //
    // 4) mousemove 3D rotation
    //
    const handleMouseMove = (e: MouseEvent) => {
      if (!card || !container) return;
    
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
    
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
    
      const rotateY = (x - centerX) / centerX * 10; // Max 10deg
      const rotateX = -(y - centerY) / centerY * 10; // Max 10deg
    
      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        scale: 1.03, // 🌟 Add slight scale up while hovering
        transformPerspective: 800,
        transformOrigin: "center",
        ease: "power2.out",
        duration: 0.4,
      });
    };
    

    const resetMouseMove = () => {
      if (!card) return;
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1, // 🌟 Reset scale back to normal
        ease: "power2.out",
        duration: 0.6,
      });
    };
    

    container?.addEventListener("mousemove", handleMouseMove);
    container?.addEventListener("mouseleave", resetMouseMove);

    window.addEventListener("resize", () => {
      elHeight = window.innerHeight / numberOfPanels;
      elWidth = window.innerWidth / numberOfPanels;
      buildPanelTimeline();
      panelTl.restart();
    });

    return () => {
      window.removeEventListener("resize", () => {});
      container?.removeEventListener("mousemove", handleMouseMove);
      container?.removeEventListener("mouseleave", resetMouseMove);
      panelTl.kill();
      introTl.kill();
      exitTl.current?.kill();
    };
  }, [navigate]);

  const handleStart = () => {
    exitTl.current?.play();
  };

  return (
    <div ref={containerRef} className="h-screen w-screen bg-black overflow-hidden relative">
      {/* looping panels */}
      {Array.from({ length: numberOfPanels }).map((_, idx) => (
        <div key={idx} className="panel1 absolute top-0 left-0 z-0" />
      ))}

      {/* white flash overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-white z-50 pointer-events-none opacity-0"
      />

      {/* 3D Card */}
      <div className="relative h-full w-full flex items-center justify-center perspective-800 z-20 pr-[6vw]">
        <div
          ref={cardRef}
          className="relative w-full h-full flex flex-col items-center justify-center transform-style-preserve-3d"
        >
          <div className="absolute top-[10%] left-1/2 transform -translate-x-1/2 callout z-20">
            <p className="text-[6.5vw] font-extrabold  text-[#d3f971] text-left w-[60vw] leading-none">
              Welcome to the
            </p>
            <p className="text-[6.5vw] font-extrabold text-[#4b917d] text-left w-[60vw] leading-none pl-[6vw]">
              end of the semester.
            </p>
            <p className="text-[6.5vw] font-extrabold text-white text-left w-[60vw] leading-none">
              Ready for your
            </p>
            <p className="text-[6.5vw] font-extrabold text-[#ee209c] text-left w-[60vw] leading-none pl-[6vw]">
              Spring 2025
            </p>
            <p className="text-[6.5vw] font-extrabold text-[#ee209c] text-right w-[60vw] leading-none">
               Wrapped?
            </p>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="absolute bottom-10 w-full flex justify-center z-20">
  <button
    onClick={handleStart}
    className="start-button 
      px-4 py-2 text-md

      sm:px-6 sm:py-3 sm:text-lg
      xs:px-4 xs:py-2 xs:text-base

      bg-black text-[#d3f971] rounded-full font-bold 
      border-2 border-[#d3f971] 
      hover:bg-[#d3f971] hover:text-black 
      transition-all duration-500 z-30"
  >
    Start
  </button>
</div>

    </div>
  );
}
