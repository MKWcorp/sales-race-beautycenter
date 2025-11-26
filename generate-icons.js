const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const logoPath = path.join(__dirname, 'public', 'logo.png');
  
  // Check if logo exists
  if (!fs.existsSync(logoPath)) {
    console.error('❌ Logo not found at:', logoPath);
    process.exit(1);
  }

  console.log('📸 Generating icons from logo.png...');

  try {
    // Generate 192x192 icon
    await sharp(logoPath)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(__dirname, 'public', 'icon-192.png'));
    
    console.log('✅ Generated icon-192.png');

    // Generate 512x512 icon
    await sharp(logoPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(__dirname, 'public', 'icon-512.png'));
    
    console.log('✅ Generated icon-512.png');

    console.log('🎉 All icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
