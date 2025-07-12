#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { connectDB, disconnectDB } = require('./db/connection');
const User = require('./models/User');

// Configuration for data restoration
const DATA_DIR = '/app/data'; // Docker volume path

async function fixDeviceMapping() {
  try {
    console.log('🔧 Fixing device mapping...');
    
    // Load original socket device mapping
    const mappingFile = path.join(DATA_DIR, 'socket_device_mapping.json');
    if (!fs.existsSync(mappingFile)) {
      console.log('❌ No socket_device_mapping.json file found. Cannot restore device mapping.');
      return;
    }
    
    const data = fs.readFileSync(mappingFile, 'utf8');
    const originalMapping = JSON.parse(data);
    
    const socketToDeviceMap = originalMapping.socketToDeviceMap || {};
    const deviceToSocketMap = originalMapping.deviceToDeviceMap || {};
    
    // Save the mapping back to the file for the server to load
    const mappingData = {
      socketToDeviceMap,
      deviceToSocketMap
    };
    
    fs.writeFileSync(mappingFile, JSON.stringify(mappingData, null, 2));
    console.log(`✅ Restored device mapping with ${Object.keys(socketToDeviceMap).length} socket mappings`);
    
  } catch (error) {
    console.error('❌ Error fixing device mapping:', error);
  }
}

