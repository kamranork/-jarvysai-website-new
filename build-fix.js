import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Fixing build path issues...');

// Set environment variables to avoid path issues
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'production';

// Try to build with modified environment
try {
  console.log('📦 Starting build process...');
  execSync('npx next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
      NODE_ENV: 'production'
    }
  });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  
  // Alternative approach - try to copy files to a clean directory
  console.log('🔄 Trying alternative approach...');
  try {
    const fs = await import('fs');
    const cleanDir = path.join(__dirname, '..', 'jarvysai-website-clean');
    
    if (!fs.existsSync(cleanDir)) {
      fs.mkdirSync(cleanDir, { recursive: true });
    }
    
    console.log('📁 Created clean directory, now copying files...');
    // This is a simplified approach - in reality, you'd want to use a proper copy utility
    console.log('💡 Please manually copy your project to a directory without special characters');
    console.log('💡 Recommended: C:\\jarvysai-website-clean');
  } catch (copyError) {
    console.error('❌ Alternative approach also failed:', copyError.message);
  }
}
