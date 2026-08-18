import { useEffect, useState } from 'react';
import { getRecoveryHealth, subscribeRecoveryHealth } from '@/services/recoveryHealth';

export function useRecoveryHealth() {
    const [health, setHealth] = useState(() => getRecoveryHealth());

    useEffect(() => {
        const refresh = () => setHealth(getRecoveryHealth());
        const unsubscribe = subscribeRecoveryHealth(refresh);
        const interval = window.setInterval(refresh, 60_000);

        return () => {
            unsubscribe();
            window.clearInterval(interval);
        };
    }, []);

    return health;
}
