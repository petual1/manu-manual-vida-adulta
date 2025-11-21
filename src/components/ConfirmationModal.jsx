import React from 'react';

export default function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel }) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay visible">
            <div className="modal-box">
                <button onClick={onCancel} className="close-btn">&times;</button>
                <h3>{title}</h3>
                <p style={{ margin: '1.5rem 0', fontSize: '1.1em' }}>{message}</p>
                <div className="modal-actions">
                    <button type="button" className="nav-button secondary" onClick={onCancel}>
                        Não
                    </button>
                    <button type="button" className="nav-button success" onClick={onConfirm}>
                        Sim
                    </button>
                </div>
            </div>
        </div>
    );
}