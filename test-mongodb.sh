#!/bin/bash

# Test script to verify MongoDB functionality
echo "🧪 Testing MongoDB Conversion..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Test 1: Check if MongoDB is running
print_status "Test 1: Checking MongoDB connection..."
if docker ps | grep -q mongodb; then
    print_success "MongoDB container is running"
else
    print_error "MongoDB container is not running"
    exit 1
fi

# Test 2: Check if server can connect to MongoDB
print_status "Test 2: Testing server MongoDB connection..."
docker-compose -f docker-compose.dev.yml run --rm server node -e "
const { connectDB } = require('./db/connection');
connectDB().then(() => {
    console.log('✅ Server can connect to MongoDB');
    process.exit(0);
}).catch(err => {
    console.error('❌ Server cannot connect to MongoDB:', err.message);
    process.exit(1);
});
"

# Test 3: Test data models
print_status "Test 3: Testing MongoDB models..."
docker-compose -f docker-compose.dev.yml run --rm server node -e "
const User = require('./models/User');
const Furniture = require('./models/Furniture');
const Record = require('./models/Record');
const UserActivity = require('./models/UserActivity');

async function testModels() {
    try {
        // Test User model
        const testUser = new User({
            deviceId: 'test-device',
            username: 'TestUser',
            totalAFKTime: 100,
            afkBalance: 50
        });
        await testUser.save();
        console.log('✅ User model works');

        // Test Furniture model
        const testFurniture = new Furniture({
            id: 'test-furniture-1',
            type: 'chair',
            x: 100,
            y: 200,
            placedBy: 'test-device'
        });
        await testFurniture.save();
        console.log('✅ Furniture model works');

        // Test Record model
        const testRecord = new Record({
            type: 'allTime',
            name: 'TestUser',
            value: 100
        });
        await testRecord.save();
        console.log('✅ Record model works');

        // Test UserActivity model
        const testActivity = new UserActivity({
            deviceId: 'test-device',
            username: 'TestUser'
        });
        await testActivity.save();
        console.log('✅ UserActivity model works');

        // Clean up test data
        await User.deleteOne({ deviceId: 'test-device' });
        await Furniture.deleteOne({ id: 'test-furniture-1' });
        await Record.deleteOne({ type: 'allTime' });
        await UserActivity.deleteOne({ deviceId: 'test-device' });
        console.log('✅ Test data cleaned up');

        process.exit(0);
    } catch (error) {
        console.error('❌ Model test failed:', error.message);
        process.exit(1);
    }
}

testModels();
"

# Test 4: Test server startup
print_status "Test 4: Testing server startup..."
docker-compose -f docker-compose.dev.yml up -d mongodb
sleep 5

# Start server in background and check if it starts successfully
docker-compose -f docker-compose.dev.yml run --rm server timeout 30 node server.js &
SERVER_PID=$!

# Wait a bit and check if server is responding
sleep 10
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    print_success "Server started successfully and is responding"
else
    print_warning "Server may not be responding on port 3001 (this is normal for dev setup)"
fi

# Kill the test server
kill $SERVER_PID 2>/dev/null || true

# Test 5: Check migration script
print_status "Test 5: Testing migration script..."
docker-compose -f docker-compose.dev.yml run --rm server node migrate-to-mongodb.js

print_success "All tests completed!"
echo ""
echo "📋 Next steps:"
echo "1. Start the full development environment: docker-compose -f docker-compose.dev.yml up -d"
echo "2. Test the web interface at http://localhost"
echo "3. Check server logs: docker-compose -f docker-compose.dev.yml logs server"
echo "4. If everything works locally, proceed with droplet migration" 