async function fixAllMigrationIssues() {
  try {
    console.log('🔧 Starting comprehensive migration issue fix...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Check if data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      console.log('❌ Data directory not found. Make sure the server has been running to create data files.');
      return;
    }
    
    // Load original user stats if available
    const userStatsFile = path.join(DATA_DIR, 'user_stats.json');
    let originalUserStats = {};
    
    if (fs.existsSync(userStatsFile)) {
      try {
        const data = fs.readFileSync(userStatsFile, 'utf8');
        originalUserStats = JSON.parse(data);
        console.log(`📊 Found original user stats with ${Object.keys(originalUserStats).length} users`);
      } catch (error) {
        console.error('❌ Error reading original user stats:', error);
      }
    }
    
    // Get all users from MongoDB
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users in MongoDB`);
    
    let fixedCount = 0;
    let restoredCount = 0;
    
    for (const user of users) {
      let needsUpdate = false;
      const updates = {};
      
      // Fix gacha items - convert strings to objects if needed
      if (user.unlockedGachaHats && Array.isArray(user.unlockedGachaHats)) {
        const fixedHats = user.unlockedGachaHats.map(item => {
          if (typeof item === 'string') {
            return { item, unlockedBy: user.username || 'Anonymous' };
          }
          return item;
        });
        
        if (JSON.stringify(fixedHats) !== JSON.stringify(user.unlockedGachaHats)) {
          updates.unlockedGachaHats = fixedHats;
          needsUpdate = true;
        }
      }
      
      if (user.unlockedGachaFurniture && Array.isArray(user.unlockedGachaFurniture)) {
        const fixedFurniture = user.unlockedGachaFurniture.map(item => {
          if (typeof item === 'string') {
            return { item, unlockedBy: user.username || 'Anonymous' };
          }
          return item;
        });
        
        if (JSON.stringify(fixedFurniture) !== JSON.stringify(user.unlockedGachaFurniture)) {
          updates.unlockedGachaFurniture = fixedFurniture;
          needsUpdate = true;
        }
      }
      
      // Fix Map fields - ensure they're proper Maps
      if (user.furnitureByType && !(user.furnitureByType instanceof Map)) {
        const map = new Map();
        if (typeof user.furnitureByType === 'object') {
          Object.entries(user.furnitureByType).forEach(([key, value]) => {
            map.set(key, value);
          });
        }
        updates.furnitureByType = map;
        needsUpdate = true;
      }
      
      if (user.dailyFurniturePlacements && !(user.dailyFurniturePlacements instanceof Map)) {
        const map = new Map();
        if (typeof user.dailyFurniturePlacements === 'object') {
          Object.entries(user.dailyFurniturePlacements).forEach(([key, value]) => {
            map.set(key, value);
          });
        }
        updates.dailyFurniturePlacements = map;
        needsUpdate = true;
      }
      
      if (user.dailyPresetUsage && !(user.dailyPresetUsage instanceof Map)) {
        const map = new Map();
        if (typeof user.dailyPresetUsage === 'object') {
          Object.entries(user.dailyPresetUsage).forEach(([key, value]) => {
            map.set(key, value);
          });
        }
        updates.dailyPresetUsage = map;
        needsUpdate = true;
      }
      
      // Restore missing data from original JSON if available
      const originalStats = originalUserStats[user.deviceId];
      if (originalStats) {
        // Restore totalAFKTime if it's missing or significantly different
        if (!user.totalAFKTime || user.totalAFKTime < (originalStats.totalAFKTime || 0)) {
          updates.totalAFKTime = originalStats.totalAFKTime || 0;
          needsUpdate = true;
          console.log(`🔄 Restoring totalAFKTime for ${user.username}: ${originalStats.totalAFKTime}s`);
        }
        
        // Restore afkBalance if it's missing or significantly different
        if (!user.afkBalance || user.afkBalance < (originalStats.afkBalance || 0)) {
          updates.afkBalance = originalStats.afkBalance || 0;
          needsUpdate = true;
          console.log(`🔄 Restoring afkBalance for ${user.username}: ${originalStats.afkBalance}s`);
        }
        
        // Restore furniturePlaced if missing
        if (!user.furniturePlaced && originalStats.furniturePlaced) {
          updates.furniturePlaced = originalStats.furniturePlaced;
          needsUpdate = true;
          console.log(`🔄 Restoring furniturePlaced for ${user.username}: ${originalStats.furniturePlaced}`);
        }
        
        // Restore firstSeen if missing
        if (!user.firstSeen && originalStats.firstSeen) {
          updates.firstSeen = new Date(originalStats.firstSeen);
          needsUpdate = true;
          console.log(`🔄 Restoring firstSeen for ${user.username}`);
        }
        
        // Restore sessions if missing
        if (!user.sessions && originalStats.sessions) {
          updates.sessions = originalStats.sessions;
          needsUpdate = true;
          console.log(`🔄 Restoring sessions for ${user.username}: ${originalStats.sessions}`);
        }
        
        // Restore furnitureByType if missing
        if (!user.furnitureByType || Object.keys(user.furnitureByType).length === 0) {
          if (originalStats.furnitureByType && Object.keys(originalStats.furnitureByType).length > 0) {
            const map = new Map();
            Object.entries(originalStats.furnitureByType).forEach(([key, value]) => {
              map.set(key, value);
            });
            updates.furnitureByType = map;
            needsUpdate = true;
            console.log(`🔄 Restoring furnitureByType for ${user.username}`);
          }
        }
        
        // Restore dailyFurniturePlacements if missing
        if (!user.dailyFurniturePlacements || user.dailyFurniturePlacements.size === 0) {
          if (originalStats.dailyFurniturePlacements && Object.keys(originalStats.dailyFurniturePlacements).length > 0) {
            const map = new Map();
            Object.entries(originalStats.dailyFurniturePlacements).forEach(([key, value]) => {
              map.set(key, value);
            });
            updates.dailyFurniturePlacements = map;
            needsUpdate = true;
            console.log(`🔄 Restoring dailyFurniturePlacements for ${user.username}`);
          }
        }
        
        // Restore furniturePresets if missing
        if (!user.furniturePresets || user.furniturePresets.length === 0) {
          if (originalStats.furniturePresets && originalStats.furniturePresets.length > 0) {
            updates.furniturePresets = originalStats.furniturePresets;
            needsUpdate = true;
            console.log(`🔄 Restoring furniturePresets for ${user.username}: ${originalStats.furniturePresets.length} presets`);
          }
        }
        
        // Restore dailyPresetUsage if missing
        if (!user.dailyPresetUsage || user.dailyPresetUsage.size === 0) {
          if (originalStats.dailyPresetUsage && Object.keys(originalStats.dailyPresetUsage).length > 0) {
            const map = new Map();
            Object.entries(originalStats.dailyPresetUsage).forEach(([key, value]) => {
              map.set(key, value);
            });
            updates.dailyPresetUsage = map;
            needsUpdate = true;
            console.log(`🔄 Restoring dailyPresetUsage for ${user.username}`);
          }
        }
        
        restoredCount++;
      }
      
      // Apply updates if needed
      if (needsUpdate) {
        await User.findByIdAndUpdate(user._id, { $set: updates });
        fixedCount++;
        console.log(`✅ Fixed user: ${user.username} (${user.deviceId})`);
      }
    }
    
    // Fix device mapping
    await fixDeviceMapping();
    
    console.log(`\n📊 Migration Fix Summary:`);
    console.log(`✅ Fixed ${fixedCount} users with data issues`);
    console.log(`🔄 Restored data for ${restoredCount} users from original JSON`);
    console.log(`🔧 Fixed device mapping`);
    
    if (fixedCount === 0 && restoredCount === 0) {
      console.log(`\n🎉 No issues found! All user data appears to be properly migrated.`);
    }
    
  } catch (error) {
    console.error('❌ Error during comprehensive migration fix:', error);
  } finally {
    await disconnectDB();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the fix
fixAllMigrationIssues().then(() => {
  console.log('🔧 Comprehensive migration fix completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Comprehensive migration fix failed:', error);
  process.exit(1);
}); 