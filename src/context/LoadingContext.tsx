
'use client';

import * as React from 'react';
import { createContext, useState, useContext, useCallback, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoader = useCallback(() => setIsLoading(true), []);
  const hideLoader = useCallback(() => setIsLoading(false), []);

  return (
    <LoadingContext.Provider value={{ isLoading, showLoader, hideLoader }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
