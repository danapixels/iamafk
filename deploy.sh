#!/bin/bash

# Deployment script for DigitalOcean
set -e

echo "🚀 Starting deployment..."

# Update system packages
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down || true

# Pull latest changes (if using git)
echo "📥 Pulling latest changes..."
git pull origin main || echo "No git repository found, continuing..."

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for containers to be ready
echo "⏳ Waiting for containers to be ready..."
sleep 10

# Check container status
echo "📊 Container status:"
docker-compose -f docker-compose.prod.yml ps

# Show logs
echo "📋 Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at: http://$(curl -s ifconfig.me)" 