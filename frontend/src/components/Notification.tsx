import { useLanguage } from './LanguageContext.tsx';

function Notification() {
    const { t } = useLanguage();
    return <h1>{t('notificationTest')}</h1>;
}

export default Notification;