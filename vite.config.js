import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],

  // 프로덕션 빌드 시 console.log 및 debugger 자동 제거
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },

  // 빌드 최적화
  build: {
    // 프로덕션에서는 소스맵 제거 (보안)
    sourcemap: mode !== 'production',

    // 청크 크기 최적화 (캐싱 효율화)
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
        },
      },
    },
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
    headers: {
      // Firebase 팝업 로그인 허용
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
}))
