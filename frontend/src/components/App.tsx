import React, { useState } from 'react';
import LoginMenu from './Login.tsx';
import Tools from './Tools.tsx';
import Logs from './Logs.tsx';
import { LanguageProvider, useLanguage } from './LanguageContext.tsx';
import { NotificationProvider } from './NotificationContext.tsx';

type Page = 'tools' | 'logs';

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as any)}
        style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff' }}
      >
        <option value="en">🇬🇧 English</option>
        <option value="ro">🇷🇴 Română</option>
        <option value="de">🇩🇪 Deutsch</option>
      </select>
    </div>
  );
}

function MainApp() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('authToken'));
  const [currentPage, setCurrentPage] = useState<Page>('tools');

  const handleLogin = (token: string) => {
    localStorage.setItem('authToken', token);
    setIsLoggedIn(true);
    setCurrentPage('tools');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
  };

  const renderPage = () => {
    if (!isLoggedIn) {
      return <LoginMenu onLogin={handleLogin} />;
    }

    switch (currentPage) {
      case 'tools':
        return <Tools onLogout={handleLogout} onViewLogs={() => setCurrentPage('logs')} />;
      case 'logs':
        return <Logs onBack={() => setCurrentPage('tools')} />;
      default:
        return <Tools onLogout={handleLogout} onViewLogs={() => setCurrentPage('logs')} />;
    }
  };

  return (
    <div>
      <LanguageSwitcher />
      {renderPage()}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <MainApp />
      </NotificationProvider>
    </LanguageProvider>
  );
}

export default App;