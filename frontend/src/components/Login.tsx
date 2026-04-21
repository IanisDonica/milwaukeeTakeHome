import React, { useState, type JSX } from 'react';
import api, { getApiErrorMessage } from '../api.ts';
import '../styles/Login.css';
import { useLanguage } from './LanguageContext.tsx';
import { useNotification } from './NotificationContext.tsx';

interface LoginMenuProps {
  onLogin: (token: string) => void;
}

function LoginMenu({ onLogin }: LoginMenuProps): JSX.Element {
  const { t } = useLanguage();
  const { addNotification } = useNotification();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/token/', { username, password });
      const token = response.data?.token || response.data?.access;
      if (token) {
        onLogin(token);
      } else {
        addNotification(t('errorUnexpected'), 'error');
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error) || t('errorUnexpected');
      addNotification(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <h2>{t('loginTitle')}</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="username">{t('usernameLabel')}</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">{t('passwordLabel')}</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? t('loggingInButton') : t('loginButton')}
        </button>
      </form>
    </div>
  );
}

export default LoginMenu;