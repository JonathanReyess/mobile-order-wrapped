import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this
import { useFileUpload } from "../hooks/useFileUpload";
import { UploadModal } from "../components/upload/UploadModal";
import { NotificationManager } from "../components/notifications/NotificationManager";
import { FileDropzone } from "../components/upload/FileDropzone";
import { LoadingButton } from "../components/ui/LoadingButton";

const UploadPage = () => {
  const navigate = useNavigate(); // Initialize navigation
  const {
    stats,
    files,
    error,
    loading,
    uploading,
    processing,
    progress,
    handleFiles,
    uploadFiles,
  } = useFileUpload();

  const [dragging, setDragging] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // 🚀 NAVIGATION LOGIC
  // When stats are ready, send the user to the /wrapped route
  useEffect(() => {
    if (stats) {
      navigate("/wrapped", { state: { stats } });
    }
  }, [stats, navigate]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
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

  return (
    <>
      <NotificationManager
        notifications={notifications}
        onDismiss={(id: number) =>
          setNotifications((prev) => prev.filter((n) => n.id !== id))
        }
      />

      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#003e7c] p-6"
        onDragOver={showInstructions ? handleDragOver : undefined}
        onDrop={showInstructions ? handleDrop : undefined}
        onDragLeave={showInstructions ? handleDragLeave : undefined}
      >
        <div className="absolute inset-0 opacity-70 bg-[url('/white-teexture-1920x1080-2.png')] bg-cover bg-center pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-md sm:max-w-lg md:max-w-xl flex flex-col items-center">
          <UploadModal
            isOpen={showInstructions}
            onClose={() => setShowInstructions(false)}
            onCopy={() => {
              navigator.clipboard.writeText(
                "from:mobileorder@transactcampus.com AND received>=2025-08-18 AND received<=2025-12-8"
              );
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            copied={copied}
          />

          <h1 className="text-5xl font-extrabold text-center mb-8 text-white font-[Manrope] tracking-tight leading-tight">
            Mobile Order Wrapped
          </h1>

          <button
            onClick={() => setShowInstructions(true)}
            className="bg-white text-[#003e7c] border border-gray-300 rounded-full w-64 py-3 text-base text-center font-bold font-sans shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg mb-6"
          >
            View Upload Instructions
          </button>

          <FileDropzone
            onFilesAdded={handleFiles}
            isDragging={dragging}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
          />

          {files.length > 0 && (
            <div className="mb-6 text-base font-medium text-gray-100 text-center animate-fadeIn">
              {files.length} {files.length === 1 ? "file" : "files"} ready to
              upload
            </div>
          )}

          <LoadingButton
            loading={loading}
            loadingText={uploading ? "Uploading..." : "Processing..."}
            onClick={uploadFiles}
          >
            Submit
          </LoadingButton>

          {/* Progress Bar Container */}
          <div className="w-64 bg-gray-200 rounded-full h-2 overflow-hidden mb-6 relative">
            {uploading ? (
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              ></div>
            ) : processing ? (
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 animate-shimmer"></div>
            ) : (
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: "0%" }}
              ></div>
            )}
          </div>

          {error && (
            <p className="mt-4 text-red-600 font-semibold text-center text-base">
              {error}
            </p>
          )}

          <p className="text-sm text-gray-100 mt-6 text-center">
            Questions or issues?{" "}
            <a
              href="https://docs.google.com/forms/..."
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

export default UploadPage;
