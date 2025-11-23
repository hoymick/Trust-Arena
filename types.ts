
export interface GameState {
  balance: number;
  isPlaying: boolean;
}

export enum SoundType {
  CLICK = 'click',
  CLAMP = 'clamp',
  SERVO = 'servo',
  IMPACT = 'impact',
  PING = 'ping',
  TAKEOFF = 'takeoff',
  WIND = 'wind',
  CRASH = 'crash',
  CASHOUT = 'cashout'
}

export interface BetResult {
  won: boolean;
  amount: number;
  multiplier: number;
}

export interface UserData {
  username: string;
  balance: number;
}
