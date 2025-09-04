// username filtering utility

const axios = require('axios');

async function checkUsernameWithAPI(username) {

const response = await axios.post('https://api.moderatecontent.com/text', {
text: username,
key: process.env.MODERATE_CONTENT_API_KEY || 'free' 
);

return {
isAppropriate: response.data.rating === 'safe',
reason: response.data.rating !== 'safe' ? 'Inappropriate content detected' : null
;

console.log('Content filtering API unavailable, using fallback');
return checkUsernameFallback(username);



function checkUsernameFallback(username) {
const lowerUsername = username.toLowerCase();

const suspiciousPatterns = [
/[0-9]{3,/, 
/[!@#$%^&*()_+\-=\[\]{;':"\\|,.<>\/?]{3,/, 
/(.)\1{4,/, 
/^(admin|mod|owner|staff|support|help|test|guest|user|anonymous)$/i,
/^(fuck|shit|bitch|ass|dick|pussy|cock|whore|slut|nazi|hitler|kys|kms)/i, 
/(fuck|shit|bitch|ass|dick|pussy|cock|whore|slut|nazi|hitler|kys|kms)/i,
];

for (const pattern of suspiciousPatterns) {
if (pattern.test(lowerUsername)) {
return {
isAppropriate: false,
reason: 'Username contains inappropriate content'
;



// check length and basic requirements
if (username.length < 2 || username.length > 50) {
return {
isAppropriate: false,
reason: 'Username must be between 2 and 50 characters'
;


// check for whitespace or special characters
if (!/^[a-zA-Z0-9\s\-_]+$/.test(username)) {
return {
isAppropriate: false,
reason: 'Username contains invalid characters'
;


return {
isAppropriate: true,
reason: null
;


// main validation function
async function validateUsername(username) {
if (!username || typeof username !== 'string') {
return {
isAppropriate: false,
reason: 'Username is required'
;


const trimmedUsername = username.trim();

if (trimmedUsername === '') {
return {
isAppropriate: false,
reason: 'Username cannot be empty'
;


return checkUsernameFallback(trimmedUsername);


module.exports = {
validateUsername,
checkUsernameFallback
; 