import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const brainDir = 'C:\\Users\\wasee\\.gemini\\antigravity\\brain\\70f03cfe-9969-48bb-9303-749d32ebff36';
const publicDir = path.resolve('public');

const sources = {
  commercial1: path.join(brainDir, 'commercial_interior_1_1790431545368.jpg'),
  residential1: path.join(brainDir, 'residential_interior_1_1790431560677.jpg'),
  restaurant1: path.join(brainDir, 'restaurant_interior_1_1790431579555.jpg'),
  turnkeyContracting: path.join(brainDir, 'service_turnkey_contracting_1790268333349.jpg'),
  interiorDesign: path.join(brainDir, 'service_interior_design_1790268268792.jpg'),
  heroMain: path.join(brainDir, 'hero_architectural_main_1790268239790.jpg'),
  courtyardCover: path.join(publicDir, 'images/projects/courtyard-villa/cover.webp'),
  courtyardGallery1: path.join(publicDir, 'images/projects/courtyard-villa/gallery-1.webp'),
  courtyardGallery2: path.join(publicDir, 'images/projects/courtyard-villa/gallery-2.webp'),
  serviceInterior: path.join(publicDir, 'images/services/interior-design.webp'),
  serviceTurnkey: path.join(publicDir, 'images/services/turnkey-contracting.webp'),
};

// Verify sources exist
for (const [key, p] of Object.entries(sources)) {
  if (!fs.existsSync(p)) {
    console.error(`Source not found: ${key} at ${p}`);
    process.exit(1);
  }
}

const targets = [
  // Commercial Demo
  {
    src: sources.commercial1,
    dest: path.join(publicDir, 'images/projects/commercial-demo/mj-coaters-cover.webp'),
    width: 1200,
    height: 750,
  },
  {
    src: sources.turnkeyContracting,
    dest: path.join(publicDir, 'images/projects/commercial-demo/mj-coaters-gallery-1.webp'),
    width: 1024,
    height: 768,
  },
  {
    src: sources.turnkeyContracting,
    dest: path.join(publicDir, 'images/projects/commercial-demo/jainam-group-cover.webp'),
    width: 1200,
    height: 750,
  },
  {
    src: sources.commercial1,
    dest: path.join(publicDir, 'images/projects/commercial-demo/jainam-group-gallery-1.webp'),
    width: 1024,
    height: 768,
  },
  {
    src: sources.serviceTurnkey,
    dest: path.join(publicDir, 'images/projects/commercial-demo/sbi-bank-cover.webp'),
    width: 1200,
    height: 750,
  },
  {
    src: sources.commercial1,
    dest: path.join(publicDir, 'images/projects/commercial-demo/sbi-bank-gallery-1.webp'),
    width: 1024,
    height: 768,
  },

  // Residential Demo
  {
    src: sources.residential1,
    dest: path.join(publicDir, 'images/projects/residential-demo/kk-group-cover.webp'),
    width: 1200,
    height: 750,
  },
  {
    src: sources.courtyardCover,
    dest: path.join(publicDir, 'images/projects/residential-demo/kk-group-gallery-1.webp'),
    width: 1024,
    height: 768,
  },
  {
    src: sources.courtyardGallery1,
    dest: path.join(publicDir, 'images/projects/residential-demo/sadguru-kripa-cover.webp'),
    width: 1200,
    height: 750,
  },
  {
    src: sources.interiorDesign,
    dest: path.join(publicDir, 'images/projects/residential-demo/sadguru-kripa-gallery-1.webp'),
    width: 1024,
    height: 768,
  },
  {
    src: sources.heroMain,
    dest: path.join(publicDir, 'images/projects/residential-demo/supriti-chs-cover.webp'),
    width: 1200,
    height: 750,
  },
  {
    src: sources.courtyardGallery2,
    dest: path.join(publicDir, 'images/projects/residential-demo/supriti-chs-gallery-1.webp'),
    width: 1024,
    height: 768,
  },

  // Hospitality Demo
  {
    src: sources.restaurant1,
    dest: path.join(publicDir, 'images/projects/hospitality-demo/ramdev-restaurant-cover.webp'),
    width: 1200,
    height: 750,
  },
  {
    src: sources.serviceInterior,
    dest: path.join(publicDir, 'images/projects/hospitality-demo/ramdev-restaurant-gallery-1.webp'),
    width: 1024,
    height: 768,
  },
  {
    src: sources.restaurant1,
    dest: path.join(publicDir, 'images/projects/hospitality-demo/apurva-baar-cover.webp'),
    width: 1200,
    height: 750,
  },
  {
    src: sources.interiorDesign,
    dest: path.join(publicDir, 'images/projects/hospitality-demo/apurva-baar-gallery-1.webp'),
    width: 1024,
    height: 768,
  },

  // Retail Demo
  {
    src: sources.commercial1,
    dest: path.join(publicDir, 'images/projects/retail-demo/bhoomi-mall-cover.webp'),
    width: 1200,
    height: 750,
  },
  {
    src: sources.turnkeyContracting,
    dest: path.join(publicDir, 'images/projects/retail-demo/bhoomi-mall-gallery-1.webp'),
    width: 1024,
    height: 768,
  },
];

async function main() {
  console.log(`Processing ${targets.length} demo images...`);

  for (const item of targets) {
    const dir = path.dirname(item.dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await sharp(item.src)
      .resize(item.width, item.height, { fit: 'cover' })
      .webp({ quality: 82 })
      .toFile(item.dest);

    console.log(`Generated: ${path.relative(publicDir, item.dest)} (${item.width}x${item.height})`);
  }

  console.log('All 18 demo images generated successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
