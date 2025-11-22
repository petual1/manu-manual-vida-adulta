import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useTrophyCalculator } from '../hooks/useTrophyCalculator'; 
import InterestOverlay from '../components/InterestOverlay';
import { trophyImages } from '../data/trophyData';

const getInterestImage = (interest) => trophyImages[interest] || trophyImages.default;

export default function InicioPage({ profile }) {
    const [selectedInterest, setSelectedInterest] = useState(null);
    const [allUserTasks, setAllUserTasks] = useState([]);
    
    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser?.uid) return;

        const tasksRef = collection(db, 'users', currentUser.uid, 'tasks');
        const q = query(tasksRef); 

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userTasks = snapshot.docs.map(doc => ({
                id: doc.data().id,
                status: doc.data().status
            }));
            setAllUserTasks(userTasks);
        });

        return () => unsubscribe(); 
    }, [profile?.uid]); 

    const calculatedTrophies = useTrophyCalculator(profile?.interests, allUserTasks);

    const handleInterestClick = (interest) => {
        setSelectedInterest(interest);
    };

    const handleCloseOverlay = () => {
        setSelectedInterest(null);
    };

    const interests = profile?.interests || [];

    return (
        <>
            <header className="content-header">
                <h2>Meu Painel</h2>
                <p>Olá, {profile?.fullName ? profile.fullName.split(' ')[0] : 'Estudante'}! Escolha uma trilha para começar.</p>
            </header>
            
            <div className="content-body">
                {interests.length > 0 ? (
                    <div className="modern-interests-grid">
                        {interests.map(interest => (
                            <div key={interest} className="modern-interest-card" onClick={() => handleInterestClick(interest)}>
                                <div className="card-bg-image" style={{ backgroundImage: `url(${getInterestImage(interest)})` }}></div>
                                <div className="card-content-overlay">
                                    <div className="card-badges">
                                        <span className="badge-pill">Trilha</span>
                                        {calculatedTrophies.includes(interest) && (
                                            <span className="badge-pill gold"><i className="fas fa-trophy"></i> Concluído</span>
                                        )}
                                    </div>
                                    <div className="card-text">
                                        <h3>{interest}</h3>
                                        <p>Toque para ver o plano de ação</p>
                                    </div>
                                    <div className="card-arrow">
                                        <i className="fas fa-arrow-right"></i>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="empty-state-panel">
                        <i className="fas fa-rocket"></i>
                        <h3>Vamos começar?</h3>
                        <p>Vá até "Meu Perfil" e selecione seus interesses para gerar seu plano de carreira.</p>
                     </div>
                )}
            </div>

            {selectedInterest && (
                <InterestOverlay 
                    interest={selectedInterest} 
                    profile={profile}
                    onClose={handleCloseOverlay} 
                />
            )}
        </>
    );
}