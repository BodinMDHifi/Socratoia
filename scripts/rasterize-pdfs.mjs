// Batch rasterization of all PdfExercise rows to /public/pdf-images
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';

const prisma = new PrismaClient();

async function ensureDir(dir) { await fs.mkdir(dir, { recursive: true }); }

async function main() {
  console.log('[rasterize] starting in', process.cwd());
  const outDir = path.join(process.cwd(), 'public', 'pdf-images');
  await ensureDir(outDir);

  // Lazy-load heavy modules to improve error visibility
  console.log('[rasterize] loading pdfjs-dist…');
  const pdfjs = (await import('pdfjs-dist/legacy/build/pdf.js')).default;
  console.log('[rasterize] loading @napi-rs/canvas…');
  const { createCanvas } = await import('@napi-rs/canvas');

  // Configure worker for Node
  try {
    const req = eval('require');
    pdfjs.GlobalWorkerOptions.workerSrc = req.resolve('pdfjs-dist/legacy/build/pdf.worker.js');
  } catch (e) {
    console.warn('[rasterize] worker setup warn:', e?.message || e);
  }

  const all = await prisma.pdfExercise.findMany();
  console.log('[rasterize] pdf exercises:', all.length);
  let total = 0;
  for (const pdf of all) {
    console.log(`[rasterize] processing PDF #${pdf.id} ${pdf.title}`);
    const abs = path.join(process.cwd(), 'public', pdf.pdfPath.replace(/^\/+/, ''));
    const fileExists = await fs
      .access(abs)
      .then(() => true)
      .catch(() => false);
    if (!fileExists) {
      console.warn('[rasterize] missing file:', abs);
      continue;
    }
    const fileBuf = await fs.readFile(abs);
    const data = new Uint8Array(fileBuf.buffer, fileBuf.byteOffset, fileBuf.byteLength);
    const doc = await pdfjs.getDocument({ data }).promise;
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const vp0 = page.getViewport({ scale: 1.0 });
      const scale = Math.min(2.0, 1280 / vp0.width);
      const viewport = page.getViewport({ scale });
      const width = Math.ceil(viewport.width);
      const height = Math.ceil(viewport.height);
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
      const canvasFactory = {
        create(w, h) {
          const c = createCanvas(w, h);
          const context = c.getContext('2d');
          return { canvas: c, context };
        },
        reset(cnv, w, h) {
          if (cnv && typeof cnv === 'object') {
            cnv.width = w;
            cnv.height = h;
          }
        },
        destroy() {},
      };
      await page.render({ canvasContext: ctx, viewport, intent: 'print', canvasFactory }).promise;
      const fileName = `${pdf.id}-${p}.jpg`;
      const outPath = path.join(outDir, fileName);
      const jpg = canvas.toBuffer('image/jpeg', { quality: 0.85 });
      await fs.writeFile(outPath, jpg);
      const pubPath = `/pdf-images/${fileName}`;
      await prisma.pdfPageImage.upsert({
        where: { pdfExerciseId_pageNumber: { pdfExerciseId: pdf.id, pageNumber: p } },
        update: { imagePath: pubPath, width, height },
        create: { pdfExerciseId: pdf.id, pageNumber: p, imagePath: pubPath, width, height },
      });
      total++;
    }
  }
  console.log('[rasterize] done. Pages rasterized:', total);
}

main()
  .catch((e) => {
    console.error('[rasterize] error:', e);
    process.exit(1);
  })
  .finally(async () => {
    try { await prisma.$disconnect(); } catch {}
  });
