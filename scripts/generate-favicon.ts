import sharp from "sharp";
import path from "path";
import fs from "fs";

const src = path.resolve(__dirname, "../public/logo.jpg");
const out = path.resolve(__dirname, "../public");

async function main() {
  if (!fs.existsSync(src)) {
    console.error("logo.jpg not found at", src);
    process.exit(1);
  }

  // 16x16 PNG
  await sharp(src)
    .resize(16, 16, { fit: "cover" })
    .png()
    .toFile(path.join(out, "favicon-16x16.png"));
  console.log("✓ favicon-16x16.png");

  // 32x32 PNG
  await sharp(src)
    .resize(32, 32, { fit: "cover" })
    .png()
    .toFile(path.join(out, "favicon-32x32.png"));
  console.log("✓ favicon-32x32.png");

  // Apple touch icon 180x180
  await sharp(src)
    .resize(180, 180, { fit: "cover" })
    .png()
    .toFile(path.join(out, "apple-touch-icon.png"));
  console.log("✓ apple-touch-icon.png");

  // favicon.ico — embed as 32x32 PNG inside an ICO container
  // ICO format: 6-byte header + 16-byte dir entry + PNG data
  const pngBuf = await sharp(src)
    .resize(32, 32, { fit: "cover" })
    .png()
    .toBuffer();

  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);  // reserved
  icoHeader.writeUInt16LE(1, 2);  // type: 1 = icon
  icoHeader.writeUInt16LE(1, 4);  // image count

  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(32, 0);      // width (0 = 256, 32 = 32)
  dirEntry.writeUInt8(32, 1);      // height
  dirEntry.writeUInt8(0, 2);       // color count (0 = no palette)
  dirEntry.writeUInt8(0, 3);       // reserved
  dirEntry.writeUInt16LE(1, 4);    // color planes
  dirEntry.writeUInt16LE(32, 6);   // bits per pixel
  dirEntry.writeUInt32LE(pngBuf.length, 8);   // size of image data
  dirEntry.writeUInt32LE(6 + 16, 12);          // offset to image data

  const ico = Buffer.concat([icoHeader, dirEntry, pngBuf]);
  fs.writeFileSync(path.join(out, "favicon.ico"), ico);
  console.log("✓ favicon.ico");

  console.log("\nDone — all favicon files written to /public/");
}

main().catch((err) => { console.error(err); process.exit(1); });
