import { Product } from '../types';

export interface FaqItem {
  id: string;
  question: string;
  alternateQueries: string[];
  keywords: string[];
  answer: string;
}

export const NERO_CONFIG = {
  botName: 'NERO',
  brandName: 'LEXUPHO',
  welcomeGreeting: "Hello! Welcome to LEXUPHO. I'm NERO, your shopping assistant. How can I help you today?",
  defaultWhatsAppPhone: '9704796170',
  supportEmail: 'luxeuphohomeinteriors@gmail.com',
  businessHours: '10:00 AM – 7:00 PM IST (Daily)',
};

export const SUGGESTED_QUESTIONS = [
  'How can I place an order?',
  'How can I track my order?',
  'What products do you sell?',
  'How can I check product prices?',
  'What payment methods are available?',
  'What is your return or exchange policy?',
  'How can I contact customer support?',
] as const;

export const NERO_FAQS: FaqItem[] = [
  {
    id: 'place-order',
    question: 'How can I place an order?',
    alternateQueries: [
      'how to order',
      'buy product',
      'purchasing items',
      'how can i buy',
      'how to checkout',
    ],
    keywords: ['place', 'order', 'buy', 'checkout', 'purchase', 'cart'],
    answer:
      'Placing an order at LEXUPHO is simple:\n1. Browse our collection in the "Furniture" catalog.\n2. Click any piece to view details and select your preferred finish or color.\n3. Click "Add to Cart" or "Buy Now".\n4. Enter your shipping address and complete secure payment with PhonePe, UPI, or Card.\nOur team will confirm your order and schedule white-glove delivery.',
  },
  {
    id: 'track-order',
    question: 'How can I track my order?',
    alternateQueries: [
      'track my order',
      'where is my order',
      'order status',
      'delivery tracking',
      'dispatch status',
    ],
    keywords: ['track', 'status', 'where', 'delivery', 'dispatch', 'courier', 'transit'],
    answer:
      'To track your order:\n1. If you have an Order ID, you can check its live status with our concierge.\n2. Connect directly with our dispatch team on WhatsApp with your Order ID for real-time live location and scheduled delivery updates.',
  },
  {
    id: 'products-sold',
    question: 'What products do you sell?',
    alternateQueries: [
      'what products do you sell',
      'what do you sell',
      'catalog',
      'collection',
      'categories',
      'furniture types',
    ],
    keywords: ['product', 'products', 'sell', 'items', 'catalog', 'category', 'categories', 'furniture', 'sofa', 'bed', 'dining', 'chair', 'storage'],
    answer:
      'LEXUPHO curates heirloom-quality luxury furniture and architectural home interiors, including:\n• Handcrafted Living Room Sofas & Sectionals\n• Wooden Platform Beds & Bedroom Suites\n• Solid Wood & Marble Dining Tables and Chairs\n• Mid-Century Sideboards, Credenzas & Storage Units\n• Designer Accent Armchairs and Loungers\n\nAll pieces are precision-crafted with seasoned hardwoods and premium upholstery.',
  },
  {
    id: 'check-prices',
    question: 'How can I check product prices?',
    alternateQueries: [
      'how can i check product prices',
      'product price',
      'pricing',
      'how much',
      'cost of items',
    ],
    keywords: ['price', 'prices', 'cost', 'rate', 'rates', 'pricing', 'inr', 'rupees'],
    answer:
      'All product prices are transparently displayed in Indian Rupees (INR) alongside each piece on our website. You can also filter the catalogue using the Price Range slider or type the name of any piece here to check its current price.',
  },
  {
    id: 'payment-methods',
    question: 'What payment methods are available?',
    alternateQueries: [
      'payment methods',
      'how to pay',
      'upi payment',
      'phonepe',
      'google pay',
      'credit card',
      'net banking',
    ],
    keywords: ['payment', 'pay', 'method', 'methods', 'upi', 'phonepe', 'gpay', 'card', 'razorpay', 'bank', 'cash'],
    answer:
      'We accept 100% secure online payments through Razorpay, supporting:\n• PhonePe, Google Pay, Paytm & all UPI Apps\n• Credit and Debit Cards (Visa, MasterCard, RuPay)\n• Net Banking across all major Indian banks\nAll transactions are encrypted with industry-standard 256-bit SSL.',
  },
  {
    id: 'return-policy',
    question: 'What is your return or exchange policy?',
    alternateQueries: [
      'return policy',
      'exchange policy',
      'can i return',
      'damaged item',
      'refund policy',
    ],
    keywords: ['return', 'exchange', 'policy', 'refund', 'damage', 'cancel', 'warranty'],
    answer:
      'Every LEXUPHO piece undergoes strict white-glove inspection prior to dispatch. We provide a 7-Day Resolution & Replacement Policy for any manufacturing flaws or transit imperfections. Please inspect your furniture upon delivery and notify our team within 7 days with photos.',
  },
  {
    id: 'customer-support',
    question: 'How can I contact customer support?',
    alternateQueries: [
      'contact customer support',
      'contact us',
      'help desk',
      'customer care',
      'phone number',
      'whatsapp support',
      'showroom location',
    ],
    keywords: ['contact', 'support', 'help', 'care', 'phone', 'call', 'email', 'number', 'whatsapp', 'reach', 'showroom'],
    answer:
      'Our dedicated concierge team is available daily from 10:00 AM to 7:00 PM IST:\n• Phone / WhatsApp: +91 9704796170\n• Email: luxeuphohomeinteriors@gmail.com\n• Showrooms: Mahbubnagar (Beside Model Basic High School) & Hyderabad (Al Hasnath Colony, Tolichowki).',
  },
];

