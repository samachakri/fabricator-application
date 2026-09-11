'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type SubscriptionTier = 'Standard' | 'Pro';

export interface CompanyBranding {
  companyName: string;
  tagline: string;
  logoType: 'icon' | 'custom_url';
  logoUrl: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  poweredByText: string;
  subscriptionTier: SubscriptionTier;
}

interface BrandingContextType {
  branding: CompanyBranding;
  updateBranding: (updates: Partial<CompanyBranding>) => void;
  toggleSubscriptionTier: () => void;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
}

const DEFAULT_BRANDING: CompanyBranding = {
  companyName: 'Apex uPVC Windows & Doors',
  tagline: 'Precision German Engineered Window Systems',
  logoType: 'icon',
  logoUrl: '',
  phone: '+91 98490 12345',
  email: 'sales@apexupvc.com',
  address: 'Plot 88, Automotive Park, Hyderabad, India',
  gstin: '36AAECP9921B1Z8',
  poweredByText: 'Powered by FabricatorPro Manufacturing Suite • ISO Certified Automation',
  subscriptionTier: 'Pro',
};

const STORAGE_KEY = 'fabricator_pro_branding_v1';

const BrandingContext = createContext<BrandingContextType | null>(null);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<CompanyBranding>(DEFAULT_BRANDING);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setBranding({ ...DEFAULT_BRANDING, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.warn('Failed to load branding from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(branding));
    } catch (e) {
      console.warn('Failed to save branding to localStorage', e);
    }
  }, [branding, isLoaded]);

  const updateBranding = (updates: Partial<CompanyBranding>) => {
    setBranding((prev) => ({ ...prev, ...updates }));
  };

  const toggleSubscriptionTier = () => {
    setBranding((prev) => ({
      ...prev,
      subscriptionTier: prev.subscriptionTier === 'Pro' ? 'Standard' : 'Pro',
    }));
  };

  const setSubscriptionTier = (tier: SubscriptionTier) => {
    setBranding((prev) => ({ ...prev, subscriptionTier: tier }));
  };

  return (
    <BrandingContext.Provider
      value={{
        branding,
        updateBranding,
        toggleSubscriptionTier,
        setSubscriptionTier,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}
