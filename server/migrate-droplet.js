#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { connectDB, disconnectDB } = require('./db/connection');
const User = require('./models/User');
const Furniture = require('./models/Furniture');
const Record = require('./models/Record');
const UserActivity = require('./models/UserActivity');

// Configuration for droplet migration
const DATA_DIR = '/app/data'; // Docker volume path
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iamafk';

async function migrateDropletData() {
  try {
    console.log('🔄 Starting droplet migration to MongoDB...');
    console.log(`📁 Data directory: ${DATA_DIR}`);
    console.log(`🗄️ MongoDB URI: ${MONGODB_URI}`);
    
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Check if data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      console.log('❌ Data directory not found. Make sure the server has been running to create data files.');
      return;
    }
    
    // List all files in data directory
    const files = fs.readdirSync(DATA_DIR);
    console.log(`📋 Found ${files.length} files in data directory:`, files);
    
    // Migrate user stats
    await migrateUserStats();
    
    // Migrate furniture
    await migrateFurniture();
    
    // Migrate records
    await migrateRecords();
    
    // Migrate user activity
    await migrateUserActivity();
    
    // Migrate socket device mapping
    await migrateSocketDeviceMapping();
    
    console.log('✅ Droplet migration completed successfully!');
    console.log('💡 You can now restart your server with MongoDB support.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

async function migrateUserStats() {
  const userStatsFile = path.join(DATA_DIR, 'user_stats.json');
  
  if (fs.existsSync(userStatsFile)) {
    try {
      const data = fs.readFileSync(userStatsFile, 'utf8');
      const userStats = JSON.parse(data);
      
      console.log(`📊 Migrating ${Object.keys(userStats).length} user stats...`);
      
      let migratedCount = 0;
      for (const [deviceId, stats] of Object.entries(userStats)) {
        await User.findOneAndUpdate(
          { deviceId },
          {
            deviceId,
            username: stats.username || 'Anonymous',
            totalAFKTime: stats.totalAFKTime || 0,
            afkBalance: stats.afkBalance || 0,
            furniturePlaced: stats.furniturePlaced || 0,
            furnitureByType: stats.furnitureByType || {},
            lastSeen: stats.lastSeen ? new Date(stats.lastSeen) : new Date(),
            firstSeen: stats.firstSeen ? new Date(stats.firstSeen) : new Date(),
            sessions: stats.sessions || 1,
            dailyFurniturePlacements: stats.dailyFurniturePlacements || {},
            unlockedHats: stats.unlockedHats || [],
            unlockedFurniture: stats.unlockedFurniture || [],
            gachaHats: stats.gachaHats || [],
            gachaFurniture: stats.gachaFurniture || [],
            unlockedGachaHats: stats.unlockedGachaHats || [],
            unlockedGachaFurniture: stats.unlockedGachaFurniture || [],
            furniturePresets: stats.furniturePresets || [],
            dailyPresetUsage: stats.dailyPresetUsage || {},
            dailyFurnitureCount: stats.dailyFurnitureCount || 0,
            lastDailyReset: stats.lastDailyReset ? new Date(stats.lastDailyReset) : new Date()
          },
          { upsert: true, new: true }
        );
        migratedCount++;
      }
      
      console.log(`✅ Migrated ${migratedCount} user stats to MongoDB`);
    } catch (error) {
      console.error('❌ Error migrating user stats:', error);
    }
  } else {
    console.log('ℹ️ No user_stats.json file found, skipping...');
  }
}

async function migrateFurniture() {
  const furnitureFile = path.join(DATA_DIR, 'furniture.json');
  
  if (fs.existsSync(furnitureFile)) {
    try {
      const data = fs.readFileSync(furnitureFile, 'utf8');
      const furnitureData = JSON.parse(data);
      
      // Handle both old and new furniture data formats
      const furniture = furnitureData.furniture || furnitureData;
      
      console.log(`🪑 Migrating ${Object.keys(furniture).length} furniture items...`);
      
      let migratedCount = 0;
      for (const [id, item] of Object.entries(furniture)) {
        await Furniture.findOneAndUpdate(
          { id },
          {
            id,
            type: item.type,
            x: item.x,
            y: item.y,
            zIndex: item.zIndex || 0,
            isFlipped: item.isFlipped || false,
            isOn: item.isOn || false,
            placedBy: item.placedBy,
            placedAt: item.placedAt ? new Date(item.placedAt) : (item.timestamp ? new Date(item.timestamp) : new Date()),
            expiresAt: item.expiresAt ? new Date(item.expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          },
          { upsert: true, new: true }
        );
        migratedCount++;
      }
      
      console.log(`✅ Migrated ${migratedCount} furniture items to MongoDB`);
    } catch (error) {
      console.error('❌ Error migrating furniture:', error);
    }
  } else {
    console.log('ℹ️ No furniture.json file found, skipping...');
  }
}

async function migrateRecords() {
  const allTimeRecordFile = path.join(DATA_DIR, 'all_time_record.json');
  const jackpotRecordFile = path.join(DATA_DIR, 'jackpot_record.json');
  
  // Migrate all-time record
  if (fs.existsSync(allTimeRecordFile)) {
    try {
      const data = fs.readFileSync(allTimeRecordFile, 'utf8');
      const record = JSON.parse(data);
      
      await Record.findOneAndUpdate(
        { type: 'allTime' },
        {
          type: 'allTime',
          name: record.name || '',
          value: record.time || 0,
          deviceId: record.deviceId || '',
          lastUpdated: record.lastUpdated ? new Date(record.lastUpdated) : new Date()
        },
        { upsert: true, new: true }
      );
      
      console.log('✅ All-time record migrated to MongoDB');
    } catch (error) {
      console.error('❌ Error migrating all-time record:', error);
    }
  } else {
    console.log('ℹ️ No all_time_record.json file found, skipping...');
  }
  
  // Migrate jackpot record
  if (fs.existsSync(jackpotRecordFile)) {
    try {
      const data = fs.readFileSync(jackpotRecordFile, 'utf8');
      const record = JSON.parse(data);
      
      await Record.findOneAndUpdate(
        { type: 'jackpot' },
        {
          type: 'jackpot',
          name: record.name || '',
          value: record.wins || 0,
          deviceId: record.deviceId || '',
          lastWinner: record.lastWinner || '',
          lastUpdated: record.lastUpdated ? new Date(record.lastUpdated) : new Date()
        },
        { upsert: true, new: true }
      );
      
      console.log('✅ Jackpot record migrated to MongoDB');
    } catch (error) {
      console.error('❌ Error migrating jackpot record:', error);
    }
  } else {
    console.log('ℹ️ No jackpot_record.json file found, skipping...');
  }
}

async function migrateUserActivity() {
  const userActivityFile = path.join(DATA_DIR, 'user_activity.json');
  
  if (fs.existsSync(userActivityFile)) {
    try {
      const data = fs.readFileSync(userActivityFile, 'utf8');
      const userActivity = JSON.parse(data);
      
      console.log(`👥 Migrating ${Object.keys(userActivity).length} user activities...`);
      
      let migratedCount = 0;
      for (const [deviceId, activity] of Object.entries(userActivity)) {
        await UserActivity.findOneAndUpdate(
          { deviceId },
          {
            deviceId,
            username: activity.username || 'Anonymous',
            lastActivity: activity.lastSeen ? new Date(activity.lastSeen) : new Date()
          },
          { upsert: true, new: true }
        );
        migratedCount++;
      }
      
      console.log(`✅ Migrated ${migratedCount} user activities to MongoDB`);
    } catch (error) {
      console.error('❌ Error migrating user activity:', error);
    }
  } else {
    console.log('ℹ️ No user_activity.json file found, skipping...');
  }
}

async function migrateSocketDeviceMapping() {
  const mappingFile = path.join(DATA_DIR, 'socket_device_mapping.json');
  
  if (fs.existsSync(mappingFile)) {
    try {
      const data = fs.readFileSync(mappingFile, 'utf8');
      const mapping = JSON.parse(data);
      
      console.log('🔗 Socket device mapping found, but not migrating to MongoDB');
      console.log('ℹ️ Socket mappings are temporary and will be rebuilt on server restart');
      console.log(`📊 Found ${Object.keys(mapping.socketToDeviceMap || {}).length} socket mappings`);
    } catch (error) {
      console.error('❌ Error reading socket device mapping:', error);
    }
  } else {
    console.log('ℹ️ No socket_device_mapping.json file found, skipping...');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateDropletData();
}

module.exports = { migrateDropletData }; 