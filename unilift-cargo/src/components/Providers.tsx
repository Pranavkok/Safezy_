'use client';

import React, { useEffect, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from '@capacitor/app';

const queryClient = new QueryClient();
const Providers = ({ children }: { children: ReactNode }) => {
  // Handle back button for mobile (Capacitor)
  useEffect(() => {
    const setupBackButtonHandler = async () => {
      await App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          App.exitApp();
        } else {
          window.history.back();
        }
      });
    };

    setupBackButtonHandler();

    return () => {
      App.removeAllListeners();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default Providers;
