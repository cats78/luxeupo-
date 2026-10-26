import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, auth } from './config';
import { Product, Category, Banner, Order, Enquiry, StoreSettings } from '../types';
import { INITIAL_BANNERS, INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Recursively strips undefined fields so Firestore writes never fail with "Unsupported field value: undefined"
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
  const clean: any = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        clean[key] = sanitizeForFirestore(val);
      } else {
        clean[key] = val;
      }
    }
  }
  return clean;
}

// ---------------- PRODUCTS ---------------- //

export async function fetchProducts(): Promise<Product[]> {
  const path = 'products';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      seedInitialDatabaseIfEmpty().catch(console.error);
      return INITIAL_PRODUCTS;
    }
    const prods = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
    return prods.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  } catch (err) {
    console.warn('Fetch products returned error, using seed fallback', err);
    return INITIAL_PRODUCTS;
  }
}

export function subscribeProducts(
  onSuccess: (products: Product[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = 'products';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        seedInitialDatabaseIfEmpty().catch(console.error);
        onSuccess(INITIAL_PRODUCTS);
      } else {
        const prods = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
        prods.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        onSuccess(prods);
      }
    },
    (error) => {
      console.warn('Firestore products subscribe error, defaulting to fallback data', error);
      onSuccess(INITIAL_PRODUCTS);
      if (onError) onError(error);
    }
  );
}

export async function saveProduct(product: Partial<Product> & { id?: string }): Promise<string> {
  const path = 'products';
  const now = new Date().toISOString();
  const productId = product.id || doc(collection(db, path)).id;
  const docRef = doc(db, path, productId);

  const cleanData: Product = {
    id: productId,
    name: product.name || 'Bespoke Item',
    category: product.category || 'Living Room Furniture',
    subcategory: product.subcategory || '',
    description: product.description || '',
    price: Number(product.price) || 0,
    originalPrice: Number(product.originalPrice) || Number(product.price) || 0,
    images: Array.isArray(product.images) && product.images.length > 0
      ? Array.from(new Set(product.images.filter(Boolean)))
      : [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85'
      ],
    materials: Array.isArray(product.materials) ? product.materials : [],
    colors: Array.isArray(product.colors) ? product.colors : [],
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    stock: typeof product.stock === 'number' ? product.stock : 1,
    inStock: product.inStock !== false,
    isFeatured: Boolean(product.isFeatured),
    createdAt: product.createdAt || now,
    updatedAt: now,
  };

  const payload = sanitizeForFirestore(cleanData);

  try {
    // setDoc with { merge: true } ensures reliable saving whether updating an existing document or creating a new one
    await setDoc(docRef, payload, { merge: true });
    return productId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `products/${productId}`);
    throw error;
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getProductById(productId: string): Promise<Product | null> {
  const path = 'products';
  try {
    const docRef = doc(db, path, productId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Product;
    }
    const fallback = INITIAL_PRODUCTS.find((p) => p.id === productId);
    return fallback || null;
  } catch (error) {
    console.warn('getProductById error, checking fallback:', error);
    return INITIAL_PRODUCTS.find((p) => p.id === productId) || null;
  }
}

// ---------------- CATEGORIES ---------------- //

export function subscribeCategories(
  onSuccess: (categories: Category[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = 'categories';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        seedInitialDatabaseIfEmpty().catch(console.error);
        onSuccess(INITIAL_CATEGORIES);
      } else {
        const cats = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category));
        cats.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        onSuccess(cats);
      }
    },
    (error) => {
      console.warn('Firestore categories subscribe error, using fallback', error);
      onSuccess(INITIAL_CATEGORIES);
      if (onError) onError(error);
    }
  );
}

export async function saveCategory(category: Category): Promise<void> {
  const path = `categories/${category.id}`;
  try {
    const payload = sanitizeForFirestore(category);
    await setDoc(doc(db, 'categories', category.id), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const path = `categories/${categoryId}`;
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// ---------------- BANNERS ---------------- //

export function subscribeBanners(
  onSuccess: (banners: Banner[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = 'banners';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        seedInitialDatabaseIfEmpty().catch(console.error);
        onSuccess(INITIAL_BANNERS);
      } else {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Banner));
        items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        onSuccess(items);
      }
    },
    (error) => {
      console.warn('Firestore banners subscribe error, using fallback', error);
      onSuccess(INITIAL_BANNERS);
      if (onError) onError(error);
    }
  );
}

