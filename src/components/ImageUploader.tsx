import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

interface ImageUploaderProps {
  maxWidth: number;
  maxHeight: number;
}

export default function ImageUploader({ maxWidth, maxHeight }: ImageUploaderProps) {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [croppedImage, setCroppedImage] = useState<string>('');
  const [showCropper, setShowCropper] = useState(false);
  const [puzzlePieces, setPuzzlePieces] = useState<string[]>([]);
  const cropperRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result as string);
        setCroppedImage('');
        setPuzzlePieces([]);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrop = () => {
    if (cropperRef.current) {
      const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas({
        width: maxWidth,
        height: maxHeight,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });

      const croppedImageURL = croppedCanvas.toDataURL('image/jpeg', 1.0);
      setCroppedImage(croppedImageURL);

      // Split image into 9 pieces
      const puzzlePieces = splitImageIntoPuzzlePieces(croppedCanvas);
      setPuzzlePieces(puzzlePieces);
      setShowCropper(false);  // Hide the cropper after confirming crop
    }
  };

  const splitImageIntoPuzzlePieces = (canvas: HTMLCanvasElement) => {
    const pieces: string[] = [];
    const ctx = canvas.getContext('2d');
    const pieceWidth = canvas.width / 3;
    const pieceHeight = canvas.height / 3;

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const pieceCanvas = document.createElement('canvas');
        pieceCanvas.width = pieceWidth;
        pieceCanvas.height = pieceHeight;
        const pieceCtx = pieceCanvas.getContext('2d');
        pieceCtx?.drawImage(
          canvas,
          col * pieceWidth, row * pieceHeight,
          pieceWidth, pieceHeight,
          0, 0,
          pieceWidth, pieceHeight
        );
        pieces.push(pieceCanvas.toDataURL('image/jpeg', 1.0));  // Convert to image data URL
      }
    }

    return pieces;
  };

  return (
    <div className="space-y-4">
      {!originalImage && !showCropper && (
        <div className="flex justify-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center w-full max-w-md p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 transition-colors"
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="mt-2 text-sm text-gray-600">Upload Image</span>
            <span className="mt-1 text-xs text-gray-400">Supports: JPG, PNG (Max 10MB)</span>
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      {showCropper && (
        <div className="relative">
          <Cropper
            ref={cropperRef}
            src={originalImage}
            style={{ height: 400, width: '100%' }}
            aspectRatio={maxWidth / maxHeight}
            guides={true}
            viewMode={1}
            dragMode="move"
            scalable={false}
            zoomable={false}
            cropBoxResizable={false}
            cropBoxMovable={true}
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <button
              onClick={handleCrop}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Confirm Crop
            </button>
          </div>
        </div>
      )}

      {croppedImage && !showCropper && (
        <div className="grid grid-cols-3 gap-2">
          {puzzlePieces.map((piece, index) => (
            <div key={index} className="relative">
              <img src={piece} alt={`Puzzle Piece ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
