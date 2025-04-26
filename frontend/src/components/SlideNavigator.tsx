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
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
        <button
          onClick={() => {
            onPrev();
            setIsPlaying(true); // 👈 Force autoplay when prev clicked
          }}
          disabled={current === 0}
          className="bg-white/20 hover:bg-white/40 text-white font-bold py-2 px-4 rounded-l rounded-r disabled:opacity-40"
        >
          Prev
        </button>
        <button
          onClick={() => {
            onNext();
            setIsPlaying(true); // 👈 Force autoplay when next clicked
          }}
          disabled={current === total - 1}
          className="bg-white/20 hover:bg-white/40 text-white font-bold py-2 px-4 rounded-l rounded-r disabled:opacity-40"
        >
          Next
        </button>
      </div>
      <div className="absolute bottom-4 w-full flex justify-center gap-2">
        {Array.from({ length: total }).map((_, idx) => (
          <span
            key={idx}
            className={`inline-block w-2 h-2 rounded-full ${
              idx === current ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </>
  );
}
