import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

type Language = 'en' | 'ro' | 'de';

interface Translations {
  [key: string]: {
    en: string;
    ro: string;
    de: string;
  };
}

const translations: Translations = {
  loginTitle: { en: 'Login', ro: 'Autentificare', de: 'Anmelden' },
  usernameLabel: { en: 'Username:', ro: 'Nume utilizator:', de: 'Benutzername:' },
  passwordLabel: { en: 'Password:', ro: 'Parolă:', de: 'Passwort:' },
  loginButton: { en: 'Login', ro: 'Autentificare', de: 'Anmelden' },
  loggingInButton: { en: 'Logging in...', ro: 'Se autentifică...', de: 'Anmelden...' },
  notificationTest: { en: 'Test', ro: 'Test', de: 'Test' },
  errorUnexpected: { en: 'An unexpected error occurred.', ro: 'A apărut o eroare neașteptată.', de: 'Ein unerwarteter Fehler ist aufgetreten.' },
  errorNoResponse: { en: 'No response from server. Check network connection.', ro: 'Niciun răspuns de la server. Verificați conexiunea.', de: 'Keine Antwort vom Server. Netzwerkverbindung prüfen.' },
  toolsTitle: { en: 'Tools', ro: 'Unelte', de: 'Werkzeuge' },
  myToolsTitle: { en: 'My Tools', ro: 'Uneltele Mele', de: 'Meine Werkzeuge' },
  warehouseToolsTitle: { en: 'Warehouse', ro: 'Depozit', de: 'Lager' },
  toolDescriptionLabel: { en: 'Description:', ro: 'Descriere:', de: 'Beschreibung:' },
  toolManufacturedDateLabel: { en: 'Manufactured:', ro: 'Fabricat la:', de: 'Hergestellt am:' },
  toolAssignedToLabel: { en: 'Assigned To:', ro: 'Asignat către:', de: 'Zugewiesen an:' },
  loadingTools: { en: 'Loading tools...', ro: 'Se încarcă uneltele...', de: 'Werkzeuge werden geladen...' },
  errorLoadingTools: { en: 'Error loading tools.', ro: 'Eroare la încărcarea uneltelor.', de: 'Fehler beim Laden der Werkzeuge.' },
  logoutButton: { en: 'Logout', ro: 'Deconectare', de: 'Abmelden' },
  transferButton: { en: 'Transfer', ro: 'Transferă', de: 'Übertragen' },
  returnButton: { en: 'Return', ro: 'Returnează', de: 'Zurückgeben' },
  transferSuccess: { en: 'Tools transferred successfully!', ro: 'Unelte transferate cu succes!', de: 'Werkzeuge erfolgreich übertragen!' },
  transferError: { en: 'An error occurred during transfer.', ro: 'A apărut o eroare în timpul transferului.', de: 'Während der Übertragung ist ein Fehler aufgetreten.' },
  logsTitle: { en: 'Request Logs', ro: 'Jurnal de Cereri', de: 'Anforderungsprotokolle' },
  viewLogsButton: { en: 'View Logs', ro: 'Vezi Jurnal', de: 'Protokolle anzeigen' },
  backToToolsButton: { en: 'Back to Tools', ro: 'Înapoi la Unelte', de: 'Zurück zu den Werkzeugen' },
  logId: { en: 'ID', ro: 'ID', de: 'ID' },
  logUser: { en: 'User', ro: 'Utilizator', de: 'Benutzer' },
  logToken: { en: 'Token', ro: 'Token', de: 'Token' },
  logTimestamp: { en: 'Timestamp', ro: 'Marcaj de Timp', de: 'Zeitstempel' },
  logAction: { en: 'Action', ro: 'Acțiune', de: 'Aktion' },
  logSuccessful: { en: 'Successful', ro: 'Succes', de: 'Erfolgreich' },
  logPage: { en: 'Page', ro: 'Pagină', de: 'Seite' },
  logOf: { en: 'of', ro: 'din', de: 'von' },
  previousButton: { en: 'Previous', ro: 'Anterior', de: 'Zurück' },
  nextButton: { en: 'Next', ro: 'Următor', de: 'Weiter' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};