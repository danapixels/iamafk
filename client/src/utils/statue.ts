import { STATUE_CONFIG, ALLTIME_STATUE_CONFIG, JACKPOT_STATUE_CONFIG  from '../constants';

// helper to get daily statue style
export const getStatueStyle = () => ({
...STATUE_CONFIG.STYLE,
left: STATUE_CONFIG.POSITION.LEFT,
top: STATUE_CONFIG.POSITION.TOP,
zIndex: STATUE_CONFIG.POSITION.Z_INDEX,
);

// helper to get all time statue style
export const getAllTimeStatueStyle = () => ({
...ALLTIME_STATUE_CONFIG.STYLE,
left: ALLTIME_STATUE_CONFIG.POSITION.LEFT,
top: ALLTIME_STATUE_CONFIG.POSITION.TOP,
zIndex: ALLTIME_STATUE_CONFIG.POSITION.Z_INDEX,
);

// helper to get jackpot statue style
export const getJackpotStatueStyle = () => ({
...JACKPOT_STATUE_CONFIG.STYLE,
left: JACKPOT_STATUE_CONFIG.POSITION.LEFT,
top: JACKPOT_STATUE_CONFIG.POSITION.TOP,
zIndex: JACKPOT_STATUE_CONFIG.POSITION.Z_INDEX,
); 