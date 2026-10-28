export const SOFA_COMBINATIONS = [
  '1+1 Sofa Set',
  '3+1+1 Sofa Set',
  '1+2+3 Sofa Set',
  '2+2 Sofa Set',
  '3+2 Sofa Set',
  'Single-Seater Sofa',
  'Double-Seater Sofa',
  'Three-Seater Sofa',
  'L-Shape Sofa',
  'U-Shape Sofa',
  'Recliner Sofa Set',
  'Sofa Cum Bed'
] as const;

export type SofaCombination = typeof SOFA_COMBINATIONS[number];

export const DINING_COMBINATIONS = [
  '2-Seater Dining Set',
  '4-Seater Dining Set',
  '6-Seater Dining Set',
  '8-Seater Dining Set',
  'Dining Table + Chairs'
] as const;

export type DiningCombination = typeof DINING_COMBINATIONS[number];

export interface ColorOption {
  name: string;
  hex: string;
}

export const FURNITURE_COLORS: ColorOption[] = [
  { name: 'Ivory Cream', hex: '#F5F2EB' },
  { name: 'Warm Beige', hex: '#D9CEB8' },
  { name: 'Oatmeal', hex: '#EBE5DA' },
  { name: 'Warm Taupe', hex: '#B3A293' },
  { name: 'Charcoal Grey', hex: '#374151' },
  { name: 'Midnight Black', hex: '#1C1917' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Cognac Brown', hex: '#8E5E3B' },
  { name: 'Walnut Brown', hex: '#5C4033' },
  { name: 'Tan Leather', hex: '#A77044' },
  { name: 'Emerald Green', hex: '#1B4D3E' },
  { name: 'Forest Green', hex: '#4F5E4D' },
  { name: 'Olive Green', hex: '#6B7A58' },
  { name: 'Navy Blue', hex: '#1E3A5F' },
  { name: 'Royal Blue', hex: '#2B4C7E' },
  { name: 'Slate Blue', hex: '#4B6584' },
  { name: 'Champagne Gold', hex: '#D4AF37' },
  { name: 'Mustard Ochre', hex: '#E5A93C' },
  { name: 'Rust Terracotta', hex: '#B7410E' },
  { name: 'Burgundy Wine', hex: '#671D28' },
  { name: 'Dusty Rose', hex: '#C98A8F' },
  { name: 'Sage Green', hex: '#9CAF88' },
];

export function getColorHex(colorName: string): string {
  if (!colorName) return '#B88E52';
  const clean = colorName.toLowerCase().trim();
  const found = FURNITURE_COLORS.find(
    (c) => c.name.toLowerCase() === clean || clean.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(clean)
  );
  if (found) return found.hex;

  // Keyword fallbacks
  if (clean.includes('white') || clean.includes('ivory')) return '#FDFBF7';
  if (clean.includes('black') || clean.includes('ebony')) return '#1C1917';
  if (clean.includes('cream') || clean.includes('oat')) return '#EBE5DA';
  if (clean.includes('beige')) return '#D9CEB8';
  if (clean.includes('grey') || clean.includes('gray') || clean.includes('charcoal')) return '#3B4856';
  if (clean.includes('brown') || clean.includes('cognac') || clean.includes('tan') || clean.includes('wood')) return '#8E5E3B';
  if (clean.includes('green') || clean.includes('emerald') || clean.includes('forest') || clean.includes('sage') || clean.includes('olive')) return '#4F5E4D';
  if (clean.includes('blue') || clean.includes('navy')) return '#1E3A5F';
  if (clean.includes('gold') || clean.includes('mustard') || clean.includes('yellow')) return '#D4AF37';
  if (clean.includes('red') || clean.includes('rust') || clean.includes('burgundy') || clean.includes('wine')) return '#671D28';

  return '#B88E52';
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  combination?: string;
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
  selectedCombination?: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  combination?: string;
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
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paidAt?: string;
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
  customerAddress?: string;
  customerPinCode?: string;
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
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayWebhookSecret?: string;
  paymentsEnabled?: boolean;
}

export interface InstagramReel {
  id: string;
  title: string;
  caption?: string;
  instagramUrl: string; // e.g. https://www.instagram.com/luxeupho_shops/ or direct reel link
  videoUrl?: string; // direct mp4/webm stream for instant high-fps playback
  thumbnailUrl: string;
  likes?: string;
  views?: string;
  duration?: string;
  badge?: string; // e.g. "NEW REEL", "ATELIER", "CRAFT"
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
}
