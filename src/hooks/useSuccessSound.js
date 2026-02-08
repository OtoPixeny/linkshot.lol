import { useRef } from 'react';

export const useSuccessSound = () => {
  const audioRef = useRef(null);

  const playClickSound = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/assets/mixkit-negative-tone-interface-tap-2569.wav');
        audioRef.current.volume = 0.3;
      }
      
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Fallback beep sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);

      });
    } catch (error) {
      console.log('Click sound failed:', error);
    }
  };

  return { playClickSound };
};
