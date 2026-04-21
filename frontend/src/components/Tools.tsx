import React, { useState, useEffect } from 'react';
import api from '../api';
import '../styles/Tools.css';

interface ToolsProps {
    token: string;
}

const Tools: React.FC<ToolsProps> = ({ token }) => {
    const [tools, setTools] = useState<any[]>([]);
    const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
    const [destinationAccount, setDestinationAccount] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchTools();
    }, [token]);

    const fetchTools = async () => {
        try {
            const response = await api.get('/tools', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTools(response.data);
        } catch (error) {
            console.error('Failed to fetch tools', error);
            setMessage({ type: 'error', text: 'Failed to fetch tools.' });
        }
    };

    const handleCheckboxChange = (toolId: string) => {
        setSelectedTools((prevSelected) => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(toolId)) {
                newSelected.delete(toolId);
            } else {
                newSelected.add(toolId);
            }
            return newSelected;
        });
    };

    const handleTransfer = async () => {
        if (selectedTools.size === 0 || !destinationAccount) {
            setMessage({ type: 'error', text: 'Please select tools and a destination account.' });
            return;
        }

        try {
            await api.post(
                '/transfer',
                {
                    tool_ids: Array.from(selectedTools),
                    destination_account: destinationAccount,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setMessage({ type: 'success', text: 'Tools transferred successfully!' });
            setSelectedTools(new Set());
            setDestinationAccount('');
            fetchTools(); // Refresh the tool list
        } catch (error) {
            console.error('Failed to transfer tools', error);
            setMessage({ type: 'error', text: 'Failed to transfer tools.' });
        }
    };

    return (
        <div className="tools-container">
            <h2>Warehouse Tools</h2>
            {message && <div className={`message ${message.type}`}>{message.text}</div>}
            <div className="tool-list">
                {tools.map((tool) => (
                    <div key={tool.id} className="tool-item">
                        <input
                            type="checkbox"
                            checked={selectedTools.has(tool.id)}
                            onChange={() => handleCheckboxChange(tool.id)}
                        />
                        <span>{tool.name} - Status: {tool.status}</span>
                    </div>
                ))}
            </div>
            <div className="transfer-section">
                <input
                    type="text"
                    placeholder="Destination Account"
                    value={destinationAccount}
                    onChange={(e) => setDestinationAccount(e.target.value)}
                />
                <button onClick={handleTransfer}>Transfer Selected Tools</button>
            </div>
        </div>
    );
};

export default Tools;
