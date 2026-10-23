export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  images: string[];
  materials?: string[];
  colors?: string[];
  sizes?: string[];
  stock: number;
  inStock: boolean;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image: string;
  subcategories: string[];
  sortOrder: number;
  isActive: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  badge?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  selectedMaterial?: string;
  selectedColor?: string;
  selectedSize?: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedMaterial?: string;
  selectedColor?: string;
  selectedSize?: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Pending Verification' | 'Paid & Verified' | 'Refunded';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt?: string;
  userId?: string;
}

export type EnquiryStatus = 'New' | 'In Progress' | 'Resolved';

export interface Enquiry {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  subject: string;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
}

export interface StoreSettings {
  id?: string;
  logoUrl: string;
  phone: string;
  email: string;
  announcement: string;
  freeShippingMin: number;
  address: string;
  updatedAt?: string;
  // Payment Gateway & Banking Details (Saved for future activation)
  paymentGatewayProvider?: string;
  upiId?: string;
  merchantName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  gatewayKeyId?: string;
  paymentsEnabled?: boolean;
}
