import React from 'react';
import '../styles/Logs.css';

interface LogsProps {
    logs: any[];
}

const Logs: React.FC<LogsProps> = ({ logs }) => {
    return (
        <div className="logs-container">
            <h2>Activity Logs</h2>
            <ul>
                {logs.map((log, index) => (
                    <li key={index}>{log.description} at {new Date(log.timestamp).toLocaleString()}</li>
                ))}
            </ul>
        </div>
    );
};

export default Logs;
