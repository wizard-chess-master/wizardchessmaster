#!/bin/bash

# Production build script for deployment
echo "🏗️  Building Wizard Chess for production deployment..."

# Step 1: Build the client and server
echo "📦 Building application..."
npm run build

# Step 2: Copy static files to the correct location
echo "📁 Moving static files to server directory..."
cp -r dist/public server/

echo "✅ Production build complete!"
echo ""
echo "📄 Build summary:"
echo "   • Client built to: server/public/"
echo "   • Server built to: dist/index.js"
echo "   • Static files properly aligned for production serving"
echo ""
echo "🚀 Ready for deployment with:"
echo "   NODE_ENV=production node dist/index.js"