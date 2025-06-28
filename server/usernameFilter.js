// Username filtering utility
// This uses external services to check for inappropriate content

const axios = require('axios');

// Option 1: Use a free content filtering API
async function checkUsernameWithAPI(username) {
  try {
    // Using a free content filtering service
    const response = await axios.post('https://api.moderatecontent.com/text', {
      text: username,
      key: process.env.MODERATE_CONTENT_API_KEY || 'free' // Free tier available
    });
    
    return {
      isAppropriate: response.data.rating === 'safe',
      reason: response.data.rating !== 'safe' ? 'Inappropriate content detected' : null
    };
  } catch (error) {
    console.log('Content filtering API unavailable, using fallback');
    return checkUsernameFallback(username);
  }
}

// Option 2: Simple pattern-based filtering (no offensive words)
function checkUsernameFallback(username) {
  const lowerUsername = username.toLowerCase();
  
  // Check for common patterns without using actual words
  const suspiciousPatterns = [
    /[0-9]{3,}/, // Too many numbers
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{3,}/, // Too many symbols
    /(.)\1{4,}/, // Repeated characters (5+)
    /^(admin|mod|owner|staff|support|help|test|guest|user|anonymous)$/i, // Reserved names
    /^(fuck|shit|bitch|ass|dick|pussy|cock|whore|slut|nazi|hitler|kys|kms)/i, // Common patterns
    /(fuck|shit|bitch|ass|dick|pussy|cock|whore|slut|nazi|hitler|kys|kms)/i, // Anywhere in name
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(lowerUsername)) {
      return {
        isAppropriate: false,
        reason: 'Username contains inappropriate content'
      };
    }
  }
  
  // Check length and basic requirements
  if (username.length < 2 || username.length > 50) {
    return {
      isAppropriate: false,
      reason: 'Username must be between 2 and 50 characters'
    };
  }
  
  // Check for only whitespace or special characters
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(username)) {
    return {
      isAppropriate: false,
      reason: 'Username contains invalid characters'
    };
  }
  
  return {
    isAppropriate: true,
    reason: null
  };
}

// Main validation function
async function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return {
      isAppropriate: false,
      reason: 'Username is required'
    };
  }
  
  const trimmedUsername = username.trim();
  
  if (trimmedUsername === '') {
    return {
      isAppropriate: false,
      reason: 'Username cannot be empty'
    };
  }
  
  // Try API first, fallback to pattern matching
  try {
    return await checkUsernameWithAPI(trimmedUsername);
  } catch (error) {
    return checkUsernameFallback(trimmedUsername);
  }
}

module.exports = {
  validateUsername,
  checkUsernameFallback
}; 