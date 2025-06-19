import { useCallback  from 'react';
import { Socket  from 'socket.io-client';
import { 
updateAFKTime, 
getUserStats, 
recordFurniturePlacement, 
canPlaceFurniture 
 from '../../utils/localStorage';

interface UseFurnitureHandlersProps {
socket: Socket | null;
setUserStats: (stats: any) => void;


export const useFurnitureHandlers = ({
socket,
setUserStats
: UseFurnitureHandlersProps) => {

const handleMoveUp = useCallback((furnitureId: string) => {
if (socket) {
socket.emit('moveFurnitureUp', { furnitureId );

, [socket]);

const handleMoveDown = useCallback((furnitureId: string) => {
if (socket) {
socket.emit('moveFurnitureDown', { furnitureId );

, [socket]);

const handleFurnitureSpawn = useCallback((furnitureType: string, x: number, y: number) => {
if (!canPlaceFurniture()) {
console.log('Daily furniture placement limit reached (1000 items)');
return;


if (socket) {
socket.emit('spawnFurniture', {
type: furnitureType,
x,
y
);

const success = recordFurniturePlacement(furnitureType);
if (success) {
setUserStats(getUserStats());


, [socket, setUserStats]);

return {
handleMoveUp,
handleMoveDown,
handleFurnitureSpawn
;
; 