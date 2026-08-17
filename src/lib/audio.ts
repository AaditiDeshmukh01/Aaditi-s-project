/**
 * Audio helper for playing and previewing notification sounds in SpendWise.
 * Supports 5 built-in audibly distinct sounds with HTML5 Audio and Web Audio API synthesizer fallbacks.
 * Handles browser autoplay restrictions gracefully without console errors.
 */

export type NotificationSoundId =
  | 'notification-1'
  | 'notification-2'
  | 'notification-3'
  | 'notification-4'
  | 'notification-5';

export interface NotificationSoundOption {
  id: NotificationSoundId;
  name: string;
  description: string;
  file: string;
}

export const NOTIFICATION_SOUNDS: NotificationSoundOption[] = [
  {
    id: 'notification-1',
    name: 'Sound 1 — Soft Bell',
    description: 'Single clean bell chime, soft and pleasant',
    file: '/sounds/notification-1.mp3',
  },
  {
    id: 'notification-2',
    name: 'Sound 2 — Double Chime',
    description: 'Two clearly separated chimes',
    file: '/sounds/notification-2.mp3',
  },
  {
    id: 'notification-3',
    name: 'Sound 3 — Digital Pop',
    description: 'Modern electronic digital notification tone',
    file: '/sounds/notification-3.mp3',
  },
  {
    id: 'notification-4',
    name: 'Sound 4 — Gentle Melody',
    description: 'Short 3-note musical motif',
    file: '/sounds/notification-4.mp3',
  },
  {
    id: 'notification-5',
    name: 'Sound 5 — Bright Alert',
    description: 'Distinctive energetic modern alert',
    file: '/sounds/notification-5.mp3',
  },
];

const audioCache = new Map<string, HTMLAudioElement>();
let currentPreviewAudio: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;

/**
 * Prime and unlock audio context upon user interaction.
 */
export function unlockAudio(): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      if (!audioContext) {
        audioContext = new AudioCtx();
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
      }
    }
  } catch {
    // Ignore context unlock error
  }

  // Pre-instantiate default sound
  try {
    if (!audioCache.has('notification-1')) {
      const audio = new Audio('/sounds/notification-1.mp3');
      audio.volume = 0.65;
      audio.load();
      audioCache.set('notification-1', audio);
    }
  } catch {
    // Ignore preload error
  }
}

/**
 * Synthesizes the requested distinct chime using Web Audio API as a fallback.
 */
function playSynthesizedSound(soundId: NotificationSoundId = 'notification-1'): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!audioContext) {
      audioContext = new AudioCtx();
    }

    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }

    const ctx = audioContext;
    const now = ctx.currentTime;

    switch (soundId) {
      case 'notification-2': {
        // Sound 2 — Double Chime: D5 (587Hz) then A5 (880Hz) with clear separation
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now);
        gain1.gain.setValueAtTime(0.28, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.6);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880.0, now + 0.28);
        gain2.gain.setValueAtTime(0.32, now + 0.28);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.28);
        osc2.stop(now + 1.1);
        break;
      }
      case 'notification-3': {
        // Sound 3 — Digital Pop: Short electronic frequency sweep pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(1050, now + 0.07);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }
      case 'notification-4': {
        // Sound 4 — Gentle Melody: 3-note ascending musical motif (G4 392Hz -> C5 523Hz -> E5 659Hz)
        [392.0, 523.25, 659.25].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + idx * 0.20;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.28, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.7);
        });
        break;
      }
      case 'notification-5': {
        // Sound 5 — Bright Alert: Modern energetic dual-pulse (784Hz + 1046Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(783.99, now);
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.4);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1046.5, now + 0.13);
        gain2.gain.setValueAtTime(0.34, now + 0.13);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.13);
        osc2.stop(now + 0.8);
        break;
      }
      case 'notification-1':
      default: {
        // Sound 1 — Soft Bell: Single clean bell chime (C5 523.25Hz with rich gentle harmonic)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now);
        gain1.gain.setValueAtTime(0.32, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.9);
        break;
      }
    }
  } catch {
    // Silently ignore Web Audio errors
  }
}

/**
 * Preview a specific sound immediately (stopping any previous preview).
 */
export async function previewNotificationSound(
  soundId: NotificationSoundId = 'notification-1'
): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Stop any ongoing preview sound immediately
  if (currentPreviewAudio) {
    try {
      currentPreviewAudio.pause();
      currentPreviewAudio.currentTime = 0;
    } catch {
      // Ignore
    }
    currentPreviewAudio = null;
  }

  try {
    const audioPath = `/sounds/${soundId}.mp3`;
    let audio = audioCache.get(soundId);
    if (!audio) {
      audio = new Audio(audioPath);
      audio.volume = 0.7;
      audioCache.set(soundId, audio);
    }

    audio.currentTime = 0;
    currentPreviewAudio = audio;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      await playPromise;
      return true;
    }
  } catch (err: unknown) {
    const errorObj = err as { name?: string };
    if (errorObj?.name === 'NotAllowedError') {
      return false;
    }
    try {
      playSynthesizedSound(soundId);
      return true;
    } catch {
      // Ignore fallback error
    }
  }
  return false;
}

/**
 * Plays the user's selected notification sound if sound is enabled.
 */
export async function playNotificationAudio(
  soundId: NotificationSoundId = 'notification-1',
  soundEnabled: boolean = true
): Promise<boolean> {
  if (typeof window === 'undefined' || !soundEnabled) {
    return false;
  }

  try {
    const validSoundId: NotificationSoundId = NOTIFICATION_SOUNDS.some((s) => s.id === soundId)
      ? soundId
      : 'notification-1';

    let audio = audioCache.get(validSoundId);
    if (!audio) {
      audio = new Audio(`/sounds/${validSoundId}.mp3`);
      audio.volume = 0.65;
      audioCache.set(validSoundId, audio);
    }

    audio.currentTime = 0;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      await playPromise;
      return true;
    }
  } catch (err: unknown) {
    const errorObj = err as { name?: string };
    if (errorObj?.name === 'NotAllowedError') {
      return false;
    }

    try {
      playSynthesizedSound(soundId);
      return true;
    } catch {
      // Ignore
    }
  }
  return false;
}
