import React, { useState  from 'react';
import { useUserStats  from '../../contexts/UserStatsContext';

interface LockedFurnitureButtonProps {
type: string;
onClick: (type: string) => void;


const LockedFurnitureButton: React.FC<LockedFurnitureButtonProps> = ({ type, onClick ) => {
const { userStats  = useUserStats();
const [isHovered, setIsHovered] = useState(false);
const [showTooltip, setShowTooltip] = useState(false);

// checks if user has this specific furniture unlocked and gets unlocker info
const unlockedFurniture = userStats?.unlockedGachaFurniture?.find(furniture => {
// handles both string and object formats
if (typeof furniture === 'string') {
return furniture === type;
 else if (typeof furniture === 'object' && furniture.item) {
return furniture.item === type;

return false;
);
const hasUnlocked = !!unlockedFurniture;
const unlockerName = typeof unlockedFurniture === 'object' ? unlockedFurniture.unlockedBy : 'Unknown';

const getButtonSrc = (isHovered: boolean) => {
if (!hasUnlocked) {
return isHovered ? '/UI/furniturelockbuttonhover.png' : '/UI/furniturelockbutton.png';


// switches between the locked and unlocked button images
switch (type) {
case 'computer':
return isHovered ? '/UI/computerbuttonhover.png' : '/UI/computerbutton.png';
case 'tv':
return isHovered ? '/UI/tvbuttonhover.png' : '/UI/tvbutton.png';
case 'toilet':
return isHovered ? '/UI/toiletbuttonhover.png' : '/UI/toiletbutton.png';
case 'washingmachine':
return isHovered ? '/UI/washingmachinebuttonhover.png' : '/UI/washingmachinebutton.png';
case 'zuzu':
return isHovered ? '/UI/zuzubuttonhover.png' : '/UI/zuzubutton.png';
default:
return isHovered ? '/UI/furniturelockbuttonhover.png' : '/UI/furniturelockbutton.png';

;

const handleClick = () => {
if (hasUnlocked) {
onClick(type);

;

const handleMouseEnter = () => {
setIsHovered(true);
setShowTooltip(true);
;

const handleMouseLeave = () => {
setIsHovered(false);
setShowTooltip(false);
;

return (
<div className="locked-button-container" style={{ position: 'relative', display: 'flex' >
<img
src={getButtonSrc(isHovered)
alt={hasUnlocked ? `${type Furniture` : "Locked Furniture"
className="button"
onClick={handleClick
onMouseEnter={handleMouseEnter
onMouseLeave={handleMouseLeave
style={{
cursor: 'pointer',
transition: 'transform 0.1s ease',

/>
<div
className="tooltip"
style={{
position: 'absolute',
top: '10px',
right: '100%',
marginRight: '10px',
backgroundColor: 'rgba(0, 0, 0, 0.7)',
color: 'white',
padding: '4px 8px',
borderRadius: '14px',
fontSize: '8px',
fontFamily: '"Press Start 2P", monospace',
whiteSpace: 'nowrap',
opacity: showTooltip ? 1 : 0,
visibility: showTooltip ? 'visible' : 'hidden',
transition: 'opacity 0.3s, visibility 0.3s',
zIndex: 99999,

>
{hasUnlocked ? `${unlockerName unlocked this!` : '30m = 1 gacha play'
</div>
</div>
);
;

export default LockedFurnitureButton; 