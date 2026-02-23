import { useState } from 'react';
import { useAuth } from './AuthContext';
import './AuthModal.css';

export default function AuthModal({ onClose }) {
    const { loginEmail, registerEmail, loginGoogle } = useAuth();

    const [tab, setTab] = useState('accedi'); // 'accedi' | 'registrati'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (tab === 'accedi') {
                await loginEmail(email, password);
            } else {
                await registerEmail(email, password, name);
            }
            onClose();
        } catch (err) {
            setError(friendlyError(err.code));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError('');
        setLoading(true);
        try {
            await loginGoogle();
            onClose();
        } catch (err) {
            setError(friendlyError(err.code));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-overlay" onClick={onClose}>
            <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="auth-header">
                    <div className="auth-tabs">
                        <button
                            className={`auth-tab ${tab === 'accedi' ? 'active' : ''}`}
                            onClick={() => { setTab('accedi'); setError(''); }}
                        >
                            Accedi
                        </button>
                        <button
                            className={`auth-tab ${tab === 'registrati' ? 'active' : ''}`}
                            onClick={() => { setTab('registrati'); setError(''); }}
                        >
                            Registrati
                        </button>
                    </div>
                    <button className="auth-close" onClick={onClose} aria-label="Chiudi">✕</button>
                </div>

                <div className="auth-body">
                    {/* Google */}
                    <button className="oauth-btn google-btn" onClick={handleGoogle} disabled={loading}>
                        <svg viewBox="0 0 24 24" className="oauth-icon" aria-hidden="true">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continua con Google
                    </button>

                    <div className="auth-divider"><span>oppure</span></div>

                    {/* Email form */}
                    <form onSubmit={handleEmailSubmit} className="auth-form">
                        {tab === 'registrati' && (
                            <label className="auth-field">
                                <span>Nome</span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Il tuo nome"
                                    required
                                    autoComplete="name"
                                />
                            </label>
                        )}
                        <label className="auth-field">
                            <span>Email</span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nome@esempio.com"
                                required
                                autoComplete="email"
                            />
                        </label>
                        <label className="auth-field">
                            <span>Password</span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                autoComplete={tab === 'accedi' ? 'current-password' : 'new-password'}
                            />
                        </label>

                        {error && <p className="auth-error">{error}</p>}

                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading ? 'Attendere…' : tab === 'accedi' ? 'Accedi' : 'Crea Account'}
                        </button>
                    </form>

                    {/* Stub social buttons */}
                    <div className="auth-coming-soon">
                        <button className="oauth-btn apple-btn" disabled>
                            <span className="oauth-icon">🍎</span> Apple (prossimamente)
                        </button>
                        <button className="oauth-btn facebook-btn" disabled>
                            <span className="oauth-icon">f</span> Facebook (prossimamente)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function friendlyError(code) {
    const map = {
        'auth/invalid-email': 'Email non valida.',
        'auth/user-not-found': 'Nessun account trovato con questa email.',
        'auth/wrong-password': 'Password errata.',
        'auth/email-already-in-use': 'Questa email è già registrata.',
        'auth/weak-password': 'La password deve avere almeno 6 caratteri.',
        'auth/popup-closed-by-user': 'Finestra chiusa prima del completamento.',
        'auth/too-many-requests': 'Troppi tentativi. Riprova più tardi.',
        'auth/invalid-credential': 'Credenziali non valide.',
    };
    return map[code] || 'Si è verificato un errore. Riprova.';
}
