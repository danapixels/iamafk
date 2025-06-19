import React from 'react';

interface ConnectionModalProps {
username: string;
onUsernameChange: (username: string) => void;
onConnect: () => void;
hasConnected: boolean;


const ConnectionModal: React.FC<ConnectionModalProps> = ({
username,
onUsernameChange,
onConnect,
hasConnected
) => {
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
if (e.key === 'Enter' && username.trim() !== '') {
onConnect();

;

if (hasConnected) {
return null;


return (
<div id="modal-overlay">
<div className="form-container">
<label htmlFor="username">What should everyone know you as when you're away?</label>
<input
id="username"
className="input-global"
value={username
onChange={(e) => onUsernameChange(e.target.value)
onKeyDown={handleKeyDown
placeholder="Type a name.."
/>
<button onClick={onConnect disabled={username.trim() === ''>
Connect
</button>
</div>
</div>
);
;

export default ConnectionModal; 