// This script should be run inside the server container
// Usage: docker exec -it iamafk-server-1 node remove_furniture_direct.js <furniture_id>

const furnitureIdToRemove = process.argv[2];

if (!furnitureIdToRemove) {
  console.error('Usage: node remove_furniture_direct.js <furniture_id>');
  console.error('Example: node remove_furniture_direct.js FCC_x5Q4Y6mfCnwbAAAn');
  process.exit(1);
}

// Import the server's furniture object (this assumes the server is running)
// We'll need to access the global furniture object from the server

console.log(`Attempting to remove furniture: ${furnitureIdToRemove}`);

// Since we can't directly access the server's memory, let's use a different approach
// We can send a signal to the server process to remove the furniture

const fs = require('fs');
const path = require('path');

// Create a temporary file with the furniture ID to remove
const tempFile = '/tmp/remove_furniture.txt';
fs.writeFileSync(tempFile, furnitureIdToRemove);

console.log(`Created removal request file: ${tempFile}`);
console.log('The server will need to be modified to check this file periodically');
console.log('For now, you may need to restart the server or manually remove the furniture from the database');

// Alternative: If you have access to the server's data file, we can remove it directly
// This depends on how your server stores furniture data 