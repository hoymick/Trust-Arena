import { SoundType } from '../types';

class SoundManager {
  constructor() {
    // Sound system disabled
  }

  public play(type: SoundType) {
    // Sound playback disabled
    return;
  }

  public toggle(enabled: boolean) {
    // No-op
  }
}

export const soundManager = new SoundManager();