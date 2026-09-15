import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.catalogo.erp',
  appName: 'CatalogoERP',
  webDir: 'out',
  server: {
    url: 'https://fernando-vendas.vercel.app/',
    cleartext: true
  }
};

export default config;