import React, { useState, useEffect } from 'react';
import Login from './Login';
import Tools from './Tools';
import Logs from './Logs';
import api from '../api';
import '../styles/App.css';

const App: React.FC = () => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        if (token) {
            fetchLogs();
        }
    }, [token]);

    const handleLogin = (token: string) => {
        setToken(token);
        localStorage.setItem('token', token);
    };

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('token');
    };

    const fetchLogs = async () => {
        try {
            const response = await api.get('/logs');
            setLogs(response.data);
        } catch (error) {
            console.error('Failed to fetch logs', error);
        }
    };

    return (
        <div className="App">
            {!token ? (
                <Login onLogin={handleLogin} />
            ) : (
                <>
                    <button onClick={handleLogout}>Logout</button>
                    <Tools token={token} />
                    <Logs logs={logs} />
                </>
            )}
        </div>
    );
};

export default App;
