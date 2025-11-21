import React, { useState, useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function Navbar({ user, profile, onLoginClick, onNavigate }) {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => { signOut(auth); };

    const safeNavigate = (page) => {
        if (window.isProfileDirty) {
            window.dispatchEvent(new CustomEvent('triggerProfileNavAlert', { detail: page }));
        } else {
            onNavigate(page);
            setIsMobileMenuOpen(false);
            setDropdownVisible(false);
        }
    };

    const handleEditProfileClick = (e) => {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('setProfileMode', { detail: true }));
        safeNavigate('perfil');
    };
    
    const handleMyProfileClick = (e) => {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('setProfileMode', { detail: false }));
        safeNavigate('perfil');
    };

    useEffect(() => {
        if (!dropdownVisible) return; 
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownVisible(false); 
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, [dropdownVisible]); 

    return (
        <>
            <nav className="navbar">
                <div className="container">
                    <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(true)}><i className="fas fa-bars"></i></button>
                    
                    <div className="nav-brand">
                        <a href="#" onClick={(e) => { e.preventDefault(); safeNavigate('inicio'); }}>
                                Manu.
                        </a>
                    </div>
                    
                    <div className="nav-user-profile">
                        {!user ? (
                            <button onClick={onLoginClick} className="nav-button primary">Entrar</button>
                        ) : (
                            <div className="user-info" onClick={() => setDropdownVisible(prev => !prev)} role="button" tabIndex="0" ref={dropdownRef}>
                                <span>{profile?.fullName || user.email}</span>
                                <img src={profile?.photoURL || '/avatar-padrao.png'} alt="Foto" onError={(e) => { e.target.onerror = null; e.target.src = '/avatar-padrao.png'; }}/>
                                <div className={`profile-dropdown ${dropdownVisible ? 'visible' : ''}`}>
                                    <ul>
                                        <li><a href="#" onClick={handleMyProfileClick}><i className="fas fa-user-circle"></i><span>Meu Perfil</span></a></li>
                                        <li><a href="#" onClick={handleEditProfileClick}><i className="fas fa-pen"></i><span>Editar Perfil</span></a></li>
                                        <li><a href="#" onClick={(e) => { e.preventDefault(); safeNavigate('configuracoes'); }}><i className="fas fa-cog"></i><span>Configurações</span></a></li>
                                        <li><a href="#" onClick={(e) => e.preventDefault()}><i className="fas fa-question-circle"></i><span>Ajuda</span></a></li>
                                        <li className="separator"><a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}><i className="fas fa-sign-out-alt"></i><span>Sair</span></a></li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
            
            <div className={`mobile-sidebar-overlay ${isMobileMenuOpen ? 'visible' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className={`mobile-sidebar ${isMobileMenuOpen ? 'visible' : ''}`}>
                <div className="mobile-sidebar-header"><h3>Navegação</h3><button onClick={() => setIsMobileMenuOpen(false)}>&times;</button></div>
                <div className="mobile-sidebar-content">
                    <ul>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); safeNavigate('inicio'); }}><i className="fas fa-home"></i><span>Meu Painel</span></a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); safeNavigate('documentos'); }}><i className="fas fa-id-card"></i><span>Documentos</span></a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); safeNavigate('configuracoes'); }}><i className="fas fa-cog"></i><span>Configurações</span></a></li>
                    </ul>
                </div>
            </div>
        </>
    );
}