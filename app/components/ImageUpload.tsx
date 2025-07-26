"use client";

import { Camera, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import swal from "@/app/utils/swal";

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onImageUpload: (file: File) => Promise<void>;
  onImageRemove?: () => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageUpload,
  onImageRemove,
  isLoading = false,
  disabled = false,
  className = "",
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxSizeInMB = 5;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      swal.error(
        "Invalid file type",
        "Please upload a JPEG, PNG, WebP, or GIF image."
      );
      return false;
    }

    if (file.size > maxSizeInBytes) {
      swal.error(
        "File too large",
        `Please upload an image smaller than ${maxSizeInMB}MB.`
      );
      return false;
    }

    return true;
  };

  const handleFileSelect = async (file: File) => {
    if (!validateFile(file)) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      await onImageUpload(file);
    } catch (error) {
      console.error("Failed to upload image:", error);
      swal.error("Upload failed", "Failed to upload image. Please try again.");
      setPreviewUrl(currentImageUrl || null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isLoading) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (disabled || isLoading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = async () => {
    if (!onImageRemove) return;

    try {
      await onImageRemove();
      setPreviewUrl(null);
      swal.success("Image removed", "Profile image removed successfully", 2000);
    } catch (error) {
      console.error("Failed to remove image:", error);
      swal.error("Removal failed", "Failed to remove image. Please try again.");
    }
  };

  const triggerFileInput = () => {
    if (!disabled && !isLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isLoading}
      />

      {previewUrl || currentImageUrl ? (
        <div className="relative group">
          <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-600 shadow-lg">
            <Image
              src={previewUrl || currentImageUrl || ""}
              alt="Profile"
              width={200}
              height={200}
              className="w-full h-full object-cover"
            />
            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          {!disabled && !isLoading && (
            <div className="absolute top-0 right-0 flex gap-1">
              <button
                onClick={triggerFileInput}
                className="p-2 bg-violet-500 text-white rounded-full shadow-lg hover:bg-violet-600 transition-colors"
                title="Change image"
              >
                <Camera className="w-4 h-4" />
              </button>
              {onImageRemove && (
                <button
                  onClick={handleRemoveImage}
                  className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            w-32 h-32 mx-auto rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 
            flex flex-col items-center justify-center cursor-pointer transition-all duration-200
            hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20
            ${
              dragActive
                ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                : ""
            }
            ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-500"></div>
          ) : (
            <>
              <Upload className="w-6 h-6 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">
                Click or drag to upload
              </span>
            </>
          )}
        </div>
      )}

      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          JPEG, PNG, WebP or GIF (max 5MB)
        </p>
      </div>
    </div>
  );
};

export default ImageUpload;
