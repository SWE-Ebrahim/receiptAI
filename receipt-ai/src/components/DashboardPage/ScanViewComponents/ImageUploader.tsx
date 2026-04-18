import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
  onUpload: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG or PNG)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onUpload(file);
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

  return (
    <div className="space-y-4">
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
        {preview ? (
          <img
            src={preview}
            alt="Receipt preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">
              cloud_upload
            </span>
            <p className="text-on-surface font-medium mb-2">
              Drop receipt image here
            </p>
            <p className="text-on-surface-variant text-sm">
              or click to browse
            </p>
            <p className="text-on-surface-variant/60 text-xs mt-2">
              JPEG, PNG up to 10MB
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {preview && (
        <button
          onClick={() => setPreview(null)}
          className="w-full py-3 rounded-xl bg-surface-container text-on-surface font-medium hover:bg-surface-container-high transition-colors"
        >
          Remove Image
        </button>
      )}
    </div>
  );
};

export default ImageUploader;
