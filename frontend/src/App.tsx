import { useState, useRef, useEffect } from "react";
import axios from "axios";
import SlideShow from "./components/SlideShow";
import { motion, AnimatePresence } from "framer-motion";

const EmailStatsViewer = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [dragging, setDragging] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [copied, setCopied] = useState(false);
const [notifications, setNotifications] = useState<
  { id: number; message: React.ReactNode; timeLeft: number }[]
>([]);



  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const fileInputRef = useRef<HTMLInputElement>(null);
const showNotification = (message: React.ReactNode) => {

  const id = Date.now();
  const duration = 10; // seconds

  setNotifications((prev) => [...prev, { id, message, timeLeft: duration }]);

  // Decrease timeLeft every second
  const interval = setInterval(() => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, timeLeft: n.timeLeft - 1 } : n
      )
    );
  }, 1000);

  // Remove after duration
  setTimeout(() => {
    clearInterval(interval);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, duration * 1000);
};


const hasShownNotification = useRef(false);

useEffect(() => {
  if (!hasShownNotification.current) {
showNotification(
  <>
    <strong>New Update:</strong> .msg file support now works on Windows!
  </>
);


    hasShownNotification.current = true;
  }
}, []);


  const handleFiles = (newFiles: FileList | File[]) => {
    const acceptedFiles = Array.from(newFiles).filter((file) =>
      file.name.endsWith(".eml") || file.name.endsWith(".msg") || file.name.endsWith(".zip")
    );
    setFiles((prev) => [...prev, ...acceptedFiles]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragging(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please upload at least one .eml, .msg or .zip file.");
      return;
    }

    setError(null);
    setLoading(true);
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const res = await axios.post(`${BACKEND_URL}/upload_emls`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        // @ts-expect-error
        onUploadProgress: (event: ProgressEvent) => {
          const percent = Math.round((event.loaded * 100) / (event.total || 1));
          setProgress(percent);
        },
      });

      setUploading(false);
      setProcessing(true);

      setTimeout(() => {
        setProcessing(false);
        setStats(res.data);
        showNotification("✅ Upload successful! Stats ready.");
      }, 1000);
    } catch (err: any) {
      console.error("❌ Backend error:", err?.response?.data || err.message);
      setError("Failed to upload files.");
      setUploading(false);
      setProcessing(false);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

const notificationElements = (
  <div className="fixed top-4 right-4 space-y-2 z-50">
    <AnimatePresence>
      {notifications.map((n) => (
        <motion.div
          key={n.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white text-[#032e56] px-4 py-3 rounded-xl shadow-lg w-72 text-sm overflow-hidden group"
        >
          {/* Message */}
          <div className="pr-8">{n.message}</div>

<div className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-blue-600 group">
  {/* Circle countdown timer */}
  <svg viewBox="0 0 36 36" className="w-full h-full">
    <path
      className="text-gray-300"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      d="M18 2.0845
         a 15.9155 15.9155 0 0 1 0 31.831
         a 15.9155 15.9155 0 0 1 0 -31.831"
    />
<path
  className="text-blue-600 group-hover:opacity-0 transition-opacity duration-200"
  stroke="currentColor"
  strokeWidth="2"
  strokeDasharray="100"
  strokeDashoffset={`${100 - (n.timeLeft / 10) * 100}`}
  fill="none"
  style={{ transition: "stroke-dashoffset 1s linear" }}
  d="M18 2.0845
     a 15.9155 15.9155 0 0 1 0 31.831
     a 15.9155 15.9155 0 0 1 0 -31.831"
/>

    <text
      x="18"
      y="22"
      textAnchor="middle"
      fontSize="12"
      fill="#032e56"
      fontWeight="bold"
      className="group-hover:opacity-0 transition-opacity duration-200"
    >
      {n.timeLeft}
    </text>
  </svg>

  {/* SVG dismiss icon */}
  <button
    onClick={() =>
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== n.id)
      )
    }
    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110 cursor-pointer"
    aria-label="Dismiss notification"
  >
    <svg
      fill="#032e56"
      height="8px"
      width="8px"
      viewBox="0 0 460.775 460.775"
      xmlns="http://www.w3.org/2000/svg"
      className="translate-x-[8px]" // 👈 push only the SVG to the right
    >
      <path d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55 c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55 c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505 c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55 l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719 c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z" />
    </svg>
  </button>
</div>


        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);






  if (stats) {
    return (
      <>
        {notificationElements}
        <SlideShow stats={stats} />
      </>
    );
  }

  return (
    <>
      {notificationElements}
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#003e7c] p-6"
        onDragOver={showInstructions ? handleDragOver : undefined}
        onDrop={showInstructions ? handleDrop : undefined}
        onDragLeave={showInstructions ? handleDragLeave : undefined}
      >
        <div className="absolute inset-0 opacity-70 bg-[url('/white-teexture-1920x1080-2.png')] bg-cover bg-center pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-md sm:max-w-lg md:max-w-xl flex flex-col items-center">
          {/* Modal */}
          {showInstructions && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-lg w-full max-w-sm shadow-lg relative"
              >
                <button
                  onClick={() => setShowInstructions(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-black text-lg"
                  aria-label="Close"
                >
                  ✕
                </button>
                <h2 className="text-xl text-black font-semibold mb-3">How to Export Receipts</h2>

                <div className="mb-4 p-3 border-l-4 border-yellow-400 bg-yellow-100 text-sm text-gray-800 rounded">
                  ⚠️ This only works on a desktop or laptop <strong>with the Outlook app installed</strong>.
                </div>

                <p className="text-sm text-gray-700 mb-2">1) Open Outlook and paste this in the search bar:</p>
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    readOnly
                    value={`from:mobileorder@transactcampus.com AND received>=2024-08-26 AND received<=2025-04-23`}
                    className="flex-1 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-2 py-1 rounded text-sm font-mono shadow-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        "from:mobileorder@transactcampus.com AND received>=2025-01-07 AND received<=2025-04-28"
                      );
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition min-w-[72px]"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>

                <p className="text-sm text-gray-700 mb-1">2) Scroll to load all emails.</p>
                <p className="text-sm text-gray-700 mb-1">3) Ctrl+A (Windows) or ⌘+A (Mac) to select.</p>
                <p className="text-sm text-gray-700">4) Drag and drop them into this page.</p>
              </motion.div>
            </div>
          )}

          <h1 className="text-5xl font-extrabold text-center mb-8 text-white font-[Manrope] tracking-tight leading-tight">
            Mobile Order Wrapped
          </h1>

          <button
            onClick={() => setShowInstructions(true)}
            className="bg-white text-[#003e7c] border border-gray-300 rounded-full w-64 py-3 text-center font-bold font-sans shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg mb-6"
          >
            View Upload Instructions
          </button>

          <div
            className={`w-full p-8 rounded-lg text-center cursor-pointer transition mb-6 ${
              dragging
                ? "border-2 border-blue-600 bg-blue-50"
                : "border-2 border-dashed border-blue-400 bg-blue-400/0 hover:bg-blue-400/40"
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <p className="text-gray-100">
              Drag and drop your <strong>.eml</strong>, <strong>.msg</strong> or <strong>.zip</strong> files here,
              or click to select files.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept=".eml,.msg,.zip"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
          </div>

          {files.length > 0 && (
            <div className="mb-6 text-md font-medium text-gray-100 text-center animate-fadeIn">
              {files.length} {files.length === 1 ? "file" : "files"} ready to upload
            </div>
          )}

          <button
            onClick={handleUpload}
            className="bg-[#032e56] text-white px-6 py-3 rounded-full w-64 font-sans font-bold transition-transform duration-200 hover:scale-105 hover:shadow-lg mb-6 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>{uploading ? "Uploading..." : "Processing..."}</span>
              </div>
            ) : (
              "Submit"
            )}
          </button>

          <div className="w-64 bg-gray-200 rounded-full h-2 overflow-hidden mb-6 relative">
            {uploading ? (
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-200" style={{ width: `${progress}%` }}></div>
            ) : processing ? (
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 animate-shimmer"></div>
            ) : (
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: "0%" }}></div>
            )}
          </div>

          {error && <p className="mt-4 text-red-600 font-semibold text-center">{error}</p>}

          <p className="text-sm text-gray-100 mt-6 text-center">
            Questions or issues?{" "}
            <a
              href="mailto:wrappedmobileorder@gmail.com"
              className="text-blue-400 underline hover:text-blue-200 transition"
            >
              Contact us
            </a>
          </p>
                  </div>
                </div>
              </>
            );
          };

export default EmailStatsViewer;
