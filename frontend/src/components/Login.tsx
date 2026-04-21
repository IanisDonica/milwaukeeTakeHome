import React, { useState } from 'react';
import api from '../api';
import '../styles/Login.css';

interface LoginProps {
    onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            const response = await api.post('/auth/token', { client_id: clientId, client_secret: clientSecret });
            onLogin(response.data.access_token);
        } catch (err) {
            setError('Failed to login. Please check your credentials.');
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <input
                type="text"
                placeholder="Client ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
            />
            <input
                type="password"
                placeholder="Client Secret"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default Login;
