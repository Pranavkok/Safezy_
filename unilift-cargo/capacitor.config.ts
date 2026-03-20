import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.safezy.app',
  appName: 'Safezy',
  webDir: 'public', // Leave empty since there's no static export
  server: {
    url: 'http://192.168.29.192:3000', // Hosted Next.js app URL
    cleartext: true, // Optional: Only set to true if using HTTP during development
    allowNavigation: ['*.payu.in', 'secure.payu.in', 'api.payu.in']
  },
  // zoomEnabled: false,
  ios: {
    preferredContentMode: 'mobile',
    zoomEnabled: false,
    limitsNavigationsToAppBoundDomains: false
  },
  android: {},
  plugins: {
    SplashScreen: {
      launchAutoHide: false
    },
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#FF914DFF'
    }
  }
};

export default config;
