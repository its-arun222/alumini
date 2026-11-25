import { createServer as createViteServer } from 'vite';
import app from './server/app';

const port = 3000;

// Dev / self-hosted only. On Vercel the API runs from api/index.ts and the
// frontend is served as static files from dist/.
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
});
app.use(vite.middlewares);

app.listen(port, '0.0.0.0', () => {
  console.log(`MAIT Alumni Ecosystem Server running at http://0.0.0.0:${port}`);
});
