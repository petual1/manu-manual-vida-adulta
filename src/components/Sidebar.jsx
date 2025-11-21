import React from 'react';

export default function Sidebar({ currentPage, onNavigate }) {
    const navItems = [
        { id: 'inicio', label: 'Meu Painel', icon: 'fa-home' },
        { id: 'documentos', label: 'Documentos', icon: 'fa-id-card' },
        { id: 'configuracoes', label: 'Configurações', icon: 'fa-cog' },
    ];

    const handleNavClick = (e, id) => {
        e.preventDefault();
        // Verifica a trava global
        if (window.isProfileDirty) {
            window.dispatchEvent(new CustomEvent('triggerProfileNavAlert', { detail: id }));
        } else {
            onNavigate(id);
        }
    };

    return (
        <aside className="sidebar">
            <h3>Navegação</h3>
            <ul>
                {navItems.map(item => (
                    <li key={item.id}>
                        <a 
                            href="#"
                            className={currentPage === item.id ? 'active' : ''}
                            onClick={(e) => handleNavClick(e, item.id)}
                        >
                            <i className={`fas ${item.icon}`}></i>
                            <span>{item.label}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </aside>
    );
}