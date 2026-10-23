import React, { createContext, useContext, useEffect, useState } from 'react';
import { StoreSettings } from '../types';
import { INITIAL_SETTINGS } from '../data/initialData';
import { subscribeSettings, updateStoreSettings } from '../firebase/firestore';

interface SettingsContextType {
  settings: StoreSettings;
  updateSettings: (newSettings: StoreSettings) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsub = subscribeSettings((fetchedSettings) => {
      setSettings(fetchedSettings);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleUpdate = async (newSettings: StoreSettings) => {
    setSettings(newSettings);
    await updateStoreSettings(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings: handleUpdate, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
