import React, { useState } from 'react'; 
import ConfirmationModal from './ConfirmationModal'; 

export default function TaskDetailView({ task, onConfirmCompletion, onBackClick, onNavigate }) {
    
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const handleConfirm = () => {
        onConfirmCompletion(); 
        setIsConfirmModalOpen(false); 
    };
    
    const renderCompleteButton = () => {
        if (task.status === 'concluída') {
             return (
                <div className="task-complete-banner">
                    <i className="fas fa-check-circle"></i>
                    <strong>Tarefa concluída!</strong>
                </div>
             );
        }
        
        return (
            <button 
                onClick={() => setIsConfirmModalOpen(true)} 
                className="nav-button success" 
                style={{ width: '100%', marginTop: '2rem' }}
            >
                Marcar como Concluída
            </button>
        );
    };

    return (
        <>
            <div className="task-detail-view">
                <button onClick={onBackClick} className="nav-button secondary small" style={{ marginBottom: '1.5rem' }}>
                    <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i>
                    Voltar para a lista
                </button>
                
                <h3 style={{ fontSize: '1.8rem', marginTop: 0 }}>{task.title}</h3>
                <p className="category-summary">{task.description}</p>
                
                <div className="task-steps-container">
                    <h4 style={{ fontSize: '1.3rem', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Passo a Passo:</h4>
                    
                    {task.steps && task.steps.length > 0 ? (
                        task.steps.map((step, index) => (
                            <div key={index} className="step-item">
                                <strong >
                                    {index + 1}. {step.title}
                                </strong>
                                
                                {step.action === 'NAV_CURRICULO' ? (
                                    <button 
                                        onClick={() => onNavigate('curriculo')} 
                                        className="nav-button primary small"
                                        style={{marginTop: '8px'}}
                                    >
                                        {step.content} <i className="fas fa-arrow-right" style={{marginLeft: '5px'}}></i>
                                    </button>
                                ) : step.link ? (
                                    <>
                                        <p>{step.content}</p>
                                        <a 
                                            href={step.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="nav-button primary small"
                                            style={{marginTop: '8px', textDecoration: 'none'}}
                                        >
                                            Acessar Link <i className="fas fa-external-link-alt" style={{marginLeft: '5px'}}></i>
                                        </a>
                                    </>
                                ) : (
                                    <p>{step.content}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>Oops! O passo a passo para esta tarefa ainda não foi detalhado.</p>
                    )}
                </div>
                
                {renderCompleteButton()}
            </div>
            
            {}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                title="Confirmar Conclusão"
                message={`Tem certeza que deseja marcar a tarefa "${task.title}" como concluída?`}
                onConfirm={handleConfirm} 
                onCancel={() => setIsConfirmModalOpen(false)}
            />
        </>
    );
}