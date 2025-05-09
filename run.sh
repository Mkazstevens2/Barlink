#!/bin/bash

echo "🔨 Building frontend..."
npm run build --prefix client

echo "🚀 Starting server..."
node server/index.js
