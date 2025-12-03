
export interface Building {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  baseCps: number; // Bananas per second
  owned: number;
  iconStr: string;
  minPrestige: number; // 0 for everyone, 1+ requires rebirth
}

export type MinionSkin = 'default' | 'purple' | 'galaxy';

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  multiplier: number; // Multiplies base click power
  trigger: number; // Total bananas earned required to unlock visibility
  owned: boolean;
  iconStr: string;
  minPrestige?: number; // Requirement to see this upgrade
  effect?: 'none' | MinionSkin; // Special visual effects
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconStr: string;
  conditionType: 'totalBananas' | 'building' | 'prestige';
  conditionTarget?: string; // building ID if type is building
  conditionValue: number; // amount needed
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  value: number;
}

export interface GameSettings {
  musicVolume: number; // 0 to 1
  sfxVolume: number; // 0 to 1
}

export interface SaveState {
  bananas: number;
  totalBananas: number;
  prestigeCount: number;
  startTime: number;
  buildings: Record<string, number>; // id -> owned count
  upgrades: string[]; // array of owned upgrade IDs
  achievements?: string[]; // array of unlocked achievement IDs
  settings?: GameSettings; // Optional for backward compatibility
}
