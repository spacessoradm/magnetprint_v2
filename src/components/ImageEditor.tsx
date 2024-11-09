import React, { useState, useCallback } from 'react';
import { RotateCw, Crop } from 'lucide-react';

interface ImageEditorProps {
  image: string;
  originalImage: string;
  onUpdate: (editedImage: string) => void;
  onRecrop: () => void;
  maxWidth: number;
  maxHeight: number;
  isPuzzle?: boolean;
}

export default function ImageEditor({ 
  image, 
  onUpdate, 
  onRecrop,
  maxWidth, 
  maxHeight,
  isPuzzle 
}: ImageEditorProps) {
  const [rotation, setRotation] = useState(0);

  const applyEdits = useCallback((newRotation: number) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let targetWidth = img.width;
      let targetHeight = img.height;
      
      const aspectRatio = img.width / img.height;
      const targetAspectRatio = maxWidth / maxHeight;

      if (aspectRatio > targetAspectRatio) {
        targetWidth = maxWidth;
        targetHeight = maxWidth / aspectRatio;
      } else {
        targetHeight = maxHeight;
        targetWidth = maxHeight * aspectRatio;
      }

      if (newRotation % 180 === 0) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      } else {
        canvas.width = targetHeight;
        canvas.height = targetWidth;
      }

      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Center the image
        ctx.translate(canvas.width / 2, canvas.height / 2);
        
        // Rotate
        ctx.rotate((newRotation * Math.PI) / 180);
        
        // Draw image centered
        ctx.drawImage(
          img,
          -targetWidth / 2,
          -targetHeight / 2,
          targetWidth,
          targetHeight
        );

        // Reset transformation
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        onUpdate(canvas.toDataURL('image/png', 1.0));
      }
    };

    img.src = image;
  }, [image, maxWidth, maxHeight, onUpdate]);

  const handleRotate = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    applyEdits(newRotation);
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
        <img
          src={image}
          alt="Preview"
          className="w-full h-auto object-contain"
        />
        <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-2">
          {maxWidth}mm x {maxHeight}mm
        </div>
        {isPuzzle && (
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border border-white border-opacity-50" />
            ))}
          </div>
        )}
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handleRotate}
            className="p-2 bg-gray-100 rounded-md hover:bg-gray-200"
            title="Rotate"
          >
            <RotateCw className="h-5 w-5" />
          </button>
          
          <button
            onClick={onRecrop}
            className="p-2 bg-gray-100 rounded-md hover:bg-gray-200"
            title="Re-crop"
          >
            <Crop className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
