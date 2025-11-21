
import React from 'react';
import { useTheme } from '../context/ThemeContext'; 

export default function ConfiguracoesPage() {
    const { theme, setTheme } = useTheme();

    return (
        <>
            <header className="content-header">
                <h2>Configurações</h2>
                <p>Ajuste as preferências do aplicativo.</p>
            </header>
            <div className="content-body">
                <div className="profile-card">
                    <h4>Tema Visual</h4>
                    <p style={{ margin: '0 0 1.5rem 0', color: 'var(--secondary-text)' }}>
                        Escolha como você quer visualizar o aplicativo.
                    </p>
                    
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button 
                            className={`nav-button ${theme === 'light' ? 'primary' : 'secondary'}`}
                            onClick={() => setTheme('light')}
                        >
                            <i className="fas fa-sun" style={{ marginRight: '8px' }}></i>
                            Claro (Padrão)
                        </button>
                        
                        <button 
                            className={`nav-button ${theme === 'gray' ? 'primary' : 'secondary'}`}
                            onClick={() => setTheme('gray')}
                        >
                            <i className="fas fa-cloud" style={{ marginRight: '8px' }}></i>
                            Cinza
                        </button>

                        <button 
                            className={`nav-button ${theme === 'dark' ? 'primary' : 'secondary'}`}
                            onClick={() => setTheme('dark')}
                        >
                            <i className="fas fa-moon" style={{ marginRight: '8px' }}></i>
                            Escuro
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}