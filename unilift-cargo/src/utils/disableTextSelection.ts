// src/utils/DisableTextSelection.ts

import { Capacitor } from '@capacitor/core';

export class DisableTextSelection {
  static apply() {
    if (Capacitor.getPlatform() === 'ios') {
      // 1. CSS approach only - avoid interfering with touch events
      const style = document.createElement('style');
      style.innerHTML = `
        body {
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -khtml-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          cursor: default;
        }

        input, textarea {
          -webkit-user-select: text !important;
          user-select: text !important;
        }
      `;
      document.head.appendChild(style);

      // 2. Only prevent text selection event
      document.addEventListener('selectstart', e => {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      });
    } else if (Capacitor.getPlatform() === 'android') {
      const style = document.createElement('style');
      style.innerHTML = `
        body {
          -webkit-user-select: none !important;
          user-select: none !important;
        }

        input, textarea {
          -webkit-user-select: text !important;
          user-select: text !important;
        }
      `;
      document.head.appendChild(style);
    }
  }
}
