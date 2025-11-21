import React from 'react';

export default function HomePage({ onLoginClick }) {
    return (
        <main id="public-homepage" className="page-container">
            <div className="hero">
                <h1>Manual da Vida Adulta</h1>
                <p>O seu assistente pessoal para navegar as complexidades da vida.</p>
                <button onClick={onLoginClick} className="nav-button large">Comece Agora</button>
            </div>
        </main>
    );
}