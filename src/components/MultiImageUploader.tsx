import React, { useRef, useState } from 'react';
import { Upload, X, Crop } from 'lucide-react';
import Cropper from 'react-cropper';
import ImageEditor from './ImageEditor';
import 'cropperjs/dist/cropper.css';

interface MultiImageUploaderProps {
  maxWidth: number;
  maxHeight: number;
  maxImages: number;
}

export default function MultiImageUploader({ maxWidth, maxHeight, maxImages }: MultiImageUploaderProps) {
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [croppedImages, setCroppedImages] = useState<string[]>([]);
  const [currentCropIndex, setCurrentCropIndex] = useState<number | null>(null);
  const cropperRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection and validate files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = maxImages - croppedImages.filter(Boolean).length;
    const selectedFiles = files.slice(0, remainingSlots).filter(file => file.type.startsWith('image/'));

    // Validate file size and type (Example: max size of 5MB)
    const validFiles = selectedFiles.filter((file) => file.size <= 5 * 1024 * 1024); // 5MB limit
    if (selectedFiles.length !== validFiles.length) {
      alert('Some files are too large. Please upload files smaller than 5MB.');
    }

    // Convert files to base64 URLs
    Promise.all(
      validFiles.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      )
    ).then((results) => {
      setOriginalImages((prev) => [...prev, ...results]);
      setCroppedImages((prev) => [...prev, ...Array(results.length).fill('')]);
      setCurrentCropIndex(croppedImages.length);
    });
  };

  // Handle image cropping (Auto save cropped image)
  const handleCrop = () => {
    if (cropperRef.current && currentCropIndex !== null) {
      const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });

      const finalCanvas = document.createElement('canvas');
      const ctx = finalCanvas.getContext('2d');

      finalCanvas.width = croppedCanvas.width;
      finalCanvas.height = croppedCanvas.height;

      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(croppedCanvas, 0, 0);

        // Automatically save the cropped image (No confirmation required)
        setCroppedImages((prev) => {
          const newImages = [...prev];
          newImages[currentCropIndex] = finalCanvas.toDataURL('image/png', 1.0);
          return newImages;
        });
      }

      // Move to next image if available
      const nextIndex = originalImages.findIndex((_, i) => !croppedImages[i]);
      setCurrentCropIndex(nextIndex === -1 ? null : nextIndex);
    }
  };

  // Handle image update after editing
  const handleImageUpdate = (editedImage: string, index: number) => {
    setCroppedImages((prev) => {
      const newImages = [...prev];
      newImages[index] = editedImage;
      return newImages;
    });
  };

  // Remove image from both original and cropped lists
  const removeImage = (index: number) => {
    setOriginalImages((prev) => prev.filter((_, i) => i !== index));
    setCroppedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Upload button and remaining slots display */}
      {croppedImages.filter(Boolean).length < maxImages && !currentCropIndex && (
        <div className="flex justify-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center w-full max-w-md p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 transition-colors"
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="mt-2 text-sm text-gray-600">Upload Images</span>
            <span className="mt-1 text-xs text-gray-400">
              {maxImages - croppedImages.filter(Boolean).length} slots remaining
            </span>
          </button>
        </div>
      )}

      {/* File input field */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />

      {/* Cropper for the current image */}
      {currentCropIndex !== null && (
        <div className="space-y-4">
          <Cropper
            ref={cropperRef}
            src={originalImages[currentCropIndex]}
            style={{ height: 400, width: '100%' }}
            aspectRatio={1}  // Square aspect ratio
            guides={true}
            viewMode={1}
            dragMode="move"
            scalable={false}  // Disable scaling
            zoomable={true}  // Disable zooming
            cropBoxResizable={false}  // Disable resizing the crop box
            cropBoxMovable={true}  // Allow moving but not resizing
            ready={() => {
              cropperRef.current.cropper.setCropBoxData({
                width: 189,
                height: 189,
              });
            }}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Image {currentCropIndex + 1} of {originalImages.length}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  removeImage(currentCropIndex);
                  setCurrentCropIndex(null);
                }}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                onClick={handleCrop}
                className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Crop className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display cropped images in grid */}
      {croppedImages.filter(Boolean).length > 0 && currentCropIndex === null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {croppedImages.map((image, index) => (
            image && (
              <div key={index} className="relative">
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 z-10 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
                <ImageEditor
                  image={image}
                  originalImage={originalImages[index]}
                  onUpdate={(editedImage) => handleImageUpdate(editedImage, index)}
                  onRecrop={() => setCurrentCropIndex(index)}
                  maxWidth={maxWidth}
                  maxHeight={maxHeight}
                />
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
