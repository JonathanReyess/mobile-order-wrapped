import React, { useRef, useLayoutEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import './_intro.scss';

// Define the number of panels as a constant for clarity
const NUMBER_OF_PANELS = 12;
const ROTATION_COEF = 5;

// --- 1. Countdown Logic Removed ---
// The getTimeLeft function and timeLeft state are removed.

const Intro: React.FC = () => {
  const navigate = useNavigate(); // Hook for navigation

  // 1. Refs to target the DOM elements for GSAP
  const bgRef = useRef<HTMLDivElement>(null);
  const textCalloutRef = useRef<HTMLHeadingElement>(null);
  const startBtnRef = useRef<HTMLButtonElement>(null); // Ref for the new button
  const overlayRef = useRef<HTMLDivElement>(null); // Ref for the overlay
  const tiltEnabledRef = useRef(false);

  
  // 2. State to manage window dimensions
  const [windowSize, setWindowSize] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 0, 
    height: typeof window !== 'undefined' ? window.innerHeight : 0 
  });
  // timeLeft state has been removed

  // 3. GSAP Timeline refs
  const tl = useRef(gsap.timeline({ repeat: -1, paused: true })); 
  const exitTl = useRef(gsap.timeline({ paused: true })); // Timeline for the exit sequence

  // Hook to run the countdown timer has been removed

  // --- Start Handler (Logic for exiting) ---
  const handleStart = useCallback(() => {
    tiltEnabledRef.current = false; 
    if (textCalloutRef.current) {
      gsap.killTweensOf(textCalloutRef.current);
    }
    // Check if the exit timeline exists and is not running
    if (exitTl.current && !exitTl.current.isActive()) {
      exitTl.current.play();
    }
  }, []);

  // Tilt configuration
const MAX_ROTATION = 8; // degrees

