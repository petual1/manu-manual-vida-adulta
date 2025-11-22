import React, { useState, useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function Navbar({ user, profile, onLoginClick, onNavigate }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef(null);

    const safeNavigate = (page) => {
        if (window.isProfileDirty) {
            window.dispatchEvent(new CustomEvent('triggerProfileNavAlert', { detail: page }));
        } else {
            onNavigate(page);
            setIsMobileMenuOpen(false);
        }
    };

    const handleLogout = () => {
        signOut(auth);
        setIsMobileMenuOpen(false);
    };

    const scrollToFeatures = () => {
        const section = document.getElementById('features');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            setIsMobileMenuOpen(false);
        }
    };

    const handleMobileBarClick = (e) => {
        if (window.innerWidth <= 992) {
            if (e.target.closest('.btn-pill-login-mobile')) return;
            e.preventDefault(); 
            setIsMobileMenuOpen(!isMobileMenuOpen); 
        }
    };

    const handleDesktopLogoClick = (e) => {
        e.stopPropagation();
        safeNavigate('inicio');
    };

    const handleDesktopProfileClick = () => {
        safeNavigate('perfil');
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('.expandable-pill')) {
                setIsMobileMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, []); 

    return (
        <div className="navbar-fixed-wrapper">
            <div className="navbar-container">
                
                {}
                <nav className={`expandable-pill ${isMobileMenuOpen ? 'expanded-mobile' : ''} ${!user ? 'visitor-mode' : ''}`}>
                    
                    <div className="pill-header" onClick={handleMobileBarClick}>
                        <div className="pill-left">
                            <div className="pill-mobile-toggle-icon">
                                <i className="fas fa-bars"></i>
                            </div>
                            <a href="#" onClick={handleDesktopLogoClick} className="brand-gradient desktop-logo">
                                Manu.
                            </a>
                        </div>

                        <div className="pill-center">
                            <span className="brand-gradient mobile-logo">Manu.</span>
                        </div>

                        <div className="pill-right">
                            <span className="menu-trigger-text">
                                Navegar <i className="fas fa-chevron-down"></i>
                            </span>

                            <div className="mobile-internal-profile">
                                {user ? (
                                    <img 
                                        src={profile?.photoURL || '/avatar-padrao.png'} 
                                        alt="Perfil" 
                                        onError={(e) => { e.target.onerror = null; e.target.src = '/avatar-padrao.png'; }}
                                    />
                                ) : (
                                    <button 
                                        className="btn-pill-login-mobile" 
                                        onClick={(e) => { e.stopPropagation(); onLoginClick(); }}
                                        aria-label="Entrar"
                                    >
                                        <i className="fas fa-arrow-right"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="pill-mega-content">
                        <div className="mega-grid">
                            {user ? (
                                <>
                                    <div className="nav-block" onClick={() => safeNavigate('inicio')}>
                                        <div className="block-icon"><i className="fas fa-home"></i></div>
                                        <div className="block-info"><h4>Início</h4><p>Painel principal</p></div>
                                    </div>
                                    <div className="nav-block" onClick={() => safeNavigate('documentos')}>
                                        <div className="block-icon"><i className="fas fa-file-alt"></i></div>
                                        <div className="block-info"><h4>Documentos</h4><p>Carteira digital</p></div>
                                    </div>
                                    <div className="nav-block" onClick={() => safeNavigate('configuracoes')}>
                                        <div className="block-icon"><i className="fas fa-cog"></i></div>
                                        <div className="block-info"><h4>Configurações</h4><p>Temas e conta</p></div>
                                    </div>
                                    <div className="nav-block" onClick={handleLogout}>
                                        <div className="block-icon"><i className="fas fa-sign-out-alt"></i></div>
                                        <div className="block-info"><h4>Sair</h4><p>Encerrar sessão</p></div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="nav-block blue" onClick={scrollToFeatures}>
                                        <div className="block-icon"><i className="fas fa-star"></i></div>
                                        <div className="block-info"><h4>Ver Funcionalidades</h4><p>Conheça o Manu</p></div>
                                    </div>
                                    <div className="nav-block gray" onClick={() => safeNavigate('ajuda')}>
                                        <div className="block-icon"><i className="fas fa-question-circle"></i></div>
                                        <div className="block-info"><h4>Ajuda</h4><p>Suporte e dúvidas</p></div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {}
                    <div className={`mobile-list-menu ${isMobileMenuOpen ? 'open' : ''}`} ref={mobileMenuRef}>
                        {user ? (
                            <>
                                <a href="#" onClick={(e) => { e.stopPropagation(); safeNavigate('inicio'); }}><i className="fas fa-home"></i> Início</a>
                                <a href="#" onClick={(e) => { e.stopPropagation(); safeNavigate('documentos'); }}><i className="fas fa-folder"></i> Documentos</a>
                                <a href="#" onClick={(e) => { e.stopPropagation(); safeNavigate('configuracoes'); }}><i className="fas fa-cog"></i> Configurações</a>
                                <a href="#" onClick={(e) => { e.stopPropagation(); safeNavigate('perfil'); }}><i className="fas fa-user"></i> Meu Perfil</a>
                                <a href="#" onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="logout-link"><i className="fas fa-sign-out-alt"></i> Sair</a>
                            </>
                        ) : (
                            <>
                                <a href="#" onClick={(e) => { e.stopPropagation(); scrollToFeatures(); }}><i className="fas fa-star"></i> Ver Funcionalidades</a>
                                <a href="#" onClick={(e) => { e.stopPropagation(); safeNavigate('ajuda'); }}><i className="fas fa-question-circle"></i> Ajuda</a>
                                <a href="#" onClick={(e) => { e.stopPropagation(); onLoginClick(); }} style={{ color: 'var(--primary-color)', fontWeight: '700' }}>
                                    <i className="fas fa-sign-in-alt"></i> Entrar na Conta
                                </a>
                            </>
                        )}
                    </div>
                </nav>

                <div className="outside-actions desktop-only">
                    {!user ? (
                        <button onClick={onLoginClick} className="btn-outside-login">
                            Entrar
                        </button>
                    ) : (
                        <div className="outside-profile" onClick={handleDesktopProfileClick}>
                            <img 
                                src={profile?.photoURL || '/avatar-padrao.png'} 
                                alt="Perfil" 
                                onError={(e) => { e.target.onerror = null; e.target.src = '/avatar-padrao.png'; }}
                            />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}