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

// ---------------- PRODUCTS ---------------- //

export async function fetchProducts(): Promise<Product[]> {
  const path = 'products';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      return INITIAL_PRODUCTS;
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
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
        onSuccess(INITIAL_PRODUCTS);
      } else {
        const prods = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
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
  try {
    if (product.id) {
      const docRef = doc(db, path, product.id);
      await updateDoc(docRef, {
        ...product,
        updatedAt: now
      });
      return product.id;
    } else {
      const newRef = doc(collection(db, path));
      const cleanData: Product = {
        id: newRef.id,
        name: product.name || 'Bespoke Item',
        category: product.category || 'Living Room Furniture',
        subcategory: product.subcategory || '',
        description: product.description || '',
        price: Number(product.price) || 0,
        originalPrice: Number(product.originalPrice) || Number(product.price) || 0,
        discountPercent: Number(product.discountPercent) || 0,
        images: product.images && product.images.length > 0 ? product.images : [
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85'
        ],
        materials: product.materials || [],
        colors: product.colors || [],
        sizes: product.sizes || [],
        stock: Number(product.stock) || 1,
        inStock: product.inStock !== false,
        isFeatured: Boolean(product.isFeatured),
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(newRef, cleanData);
      return newRef.id;
    }
  } catch (error) {
    handleFirestoreError(error, product.id ? OperationType.UPDATE : OperationType.CREATE, path);
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
    await setDoc(doc(db, 'categories', category.id), category);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const path = `categories/${categoryId}`;
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
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
    await setDoc(doc(db, 'banners', banner.id), banner);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
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
    const docRef = await addDoc(collection(db, path), {
      ...orderData,
      createdAt: new Date().toISOString()
    });
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
    await setDoc(doc(db, 'settings', 'store_config'), {
      ...settings,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ---------------- DATABASE SEEDING ---------------- //

export async function seedInitialDatabaseIfEmpty(): Promise<void> {
  // Only attempt writes if authenticated as admin to avoid permission-denied errors
  if (!auth.currentUser) {
    return;
  }
  try {
    const productsSnap = await getDocs(collection(db, 'products'));
    if (productsSnap.empty) {
      for (const p of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', p.id), p);
      }
    }

    const categoriesSnap = await getDocs(collection(db, 'categories'));
    if (categoriesSnap.empty) {
      for (const c of INITIAL_CATEGORIES) {
        await setDoc(doc(db, 'categories', c.id), c);
      }
    }

    const bannersSnap = await getDocs(collection(db, 'banners'));
    if (bannersSnap.empty) {
      for (const b of INITIAL_BANNERS) {
        await setDoc(doc(db, 'banners', b.id), b);
      }
    }

    const settingsDoc = await getDoc(doc(db, 'settings', 'store_config'));
    if (!settingsDoc.exists()) {
      await setDoc(doc(db, 'settings', 'store_config'), INITIAL_SETTINGS);
    }
  } catch (err) {
    // Non-fatal, suppress safely
    console.debug('Database seed check complete.');
  }
}
