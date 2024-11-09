export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  type: 'set' | 'puzzle';
  dimensions: {
    width: number;
    height: number;
  };
}

export interface CartItem {
  productId: string;
  quantity: number;
  images: string[];
  price: number;
}

export interface DeliveryDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}