import { useRef } from 'react';

function useKeyboardSound() {
    const soundsRef = useRef(null);

    if (!soundsRef.current) {
        soundsRef.current = [
            new Audio("/sounds/keystroke1.mp3"),
            new Audio("/sounds/keystroke2.mp3"),
            new Audio("/sounds/keystroke3.mp3"),
            new Audio("/sounds/keystroke4.mp3"),
        ];
    }

    const playRandomKeyStrokeSound = () => {
        const sounds = soundsRef.current;
        const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
        randomSound.currentTime = 0;
        randomSound.play().catch(() => {});
    };

    return { playRandomKeyStrokeSound };
}

export default useKeyboardSound;
