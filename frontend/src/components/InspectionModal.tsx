import React from 'react';
import '../styles/InspectionModal.css';

interface InspectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const InspectionModal: React.FC<InspectionModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>X</button>
                {children}
            </div>
        </div>
    );
};

export default InspectionModal;
