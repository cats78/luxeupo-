import { Product, Category, Banner, StoreSettings } from '../types';

export const INITIAL_SETTINGS: StoreSettings = {
  logoUrl: 'https://i.ibb.co/B2ynSdJp/Luxeupho-Gold-Home-Interiors-Emblem.png',
  phone: '9704796170',
  email: 'luxeuphohomeinteriors@gmail.com',
  announcement: 'COMPLIMENTARY ARCHITECTURAL DESIGN CONSULTATION & WHITE-GLOVE PAN-INDIA INSTALLATION',
  freeShippingMin: 25000,
  address: 'LEXUPHO Flagship Gallery, High Street Luxury Boulevard',
};

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'banner-1',
    badge: 'PREMIUM FURNITURE COLLECTION',
    title: 'Luxury Living Starts Here',
    subtitle: 'Beautiful furniture. Timeless designs. For a home that feels like you.',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85',
    buttonText: 'Shop Now →',
    buttonLink: '#furniture-section',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'banner-2',
    badge: 'MODERN & ELEGANT',
    title: 'Furniture for Every Space',
    subtitle: 'Living Room | Bedroom | Dining | Storage — Carefully curated pieces for modern sanctuaries.',
    imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85',
    buttonText: 'Explore Collection →',
    buttonLink: '#furniture-section',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'banner-3',
    badge: 'OUR COLLECTION',
    title: 'Shop by Category',
    subtitle: 'Explore our carefully curated furniture for every space.',
    imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=2000&q=85',
    buttonText: 'View All →',
    buttonLink: '#categories-section',
    sortOrder: 3,
    isActive: true,
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-sofas',
    name: 'Sofas',
    slug: 'sofas',
    description: 'Modern curved sectionals, comfort loungers, and plush 3-seater sofas.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    subcategories: ['3-Seater Sofas', 'Sectionals', 'Chesterfields', 'Loveseats'],
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'cat-beds',
    name: 'Beds',
    slug: 'beds',
    description: 'Platform wooden king beds, tufted headboards, and master bedroom suites.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    subcategories: ['King Beds', 'Queen Beds', 'Storage Beds', 'Nightstands'],
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'cat-dining',
    name: 'Dining',
    slug: 'dining',
    description: 'Solid wood dining tables, Italian marble centerpieces, and curated chairs.',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
    subcategories: ['Dining Sets', 'Dining Tables', 'Dining Chairs', 'Bar Stools'],
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'cat-storage',
    name: 'Storage',
    slug: 'storage',
    description: 'Mid-century wooden sideboards, credenzas, and modular storage cabinets.',
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80',
    subcategories: ['Storage Cabinets', 'Sideboards', 'TV Units', 'Credenzas'],
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'cat-chairs',
    name: 'Chairs',
    slug: 'chairs',
    description: 'Ergonomic accent armchairs, couture loungers, and minimal reading chairs.',
    image: 'https://images.unsplash.com/photo-1580481077195-c9443e2646d2?auto=format&fit=crop&w=800&q=80',
    subcategories: ['Accent Chairs', 'Armchairs', 'Lounge Chairs', 'Ottomans'],
    sortOrder: 5,
    isActive: true,
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'modern-sofa',
    name: 'Modern Sofa',
    category: 'Sofas',
    subcategory: '3-Seater Sofas',
    description: 'A perfect blend of comfort and elegance. This modern sofa adds a touch of luxury to your living space with its premium fabric and sturdy build.',
    price: 24999,
    originalPrice: 32999,
    discountPercent: 24,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=85'
    ],
    materials: ['Premium Textured Fabric', 'Kiln-Dried Hardwood Frame', 'High-Density Foam'],
    colors: ['Oatmeal Cream', 'Midnight Charcoal', 'Cognac Tan', 'Forest Emerald'],
    sizes: ['3-Seater (84" W x 38" D x 32" H)', '4-Seater (98" W x 38" D x 32" H)'],
    stock: 8,
    inStock: true,
    isFeatured: true,
    createdAt: '2026-03-01T10:00:00.000Z'
  },
  {
    id: 'luxury-bed',
    name: 'Luxury Bed',
    category: 'Beds',
    subcategory: 'King Beds',
    description: 'Engineered for restorative sleep. Crafted with an upholstered channel headboard, solid oak frame, and noise-free acoustic slats.',
    price: 36999,
    originalPrice: 45999,
    discountPercent: 20,
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4570?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=85'
    ],
    materials: ['Solid European Oak', 'Belgian Linen Headboard', 'Reinforced Steel Support'],
    colors: ['Natural Oak / Warm Ivory', 'Smoked Walnut', 'Charcoal Grey'],
    sizes: ['King (78" x 72")', 'Queen (78" x 60")'],
    stock: 5,
    inStock: true,
    isFeatured: true,
    createdAt: '2026-03-02T10:00:00.000Z'
  },
  {
    id: 'dining-table-set',
    name: 'Dining Table Set',
    category: 'Dining',
    subcategory: 'Dining Sets',
    description: 'Solid hardwood dining table with 4 coordinating cushioned chairs. Finished with a natural oil polish that repels spills.',
    price: 29999,
    originalPrice: 38999,
    discountPercent: 23,
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1533779283484-8da7979bc658?auto=format&fit=crop&w=1200&q=85'
    ],
    materials: ['Solid Sheesham / Teak Wood', 'Ergonomic Cushion Seats', 'Brass Fasteners'],
    colors: ['Warm Teak', 'Dark Espresso', 'Natural Honey'],
    sizes: ['6-Seater (66" L x 36" W x 30" H)', '4-Seater (48" L x 36" W x 30" H)'],
    stock: 6,
    inStock: true,
    isFeatured: true,
    createdAt: '2026-03-03T10:00:00.000Z'
  },
  {
    id: 'storage-cabinet',
    name: 'Storage Cabinet',
    category: 'Storage',
    subcategory: 'Sideboards',
    description: 'Mid-century modern wooden sideboard featuring dual fluted sliding tambour doors and spacious interior shelving for media and dining ware.',
    price: 18999,
    originalPrice: 24999,
    discountPercent: 24,
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=85'
    ],
    materials: ['Solid Walnut Veneer', 'Solid Hardwood Legs', 'Soft-Close Hinges'],
    colors: ['Deep Walnut', 'Warm Caramel Oak'],
    sizes: ['54" W x 18" D x 30" H'],
    stock: 7,
    inStock: true,
    isFeatured: true,
    createdAt: '2026-03-04T10:00:00.000Z'
  },
  {
    id: 'accent-chair',
    name: 'Accent Chair',
    category: 'Chairs',
    subcategory: 'Accent Chairs',
    description: 'Sculptural barrel lounge chair tailored in soft textured weave fabric with solid tapered wooden legs.',
    price: 12999,
    originalPrice: 16999,
    discountPercent: 23,
    images: [
      'https://images.unsplash.com/photo-1580481077195-c9443e2646d2?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=85'
    ],
    materials: ['Heavy Weave Bouclé', 'Kiln-Dried Ash Wood', 'Molded Foam Core'],
    colors: ['Oatmeal Cream', 'Charcoal Slate', 'Rust Terracotta', 'Olive Green'],
    sizes: ['32" W x 33" D x 31" H'],
    stock: 12,
    inStock: true,
    isFeatured: true,
    createdAt: '2026-03-05T10:00:00.000Z'
  },
  {
    id: 'coffee-table',
    name: 'Coffee Table',
    category: 'Storage',
    subcategory: 'Coffee Tables',
    description: 'Fluted metallic pedestal coffee table with a circular honed top that adds contemporary architectural elegance to your living room.',
    price: 9999,
    originalPrice: 12999,
    discountPercent: 23,
    images: [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85'
    ],
    materials: ['Electroplated Spun Brass', 'Reinforced Weighted Base'],
    colors: ['Champagne Brass', 'Matte Black', 'Antique Bronze'],
    sizes: ['34" Diameter x 16" H'],
    stock: 10,
    inStock: true,
    isFeatured: true,
    createdAt: '2026-03-06T10:00:00.000Z'
  }
];