export async function saveBanner(banner: Banner): Promise<void> {
  const path = `banners/${banner.id}`;
  try {
    const payload = sanitizeForFirestore(banner);
    await setDoc(doc(db, 'banners', banner.id), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteBanner(bannerId: string): Promise<void> {
  const path = `banners/${bannerId}`;
  try {
    await deleteDoc(doc(db, 'banners', bannerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------- ORDERS ---------------- //

export async function createCustomerOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
  const path = 'orders';
  try {
    const payload = sanitizeForFirestore({
      ...orderData,
      createdAt: new Date().toISOString()
    });
    const docRef = await addDoc(collection(db, path), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export function subscribeOrders(
  onSuccess: (orders: Order[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = 'orders';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onSuccess(orders);
    },
    (error) => {
      console.error('Failed to subscribe to orders (requires admin):', error);
      if (onError) onError(error);
    }
  );
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  paymentStatus?: Order['paymentStatus']
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const updates: Record<string, any> = { status, updatedAt: new Date().toISOString() };
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
    }
    await updateDoc(doc(db, 'orders', orderId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ---------------- ENQUIRIES / SUPPORT ---------------- //

export async function submitEnquiry(enquiry: Omit<Enquiry, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const path = 'enquiries';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...enquiry,
      status: 'New',
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export function subscribeEnquiries(
  onSuccess: (enquiries: Enquiry[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = 'enquiries';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const enqs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Enquiry));
      enqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onSuccess(enqs);
    },
    (error) => {
      console.error('Failed to subscribe to enquiries (requires admin):', error);
      if (onError) onError(error);
    }
  );
}

export async function updateEnquiryStatus(enquiryId: string, status: Enquiry['status']): Promise<void> {
  const path = `enquiries/${enquiryId}`;
  try {
    await updateDoc(doc(db, 'enquiries', enquiryId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteEnquiry(enquiryId: string): Promise<void> {
  const path = `enquiries/${enquiryId}`;
  try {
    await deleteDoc(doc(db, 'enquiries', enquiryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------- STORE SETTINGS ---------------- //

export function subscribeSettings(
  onSuccess: (settings: StoreSettings) => void
): Unsubscribe {
  const docRef = doc(db, 'settings', 'store_config');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onSuccess(snapshot.data() as StoreSettings);
      } else {
        onSuccess(INITIAL_SETTINGS);
      }
    },
    (error) => {
      console.warn('Using default store settings:', error);
      onSuccess(INITIAL_SETTINGS);
    }
  );
}

export async function updateStoreSettings(settings: StoreSettings): Promise<void> {
  const path = 'settings/store_config';
  try {
    const payload = sanitizeForFirestore({
      ...settings,
      updatedAt: new Date().toISOString()
    });
    await setDoc(doc(db, 'settings', 'store_config'), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// ---------------- DATABASE SEEDING ---------------- //

export async function seedInitialDatabaseIfEmpty(): Promise<void> {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'store_config'));
    if (settingsDoc.exists() && (settingsDoc.data() as any)?.hasBeenSeeded) {
      return; // Already initialized; never overwrite admin edits or re-insert deleted items
    }

    // 1. Products: verify and ensure baseline products exist
    const productsSnap = await getDocs(collection(db, 'products'));
    if (productsSnap.empty) {
      for (const p of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', p.id), sanitizeForFirestore(p), { merge: true });
      }
    }

    // 2. Categories: verify and ensure baseline categories exist
    const categoriesSnap = await getDocs(collection(db, 'categories'));
    if (categoriesSnap.empty) {
      for (const c of INITIAL_CATEGORIES) {
        await setDoc(doc(db, 'categories', c.id), sanitizeForFirestore(c), { merge: true });
      }
    }

    // 3. Banners: verify and ensure baseline banners exist
    const bannersSnap = await getDocs(collection(db, 'banners'));
    if (bannersSnap.empty) {
      for (const b of INITIAL_BANNERS) {
        await setDoc(doc(db, 'banners', b.id), sanitizeForFirestore(b), { merge: true });
      }
    }

    // 4. Settings: record that seed is complete
    await setDoc(doc(db, 'settings', 'store_config'), sanitizeForFirestore({
      ...INITIAL_SETTINGS,
      hasBeenSeeded: true,
    }), { merge: true });
  } catch (err) {
    console.debug('Database seed check complete.', err);
  }
}
