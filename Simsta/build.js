const fs = require('fs/promises');
const path = require('path');

const projectRoot = __dirname;
const outputDir = path.join(projectRoot, 'dist');
const ignoredEntries = new Set(['dist', 'node_modules']);

async function copyFile(sourcePath, targetPath) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.copyFile(sourcePath, targetPath);
}

async function copyDirectory(sourceDir, targetDir) {
  await fs.mkdir(targetDir, { recursive: true });

  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    if (ignoredEntries.has(entry.name)) {
      continue;
    }

    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
    } else if (entry.isFile()) {
      await copyFile(sourcePath, targetPath);
    }
  }
}

async function build() {
  await fs.rm(outputDir, { recursive: true, force: true });

  const entries = await fs.readdir(projectRoot, { withFileTypes: true });
  let copiedEntries = 0;

  await fs.mkdir(outputDir, { recursive: true });

  for (const entry of entries) {
    if (ignoredEntries.has(entry.name)) {
      continue;
    }

    const sourcePath = path.join(projectRoot, entry.name);
    const targetPath = path.join(outputDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
    } else if (entry.isFile()) {
      await copyFile(sourcePath, targetPath);
    }

    copiedEntries++;
  }

  console.log(`Built ${copiedEntries} top-level entries into ${outputDir}`);
}

build().catch(error => {
  console.error('Build failed:', error);
  process.exit(1);
});
