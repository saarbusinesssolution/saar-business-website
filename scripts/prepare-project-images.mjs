import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const projectRoot = process.cwd();
const masterHeroPath = path.join(projectRoot, 'public/images/hero/hero-architectural-main.webp');
const targetDir = path.join(projectRoot, 'public/images/projects/courtyard-villa');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function prepareImages() {
  console.log('Processing project gallery images from master architectural asset (1376x768)...');

  // 1. Cover Image (16:10, 1200x750)
  const coverPath = path.join(targetDir, 'cover.webp');
  await sharp(masterHeroPath)
    .resize(1200, 750, { fit: 'cover', position: 'center' })
    .webp({ quality: 88, effort: 6 })
    .toFile(coverPath);
  console.log('✅ Generated cover.webp (1200x750)');

  // 2. Gallery 1: Focus on vertical fluted teak woodwork & courtyard transition (4:3, 1024x768)
  const gallery1Path = path.join(targetDir, 'gallery-1.webp');
  await sharp(masterHeroPath)
    .extract({ left: 350, top: 0, width: 1024, height: 768 })
    .webp({ quality: 88, effort: 6 })
    .toFile(gallery1Path);
  console.log('✅ Generated gallery-1.webp (1024x768)');

  // 3. Gallery 2: Focus on travertine stone flooring and living volume (4:3, 1024x768)
  const gallery2Path = path.join(targetDir, 'gallery-2.webp');
  await sharp(masterHeroPath)
    .extract({ left: 0, top: 0, width: 1024, height: 768 })
    .webp({ quality: 88, effort: 6 })
    .toFile(gallery2Path);
  console.log('✅ Generated gallery-2.webp (1024x768)');

  console.log('All project visual assets prepared successfully.');
}

prepareImages().catch((err) => {
  console.error('Error generating project assets:', err);
  process.exit(1);
});
