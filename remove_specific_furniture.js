const io = require('socket.io-client');

// Get the furniture ID from command line arguments
const furnitureIdToRemove = process.argv[2];

if (!furnitureIdToRemove) {
  console.error('Usage: node remove_specific_furniture.js <furniture_id>');
  console.error('Example: node remove_specific_furniture.js FCC_x5Q4Y6mfCnwbAAAn');
  process.exit(1);
}

// Connect to the server through Docker network
// The server container name is 'iamafk-server-1'
const socket = io('http://iamafk-server-1:3001', {
  timeout: 5000,
  forceNew: true
});

socket.on('connect', () => {
  console.log('Connected to server');
  
  // Emit the delete furniture event
  socket.emit('deleteFurniture', furnitureIdToRemove);
  console.log(`Attempting to delete furniture: ${furnitureIdToRemove}`);
  
  // Wait a moment for the server to process, then disconnect
  setTimeout(() => {
    console.log('Disconnecting...');
    socket.disconnect();
    process.exit(0);
  }, 2000);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
  console.log('Trying alternative connection...');
  
  // Try connecting to localhost as fallback
  const fallbackSocket = io('http://localhost:3001', {
    timeout: 5000,
    forceNew: true
  });
  
  fallbackSocket.on('connect', () => {
    console.log('Connected via fallback');
    fallbackSocket.emit('deleteFurniture', furnitureIdToRemove);
    console.log(`Attempting to delete furniture: ${furnitureIdToRemove}`);
    
    setTimeout(() => {
      console.log('Disconnecting...');
      fallbackSocket.disconnect();
      process.exit(0);
    }, 2000);
  });
  
  fallbackSocket.on('connect_error', (fallbackError) => {
    console.error('Fallback connection also failed:', fallbackError.message);
    process.exit(1);
  });
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});

// Handle any other events
socket.onAny((eventName, ...args) => {
  console.log(`Received event: ${eventName}`, args);
}); 