import packageJson from './package.json';
import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  manifestVersion: 3,
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    name: 'Navo',
    description: 'A clean visual bookmark workspace for your browser new tab.',
    version: packageJson.version,
    permissions: ['bookmarks', 'storage', 'favicon'],
    host_permissions: [
      'https://api.bing.com/*',
      'https://www.bing.com/*',
    ],
    chrome_url_overrides: {
      newtab: 'newtab.html',
    },
    icons: {
      16: '/icons/icon-16.png',
      48: '/icons/icon-48.png',
      128: '/icons/icon-128.png',
    },
  },
});
