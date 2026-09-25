/**
 * Asset Production & Optimization Pipeline
 * Converts raw generated architectural photography and brand logos into
 * responsive, highly compressed WebP derivatives and favicons using Sharp.
 */

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const projectRoot = process.cwd();
const brainDir = 'C:/Users/wasee/.gemini/antigravity/brain/70f03cfe-9969-48bb-9303-749d32ebff36';

// Ensure target directories exist
const dirs = [
  'public/images/hero',
  'public/images/services',
  'public/images/projects',
  'public/images/brand',
];
for (const dir of dirs) {
  fs.mkdirSync(path.join(projectRoot, dir), { recursive: true });
}

console.log('🖼️  Starting SAAR Asset Optimization Pipeline...\n');

async function processAssets() {
  // 1. BRAND LOGO DERIVATIVES & FAVICONS
  console.log('1. Processing Brand Identity Assets & Favicon Suite...');
  const brandIconSrc = path.join(projectRoot, 'public/images/brand/logo-icon.png');
  const brandFullSrc = path.join(projectRoot, 'public/images/brand/logo-full.png');

  // WebP Logo Full
  await sharp(brandFullSrc)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 90, lossless: false })
    .toFile(path.join(projectRoot, 'public/images/brand/logo-full.webp'));
  console.log('  ✅ Generated public/images/brand/logo-full.webp');

  // WebP Logo Icon
  await sharp(brandIconSrc)
    .resize({ width: 512, withoutEnlargement: true })
    .webp({ quality: 90, lossless: false })
    .toFile(path.join(projectRoot, 'public/images/brand/logo-icon.webp'));
  console.log('  ✅ Generated public/images/brand/logo-icon.webp');

  // Favicons
  await sharp(brandIconSrc).resize(16, 16).png().toFile(path.join(projectRoot, 'public/favicon-16x16.png'));
  await sharp(brandIconSrc).resize(32, 32).png().toFile(path.join(projectRoot, 'public/favicon-32x32.png'));
  await sharp(brandIconSrc).resize(180, 180).png().toFile(path.join(projectRoot, 'public/apple-touch-icon.png'));
  await sharp(brandIconSrc).resize(192, 192).png().toFile(path.join(projectRoot, 'public/android-chrome-192x192.png'));
  // Standard 32x32 ico fallback
  await sharp(brandIconSrc).resize(32, 32).png().toFile(path.join(projectRoot, 'public/favicon.ico'));
  console.log('  ✅ Generated Favicon Suite (16x16, 32x32, 180x180, 192x192, favicon.ico)');

  // 2. HOMEPAGE HERO DERIVATIVES
  console.log('\n2. Processing Homepage Hero Visual...');
  const heroSrc = path.join(brainDir, 'hero_architectural_main_1790268239790.jpg');
  if (fs.existsSync(heroSrc)) {
    // Desktop Full (2400px wide)
    await sharp(heroSrc)
      .resize({ width: 2400, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join(projectRoot, 'public/images/hero/hero-architectural-main.webp'));

    // Tablet (1200px wide)
    await sharp(heroSrc)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join(projectRoot, 'public/images/hero/hero-architectural-main-md.webp'));

    // Mobile (640px wide)
    await sharp(heroSrc)
      .resize({ width: 640, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join(projectRoot, 'public/images/hero/hero-architectural-main-sm.webp'));

    console.log('  ✅ Generated responsive Hero WebP suite (2400w, 1200w, 640w)');
  } else {
    console.log('  ⚠️ Hero source file not found at:', heroSrc);
  }

  // 3. CORE SERVICE VISUALS
  console.log('\n3. Processing Core Service Visuals...');
  const interiorSrc = path.join(brainDir, 'service_interior_design_1790268268792.jpg');
  if (fs.existsSync(interiorSrc)) {
    await sharp(interiorSrc)
      .resize({ width: 1200, height: 900, fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(path.join(projectRoot, 'public/images/services/interior-design.webp'));
    console.log('  ✅ Generated public/images/services/interior-design.webp (1200x900 4:3)');
  }

  const turnkeySrc = path.join(brainDir, 'service_turnkey_contracting_1790268333349.jpg');
  if (fs.existsSync(turnkeySrc)) {
    await sharp(turnkeySrc)
      .resize({ width: 1200, height: 900, fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(path.join(projectRoot, 'public/images/services/turnkey-contracting.webp'));
    console.log('  ✅ Generated public/images/services/turnkey-contracting.webp (1200x900 4:3)');
  }

  console.log('\n🎉 Asset Optimization Complete!\n');
}

processAssets().catch((err) => {
  console.error('Fatal optimization error:', err);
  process.exit(1);
});
