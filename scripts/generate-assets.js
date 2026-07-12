const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

function createCRC32(buf) {
  let crc = 0xFFFFFFFF;
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeB, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(createCRC32(crcData));
  return Buffer.concat([len, typeB, data, crc]);
}

function makePNG(width, height, pixels) {
  // pixels: flat Uint8Array RGBA (width * height * 4)
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Raw data: each row prefixed with filter byte (0 = None)
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter none
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * (1 + width * 4) + 1 + x * 4;
      raw[dst] = pixels[src];
      raw[dst + 1] = pixels[src + 1];
      raw[dst + 2] = pixels[src + 2];
      raw[dst + 3] = pixels[src + 3];
    }
  }

  const compressed = zlib.deflateSync(raw);
  const idat = chunk('IDAT', compressed);
  const iend = chunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, chunk('IHDR', ihdr), idat, iend]);
}

function fillRect(pixels, w, h, x1, y1, x2, y2, r, g, b, a) {
  for (let y = Math.max(0, y1); y < Math.min(h, y2); y++) {
    for (let x = Math.max(0, x1); x < Math.min(w, x2); x++) {
      const i = (y * w + x) * 4;
      pixels[i] = r;
      pixels[i + 1] = g;
      pixels[i + 2] = b;
      pixels[i + 3] = a;
    }
  }
}

function drawCircle(pixels, w, h, cx, cy, radius, r, g, b, a) {
  const r2 = radius * radius;
  for (let y = Math.max(0, cy - radius); y < Math.min(h, cy + radius); y++) {
    for (let x = Math.max(0, cx - radius); x < Math.min(w, cx + radius); x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) {
        const i = (y * w + x) * 4;
        pixels[i] = r;
        pixels[i + 1] = g;
        pixels[i + 2] = b;
        pixels[i + 3] = a;
      }
    }
  }
}

function drawMoon(pixels, w, h, cx, cy, radius, r, g, b, a) {
  const r2 = radius * radius;
  const offset = radius * 0.15;
  for (let y = Math.max(0, cy - radius); y < Math.min(h, cy + radius); y++) {
    for (let x = Math.max(0, cx - radius); x < Math.min(w, cx + radius); x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) {
        // Cut a circle out of the right side
        const dx2 = x - (cx + offset);
        if (dx2 * dx2 + dy * dy > radius * 0.85 * radius * 0.85) {
          const i = (y * w + x) * 4;
          pixels[i] = r;
          pixels[i + 1] = g;
          pixels[i + 2] = b;
          pixels[i + 3] = a;
        }
      }
    }
  }
}

function drawText(pixels, w, h, text, x, y, size, r, g, b, a) {
  // Very simple bitmap font for digits and basic letters
  // Using a simple approach: draw as tiny dots
  // Since we can't render real fonts, skip text rendering
  // The splash text should just be decorative
}

function generateIcon() {
  const w = 512, h = 512;
  const pixels = new Uint8Array(w * h * 4);
  // Background
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 10; pixels[i + 1] = 10; pixels[i + 2] = 26; pixels[i + 3] = 255;
  }
  // Outer moon glow
  drawCircle(pixels, w, h, 256, 220, 115, 99, 102, 241, 180);
  // Moon crescent
  drawMoon(pixels, w, h, 256, 220, 100, 99, 102, 241, 255);
  // Inner moon
  drawMoon(pixels, w, h, 256, 225, 82, 129, 140, 248, 255);
  // Stars - tiny dots
  const stars = [[180,120],[320,110],[350,160],[150,180],[390,200],[170,280],[380,290],[200,150],[300,140]];
  for (const [sx, sy] of stars) {
    drawCircle(pixels, w, h, sx, sy, 3, 255, 255, 255, 200);
  }
  return makePNG(w, h, pixels);
}

function generateAdaptiveIcon() {
  const w = 1024, h = 1024;
  const pixels = new Uint8Array(w * h * 4);
  // Transparent background
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i + 3] = 0;
  }
  // Outer glow
  drawCircle(pixels, w, h, 512, 440, 210, 99, 102, 241, 120);
  // Moon
  drawMoon(pixels, w, h, 512, 440, 195, 99, 102, 241, 255);
  drawMoon(pixels, w, h, 512, 448, 160, 129, 140, 248, 255);
  // Stars
  const stars = [[360,250],[640,230],[680,290],[300,360],[780,400],[380,540],[760,560],[400,320],[600,280]];
  for (const [sx, sy] of stars) {
    drawCircle(pixels, w, h, sx, sy, 5, 255, 255, 255, 180);
  }
  return makePNG(w, h, pixels);
}

function generateSplash() {
  const w = 1284, h = 2778;
  const pixels = new Uint8Array(w * h * 4);
  // Background
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 10; pixels[i + 1] = 10; pixels[i + 2] = 26; pixels[i + 3] = 255;
  }
  // Large moon
  drawCircle(pixels, w, h, w / 2, h / 2 - 200, 200, 99, 102, 241, 140);
  drawMoon(pixels, w, h, w / 2, h / 2 - 200, 180, 99, 102, 241, 255);
  drawMoon(pixels, w, h, w / 2, h / 2 - 190, 145, 129, 140, 248, 255);
  // Stars
  const stars = [[400,500],[880,480],[940,550],[350,620],[980,660],[400,800],[900,820],[450,560],[830,520]];
  for (const [sx, sy] of stars) {
    drawCircle(pixels, w, h, sx, sy, 5, 255, 255, 255, 180);
  }
  return makePNG(w, h, pixels);
}

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

console.log('Generating assets...');
fs.writeFileSync(path.join(ASSETS_DIR, 'icon.png'), generateIcon());
console.log('Generated icon.png');
fs.writeFileSync(path.join(ASSETS_DIR, 'adaptive-icon.png'), generateAdaptiveIcon());
console.log('Generated adaptive-icon.png');
fs.writeFileSync(path.join(ASSETS_DIR, 'splash.png'), generateSplash());
console.log('Generated splash.png');
console.log('Done!');
