#!/usr/bin/env node
import * as esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'

// Function to delete a file if it exists
function deleteFileIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    console.log(`Deleted: ${filePath}`)
  }
}

// Delete specific files before build
const filesToDelete = [
  './extension/App.js',
  './extension/App.css',
  './extension/nostr-tools.js',
]
filesToDelete.forEach(deleteFileIfExists)

// Ensure the output directory exists
if (!fs.existsSync('./extension')) {
  fs.mkdirSync('./extension', { recursive: true })
}

// Build function
esbuild.build({
  bundle: true,
  minify: true,
  sourcemap: false,
  treeShaking: true,
  outdir: './extension',
  legalComments: 'none',
  entryPoints: {
    'App': './src/App.js',
    'nostr-tools': './src/nostr-tools.js'
  },
})
.then(() => console.log('Build success.'))
.catch((error) => {
  console.error('Build failed: ', error)
  process.exit(1)
})