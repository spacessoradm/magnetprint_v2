import React from 'react';
import { Link } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <ImageIcon className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">MagnetPrints</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}