'use client';

import React, { useState, useRef, ReactElement, useEffect } from 'react';

interface FullScreenComponentProps {
  children: ReactElement<{
    handleFullScreen: () => void;
    isFullScreen: boolean;
  }>;
}

const FullScreenComponent: React.FC<FullScreenComponentProps> = ({
  children
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const fullScreenRef = useRef<HTMLDivElement | null>(null);

  // Detect iOS on component mount
  useEffect(() => {
    const checkIsIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    setIsIOS(checkIsIOS());
  }, []);

  const handleFullScreen = () => {
    if (isIOS) {
      // For iOS: toggle a CSS-based fullscreen mode
      setIsFullScreen(!isFullScreen);
    } else {
      // For non-iOS: use the standard Fullscreen API
      if (!isFullScreen) {
        fullScreenRef.current?.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  return (
    <div
      ref={fullScreenRef}
      className={`transition-all duration-300 ${
        isFullScreen
          ? isIOS
            ? 'fixed inset-0 z-50 bg-white w-screen h-screen overflow-auto'
            : 'p-4 bg-white'
          : ''
      }`}
    >
      {React.cloneElement(children, { handleFullScreen, isFullScreen })}
    </div>
  );
};

export default FullScreenComponent;
