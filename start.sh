#!/bin/bash
# CaliTrack — One-click start script
# Just double-click this file or run: ./start.sh

echo "🏋️ Starting CaliTrack..."
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "   Download it from: https://nodejs.org"
    echo "   Or deploy to Vercel instead (no install needed)."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies (first time only)..."
    npm install
    echo ""
fi

echo "🚀 Opening CaliTrack at http://localhost:3000"
echo "   Press Ctrl+C to stop the server"
echo ""

# Open browser after a short delay
(sleep 3 && open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 2>/dev/null || start http://localhost:3000 2>/dev/null) &

# Start the dev server
npm run dev
