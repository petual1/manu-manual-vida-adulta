import React from 'react';
import { useTheme } from '../context/ThemeContext'; 
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';

export default function ConfiguracoesPage({ onNavigate }) {
    const { theme, setTheme } = useTheme();
    const user = auth.currentUser;

    const handleLogout = () => {
        signOut(auth);
        toast.success("Sessão encerrada.");
        onNavigate('inicio');
    };

    return (
        <>
            <header className="content-header">
                <h2>Configurações</h2>
                <p>Personalize sua experiência no Manu.</p>
            </header>

            <div className="content-body">
                <div className="settings-grid-layout">
                    
                    {}
                    <section className="settings-section">
                        <h3>Aparência</h3>
                        <div className="settings-card">
                            <p className="settings-desc">Escolha o tema que melhor se adapta ao seu ambiente.</p>
                            
                            <div className="theme-selector-grid">
                                {}
                                <button 
                                    className={`theme-card light ${theme === 'light' ? 'active' : ''}`}
                                    onClick={() => setTheme('light')}
                                >
                                    <div className="theme-preview">
                                        <div className="preview-nav"></div>
                                        <div className="preview-content"></div>
                                    </div>
                                    <span>Claro</span>
                                    {theme === 'light' && <i className="fas fa-check-circle"></i>}
                                </button>

                                {}
                                <button 
                                    className={`theme-card gray ${theme === 'gray' ? 'active' : ''}`}
                                    onClick={() => setTheme('gray')}
                                >
                                    <div className="theme-preview">
                                        <div className="preview-nav"></div>
                                        <div className="preview-content"></div>
                                    </div>
                                    <span>Cinza</span>
                                    {theme === 'gray' && <i className="fas fa-check-circle"></i>}
                                </button>

                                {}
                                <button 
                                    className={`theme-card dark ${theme === 'dark' ? 'active' : ''}`}
                                    onClick={() => setTheme('dark')}
                                >
                                    <div className="theme-preview">
                                        <div className="preview-nav"></div>
                                        <div className="preview-content"></div>
                                    </div>
                                    <span>Escuro</span>
                                    {theme === 'dark' && <i className="fas fa-check-circle"></i>}
                                </button>
                            </div>
                        </div>
                    </section>

                    {}
                    <section className="settings-section">
                        <h3>Conta & Dados</h3>
                        <div className="settings-card">
                            <div className="settings-row">
                                <div>
                                    <strong>Perfil Público</strong>
                                    <p className="small-desc">Gerencie sua foto e bio.</p>
                                </div>
                                <button onClick={() => onNavigate('perfil')} className="nav-button secondary small">
                                    Editar Perfil
                                </button>
                            </div>
                            
                            <div className="divider"></div>

                            <div className="settings-row">
                                <div>
                                    <strong>Sessão</strong>
                                    <p className="small-desc">Desconectar deste dispositivo.</p>
                                </div>
                                <button onClick={handleLogout} className="nav-button secondary small">
                                    <i className="fas fa-sign-out-alt"></i> Sair
                                </button>
                            </div>
                        </div>
                    </section>

                    {}
                    <section className="settings-section">
                        <h3>Sobre</h3>
                        <div className="settings-card info-card">
                            <p><strong>Manu.</strong> Versão Beta 1.0</p>
                            <p>© 2025 Projeto de Extensão • Unima (Afya)</p>
                            <div className="links-row">
                                <a href="#">Termos de Uso</a> • <a href="#">Privacidade</a> • <a href="#">Suporte</a>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </>
    );
}