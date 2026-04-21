import React from 'react';
import '../styles/InspectionModal.css';

interface TransferHistory {
  transferred_to_user: string;
  token_used: string;
  timestamp: string;
}

interface InspectionData {
  tool_name: string;
  transfer_history: TransferHistory[];
}

interface InspectionModalProps {
  data: InspectionData;
  onClose: () => void;
}

const InspectionModal: React.FC<InspectionModalProps> = ({ data, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{data.tool_name}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="history-list">
          {data.transfer_history.map((entry, index) => (
            <div key={index} className="history-entry">
              <p><strong>Transferred to:</strong> {entry.transferred_to_user}</p>
              <p><strong>Token Used:</strong> {entry.token_used}</p>
              <p><strong>Timestamp:</strong> {new Date(entry.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InspectionModal;