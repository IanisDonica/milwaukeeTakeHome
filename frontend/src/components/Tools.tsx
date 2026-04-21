import React, { useState, useEffect } from 'react';
import api, { getApiErrorMessage } from '../api.ts';
import '../styles/Tools.css';
import { useLanguage } from './LanguageContext.tsx';
import { useNotification } from './NotificationContext.tsx';
import InspectionModal from './InspectionModal.tsx';

// --- Type Definitions ---
interface Tool {
  name: string;
  description: string;
  manufactured_date: string;
  assigned_to?: string;
}

interface TransferHistory {
  transferred_to_user: string;
  token_used: string;
  timestamp: string;
}

interface InspectionData {
  tool_name: string;
  transfer_history: TransferHistory[];
}

// --- Child Components ---

const ToolCard: React.FC<{ tool: Tool; showCheckbox?: boolean; isChecked?: boolean; onCheckboxChange?: (name: string) => void; onInspect?: (name: string) => void; isInspectable?: boolean; }> = ({ tool, showCheckbox, isChecked, onCheckboxChange, onInspect, isInspectable }) => {
  const { t } = useLanguage();

  // Decide what clicking the card does
  const handleCardClick = () => {
    if (isInspectable && onInspect) {
      onInspect(tool.name);
    } else if (showCheckbox && onCheckboxChange) {
      // Allow clicking the whole card to select it
      onCheckboxChange(tool.name);
    }
  };

  let cardClasses = 'tool-card';
  if (showCheckbox) cardClasses += ' selectable';
  if (isInspectable) cardClasses += ' inspectable';
  if (isChecked) cardClasses += ' selected';

  return (
    <div className={cardClasses} onClick={handleCardClick} style={{ cursor: (isInspectable || showCheckbox) ? 'pointer' : 'default' }}>
      <div className="tool-card-header">
        <h3>{tool.name}</h3>
      </div>
      <div className="tool-card-body">
        <p><strong>{t('toolDescriptionLabel')}</strong> {tool.description}</p>
        <p><strong>{t('toolManufacturedDateLabel')}</strong> {tool.manufactured_date}</p>
        {tool.assigned_to && (
          <p><strong>{t('toolAssignedToLabel')}</strong> {tool.assigned_to}</p>
        )}
      </div>
      {showCheckbox && onCheckboxChange && (
        <div className="tool-card-footer" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            className="tool-checkbox"
            checked={isChecked}
            onChange={() => onCheckboxChange(tool.name)}
          />
        </div>
      )}
    </div>
  );
};

const MyToolsSection: React.FC<{ tools: Tool[] }> = ({ tools }) => {
  const { t } = useLanguage();
  if (tools.length === 0) return null;

  return (
    <div className="my-tools-section">
      <div className="section-header">
        <h3>{t('myToolsTitle')}</h3>
      </div>
      <div className="tools-grid">
        {tools.map((tool) => <ToolCard key={tool.name} tool={tool} />)}
      </div>
    </div>
  );
};

const WarehouseSection: React.FC<{ tools: Tool[]; userRole: string | null; selectedTools: string[]; onCheckboxChange: (name: string) => void; onInspect: (name: string) => void; }> = ({ tools, userRole, selectedTools, onCheckboxChange, onInspect }) => {
  const { t } = useLanguage();
  // Allow everyone to select, but what selection does changes based on role
  const isInspectable = userRole === 'warehouse';

  return (
    <div className="warehouse-section">
      <div className="section-header">
        <h3>{t('warehouseToolsTitle')}</h3>
      </div>
      <div className="tools-grid">
        {tools.map((tool) => (
          <ToolCard
            key={tool.name}
            tool={tool}
            showCheckbox={true} // Checkboxes always shown now
            isChecked={selectedTools.includes(tool.name)}
            onCheckboxChange={onCheckboxChange}
            isInspectable={isInspectable}
            onInspect={onInspect}
          />
        ))}
      </div>
    </div>
  );
};


// --- Main Component ---

