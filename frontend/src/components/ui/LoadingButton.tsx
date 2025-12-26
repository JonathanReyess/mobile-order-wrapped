import React from "react";

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading: boolean;
  loadingText: string;
}

export const LoadingButton = ({
  loading,
  loadingText,
  children,
  className,
  ...props
}: LoadingButtonProps) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className={`bg-[#032e56] text-white px-6 py-3 rounded-full w-64 text-base font-sans font-bold transition-transform duration-200 hover:scale-105 hover:shadow-lg mb-6 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
  >
    {loading ? (
      <div className="flex items-center space-x-2">
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
        <span className="text-base">{loadingText}</span>
      </div>
    ) : (
      children
    )}
  </button>
);
