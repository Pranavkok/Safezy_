'use client';
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}
const Overlay = ({ isOpen, onClose, className }: OverlayProps) => {
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Add styles to prevent scroll on body
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;

      // Cleanup function to restore scroll
      return () => {
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  return (
    <div
      aria-hidden={!isOpen}
      onClick={onClose}
      className={cn(
        'fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        className
      )}
      role="presentation"
    />
  );
};

export default Overlay;
