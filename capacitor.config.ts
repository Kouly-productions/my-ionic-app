import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'my-app',
  webDir: 'dist',
  plugins: {
    Motion: {
      ios: {
        motion: true
      }
    }
  }
};

export default config;