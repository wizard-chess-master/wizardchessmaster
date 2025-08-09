#!/bin/bash

# Production build script for deployment
echo "🏗️  Building Wizard Chess for production deployment..."

# Ensure NODE_ENV is set for build process
export NODE_ENV=production
echo "✅ NODE_ENV set to: $NODE_ENV"

# Step 1: Build the client and server
echo "📦 Building application..."
npm run build

# Step 2: Copy static files to the correct location
echo "📁 Moving static files to server directory..."
cp -r dist/public server/

# Step 3: Verify build integrity
echo "🔍 Verifying build integrity..."
if [ ! -f "dist/index.js" ]; then
    echo "❌ Server build failed - dist/index.js not found"
    exit 1
fi

if [ ! -d "server/public" ]; then
    echo "❌ Client build failed - server/public not found"
    exit 1
fi

if [ ! -f "server/public/index.html" ]; then
    echo "❌ Client build failed - index.html not found"
    exit 1
fi

echo "✅ Production build complete and verified!"
echo ""
echo "📄 Build summary:"
echo "   • Client built to: server/public/"
echo "   • Server built to: dist/index.js"
echo "   • Static files properly aligned for production serving"
echo "   • Environment: NODE_ENV=$NODE_ENV"
echo ""
echo "🚀 Ready for deployment with:"
echo "   NODE_ENV=production node dist/index.js"