const handleMouseMove = useCallback((e: MouseEvent) => {
  if (!tiltEnabledRef.current) return;
  if (!textCalloutRef.current) return;

  const rect = textCalloutRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;

  const rotateX = (y / rect.height) * -MAX_ROTATION;
  const rotateY = (x / rect.width) * MAX_ROTATION;

  gsap.to(textCalloutRef.current, {
    rotateX,
    rotateY,
    transformPerspective: 800,
    duration: 0.4,
    ease: "power3.out",
    overwrite: true,
  });
}, []);



  // Helper function to calculate dimensions based on current window size
  const calculateDimensions = useCallback(() => {
    const { width, height } = windowSize;
    const elHeight = height / NUMBER_OF_PANELS;
    const elWidth = width / NUMBER_OF_PANELS;
    return { elHeight, elWidth, width, height };
  }, [windowSize]);

  // 4. Function to define all GSAP animations
  const addItemsToTimeline = useCallback(() => {
    if (!bgRef.current || !overlayRef.current) return;

    tl.current.clear();
    exitTl.current.clear(); // Clear exit timeline on resize/re-run
    const { elHeight, elWidth, width, height } = calculateDimensions();
    
    // Select all panel elements dynamically using the ref
    const panels = bgRef.current.querySelectorAll('.panel1');
    const secondaryPanels = bgRef.current.querySelectorAll('.panel2');

    // --- ENTRANCE Timeline (Combined Intro) ---
    const introTl = gsap.timeline({ defaults: { ease: "expo.out" } });


    // Text Entrance
    introTl.fromTo(
      textCalloutRef.current,
      { left: "150%" }, // Initial state
      { 
        left: "50%", 
        y: -30, 
        duration: 1, 
        delay: 1.2 
      }, 
      0
    );

    // BUTTON Entrance
    introTl.fromTo(
      startBtnRef.current, 
      { opacity: 0, scale: 0.5, y: 100 }, 
      { opacity: 1, scale: 1, y: -50, duration: 1 }, 
      2 // Starts 2 seconds into the introTl
    );

    introTl.call(() => {
      tiltEnabledRef.current = true;
    });


    // --- EXIT Timeline (New) ---
  

    // 💡 NEW: Text exits to the left, Start button fades out
    exitTl.current.to(
      textCalloutRef.current,
      { 
        opacity: 0, 
        x: '-200%', // Animate the X position off-screen to the left
        duration: 0.6, 
        ease: "power2.inOut" 
      }
    )
    .to(
        startBtnRef.current,
        { 
          opacity: 0, 
          y: 30, 
          duration: 0.4, 
          ease: "power1.inOut" 
        },
        '<' // Start the button fade at the same time as the text move
    )
    .to(panels, 
      { opacity: 0, duration: 0.8 }, 
      "<" // Start simultaneously with text/button fade
    )
    .to(overlayRef.current, 
      { opacity: 1, duration: 0.5 }, 
      "<0.2" // Start slightly after panel fade begins
    )
    .call(() => {
        // NAVIGATE TO /about AS REQUESTED
        navigate("/upload"); 
    });
    
    // --- Panel Animations (Setup for the Looping Timeline) ---
    panels.forEach((panel, i) => {
      // (Panel logic is complex and remains identical to your previous code)
      // ... [The entire panels.forEach loop code is unchanged and omitted for brevity] ...
      
      const stopPosition = 100 - i * 1;
      const wi = width - elWidth * (12 - i) + elWidth;
      const he = height - elHeight * (12 - i) + elHeight;

      const backgroundGradient = (stop: number | string) => 
        `linear-gradient(105deg, rgba(173, 216, 230, 1) 0%, rgba(100, 149, 237, 1) 6%, rgba(0, 100, 255, 1) 19%, rgba(0, 51, 153, 1) 72%, rgba(0, 0, 0, 1) ${stop}%)`;

      const backgroundGradient2 = (stop: number | string) => 
        `linear-gradient(90deg, rgba(200, 220, 255, 1) 0%, rgba(100, 149, 237, 1) 6%, rgba(0, 100, 255, 1) 19%, rgba(0, 51, 153, 1) 72%, rgba(0, 0, 0, 1) ${stop}%)`;
      
      // Initial rotation/scaling
      tl.current.fromTo(
        panel,
        {
          y: elHeight * 5.5,
          x: elWidth * 5.5,
          width: 0,
          height: 0,
          rotation: -360,
          background: backgroundGradient(stopPosition),
        },
        {
          width: wi,
          height: he,
          y: -elHeight / 1.33 + ((12 - i) * elHeight) / 1.33,
          x: 0,
          duration: 1 + 0.1 * (12 - i),
          ease: "sine.inOut",
          rotation: 0,
          background: backgroundGradient(stopPosition),
        },
        0
      );

      // Linear rotation 1
      tl.current.to(
        panel,
        {
          rotation: 12 * ROTATION_COEF - (i + 1) * ROTATION_COEF,
          duration: 3,
          background: backgroundGradient2(stopPosition),
          ease: "linear",
        },
        ">"
      );

      // Reordering/transformation
      tl.current.to(
        panel,
        {
          rotation: 360,
          y: -elHeight / 6 + ((12 - i) * elHeight) / 6,
          x: -elWidth / 1.2 + ((12 - i) * elWidth) / 1.2,
          background: backgroundGradient2("100%"),
          ease: "sine.inOut",
          duration: 1,
        },
        ">"
      );

      // Linear rotation 2
      tl.current.to(
        panel,
        {
          rotation: 12 * ROTATION_COEF - (i + 1) * ROTATION_COEF + 360,
          duration: 4,
          background: backgroundGradient2("100%"),
          ease: "linear",
        },
        ">"
      );

      // Set label for secondary panels start
      if (i === 0) {
        tl.current.addLabel("splitStart", "-=0.8");
      }

      // --- Panel2 Animations (Secondary panels) ---
      secondaryPanels.forEach((twoPanel, index) => {
        // Only run for the first panel in the main loop to avoid repetition
        if (i !== 0) return; 

        const wi2 = width - elWidth * index + elWidth;
        const backgroundGradient3 = 
        `linear-gradient(
          90deg,
          rgba(200, 220, 255, 1) 0%, /* Very Light Blue */
          rgba(100, 149, 237, 1) 6%, /* Cornflower Blue */
          rgba(0, 100, 255, 1) 19%, /* Bright Blue */
          rgba(0, 51, 153, 1) 72%,  /* Dark Blue/Navy */
          rgba(0, 0, 0, 1) 100%
        )`;
        tl.current.fromTo(
          twoPanel,
          {
            y: elHeight * 5.5,
            x: elWidth * 5.5,
            width: 0,
            height: 0,
            rotation: -360,
            background: backgroundGradient("100%"),
          },
          {
            rotation: -90,
            y: 0 + (index * elHeight) / 4 - wi2,
            x: -elWidth / 2 + (index * elWidth) / 2,
            width: wi2,
            height: wi2,
            background: backgroundGradient3,
            ease: "sine.inOut",
            duration: 1,
          },
          "splitStart" + `+=${0.05 * index}`
        );

        tl.current.to(
          twoPanel,
          {
            rotation: 12 * ROTATION_COEF - (12 - index) * ROTATION_COEF - 90,
            duration: 5,
            background: backgroundGradient3,
            ease: "linear",
          },
          ">"
        );
        
        tl.current.to(
            twoPanel,
            {
              rotation: 300,
              y: 0 + (index * elHeight) /2 - wi2,
              x: (width*1.1 - wi2 * 1.2 ),
              width: wi2,
              height: wi2,
              background: backgroundGradient3,
              ease: "sine.inOut",
              duration: 1,
            },
            ">"
          );
          
          tl.current.to(
            twoPanel,
            {
              rotation: "+=15",
              duration: 5,
              background: backgroundGradient3,
              ease: "linear",
            },
            ">"
          );
          
          tl.current.to(
            twoPanel,
            {
              rotation: "+=360",
              y: `-=${wi2*2}`,
              x: `+=${wi2*2}`,
              width: wi2,
              height: wi2,
              background: backgroundGradient3,
              ease: "sine.inOut",
              duration: 1,
            },
            ">"
          );
      });
      // --- End of Panel2 Animations ---

      // --- Panel1 Exit Animations ---
      // The logic for the first panel is slightly different (opacity 0)
      if (i === 0) {
        tl.current.to(
          panel,
          {
            rotation: 720 + 90,
            y: height - ((12 - i) * elHeight) / 4,
            x: -elWidth / 2 + ((12 - i) * elWidth) / 2,
            width: 0,
            height: 0,
            opacity: 0, // Key difference from the original code
            background: backgroundGradient2("100%"),
            ease: "sine.inOut",
            duration: 1,
          },
          "splitStart" + `+=${0.05 * i}`
        );
      } else {
        // Remaining panels
        tl.current.to(
          panel,
          {
            rotation: 720 + 90,
            y: height - ((12 - i) * elHeight) / 4,
            x: -elWidth / 2 + ((12 - i) * elWidth) / 2,
            width: wi,
            height: wi,
            background: backgroundGradient2("100%"),
            ease: "sine.inOut",
            duration: 1,
          },
          "splitStart" + `+=${0.05 * i}`
        );

        // Subsequent animations for remaining panels
        tl.current.to(
          panel,
          {
            rotation: (12 * ROTATION_COEF - (i + 1) * ROTATION_COEF) / 1.2 + 810,
            duration: 5,
            background: backgroundGradient2("100%"),
            ease: "linear",
          },
          ">"
        );

        tl.current.to(
          panel,
          {
            y: height - ((12 - i) * elHeight) / 2,
            x: 0 - elWidth * 1.2,
            rotation: (12 * ROTATION_COEF - (i + 1) * ROTATION_COEF) / 1.2 + 1180,
            ease: "sine.inOut",
            duration: 1,
            background: backgroundGradient2("100%"),
          },
          ">"
        );

        tl.current.to(
          panel,
          {
            rotation: (12 * ROTATION_COEF - (i + 1) * ROTATION_COEF) / 1.2 + 1200,
            duration: 5,
            background: backgroundGradient2("100%"),
            ease: "linear",
          },
          ">"
        );

        tl.current.to(
          panel,
          {
            y: `+=${elHeight * 4}`,
            x: `-=${elWidth * 4}`,
            rotation: (12 * ROTATION_COEF - (i + 1) * ROTATION_COEF) / 1.2 + 1500,
            ease: "sine.inOut",
            duration: 1,
            background: backgroundGradient2("100%"),
          },
          ">"
        );
      }
    });
    
    // Calculate the actual duration of the panel animations
    const loopDuration = tl.current.duration(); 

    // Explicitly set the text/button elements to their final stable state for the loop
    tl.current.to(textCalloutRef.current, { left: "50%", duration: 0.01 }, loopDuration); // Only setting left
    tl.current.to(startBtnRef.current, { opacity: 1, scale: 1, y: -50, duration: 0.01 }, loopDuration);
    
    // Start the timeline after all animations are added
    tl.current.play(0); 

  }, [calculateDimensions, windowSize, navigate]);


  

  
  // 5. useLayoutEffect for initial setup and window resize listener
  useLayoutEffect(() => {
    // Initial timeline setup
    addItemsToTimeline();

    // Resize handler function
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);

    const handleMove = (e: MouseEvent) => handleMouseMove(e);
    window.addEventListener("mousemove", handleMove);

    // Cleanup function for event listener
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener("mousemove", handleMove);
      tl.current.kill(); 
      exitTl.current.kill();
    };
  }, [addItemsToTimeline, handleStart, calculateDimensions, handleMouseMove]);

  // 6. JSX Markup
  return (
    <>
      <div className="bg" ref={bgRef}>
        {/* Render Panel 1s */}
        {Array.from({ length: NUMBER_OF_PANELS }).map((_, i) => (
          <div key={`p1-${i}`} className="panel panel1"></div>
        ))}
        {/* Render Panel 2s */}
        {Array.from({ length: NUMBER_OF_PANELS }).map((_, i) => (
          <div key={`p2-${i}`} className="panel panel2"></div>
        ))}
      </div>

      {/* White flash overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-white z-50 pointer-events-none opacity-0"
      />

      {/* CALLOUT (H1) - Modified Text Structure for new layout */}
      <h1 
        className="callout absolute top-[0%] left-1/2 transform -translate-x-1/2 **-translate-y-[10vh]** z-20"
        ref={textCalloutRef}
      >
        <div className="w-[60vw] text-center leading-none font-extrabold">
            
            {/* Multi-line text with offsets and specific colors */}
            <p className="text-[6vw] font-extrabold text-[#d3f971] text-left w-[20vw] leading-none">
                Welcome to the
            </p>
            <p className="text-[6vw] font-extrabold text-[#4b917d] text-left w-[20vw] leading-none pl-[6vw]">
                end of the semester.
            </p>
            <p className="text-[6vw] font-extrabold text-white text-left w-[45vw] leading-none">
                Ready for your
            </p>
            <p className="text-[6vw] font-extrabold text-[#ee209c] text-left w-[45vw] leading-none pl-[6vw]">
                Fall 2025
            </p>
            <p className="text-[6vw] font-extrabold text-[#ee209c] text-right w-[50vw] leading-none">
                Wrapped?
            </p>
        </div>
      </h1>

      {/* --- START BUTTON (Modified) --- */}
      <div
        className="
          absolute 
          bottom-[12vh] sm:bottom-10 
          w-full flex justify-center z-20
          px-4
        "
      >
<button
  ref={startBtnRef}
  onClick={handleStart}
  className={`start-button 
    // 🚀 MODIFICATIONS HERE 🚀
    px-6 py-3 text-lg // Reduced padding and text size for mobile
    sm:px-8 sm:py-4 sm:text-xl // Reduced padding and text size for small screens and up
    rounded-full font-bold border-2 transition-all duration-500 z-30
    bg-black text-[#d3f971] border-[#d3f971] hover:bg-[#d3f971] hover:text-black
  `}
>
  {/* Button text is now permanently 'Start' */}
  Start
</button>
      </div>
    </>
  );
};

export default Intro;