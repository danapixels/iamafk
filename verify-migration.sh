#!/bin/bash

# Verification script for MongoDB migration
echo "🔍 Verifying MongoDB Migration..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
echo -e "${GREEN[SUCCESS]${NC $1"


print_error() {
echo -e "${RED[ERROR]${NC $1"


print_warning() {
echo -e "${YELLOW[WARNING]${NC $1"


print_status() {
echo -e "${BLUE[INFO]${NC $1"


# Check if services are running
print_status "Checking if services are running..."

if docker ps | grep -q iamafk-server; then
print_success "Server is running"
else
print_error "Server is not running"
exit 1
fi

if docker ps | grep -q iamafk-mongodb; then
print_success "MongoDB is running"
else
print_error "MongoDB is not running"
exit 1
fi

# Check MongoDB collections
print_status "Checking MongoDB data..."

USER_COUNT=$(docker exec -it iamafk-mongodb mongosh iamafk --quiet --eval "db.users.countDocuments()" 2>/dev/null || echo "0")
FURNITURE_COUNT=$(docker exec -it iamafk-mongodb mongosh iamafk --quiet --eval "db.furniture.countDocuments()" 2>/dev/null || echo "0")
RECORD_COUNT=$(docker exec -it iamafk-mongodb mongosh iamafk --quiet --eval "db.records.countDocuments()" 2>/dev/null || echo "0")
ACTIVITY_COUNT=$(docker exec -it iamafk-mongodb mongosh iamafk --quiet --eval "db.useractivities.countDocuments()" 2>/dev/null || echo "0")

echo "📊 Data Counts:"
echo "- Users: $USER_COUNT"
echo "- Furniture: $FURNITURE_COUNT"
echo "- Records: $RECORD_COUNT"
echo "- User Activities: $ACTIVITY_COUNT"

# Check server logs for errors
print_status "Checking server logs for errors..."
ERROR_COUNT=$(docker logs iamafk-server --tail 100 2>&1 | grep -i "error\|exception\|failed" | wc -l)

if [ "$ERROR_COUNT" -eq 0 ]; then
print_success "No recent errors in server logs"
else
print_warning "Found $ERROR_COUNT potential errors in server logs"
echo "Recent logs:"
docker logs iamafk-server --tail 20
fi

# Check MongoDB logs for errors
print_status "Checking MongoDB logs for errors..."
MONGO_ERROR_COUNT=$(docker logs iamafk-mongodb --tail 100 2>&1 | grep -i "error\|exception\|failed" | wc -l)

if [ "$MONGO_ERROR_COUNT" -eq 0 ]; then
print_success "No recent errors in MongoDB logs"
else
print_warning "Found $MONGO_ERROR_COUNT potential errors in MongoDB logs"
fi

# Test server connectivity
print_status "Testing server connectivity..."
if curl -s http://localhost:3001 > /dev/null 2>&1; then
print_success "Server is responding on port 3001"
else
print_warning "Server may not be responding on port 3001 (check if port is exposed)"
fi

# Check recent activity
print_status "Checking recent activity..."
RECENT_USERS=$(docker exec -it iamafk-mongodb mongosh iamafk --quiet --eval "db.users.find().sort({lastSeen: -1).limit(3).forEach(printjson)" 2>/dev/null || echo "No recent users")
RECENT_FURNITURE=$(docker exec -it iamafk-mongodb mongosh iamafk --quiet --eval "db.furniture.find().sort({placedAt: -1).limit(3).forEach(printjson)" 2>/dev/null || echo "No recent furniture")

echo "Recent Users:"
echo "$RECENT_USERS"
echo ""
echo "Recent Furniture:"
echo "$RECENT_FURNITURE"

# Performance check
print_status "Checking performance..."
SERVER_CPU=$(docker stats iamafk-server --no-stream --format "table {{.CPUPerc" | tail -1)
SERVER_MEM=$(docker stats iamafk-server --no-stream --format "table {{.MemPerc" | tail -1)
MONGO_CPU=$(docker stats iamafk-mongodb --no-stream --format "table {{.CPUPerc" | tail -1)
MONGO_MEM=$(docker stats iamafk-mongodb --no-stream --format "table {{.MemPerc" | tail -1)

echo "Performance:"
echo "- Server CPU: $SERVER_CPU"
echo "- Server Memory: $SERVER_MEM"
echo "- MongoDB CPU: $MONGO_CPU"
echo "- MongoDB Memory: $MONGO_MEM"

# Final assessment
echo ""
echo "🎯 Migration Assessment:"

if [ "$USER_COUNT" -gt 0 ] || [ "$FURNITURE_COUNT" -gt 0 ]; then
print_success "Data migration appears successful"
else
print_warning "No data found - this might be normal for a fresh installation"
fi

if [ "$ERROR_COUNT" -eq 0 ] && [ "$MONGO_ERROR_COUNT" -eq 0 ]; then
print_success "No errors detected"
else
print_warning "Some errors detected - check logs for details"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Test the website functionality manually"
echo "2. Monitor for any user-reported issues"
echo "3. Check performance over the next few hours"
echo "4. If everything works well, you can delete the backup file"

print_success "Verification complete!" 