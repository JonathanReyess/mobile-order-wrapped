import { motion } from "framer-motion";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopy: () => void;
  copied: boolean;
}

export const UploadModal = ({
  isOpen,
  onClose,
  onCopy,
  copied,
}: UploadModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-6 rounded-lg w-full max-w-sm shadow-lg relative"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-lg"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-xl text-black font-semibold mb-3">
          How to Export Receipts
        </h2>

        <div className="mb-4 p-3 border-l-4 border-yellow-400 bg-yellow-100 text-sm text-gray-800 rounded">
          ⚠️ <strong>IMPORTANT:</strong> This process requires a desktop or
          laptop and the <strong>Outlook App</strong>.
        </div>

        <p className="text-sm text-gray-700 mb-3">
          <strong>Your Privacy Matters:</strong> This app <strong>never</strong>{" "}
          reads your entire mailbox.
        </p>

        <p className="text-sm text-gray-700 mb-2">
          1) <strong>Search & Filter:</strong> Paste this into the Outlook
          search bar:
        </p>

        <div className="flex items-center space-x-2 mb-4">
          <input
            readOnly
            value={`from:mobileorder@transactcampus.com AND received>=2025-08-18 AND received<=2025-12-8`}
            className="flex-1 border border-gray-300 bg-white text-gray-900 px-2 py-1 rounded text-sm font-mono shadow-sm"
          />
          <button
            onClick={onCopy}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition min-w-[72px]"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <p className="text-sm text-gray-700 mb-1">
          2) <strong>Load All:</strong> Scroll down in search results until all
          receipts load.
        </p>
        <p className="text-sm text-gray-700 mb-1">
          3) <strong>Select All:</strong> Press Ctrl+A (PC) or ⌘+A (Mac).
        </p>
        <p className="text-sm text-gray-700">
          4) <strong>Drag & Drop:</strong> Drag selected emails onto this page.
        </p>
      </motion.div>
    </div>
  );
};
