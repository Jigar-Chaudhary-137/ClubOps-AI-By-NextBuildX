import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
<<<<<<< HEAD
        changeOrigin: true,
      },
    },
  },
=======
        changeOrigin: true
      }
    }
  }
>>>>>>> e0f1a22667099e4213ef11bc70c54c319f69a33c
});
