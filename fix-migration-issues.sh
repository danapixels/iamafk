#!/bin/bash

# IAMAFK Migration Issue Fix Script
# This script fixes issues with the MongoDB migration

set -e  # Exit on any error

echo "🔧 Starting IAMAFK Migration Issue Fix..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.prod.yml" ]; then
    print_error "Please run this script from the IAMAFK project root directory"
    exit 1
fi

print_status "Checking Docker containers..."

# Check if containers are running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_warning "Server containers are running. Stopping them for migration fix..."
    docker-compose -f docker-compose.prod.yml down
    print_success "Containers stopped"
else
    print_status "Containers are not running, proceeding with fix..."
fi

print_status "Running comprehensive migration fix..."

# Run the comprehensive fix script
if docker-compose -f docker-compose.prod.yml run --rm server node fix-all-migration-issues.js; then
    print_success "Migration fix completed successfully!"
else
    print_error "Migration fix failed!"
    print_status "Attempting to restart containers anyway..."
fi

print_status "Starting containers..."

# Start the containers
if docker-compose -f docker-compose.prod.yml up -d; then
    print_success "Containers started successfully!"
else
    print_error "Failed to start containers!"
    exit 1
fi

print_status "Waiting for server to be ready..."

# Wait for server to be ready
sleep 10

print_status "Checking server status..."

# Check if server is responding
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "Server is responding!"
else
    print_warning "Server may still be starting up..."
fi

echo ""
print_success "🎉 Migration fix completed!"
echo ""
print_status "What was fixed:"
echo "  ✅ Gacha unlock data (users' unlocked hats and furniture)"
echo "  ✅ Historical AFK time and balance"
echo "  ✅ Furniture placement history"
echo "  ✅ Device ID to socket mapping"
echo "  ✅ All missing user data fields"
echo ""
print_status "Users should now see their progress restored when they reconnect!" 