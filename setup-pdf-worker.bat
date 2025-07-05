@echo off
REM Script to copy PDF.js worker to public directory
REM Run this after npm install or when updating PDF.js

echo 📄 Setting up PDF.js worker...

REM Check if pdfjs-dist is installed
if not exist "node_modules\pdfjs-dist" (
    echo ❌ pdfjs-dist not found. Please run: npm install pdfjs-dist
    exit /b 1
)

REM Copy the worker file
if exist "node_modules\pdfjs-dist\build\pdf.worker.min.mjs" (
    copy "node_modules\pdfjs-dist\build\pdf.worker.min.mjs" "public\pdf.worker.min.js" >nul
    echo ✅ PDF.js worker copied to public\pdf.worker.min.js
) else (
    echo ❌ PDF.js worker file not found in node_modules\pdfjs-dist\build\
    exit /b 1
)

echo 🎉 PDF.js worker setup complete!
