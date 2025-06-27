const fs = require('fs');

// Get the furniture ID from command line arguments
const furnitureIdToRemove = process.argv[2];

if (!furnitureIdToRemove) {
  console.error('Usage: node remove_furniture.js <furniture_id>');
  console.error('Example: node remove_furniture.js FCC_x5Q4Y6mfCnwbAAAn-1750998713159');
  process.exit(1);
}

// Read the furniture.json file
const furniturePath = '/app/data/furniture.json';
const furnitureData = JSON.parse(fs.readFileSync(furniturePath, 'utf8'));

console.log(`Attempting to remove furniture: ${furnitureIdToRemove}`);

// Check if the item exists
if (furnitureData[furnitureIdToRemove]) {
  const item = furnitureData[furnitureIdToRemove];
  console.log(`Found item: ${item.type} at position (${item.x}, ${item.y})`);
  
  // Remove the item
  delete furnitureData[furnitureIdToRemove];
  
  // Write the updated data back to the file
  fs.writeFileSync(furniturePath, JSON.stringify(furnitureData, null, 2));
  
  console.log('Furniture removed successfully!');
  console.log('You may need to restart the server for changes to take effect.');
} else {
  console.error(`Furniture item ${furnitureIdToRemove} not found!`);
  console.log('Available furniture IDs:');
  Object.keys(furnitureData).slice(0, 10).forEach(id => {
    const item = furnitureData[id];
    console.log(`  ${id}: ${item.type} (${item.ownerName})`);
  });
  if (Object.keys(furnitureData).length > 10) {
    console.log(`  ... and ${Object.keys(furnitureData).length - 10} more items`);
  }
  process.exit(1);
} 