import { useCallback  from 'react';
import { Socket  from 'socket.io-client';

interface UseFurnitureHandlersProps {
socket: Socket | null;
canPlaceFurniture: () => boolean;
recordFurniturePlacement: (type: string) => Promise<boolean>;


export const useFurnitureHandlers = ({
socket,
canPlaceFurniture,
recordFurniturePlacement
: UseFurnitureHandlersProps) => {

const handleMoveUp = useCallback((furnitureId: string) => {
if (socket) {
socket.emit('moveFurnitureUp', { furnitureId );

, [socket]);

const handleMoveDown = useCallback((furnitureId: string) => {
if (socket) {
socket.emit('moveFurnitureDown', { furnitureId );

, [socket]);

const handleFurnitureSpawn = useCallback(async (furnitureType: string, x: number, y: number) => {
if (!canPlaceFurniture()) {
console.log('Daily furniture placement limit reached (1000 items)');
return;


if (socket) {
socket.emit('spawnFurniture', {
type: furnitureType,
x,
y
);

const success = await recordFurniturePlacement(furnitureType);
if (!success) {
console.warn('Failed to record furniture placement');


, [socket, canPlaceFurniture, recordFurniturePlacement]);

return {
handleMoveUp,
handleMoveDown,
handleFurnitureSpawn
;
; 