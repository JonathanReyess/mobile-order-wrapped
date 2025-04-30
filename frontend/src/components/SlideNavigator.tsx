export default function SlideNavigator({
  current,
  total,
  onNext,
  onPrev,
  setIsPlaying,
}: {
  current: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  setIsPlaying: (play: boolean) => void;
}) {
  return (
    <>
      {/* Navigation Buttons */}
      <div className="absolute bottom-[clamp(1rem,4vh,2rem)] inset-x-[clamp(1rem,4vw,2rem)] flex justify-center gap-[clamp(0.5rem,1vw,1.5rem)]">
        {["Prev", "Next"].map((label, i) => {
          const isPrev = i === 0;
          const disabled = isPrev ? current === 0 : current === total - 1;
          const onClick = () => {
            isPrev ? onPrev() : onNext();
            setIsPlaying(true);
          };
          return (
            <button
              key={label}
              onClick={onClick}
              disabled={disabled}
              className={`
                bg-white/20 hover:bg-white/40 text-white font-semibold
                text-[clamp(0.75rem,2vw,1rem)]
                px-[clamp(0.5rem,1.5vw,1.25rem)]
                py-[clamp(0.25rem,1vh,0.75rem)]
                rounded-lg disabled:opacity-40 transition
              `}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-[clamp(0.5rem,1.65vh,1rem)] inset-x-0 flex justify-center gap-[clamp(0.25rem,0.55vw,0.75rem)]">
        {Array.from({ length: total }).map((_, idx) => (
          <span
            key={idx}
            className={`
              inline-block
              w-[clamp(0.25rem,1vw,0.5rem)]
              h-[clamp(0.25rem,1vw,0.5rem)]
              rounded-full
              ${idx === current ? "bg-white" : "bg-white/40"}
            `}
          />
        ))}
      </div>
    </>
  );
}
