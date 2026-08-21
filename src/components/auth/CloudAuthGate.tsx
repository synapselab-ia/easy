import React from 'react';
import type { Session } from '@supabase/supabase-js';
import { getEasySupabaseClient, isEasySupabaseConfigured } from '@/lib/supabase';
import { isCurrentUserApprovedOperator, refreshCloudCache } from '@/services/cloudDataService';

interface CloudAuthGateProps {
    children: React.ReactNode;
}

type GateState = 'loading' | 'signed-out' | 'checking' | 'approved' | 'denied' | 'error';

export default function CloudAuthGate({ children }: CloudAuthGateProps) {
    const configured = isEasySupabaseConfigured();
    const [state, setState] = React.useState<GateState>(configured ? 'loading' : 'approved');
    const [session, setSession] = React.useState<Session | null>(null);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [authMode, setAuthMode] = React.useState<'sign-in' | 'sign-up'>('sign-in');
    const [message, setMessage] = React.useState<string>();
    const [busy, setBusy] = React.useState(false);

    const verifySession = React.useCallback(async (nextSession: Session | null) => {
        setSession(nextSession);
        setMessage(undefined);

        if (!nextSession) {
            setState('signed-out');
            return;
        }

        setState('checking');
        try {
            const approved = await isCurrentUserApprovedOperator();
            if (!approved) {
                setState('denied');
                return;
            }

            await refreshCloudCache();
            setState('approved');
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Falha ao conectar ao banco online.');
            setState('error');
        }
    }, []);

    React.useEffect(() => {
        if (!configured) return;

        const client = getEasySupabaseClient();
        let active = true;
        const pendingAuthTimers = new Set<number>();

        client.auth.getSession().then(({ data, error }) => {
            if (!active) return;
            if (error) {
                setMessage(error.message);
                setState('error');
                return;
            }
            void verifySession(data.session);
        });

        const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
            if (!active) return;

            // Supabase currently documents a deadlock when additional async client calls
            // are started inside onAuthStateChange. Defer authorization/cache work until
            // after the auth callback returns.
            const timerId = window.setTimeout(() => {
                pendingAuthTimers.delete(timerId);
                if (active) void verifySession(nextSession);
            }, 0);
            pendingAuthTimers.add(timerId);
        });

        return () => {
            active = false;
            pendingAuthTimers.forEach(timerId => window.clearTimeout(timerId));
            pendingAuthTimers.clear();
            listener.subscription.unsubscribe();
        };
    }, [configured, verifySession]);

    if (!configured) return <>{children}</>;

    const handleAuth = async (event: React.FormEvent) => {
        event.preventDefault();
        setBusy(true);
        setMessage(undefined);
        const client = getEasySupabaseClient();

        try {
            if (authMode === 'sign-in') {
                const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
                if (error) throw error;
                await verifySession(data.session);
            } else {
                const { data, error } = await client.auth.signUp({ email: email.trim(), password });
                if (error) throw error;

                if (data.session) {
                    await verifySession(data.session);
                } else {
                    setMessage('Conta criada. Confira o e-mail de confirmação e depois entre no Easy.');
                    setAuthMode('sign-in');
                    setState('signed-out');
                }
            }
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Não foi possível autenticar.');
        } finally {
            setBusy(false);
        }
    };

    const handleLogout = async () => {
        setBusy(true);
        try {
            await getEasySupabaseClient().auth.signOut();
        } finally {
            setBusy(false);
        }
    };

    if (state === 'approved') return <>{children}</>;

    if (state === 'loading' || state === 'checking') {
        return (
            <div className="min-h-screen grid place-items-center bg-background p-6">
                <div className="w-full max-w-md rounded-xl border bg-card p-6 text-center space-y-2">
                    <h1 className="text-xl font-semibold">Easy</h1>
                    <p className="text-sm text-muted-foreground">
                        {state === 'loading' ? 'Verificando sua sessão...' : 'Conectando ao banco online...'}
                    </p>
                </div>
            </div>
        );
    }

    if (state === 'denied') {
        return (
            <div className="min-h-screen grid place-items-center bg-background p-6">
                <div className="w-full max-w-md rounded-xl border bg-card p-6 space-y-4">
                    <div>
                        <h1 className="text-xl font-semibold">Conta aguardando liberação</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Sua conta foi reconhecida, mas ainda não está autorizada a operar o Easy. Nenhum dado da loja foi liberado.
                        </p>
                    </div>
                    {session?.user.email && (
                        <p className="rounded-md bg-muted p-3 text-sm">Conta: {session.user.email}</p>
                    )}
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => void verifySession(session)}
                            disabled={busy}
                            className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
                        >
                            Verificar novamente
                        </button>
                        <button
                            type="button"
                            onClick={() => void handleLogout()}
                            disabled={busy}
                            className="rounded-md bg-secondary px-4 py-2 text-secondary-foreground disabled:opacity-50"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (state === 'error' && session) {
        return (
            <div className="min-h-screen grid place-items-center bg-background p-6">
                <div className="w-full max-w-md rounded-xl border bg-card p-6 space-y-4">
                    <div>
                        <h1 className="text-xl font-semibold">Banco online indisponível</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            O Easy não libera gravações offline. Tente conectar novamente antes de continuar.
                        </p>
                    </div>
                    {message && <p className="text-sm text-destructive">{message}</p>}
                    <button
                        type="button"
                        onClick={() => void verifySession(session)}
                        className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen grid place-items-center bg-background p-6">
            <form onSubmit={handleAuth} className="w-full max-w-md rounded-xl border bg-card p-6 space-y-4">
                <div>
                    <h1 className="text-2xl font-bold">Easy</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {authMode === 'sign-in' ? 'Entre para acessar o banco online.' : 'Crie sua conta de acesso.'}
                    </p>
                </div>

                <label className="block space-y-1 text-sm">
                    <span>E-mail</span>
                    <input
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={event => setEmail(event.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-2"
                    />
                </label>

                <label className="block space-y-1 text-sm">
                    <span>Senha</span>
                    <input
                        type="password"
                        required
                        minLength={6}
                        autoComplete={authMode === 'sign-in' ? 'current-password' : 'new-password'}
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-2"
                    />
                </label>

                {message && <p className="text-sm text-muted-foreground">{message}</p>}

                <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50"
                >
                    {busy ? 'Aguarde...' : authMode === 'sign-in' ? 'Entrar' : 'Criar conta'}
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setAuthMode(current => current === 'sign-in' ? 'sign-up' : 'sign-in');
                        setMessage(undefined);
                    }}
                    className="w-full text-sm text-muted-foreground underline underline-offset-4"
                >
                    {authMode === 'sign-in' ? 'Primeiro acesso? Criar conta' : 'Já tenho conta'}
                </button>
            </form>
        </div>
    );
}
