import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    sveltekit(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@browsermt/bergamot-translator/worker/bergamot-translator-worker.wasm',
          dest: '_app/immutable/workers',
        },
        {
          src: 'node_modules/@browsermt/bergamot-translator/worker/bergamot-translator-worker.js',
          dest: '_app/immutable/workers',
        },
        {
          src: 'static/keun.svg',
          dest: '_app/immutable/assets',
        },
      ],
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {},
    },
  },
  optimizeDeps: {
    exclude: [
      '@radar-azdelta/svelte-datatable',
      '@browsermt/bergamot-translator',
      '@radar-azdelta/svelte-athena-search',
      // '@radar-azdelta-int/radar-svelte-components'
    ],
  },
})
