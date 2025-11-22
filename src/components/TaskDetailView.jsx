import React, { useState } from 'react'; 
import ConfirmationModal from './ConfirmationModal'; 

export default function TaskDetailView({ task, onConfirmCompletion, onBackClick, onNavigate }) {
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    return (
        <div className="modern-detail-container">
            {}
            <div className="detail-header-actions">
                <button onClick={onBackClick} className="nav-button secondary small icon-only">
                    <i className="fas fa-arrow-left"></i>
                </button>
                <span className="detail-category-badge">{task.category}</span>
            </div>

            <div className="detail-hero">
                <h2>{task.title}</h2>
                <p>{task.description}</p>
            </div>
            
            {}
            <div className="detail-steps-list">
                {task.steps && task.steps.length > 0 ? (
                    task.steps.map((step, index) => (
                        <div key={index} className="modern-step-card">
                            <div className="step-number">{index + 1}</div>
                            <div className="step-content">
                                <h5>{step.title}</h5>
                                <p>{step.content}</p>
                                
                                {}
                                {step.action === 'NAV_CURRICULO' && (
                                    <button onClick={() => onNavigate('curriculo')} className="nav-button primary small mt-2">
                                        Ir para Currículo <i className="fas fa-arrow-right"></i>
                                    </button>
                                )}
                                {step.link && (
                                    <a href={step.link} target="_blank" rel="noopener noreferrer" className="nav-button secondary small mt-2">
                                        Acessar Link <i className="fas fa-external-link-alt"></i>
                                    </a>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state-small">Sem passos detalhados.</div>
                )}
            </div>
            
            {}
            <div className="detail-footer-action">
                {task.status === 'concluída' ? (
                    <div className="completed-banner">
                        <i className="fas fa-check-circle"></i> Tarefa Concluída
                    </div>
                ) : (
                    <button onClick={() => setIsConfirmModalOpen(true)} className="nav-button success full-width">
                        Concluir Tarefa <i className="fas fa-check"></i>
                    </button>
                )}
            </div>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                title="Concluir Tarefa"
                message="Você confirma que terminou todos os passos?"
                onConfirm={() => { onConfirmCompletion(); setIsConfirmModalOpen(false); }}
                onCancel={() => setIsConfirmModalOpen(false)}
            />
        </div>
    );
}