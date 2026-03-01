/**
 * generate-icons.js
 * Creates simple solid-color PNG icon files for the extension.
 * AMBER / YELLOW  #EAB308 — matches the 🟡 brand colour.
 * Run once: node generate-icons.js
 */
import zlib from "zlib";
import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── CRC-32 ────────────────────────────────────────
function buildCrcTable() {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++)
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
}
const CRC_TABLE = buildCrcTable();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++)
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// ── PNG chunk builder ─────────────────────────────
function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf  = Buffer.allocUnsafe(4);
  lenBuf.writeUInt32BE(data.length);
  const crcBuf  = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// ── Build PNG ─────────────────────────────────────
function makePng(size, r, g, b) {
  // IHDR  (13 bytes)
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0);   // width
  ihdr.writeUInt32BE(size, 4);   // height
  ihdr[8]  = 8;   // bit depth
  ihdr[9]  = 2;   // colour type = RGB truecolour
  ihdr[10] = 0;   // compression
  ihdr[11] = 0;   // filter
  ihdr[12] = 0;   // interlace

  // Raw scanlines: each row starts with filter-type byte 0 then RGB pixels
  const raw = Buffer.allocUnsafe(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    const rowOffset = y * (1 + size * 3);
    raw[rowOffset] = 0; // filter None
    for (let x = 0; x < size; x++) {
      const px = rowOffset + 1 + x * 3;
      raw[px]     = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
    }
  }

  const idat = zlib.deflateSync(raw, { level: 9 });

  const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    PNG_SIG,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ── Main ──────────────────────────────────────────
const dir = path.join(__dirname, "icons");
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

const SIZES = [16, 32, 48, 128];
// amber-500: #EAB308 → r=234, g=179, b=8
const [R, G, B] = [234, 179, 8];

for (const sz of SIZES) {
  const out = path.join(dir, `icon${sz}.png`);
  fs.writeFileSync(out, makePng(sz, R, G, B));
  console.log(`  ✓ icons/icon${sz}.png  (${sz}×${sz})`);
}
console.log("Done.");
