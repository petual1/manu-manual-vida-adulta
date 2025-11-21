import React from 'react';

export default function CompletionRewardModal({ isOpen, onClose, interestName }) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay visible">
            <div className="modal-box reward-modal">
                <div className="reward-icon">
                    <i className="fas fa-trophy"></i>
                </div>
                <h2>Parabéns!</h2>
                <div className="reward-modal-content">
                    <p>Você completou 100% do plano de ação para <strong>{interestName}</strong>!</p>
                    <p>Você está um passo mais perto de dominar este assunto e pronto para os próximos desafios.</p>
                </div>
                <button onClick={onClose} className="nav-button primary">
                    Continuar
                </button>
            </div>
        </div>
    );
}