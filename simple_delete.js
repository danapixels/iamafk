const io = require('socket.io-client');

const furnitureIdToRemove = process.argv[2];

if (!furnitureIdToRemove) {
  console.error('Usage: node simple_delete.js <furniture_id>');
  process.exit(1);
}

console.log(`Attempting to delete: ${furnitureIdToRemove}`);

const socket = io('http://localhost:3001', {
  timeout: 3000,
  forceNew: true
});

socket.on('connect', () => {
  console.log('Connected! Sending delete command...');
  
  // Send delete command immediately
  socket.emit('deleteFurniture', furnitureIdToRemove);
  console.log('Delete command sent!');
  
  // Wait 1 second then disconnect
  setTimeout(() => {
    console.log('Disconnecting...');
    socket.disconnect();
    process.exit(0);
  }, 1000);
});

socket.on('connect_error', (error) => {
  console.error('Connection failed:', error.message);
  process.exit(1);
});

// Don't listen to any events, just send the command 