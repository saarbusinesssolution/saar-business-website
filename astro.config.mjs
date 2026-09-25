// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

/**
 * Custom integration injecting /dev/components route strictly in development mode.
 * In production build (command === 'build'), this route is completely omitted from dist/.
 */
function devComponentPreview() {
  return {
    name: 'dev-component-preview',
    hooks: {
      /** @param {{ command: string; injectRoute: (route: { pattern: string; entrypoint: string }) => void }} options */
      'astro:config:setup': ({ command, injectRoute }) => {
        if (command === 'dev') {
          injectRoute({
            pattern: '/dev/components',
            entrypoint: './src/dev/ComponentPreview.astro',
          });
        }
      },
    },
  };
}

/**
 * Custom integration providing POST /api/enquiry handling during 'astro dev'
 */
function devEnquiryApi() {
  return {
    name: 'dev-enquiry-api',
    hooks: {
      /** @param {{ server: import('vite').ViteDevServer }} options */
      'astro:server:setup': ({ server }) => {
        server.middlewares.use(async (/** @type {any} */ req, /** @type {any} */ res, next) => {
          const url = req.url || '';
          if (url === '/api/enquiry' || url.startsWith('/api/enquiry?')) {
            if (req.method === 'POST') {
              try {
                const { handleEnquiryRequest } = await import('./src/lib/server/enquiry-handler.ts');
                const chunks = [];
                for await (const chunk of req) {
                  chunks.push(chunk);
                }
                const bodyBuffer = Buffer.concat(chunks);
                const protocol = req.headers['x-forwarded-proto'] || 'http';
                const host = req.headers['host'] || 'localhost:4321';
                const fullUrl = `${protocol}://${host}${url}`;

                const headers = new Headers();
                for (const [key, value] of Object.entries(req.headers)) {
                  if (value !== undefined) {
                    if (Array.isArray(value)) {
                      value.forEach((v) => headers.append(key, v));
                    } else {
                      headers.set(key, value);
                    }
                  }
                }

                const webReq = new Request(fullUrl, {
                  method: 'POST',
                  headers,
                  body: bodyBuffer,
                });

                const devEnv = {
                  RESEND_API_KEY: process.env.RESEND_API_KEY,
                  ENQUIRY_RECIPIENT_EMAIL: process.env.ENQUIRY_RECIPIENT_EMAIL || 'dev-inbox@saarbusiness.test',
                  ENQUIRY_SENDER_EMAIL: process.env.ENQUIRY_SENDER_EMAIL || 'dev-notifications@saarbusiness.test',
                  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
                  ENABLE_TEST_MOCK_DELIVERY: process.env.ENABLE_TEST_MOCK_DELIVERY || 'true',
                  NODE_ENV: 'development',
                };

                const webRes = await handleEnquiryRequest(webReq, devEnv);
                res.statusCode = webRes.status;
                webRes.headers.forEach((val, key) => {
                  res.setHeader(key, val);
                });
                const responseText = await webRes.text();
                res.end(responseText);
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Dev server internal error' }));
              }
            } else if (req.method === 'OPTIONS') {
              res.statusCode = 204;
              res.setHeader('Allow', 'POST, OPTIONS');
              res.end();
            } else {
              next();
            }
          } else {
            next();
          }
        });
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://saarbusiness.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    devComponentPreview(),
    devEnquiryApi(),
  ],
});

