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
                <p>Olá, {profile?.fullName ? profile.fullName.split(' ')[0] : 'Utilizador'}! Selecione uma área de interesse para ver suas tarefas e recomendações.</p>
            </header>
            <div className="content-body">
                {interests.length > 0 ? (
                    <div className="interests-grid">
                        {interests.map(interest => (
                            <div key={interest} className="interest-card" onClick={() => handleInterestClick(interest)}>
                                <div className="interest-card-header" style={{ backgroundImage: `url(${getInterestImage(interest)})` }}>
                                    <div className="card-overlay">
                                        
                                        {}
                                        {}
                                        <h3>{interest}</h3>
                                        
                                        {}
                                        {calculatedTrophies.includes(interest) && (
                                            <i className="fas fa-trophy trophy-icon-painel"></i>
                                        )}
                                        {}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                     <p>Para começar, vá até "Meu Perfil" e selecione as suas áreas de interesse para que possamos gerar o seu plano de ação!</p>
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