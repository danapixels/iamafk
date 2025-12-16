import { datadogRum } from '@datadog/browser-rum';

/**
 *  datadog RUM event tracking utilities
 */

export const trackUserLogin = (username: string) => {
  datadogRum.addAction('user_login', {
    username,
    timestamp: Date.now()
  });
};

export const trackFurniturePanelClick = (furnitureType: string) => {
  datadogRum.addAction('furniture_panel_click', {
    furnitureType,
    timestamp: Date.now()
  });
};

export const trackGachaMachineClick = (machineType: 'hat' | 'furniture', hasEnoughTime: boolean) => {
  datadogRum.addAction('gacha_machine_click', {
    machineType,
    hasEnoughTime,
    timestamp: Date.now()
  });
};

export const trackGachaWin = (machineType: 'hat' | 'furniture', item: string) => {
  datadogRum.addAction('gacha_win', {
    machineType,
    item,
    timestamp: Date.now()
  });
};

export const trackSessionEnd = (reason: string, sessionDuration?: number) => {
  datadogRum.addAction('session_end', {
    reason,
    sessionDuration,
    timestamp: Date.now()
  });
};

export const trackDoubleClick = (x: number, y: number) => {
  datadogRum.addAction('double_click', {
    x,
    y,
    timestamp: Date.now()
  });
};

export const trackHatsPanelClick = (hatType: string) => {
  datadogRum.addAction('hats_panel_click', {
    hatType,
    timestamp: Date.now()
  });
};

export const trackFurniturePlacement = (furnitureType: string, x: number, y: number) => {
  datadogRum.addAction('furniture_placement', {
    furnitureType,
    x,
    y,
    timestamp: Date.now()
  });
};

export const trackFurnitureInteraction = (action: string, furnitureId: string, furnitureType: string) => {
  datadogRum.addAction('furniture_interaction', {
    action, // 'select', 'delete', 'move', 'flip', 'toggle'
    furnitureId,
    furnitureType,
    timestamp: Date.now()
  });
};
