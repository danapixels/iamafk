#!/bin/bash

# IAMAFK MongoDB Migration Script
# This script automates the migration from file-based storage to MongoDB

set -e# Exit on any error

echo "🔄 Starting IAMAFK MongoDB Migration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
echo -e "${BLUE[INFO]${NC $1"


print_success() {
echo -e "${GREEN[SUCCESS]${NC $1"


print_warning() {
echo -e "${YELLOW[WARNING]${NC $1"


print_error() {
echo -e "${RED[ERROR]${NC $1"


# Check if we're in the right directory
if [ ! -f "docker-compose.prod.yml" ]; then
print_error "Please run this script from the IAMAFK project root directory"
exit 1
fi

# Step 1: Backup current data
print_status "Step 1: Creating backup of current data..."
BACKUP_FILE="iamafk-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
docker run --rm -v iamafk_server-data:/data -v $(pwd):/backup alpine tar czf /backup/$BACKUP_FILE -C /data . 2>/dev/null || {
print_warning "No existing data volume found, skipping backup"
BACKUP_FILE=""


if [ -n "$BACKUP_FILE" ]; then
print_success "Backup created: $BACKUP_FILE"
fi

# Step 2: Stop current services
print_status "Step 2: Stopping current services..."
docker-compose -f docker-compose.prod.yml down

# Step 3: Start MongoDB
print_status "Step 3: Starting MongoDB..."
docker-compose -f docker-compose.prod.yml up -d mongodb

# Wait for MongoDB to be ready
print_status "Waiting for MongoDB to be ready..."
sleep 15

# Check if MongoDB is running
if ! docker ps | grep -q iamafk-mongodb; then
print_error "MongoDB failed to start. Check logs with: docker logs iamafk-mongodb"
exit 1
fi

print_success "MongoDB is running"

# Step 4: Run migration
print_status "Step 4: Running data migration..."
docker-compose -f docker-compose.prod.yml run --rm server node migrate-droplet.js

if [ $? -eq 0 ]; then
print_success "Migration completed successfully"
else
print_error "Migration failed. Check the logs above for details"
exit 1
fi

# Step 5: Start all services
print_status "Step 5: Starting all services with MongoDB support..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker ps | grep -q iamafk-server; then
print_success "Server is running with MongoDB support"
else
print_error "Server failed to start. Check logs with: docker logs iamafk-server"
exit 1
fi

# Step 6: Verify migration
print_status "Step 6: Verifying migration..."
echo "Checking MongoDB collections..."

# Get collection counts
USER_COUNT=$(docker exec -it iamafk-mongodb mongosh iamafk --quiet --eval "db.users.countDocuments()" 2>/dev/null || echo "0")
FURNITURE_COUNT=$(docker exec -it iamafk-mongodb mongosh iamafk --quiet --eval "db.furniture.countDocuments()" 2>/dev/null || echo "0")
RECORD_COUNT=$(docker exec -it iamafk-mongodb mongosh iamafk --quiet --eval "db.records.countDocuments()" 2>/dev/null || echo "0")
ACTIVITY_COUNT=$(docker exec -it iamafk-mongodb mongosh iamafk --quiet --eval "db.useractivities.countDocuments()" 2>/dev/null || echo "0")

echo "📊 Migration Results:"
echo "- Users: $USER_COUNT"
echo "- Furniture: $FURNITURE_COUNT"
echo "- Records: $RECORD_COUNT"
echo "- User Activities: $ACTIVITY_COUNT"

print_success "Migration completed successfully!"
echo ""
echo "🎉 Your IAMAFK server is now running with MongoDB!"
echo ""
echo "📋 Next steps:"
echo "- Test your application to ensure everything works"
echo "- Monitor the logs: docker logs iamafk-server"
echo "- Check MongoDB stats: docker exec -it iamafk-mongodb mongosh iamafk --eval 'db.stats()'"
echo ""
if [ -n "$BACKUP_FILE" ]; then
echo "💾 Your backup is saved as: $BACKUP_FILE"
echo " You can delete it once you're confident the migration was successful"
fi
echo ""
echo "🔧 If you need to rollback:"
echo "1. Stop services: docker-compose -f docker-compose.prod.yml down"
echo "2. Restore backup: docker run --rm -v iamafk_server-data:/data -v \$(pwd):/backup alpine tar xzf /backup/$BACKUP_FILE -C /data"
echo "3. Revert to old docker-compose file and restart" 