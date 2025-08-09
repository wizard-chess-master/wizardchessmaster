#!/bin/bash

echo "🚀 Starting deployment test..."

echo "📦 Building application..."
npm run build

echo "📁 Copying static files to server directory..."
cp -r dist/public server/

echo "🎯 Setting production environment..."
export NODE_ENV=production

echo "🔧 Starting production server..."
node dist/index.js