import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
    onSwitchToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
    const [identifier, setIdentifier] = useState(''); // Can be username or email
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(identifier, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
            <div className="w-full max-w-md animate-fade-in">
                 <div className="text-center mb-8">
                    <svg className="w-16 h-16 text-blue-500 mx-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5"/>
                        <path opacity="0.6" d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5"/>
                        <path opacity="0.6" d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <h1 className="text-4xl font-bold text-gray-100 tracking-wider mt-2">AETHERFIT</h1>
                    <p className="text-gray-400">Mission Control Access</p>
                </div>

                <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Username or Email</label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                                required
                                placeholder="e.g., commander@aetherfit.io"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                                required
                                placeholder="••••••••"
                            />
                        </div>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Authenticating...' : 'Engage'}
                            </button>
                        </div>
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-400">
                        No account?{' '}
                        <button onClick={onSwitchToRegister} className="font-medium text-blue-400 hover:text-blue-300">
                            Register here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;