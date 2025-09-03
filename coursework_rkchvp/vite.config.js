import { defineConfig } from 'vite';
import reactPlugin from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        reactPlugin()
    ],
    server: {
        port: 51735
    },
    build: {
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                'react-bootstrap'
            ]
        }
    }
});
