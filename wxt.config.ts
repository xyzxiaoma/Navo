import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  manifestVersion: 3,
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    name: 'Navo',
    description: 'A clean visual bookmark workspace for your browser new tab.',
    version: '1.0.1',
    permissions: ['bookmarks', 'storage', 'favicon'],
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