interface ToolsProps {
  onLogout: () => void;
  onViewLogs: () => void;
}

const Tools: React.FC<ToolsProps> = ({ onLogout, onViewLogs }) => {
  const { t } = useLanguage();
  const { addNotification } = useNotification();
  const [selfTools, setSelfTools] = useState<Tool[]>([]);
  const [centralTools, setCentralTools] = useState<Tool[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [inspectionData, setInspectionData] = useState<InspectionData | null>(null);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await api.get('/tools/');
        setUserRole(response.data.meta?.user_role);
        setSelfTools(response.data.data?.self || []);
        setCentralTools(response.data.data?.central || []);
      } catch (err) {
        const errorMessage = getApiErrorMessage(err) || t('errorLoadingTools');
        setInitialLoadError(errorMessage);
        addNotification(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, [t, addNotification]);

  const handleCheckboxChange = (toolName: string) => {
    setSelectedTools(prev => prev.includes(toolName) ? prev.filter(name => name !== toolName) : [...prev, toolName]);
  };

  const handleTransfer = async () => {
    setIsTransferring(true);
    try {
      await api.post('/transfer/', { tools: selectedTools });
      addNotification(t('transferSuccess'), 'success');

      // Update UI without refetching
      if (userRole === 'warehouse') {
        // Warehouse returning tools: remove them from central UI (or maybe they just stay there with new assignment, but let's assume they might disappear or we just refetch. Actually, best to refetch for warehouse to get updated assigned_to)
        // For simplicity, let's just refetch the whole list when warehouse returns
        const response = await api.get('/tools/');
        setSelfTools(response.data.data?.self || []);
        setCentralTools(response.data.data?.central || []);
      } else {
        // Normal user transferring tools from central to self
        const transferredTools = centralTools.filter(tool => selectedTools.includes(tool.name));
        setSelfTools(prev => [...prev, ...transferredTools]);
        setCentralTools(prev => prev.filter(tool => !selectedTools.includes(tool.name)));
      }

      setSelectedTools([]);
    } catch (err) {
      const errorMessage = getApiErrorMessage(err) || t('transferError');
      addNotification(errorMessage, 'error');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleInspect = async (toolName: string) => {
    try {
      const response = await api.post('/inspect/', { tool_name: toolName });
      setInspectionData(response.data);
    } catch (err) {
      const errorMessage = getApiErrorMessage(err) || 'Failed to fetch inspection data.';
      addNotification(errorMessage, 'error');
    }
  };

  if (loading) return <div>{t('loadingTools')}</div>;
  if (initialLoadError) return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <p style={{ color: 'red' }}>{initialLoadError}</p>
      <button onClick={onLogout} className="logout-btn" style={{ marginTop: '20px' }}>{t('logoutButton')}</button>
    </div>
  );

  const actionText = userRole === 'warehouse' ? t('returnButton') : t('transferButton');

  return (
    <div className="tools-container">
      <div className="header">
        <h2>{t('toolsTitle')}</h2>
        <div>
          {userRole === 'warehouse' && (
            <button onClick={onViewLogs} className="logout-btn" style={{ marginRight: '10px' }}>{t('viewLogsButton')}</button>
          )}
          <button onClick={onLogout} className="logout-btn">{t('logoutButton')}</button>
        </div>
      </div>
      <MyToolsSection tools={selfTools} />
      <WarehouseSection
        tools={centralTools}
        userRole={userRole}
        selectedTools={selectedTools}
        onCheckboxChange={handleCheckboxChange}
        onInspect={handleInspect}
      />

      {/* Floating Action Button */}
      {selectedTools.length > 0 && (
        <div className="floating-action-container">
          <button
            className="floating-action-btn"
            onClick={handleTransfer}
            disabled={isTransferring}
          >
            {isTransferring ? '...' : actionText}
            {!isTransferring && <span className="badge">{selectedTools.length}</span>}
          </button>
        </div>
      )}

      {inspectionData && <InspectionModal data={inspectionData} onClose={() => setInspectionData(null)} />}
    </div>
  );
};

export default Tools;