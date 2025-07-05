#!/bin/bash

# Script to copy PDF.js worker to public directory
# Run this after npm install or when updating PDF.js

echo "📄 Setting up PDF.js worker..."

# Check if pdfjs-dist is installed
if [ ! -d "node_modules/pdfjs-dist" ]; then
    echo "❌ pdfjs-dist not found. Please run: npm install pdfjs-dist"
    exit 1
fi

# Copy the worker file
if [ -f "node_modules/pdfjs-dist/build/pdf.worker.min.mjs" ]; then
    cp "node_modules/pdfjs-dist/build/pdf.worker.min.mjs" "public/pdf.worker.min.js"
    echo "✅ PDF.js worker copied to public/pdf.worker.min.js"
else
    echo "❌ PDF.js worker file not found in node_modules/pdfjs-dist/build/"
    exit 1
fi

echo "🎉 PDF.js worker setup complete!"
