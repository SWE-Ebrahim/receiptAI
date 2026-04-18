import React, { useState, useRef } from 'react';

interface PDFUploaderProps {
  onUpload: (file: File) => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleProcess = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-outline-variant hover:border-primary/50'
          }`}
          style={{ aspectRatio: '3/4' }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">
              picture_as_pdf
            </span>
            <p className="text-on-surface font-medium mb-2">
              Drop PDF receipt here
            </p>
            <p className="text-on-surface-variant text-sm">
              or click to browse
            </p>
            <p className="text-on-surface-variant/60 text-xs mt-2">
              PDF up to 10MB
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-container-low p-6 space-y-4">
          {/* File info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-4xl text-error">
                picture_as_pdf
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-on-surface font-medium truncate">
                {selectedFile.name}
              </p>
              <p className="text-on-surface-variant text-sm mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-on-surface-variant/60 text-xs mt-1">
                First page will be processed
              </p>
            </div>
            <button
              onClick={handleRemove}
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {/* Process button */}
          <button
            onClick={handleProcess}
            className="w-full py-3 rounded-xl bg-primary text-white font-medium shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">analytics</span>
            Process PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFUploader;
