import { copyFile, mkdir } from 'fs/promises';
import { join } from 'path';

async function copyFiles() {
  try {
    // Create dist directory if it doesn't exist
    await mkdir(join(process.cwd(), 'dist'), { recursive: true });
    
    // Create icons directory in dist
    await mkdir(join(process.cwd(), 'dist', 'icons'), { recursive: true });
    
    // Copy manifest
    await copyFile(
      join(process.cwd(), 'manifest.json'),
      join(process.cwd(), 'dist', 'manifest.json')
    );
    
    // Copy icon
    await copyFile(
      join(process.cwd(), 'icons', '128.png'),
      join(process.cwd(), 'dist', 'icons', '128.png')
    );
    
    console.log('Files copied successfully');
  } catch (error) {
    console.error('Error copying files:', error);
    process.exit(1);
  }
}

copyFiles(); 