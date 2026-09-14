import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { handleGeminiChat, handleGenerateQuiz, handleGenerateNotes } from './src/api/gemini.ts';

function apiDevPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        const url = req.url.split('?')[0];

        if (url === '/api/health') {
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ status: 'ok', dev: true }));
        }

        if (req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk: Buffer) => {
            bodyStr += chunk.toString();
          });
          req.on('end', async () => {
            try {
              const body = bodyStr ? JSON.parse(bodyStr) : {};
              res.setHeader('Content-Type', 'application/json');

              if (url === '/api/gemini/chat') {
                const result = await handleGeminiChat(body);
                return res.end(JSON.stringify(result));
              }

              if (url === '/api/gemini/quiz') {
                const result = await handleGenerateQuiz(body);
                return res.end(JSON.stringify(result));
              }

              if (url === '/api/gemini/notes') {
                const result = await handleGenerateNotes(body);
                return res.end(JSON.stringify(result));
              }

              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Endpoint not found' }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Internal error' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), apiDevPlugin()],
    base: '/Smart-Student-Dashboard/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});


