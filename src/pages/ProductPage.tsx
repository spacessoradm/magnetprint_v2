import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import ImageUploader from '../components/ImageUploader';
import MultiImageUploader from '../components/MultiImageUploader';
import { Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  // Find the product based on the id parameter from the URL
  const product = products.find(p => p.id === id);
  
  // Handle case when the product is not found
  if (!product) {
    return <div>Product not found</div>;
  }

  // Function to handle adding the product to the cart
  const handleAddToCart = () => {
    // Check if the required images are uploaded
    if (
      (product.type === 'set' && uploadedImages.length === 6) ||
      (product.type === 'puzzle' && uploadedImages.length === 1)
    ) {
      addToCart({
        productId: product.id,
        quantity,
        images: uploadedImages,
        price: product.price
      });
      navigate('/cart');
    } else {
      alert(`Items added successfully`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {/* Display product image */}
          <img
            src={product.image}
            alt={product.name}
            className="w-full rounded-lg shadow-lg"
          />
        </div>
        
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-2xl font-bold text-indigo-600">${product.price}</p>
          <p className="text-gray-600">{product.description}</p>
          
          {/* Quantity Controls */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Quantity:</span>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Image Upload Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Upload Your {product.type === 'set' ? 'Images' : 'Image'}</h3>
            {product.type === 'set' ? (
              <MultiImageUploader
                maxWidth={product.dimensions.width}
                maxHeight={product.dimensions.height}
                maxImages={6}
                onImagesUpdate={(images) => {
                  setUploadedImages(images);
                  console.log("Uploaded images:", images);  // For debugging: remove in production
                }}
              />
            ) : (
              <ImageUploader
                maxWidth={product.dimensions.width}
                maxHeight={product.dimensions.height}
                isPuzzle={product.type === 'puzzle'}
                onImageUpdate={(image) => {
                  setUploadedImages([image]);
                  console.log("Uploaded image:", image);  // For debugging: remove in production
                }}
              />
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add to Cart - ${(product.price * quantity).toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
