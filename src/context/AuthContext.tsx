import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface AdminUserData {
  username: string;
  role: string;
  loginTime: string;
}

interface AuthContextType {
  user: User | null;
  adminUser: AdminUserData | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithServerAuth: (username: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = [
  'rayanali5698@gmail.com',
  'luxeuphohomeinteriors@gmail.com'
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUserData | null>(() => {
    try {
      const saved = localStorage.getItem('luxeupho_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('luxeupho_admin_token'));
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Check token validity on boot
  useEffect(() => {
    const token = localStorage.getItem('luxeupho_admin_token');
    if (token) {
      fetch('/api/admin-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.valid) {
            setIsAdmin(true);
          } else {
            // Token expired or invalid
            localStorage.removeItem('luxeupho_admin_token');
            localStorage.removeItem('luxeupho_admin_user');
            setIsAdmin(false);
            setAdminUser(null);
          }
        })
        .catch(() => {
          // If server is temporarily restarting, keep session if token exists
          setIsAdmin(true);
        });
    }
  }, []);

  const checkAdminStatus = async (currentUser: User | null) => {
    if (localStorage.getItem('luxeupho_admin_token')) {
      setIsAdmin(true);
      return;
    }
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }

    if (currentUser.email && ADMIN_EMAILS.includes(currentUser.email.toLowerCase())) {
      setIsAdmin(true);
      try {
        await setDoc(doc(db, 'admins', currentUser.uid), {
          email: currentUser.email,
          role: 'super_admin',
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn('Could not update admin doc:', e);
      }
      return;
    }

    try {
      const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
      setIsAdmin(adminDoc.exists());
    } catch {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      await checkAdminStatus(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Secure Server-Side Authentication
  // Never exposes passwords in frontend code: verified at POST /api/admin-login
  const loginWithServerAuth = async (username: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: pass.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        localStorage.setItem('luxeupho_admin_token', data.token);
        localStorage.setItem('luxeupho_admin_user', JSON.stringify(data.user));
        setIsAdmin(true);
        setAdminUser(data.user);
        return { success: true };
      }

      return {
        success: false,
        message: data.message || 'Invalid administrator username or password.',
      };
    } catch (error: any) {
      console.error('Server auth error:', error);
      return {
        success: false,
        message: 'Could not connect to authentication server. Please try again.',
      };
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      await checkAdminStatus(result.user);
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      await checkAdminStatus(result.user);
    } catch (error) {
      console.error('Email sign in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn(e);
    }
    localStorage.removeItem('luxeupho_admin_token');
    localStorage.removeItem('luxeupho_admin_user');
    localStorage.removeItem('luxeupho_admin_session');
    setIsAdmin(false);
    setAdminUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        adminUser,
        isAdmin,
        loading,
        loginWithServerAuth,
        loginWithGoogle,
        loginWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
