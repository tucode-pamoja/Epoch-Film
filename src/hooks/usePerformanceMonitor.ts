import { useState, useEffect, useRef } from 'react';

/**
 * Hook to monitor FPS and determine device performance tier.
 * Returns the current FPS and a performance tier (High, Mid, Low).
 */
export function usePerformanceMonitor() {
    const [fps, setFps] = useState(60);
    const [tier, setTier] = useState<'HIGH' | 'MID' | 'LOW'>('HIGH');
    const frameCount = useRef(0);
    const lastTime = useRef(performance.now());

    useEffect(() => {
        let animationFrame: number;

        const checkFps = () => {
            const now = performance.now();
            frameCount.current++;

            if (now >= lastTime.current + 1000) {
                const currentFps = Math.round((frameCount.current * 1000) / (now - lastTime.current));
                setFps(currentFps);

                // Determine Tier
                if (currentFps >= 50) setTier('HIGH');
                else if (currentFps >= 30) setTier('MID');
                else setTier('LOW');

                frameCount.current = 0;
                lastTime.current = now;
            }

            animationFrame = requestAnimationFrame(checkFps);
        };

        animationFrame = requestAnimationFrame(checkFps);
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    return { fps, tier };
}
