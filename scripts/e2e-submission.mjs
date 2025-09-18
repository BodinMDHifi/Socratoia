// End-to-end smoke test: login (credentials), then POST /api/submissions with a small JPEG
// Requires dev server running and admin/admin seeded.

const base = process.env.BASE_URL || 'http://localhost:3001';

class CookieJar {
  jar = new Map();
  addFrom(setCookieHeaders = []) {
    for (const line of setCookieHeaders) {
      const [pair] = line.split(';');
      const idx = pair.indexOf('=');
      if (idx > 0) {
        const k = pair.slice(0, idx).trim();
        const v = pair.slice(idx + 1).trim();
        this.jar.set(k, v);
      }
    }
  }
  header() {
    return [...this.jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  }
}

function tinyJpegBuffer() {
  // 1x1 pixel JPEG (white)
  const b64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEBAQEA8QDw8QDw8PDw8QEA8PDw8PFREWFhURFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBEQACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAAEBQIDBgEAB//EADoQAAEDAgMFBQYGAwAAAAAAAAEAAgMRBBIhMQVBUWFxBiKBkaGxEzJCUnKC0QXxFSNDYoOy/8QAGQEBAAMBAQAAAAAAAAAAAAAAAAECAwQF/8QAHREBAQACAgMBAAAAAAAAAAAAAAECEQMhAjFBYf/aAAwDAQACEQMRAD8A3+iiiigAooooAKKKKACiiigApJtV2w9qg2xw0kqj1mZ0nZxqGqv+oWv0W3aG3F1z5Qv3o8H3c2H0m1M6lLr0rCsVv7JkbkC6b+KkO3qNQAC0i3N4bQxk2Kf2l1zz6v3p8M7u7K9b7kWb1Qn8k7o8CkHj9zHsPpNppppNADRRRQAUUUUAFFFFABRRRQAUUUUAf/2Q==';
  return Buffer.from(b64, 'base64');
}

async function main() {
  const jar = new CookieJar();

  // 1) Get CSRF token
  const csrfRes = await fetch(`${base}/api/auth/csrf`, { method: 'GET' });
  jar.addFrom(csrfRes.headers.getSetCookie?.() || []);
  const csrf = await csrfRes.json();
  const csrfToken = csrf?.csrfToken;
  if (!csrfToken) throw new Error('No CSRF token');

  // 2) Sign in with credentials admin/admin
  const params = new URLSearchParams();
  params.set('csrfToken', csrfToken);
  params.set('email', 'admin');
  params.set('password', 'admin');
  params.set('callbackUrl', `${base}/`);
  const loginRes = await fetch(`${base}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: jar.header() },
    redirect: 'manual',
    body: params,
  });
  jar.addFrom(loginRes.headers.getSetCookie?.() || []);
  if (![200, 302].includes(loginRes.status)) {
    const t = await loginRes.text();
    throw new Error(`Login failed: ${loginRes.status} ${t}`);
  }

  // 3) Create multipart form with tiny JPEG
  const fd = new FormData();
  fd.set('exerciseId', '1');
  fd.set('answer', 'Voici mon schéma test.');
  const jpeg = tinyJpegBuffer();
  const file = new Blob([jpeg], { type: 'image/jpeg' });
  fd.set('image', file, 'test.jpg');

  const subRes = await fetch(`${base}/api/submissions`, {
    method: 'POST',
    headers: { Cookie: jar.header() },
    body: fd,
  });
  const json = await subRes.json();
  console.log('Submission status', subRes.status);
  console.log(JSON.stringify(json, null, 2));
  if (subRes.status !== 201) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
