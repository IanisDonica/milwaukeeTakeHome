import React, { useState, useEffect } from 'react';
import api, { getApiErrorMessage } from './api.ts';
import './Logs.css';
import { useLanguage } from './LanguageContext.tsx';
import { useNotification } from './NotificationContext.tsx';

interface Log {
  id: number;
  user: string;
  token: string | null;
  timestamp: string;
  action: string;
  successful: boolean;
}

interface LogsData {
  count: number;
  num_pages: number;
  current_page: number;
  next: number | null;
  previous: number | null;
  results: Log[];
}

interface LogsProps {
  onBack: () => void;
}

const Logs: React.FC<LogsProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { addNotification } = useNotification();
  const [logsData, setLogsData] = useState<LogsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await api.get('/logs/', {
          params: { page },
        });
        setLogsData(response.data);
      } catch (err) {
        const errorMessage = getApiErrorMessage(err) || 'Failed to fetch logs.';
        addNotification(errorMessage, 'error');
        onBack();
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [page, addNotification, onBack, t]);

  if (loading || !logsData) {
    return <div>Loading logs...</div>;
  }

  return (
    <div className="logs-container">
      <div className="logs-header">
        <h2>{t('logsTitle')}</h2>
        <button onClick={onBack} className="logout-btn">{t('backToToolsButton')}</button>
      </div>
      <table className="logs-table">
        <thead>
          <tr>
            <th>{t('logId')}</th>
            <th>{t('logUser')}</th>
            <th>{t('logToken')}</th>
            <th>{t('logTimestamp')}</th>
            <th>{t('logAction')}</th>
            <th>{t('logSuccessful')}</th>
          </tr>
        </thead>
        <tbody>
          {logsData.results.map(log => (
            <tr key={log.id}>
              <td>{log.id}</td>
              <td>{log.user}</td>
              <td>{log.token ? `${log.token.substring(0, 8)}...` : 'N/A'}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.action}</td>
              <td className={log.successful ? 'status-successful' : 'status-failed'}>
                {log.successful ? 'Yes' : 'No'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination-controls">
        <button onClick={() => setPage(logsData.previous!)} disabled={!logsData.previous}>
          {t('previousButton')}
        </button>
        <span className="page-info">
          {t('logPage')} {logsData.current_page} {t('logOf')} {logsData.num_pages}
        </span>
        <button onClick={() => setPage(logsData.next!)} disabled={!logsData.next}>
          {t('nextButton')}
        </button>
      </div>
    </div>
  );
};

export default Logs;