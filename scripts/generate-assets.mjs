import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const BANNER_SOURCE = path.join(ROOT, "src", "assets", "banner1.jpg");
const FAVICON_SOURCE = path.join(ROOT, "public", "favicon.png");

const POND_BACKGROUND = { r: 0x10, g: 0x23, b: 0x3d, alpha: 1 };

const formatKB = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

async function logOutput(relativePath) {
  const stat = await fs.stat(path.join(ROOT, relativePath));
  console.log(`[generate-assets] ${relativePath} -> ${formatKB(stat.size)}`);
}

async function generateBannerWebp() {
  const target = path.join("src", "assets", "banner1.webp");
  await sharp(BANNER_SOURCE)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 68 })
    .toFile(path.join(ROOT, target));
  await logOutput(target);
}

async function generateOgImage() {
  const target = path.join("public", "og-image.jpg");
  await sharp(BANNER_SOURCE)
    .resize(1200, 630, { fit: "cover" })
    .jpeg({ quality: 72 })
    .toFile(path.join(ROOT, target));
  await logOutput(target);
}

async function generatePaddedIcon(size) {
  const target = path.join("public", `icon-${size}.png`);
  const innerSize = Math.round(size * 0.9);
  const contained = await sharp(FAVICON_SOURCE)
    .resize(innerSize, innerSize, {
      fit: "inside",
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: POND_BACKGROUND,
    },
  })
    .composite([{ input: contained, gravity: "centre" }])
    .png()
    .toFile(path.join(ROOT, target));
  await logOutput(target);
}

async function main() {
  await fs.access(BANNER_SOURCE);
  await fs.access(FAVICON_SOURCE);
  await Promise.all([
    generateBannerWebp(),
    generateOgImage(),
    generatePaddedIcon(192),
    generatePaddedIcon(512),
  ]);
}

main().catch((error) => {
  console.error("[generate-assets] failed:", error);
  process.exitCode = 1;
});
