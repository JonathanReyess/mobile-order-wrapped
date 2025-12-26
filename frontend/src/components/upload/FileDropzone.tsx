import React, { useRef } from "react";

interface FileDropzoneProps {
  onFilesAdded: (files: FileList | File[]) => void;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
}

export const FileDropzone = ({
  onFilesAdded,
  isDragging,
  onDragOver,
  onDrop,
  onDragLeave,
}: FileDropzoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`w-full p-8 rounded-lg text-center cursor-pointer transition mb-6 ${
        isDragging
          ? "border-2 border-blue-600 bg-blue-50"
          : "border-2 border-dashed border-blue-400 bg-blue-400/0 hover:bg-blue-400/40"
      }`}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
      onClick={() => fileInputRef.current?.click()}
    >
      <p className="text-base text-gray-100 font-medium">
        Drag and drop your <strong>.eml</strong>, <strong>.msg</strong> or{" "}
        <strong>.zip</strong> files here, or click to select files.
      </p>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept=".eml,.msg,.zip"
        onChange={(e) => e.target.files && onFilesAdded(e.target.files)}
      />
    </div>
  );
};
