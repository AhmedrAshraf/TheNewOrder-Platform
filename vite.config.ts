import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'stripe': ['@stripe/stripe-js', 'stripe'],
          'ui': ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    target: 'esnext',
    cssCodeSplit: true,
    reportCompressedSize: false
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@stripe/stripe-js', 'lucide-react']
  },
  esbuild: {
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    treeShaking: true
  },
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' https://images.unsplash.com https://cdn.prod.website-files.com https://air.io https://img1.wsimg.com https://graoadnysazrvqggmhfe.supabase.co https://static-00.iconduck.com https://www.addevice.io https://encrypted-tbn0.gstatic.com https://encrypted-tbn0.gstatic.com data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; connect-src 'self' http://localhost:8000 http://localhost:8200/api/send-email https://the-new-order-platform-server.vercel.app/api/send-email https://the-new-order-platform-server.vercel.app http://localhost:8200 https://the-new-order-platform-server.vercel https://api.stripe.com https://the-new-order-platform-server.vercel.app/api/create-checkout-session https://js.stripe.com https://graoadnysazrvqggmhfe.supabase.co; frame-src 'self' https://the-new-order-platform-server.vercel https://js.stripe.com https://hooks.stripe.com;"
    }
  }
});