export interface NeroResponse {
  text: string;
  matchedProducts?: Product[];
  showWhatsAppButton?: boolean;
}

export function processNeroQuery(
  rawQuery: string,
  products: Product[],
  whatsappPhone: string
): NeroResponse {
  const query = rawQuery.trim();
  const lower = query.toLowerCase();

  if (!query) {
    return {
      text: NERO_CONFIG.welcomeGreeting,
    };
  }

  // 1. Greetings
  const greetings = ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening', 'greetings'];
  const isGreeting = greetings.some((g) => lower === g || lower.startsWith(`${g} `) || lower.endsWith(` ${g}`));
  if (isGreeting) {
    return {
      text: "Hello! Welcome to LEXUPHO. I'm NERO, your luxury furniture assistant. I can help you explore our collections, check live prices, guide your checkout, or connect you with our design concierge.",
    };
  }

  // 2. Direct match against the 7 suggested questions or FAQs
  for (const faq of NERO_FAQS) {
    if (lower === faq.question.toLowerCase()) {
      return { text: faq.answer };
    }
    const hasAltMatch = faq.alternateQueries.some((alt) => lower.includes(alt) || alt.includes(lower));
    if (hasAltMatch) {
      return { text: faq.answer };
    }
  }

  // 3. Keyword-based FAQ matching
  for (const faq of NERO_FAQS) {
    const matchedCount = faq.keywords.filter((kw) => lower.includes(kw)).length;
    if (matchedCount >= 2) {
      return { text: faq.answer };
    }
  }

  // 4. Real LEXUPHO Product Search in Catalog
  if (products && products.length > 0) {
    const matchingProducts = products.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(lower);
      const catMatch = p.category.toLowerCase().includes(lower);
      const descMatch = (p.description || '').toLowerCase().includes(lower);
      return nameMatch || catMatch || descMatch;
    });

    if (matchingProducts.length > 0) {
      const topMatches = matchingProducts.slice(0, 3);
      const productLines = topMatches
        .map((p) => `• ${p.name} — ₹${p.price.toLocaleString('en-IN')} (${p.category})`)
        .join('\n');

      return {
        text: `Here are matching pieces from our LEXUPHO collection:\n\n${productLines}\n\nClick any item below to view photographs, dimensions, and finishes.`,
        matchedProducts: topMatches,
      };
    }
  }

  // 5. Fallback with direct WhatsApp contact
  const cleanPhone = (whatsappPhone || NERO_CONFIG.defaultWhatsAppPhone).replace(/\D/g, '');
  return {
    text: "I don't have that specific information right now. For personalized assistance, custom bespoke orders, or immediate inquiries, our concierge team is happy to assist you directly on WhatsApp.",
    showWhatsAppButton: true,
  };
}
