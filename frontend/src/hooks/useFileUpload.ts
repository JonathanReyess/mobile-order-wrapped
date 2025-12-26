import { useState, useCallback } from "react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const useFileUpload = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // 1. Validation Logic
  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const acceptedFiles = Array.from(newFiles).filter(
      (file) =>
        file.name.endsWith(".eml") ||
        file.name.endsWith(".msg") ||
        file.name.endsWith(".zip")
    );
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  // 2. Clear Files
  const clearFiles = useCallback(() => setFiles([]), []);

  // 3. Upload/Network Logic
  const uploadFiles = async () => {
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
        // @ts-ignore - axios type quirk
        onUploadProgress: (event: ProgressEvent) => {
          const percent = Math.round((event.loaded * 100) / (event.total || 1));
          setProgress(percent);
        },
      });

      setUploading(false);
      setProcessing(true);

      // Simulate the processing delay for UX
      setTimeout(() => {
        setProcessing(false);
        setStats(res.data);
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      console.error("❌ Backend error:", err?.response?.data || err.message);
      setError("Failed to upload files.");
      setUploading(false);
      setProcessing(false);
      setLoading(false);
    } finally {
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return {
    stats,
    files,
    error,
    loading,
    uploading,
    processing,
    progress,
    handleFiles,
    uploadFiles,
    clearFiles,
    setError,
  };
};
