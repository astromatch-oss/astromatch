const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal pure Node PNG generator
function createCosmicPNG(size) {
  const width = size;
  const height = size;

  // RGBA buffer (height rows, width * 4 bytes + 1 filter byte per row)
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const rOuter = width * 0.42;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background rounded box
      const cornerR = width * 0.22;
      const inBoxX = Math.abs(dx) < cx - cornerR || Math.abs(dy) < cy - cornerR ||
        (Math.hypot(Math.abs(dx) - (cx - cornerR), Math.abs(dy) - (cy - cornerR)) <= cornerR);

      if (!inBoxX) {
        // Transparent outside
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
        continue;
      }

      // Background cosmic dark navy #0D0F1D -> #18112D
      const gradT = (x + y) / (width + height);
      let r = Math.round(13 + gradT * 25);
      let g = Math.round(15 + gradT * 10);
      let b = Math.round(29 + gradT * 35);
      let a = 255;

      // Outer glowing constellation ring
      if (Math.abs(dist - rOuter) < width * 0.015) {
        r = Math.round(r * 0.3 + 124 * 0.7);
        g = Math.round(g * 0.3 + 58 * 0.7);
        b = Math.round(b * 0.3 + 237 * 0.7);
      }

      // Heart / Star shape
      // (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
      const hx = (x - cx) / (width * 0.28);
      const hy = -(y - cy + height * 0.03) / (height * 0.28);
      const heartEq = Math.pow(hx * hx + hy * hy - 0.75, 3) - hx * hx * Math.pow(hy, 3);

      if (heartEq <= 0.05 && heartEq >= -0.22) {
        // Cosmic gradient along heart stroke (Purple #7C3AED -> Pink #EC4899 -> Gold #F59E0B)
        const t = (hx + 1) / 2;
        r = Math.round(124 * (1 - t) + 236 * t);
        g = Math.round(58 * (1 - t) + 72 * t);
        b = Math.round(237 * (1 - t) + 153 * (1 - t) * t + 11 * t);
      }

      // Central star sparkle
      if (Math.abs(dx) < width * 0.018 && Math.abs(dy) < height * 0.09) {
        r = 253; g = 224; b = 71;
      }
      if (Math.abs(dy) < height * 0.018 && Math.abs(dx) < width * 0.09) {
        r = 253; g = 224; b = 71;
      }
      if (dist < width * 0.04) {
        r = 255; g = 255; b = 255;
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // PNG Construction
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4);
  data.copy(buf, 8);
  const crc = crc32(Buffer.concat([Buffer.from(type), data]));
  buf.writeUInt32BE(crc >>> 0, 8 + len);
  return buf;
}

// CRC32 implementation for PNG
function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }

  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const publicDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate standard icons
const icon192 = createCosmicPNG(192);
fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), icon192);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), icon192);

const icon512 = createCosmicPNG(512);
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), icon512);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512x512.png'), icon512);

console.log('✅ Successfully generated PWA PNG icons: 192x192, 512x512, apple-touch-icon.png');
