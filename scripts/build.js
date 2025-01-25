import { copyFile } from 'fs/promises';
import { join } from 'path';

async function copyManifest() {
  try {
    await copyFile(
      join(process.cwd(), 'manifest.json'),
      join(process.cwd(), 'dist', 'manifest.json')
    );
    console.log('Manifest file copied successfully');
  } catch (error) {
    console.error('Error copying manifest:', error);
    process.exit(1);
  }
}

copyManifest(); 