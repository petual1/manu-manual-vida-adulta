import React from 'react';
import { trophyImages } from '../data/trophyData'; 

const getTrophyImage = (interestName) => {
    return trophyImages[interestName] || trophyImages.default;
};

export default function TrophyDisplay({ trophies }) {
    
    if (!trophies || trophies.length === 0) {
        return (
            <div className="trophy-grid-empty">
                <i className="fas fa-medal"></i>
                <p>Você ainda não desbloqueou nenhum troféu.</p>
                <small>Complete 100% de um plano de ação para ganhar seu primeiro!</small>
            </div>
        );
    }

    return (
        <div className="trophy-grid">
            {trophies.map(trophyName => (
                <div key={trophyName} className="trophy-card">
                    <img src={getTrophyImage(trophyName)} alt={trophyName} className="trophy-image" />
                    <div className="trophy-info">
                        <span className="trophy-icon"><i className="fas fa-trophy"></i></span>
                        <h4>{trophyName}</h4>
                        <small>Plano 100% Concluído</small>
                    </div>
                </div>
            ))}
        </div>
    );
}