export default function SlideLayout({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <div
        className={`h-screen w-full flex items-center justify-center px-4 ${className}`}
      >
        <div className="w-full max-w-[450px] h-[600px] sm:h-[90vh] bg-white/10 backdrop-blur-md text-white rounded-3xl shadow-xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>
        </div>
      </div>
    );
  }
  