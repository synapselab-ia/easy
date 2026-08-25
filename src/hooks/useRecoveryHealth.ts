import { useEffect, useState } from 'react';
import { isEasySupabaseConfigured } from '../lib/supabase';
import { refreshCloudRecoveryHealth } from '../services/cloudRecoveryHealth';
import { getRecoveryHealth, subscribeRecoveryHealth } from '../services/recoveryHealth';

export function useRecoveryHealth() {
    const [health, setHealth] = useState(() => getRecoveryHealth());

    useEffect(() => {
        let active = true;
        const update = () => {
            if (active) setHealth(getRecoveryHealth());
        };
        const unsubscribe = subscribeRecoveryHealth(update);

        if (!isEasySupabaseConfigured()) {
            const interval = window.setInterval(update, 60_000);
            return () => {
                active = false;
                unsubscribe();
                window.clearInterval(interval);
            };
        }

        const refresh = async () => {
            try {
                await refreshCloudRecoveryHealth();
            } catch {
                // Cloud refresh failures deliberately keep writes blocked.
            } finally {
                update();
            }
        };

        const handleFocus = () => void refresh();
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') void refresh();
        };

        void refresh();
        const interval = window.setInterval(() => void refresh(), 60_000);
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            active = false;
            unsubscribe();
            window.clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, []);

    return health;
}
