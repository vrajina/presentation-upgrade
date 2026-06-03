import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOTAL_SLIDES = 9;
const WIDTH = 1920;
const HEIGHT = 1080;
const PORT = 4195;
const OUTPUT = path.join(__dirname, 'presentation.pdf');

async function waitForServer(url, maxWait = 30000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise(r => setTimeout(r, 300));
    }
  }
  throw new Error('Server did not start in time');
}

async function main() {
  // 1. Build first
  console.log('🔨 Building project...');
  await new Promise((resolve, reject) => {
    const build = spawn('npx', ['astro', 'build'], {
      cwd: __dirname,
      shell: true,
      stdio: 'inherit',
    });
    build.on('close', code => code === 0 ? resolve() : reject(new Error(`Build failed with code ${code}`)));
  });

  // 2. Start preview server
  console.log('🌐 Starting preview server...');
  const server = spawn('npx', ['astro', 'preview', '--host', '127.0.0.1', '--port', String(PORT)], {
    cwd: __dirname,
    shell: true,
    stdio: 'pipe',
  });

  server.stderr.on('data', d => {
    const msg = d.toString();
    if (msg.includes('Error')) console.error('  Server:', msg.trim());
  });

  await waitForServer(`http://127.0.0.1:${PORT}/`);
  console.log(`  ✓ Server ready on port ${PORT}`);

  // 3. Launch browser
  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'shell',
    args: [`--window-size=${WIDTH},${HEIGHT}`, '--disable-gpu', '--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  // 4. Open presentation
  console.log('📂 Loading presentation...');
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle0', timeout: 60000 });
  // Wait for fonts and images
  await new Promise(r => setTimeout(r, 4000));

  // 5. Screenshot each slide
  const screenshots = [];
  for (let i = 0; i < TOTAL_SLIDES; i++) {
    console.log(`📸 Slide ${i + 1}/${TOTAL_SLIDES}...`);
    await page.evaluate((idx, total) => {
      const track = document.querySelector('.slides-track');
      track.style.transition = 'none';
      track.style.transform = `translateX(-${idx * 100}vw)`;
      // Update counter — must match current slide
      const cur = document.querySelector('.nav-counter-current');
      if (cur) cur.textContent = idx + 1;
      const tot = document.querySelector('.nav-counter-total');
      if (tot) tot.textContent = total;
      // Update progress bar
      const bar = document.querySelector('.nav-progress');
      if (bar) bar.style.width = `${((idx + 1) / total) * 100}%`;
      // Update nav buttons visibility
      const prev = document.querySelector('.nav-prev');
      const next = document.querySelector('.nav-next');
      if (prev) prev.classList.toggle('hidden', idx === 0);
      if (next) next.classList.toggle('hidden', idx === total - 1);
    }, i, TOTAL_SLIDES);
    await new Promise(r => setTimeout(r, 800));
    const screenshot = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT }
    });
    screenshots.push(screenshot);
  }

  // 6. Build PDF
  console.log('📄 Building PDF...');
  const pdfDoc = await PDFDocument.create();
  for (const screenshot of screenshots) {
    const image = await pdfDoc.embedPng(screenshot);
    const pageWidth = WIDTH * 0.5;
    const pageHeight = HEIGHT * 0.5;
    const pdfPage = pdfDoc.addPage([pageWidth, pageHeight]);
    pdfPage.drawImage(image, { x: 0, y: 0, width: pageWidth, height: pageHeight });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(OUTPUT, pdfBytes);

  // 7. Cleanup
  await browser.close();
  server.kill();
  console.log(`✅ Done! PDF saved: ${OUTPUT}`);
  console.log(`   ${TOTAL_SLIDES} slides, ${(pdfBytes.length / 1024 / 1024).toFixed(1)} MB`);
}

main().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
