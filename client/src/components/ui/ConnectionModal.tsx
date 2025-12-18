import React, { memo } from 'react';

interface ConnectionModalProps {
  username: string;
  onUsernameChange: (username: string) => void;
  onConnect: () => void;
  hasConnected: boolean;
}

const ConnectionModal: React.FC<ConnectionModalProps> = memo(({
  username,
  onUsernameChange,
  onConnect,
  hasConnected
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && username.trim() !== '') {
      onConnect();
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // limits to 50 characters
    if (value.length <= 50) {
      onUsernameChange(value);
    }
  };

  if (hasConnected) {
    return null;
  }

  return (
    <div id="modal-overlay">
      <div className="form-container">
        <label htmlFor="username">What should everyone know you as when you're away?</label>
        <input
          id="username"
          className="input-global"
          value={username}
          onChange={handleUsernameChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a name.."
          maxLength={50}
        />
        <button onClick={onConnect} disabled={username.trim() === ''}>
          Connect
        </button>
      </div>
    </div>
  );
});

export default ConnectionModal; 