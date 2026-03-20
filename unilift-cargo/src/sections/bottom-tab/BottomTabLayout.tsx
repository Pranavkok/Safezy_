'use client';

import React, { useEffect, useState } from 'react';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import BottomTab from './BottomTab';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { DisableTextSelection } from '@/utils/disableTextSelection';
import { StatusBar } from '@capacitor/status-bar';

const BottomTabLayout = ({ children }: { children: React.ReactNode }) => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const [safeAreaTop, setSafeAreaTop] = useState('0px');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSafeAreaTop(
        getComputedStyle(document.documentElement).getPropertyValue('--sat')
      );
    }
  }, []);

  useEffect(() => {
    let showListener: PluginListenerHandle | undefined;
    let hideListener: PluginListenerHandle | undefined;

    if (Capacitor.isNativePlatform()) {
      DisableTextSelection.apply();
      StatusBar.show();
      SplashScreen.hide();

      // Add keyboard listeners
      Keyboard.addListener('keyboardWillShow', () =>
        setIsKeyboardOpen(true)
      ).then(listener => (showListener = listener));

      Keyboard.addListener('keyboardWillHide', () =>
        setIsKeyboardOpen(false)
      ).then(listener => (hideListener = listener));
    }

    // Cleanup listeners on unmount
    return () => {
      showListener?.remove();
      hideListener?.remove();
    };
  }, []);

  if (Capacitor.getPlatform() === 'web') {
    return children;
  }

  return (
    <div
      suppressHydrationWarning
      className={`${!isKeyboardOpen && 'h-[calc(100vh-100px)]'}  overflow-hidden mt-[${safeAreaTop}]`}
    >
      <div suppressHydrationWarning className="h-full overflow-scroll relative">
        {children}
      </div>
      {!isKeyboardOpen && <BottomTab />}
    </div>
  );
};

export default BottomTabLayout;
