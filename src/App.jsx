import React, { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; 
import { auth, db } from './firebase';
import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';
import InicioPage from './pages/InicioPage';
import DocumentosPage from './pages/DocumentosPage';
import ProfilePage from './pages/ProfilePage.jsx';
import ConfiguracoesPage from './pages/ConfiguracoesPage.jsx';

export default function App() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOnboarding, setIsOnboarding] = useState(false);
    const [loginModalVisible, setLoginModalVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState('inicio');
    
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                const docRef = doc(db, 'users', currentUser.uid);
                
                const unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
                    setLoading(true); 
                    if (docSnap.exists() && docSnap.data().profileComplete) {
                        const firestoreProfile = docSnap.data();
                        
                        let finalPhotoURL = firestoreProfile.photoURL || currentUser.photoURL;
                        
                        const finalProfile = { ...firestoreProfile, photoURL: finalPhotoURL };

                        setProfile(finalProfile);
                        
                        if (profile === null) {
                            setIsOnboarding(false);
                            setCurrentPage('inicio');
                        }
                    } else {
                        setProfile({
                            email: currentUser.email,
                            displayName: currentUser.displayName,
                            photoURL: currentUser.photoURL,
                            trophies: [] 
                        });
                        setIsOnboarding(true);
                    }
                    setUser(currentUser);
                    setLoading(false);
                }); 

                return () => unsubscribeProfile();

            } else {
                setUser(null);
                setProfile(null);
                setIsOnboarding(false);
                setLoading(false);
            }
        });
        
        return () => unsubscribeAuth();
    }, [profile === null]); 

    
    const handleProfileUpdate = useCallback((updatedProfile) => {
        setProfile(updatedProfile);
        if (updatedProfile.profileComplete) {
            setIsOnboarding(false);
        }
        
    }, []);

    const handleNavigation = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    if (loading) {
        return <Preloader />;
    }

    const renderUserContent = () => {
        if (isOnboarding) {
            return <OnboardingPage user={user} profile={profile} onProfileUpdate={handleProfileUpdate} />;
        }

        const renderPage = () => {
            let pageComponent;
            switch (currentPage) {
                case 'inicio': 
                    pageComponent = <InicioPage profile={profile} />; 
                    break;
                case 'documentos': 
                    pageComponent = <DocumentosPage />; 
                    break;
                case 'perfil': 
                    pageComponent = <ProfilePage user={user} profile={profile} onProfileUpdate={handleProfileUpdate} onNavigate={handleNavigation} />; 
                    break;
                case 'configuracoes':
                    pageComponent = <ConfiguracoesPage />;
                    break;
                default: 
                    pageComponent = <InicioPage profile={profile} />;
            }
            
            return (
                <div className="page-transition-wrapper" key={currentPage}>
                    {pageComponent}
                </div>
            );
        };

        return (
            <div id="app-container" className={`page-container ${currentPage === 'inicio' ? 'layout-inicio' : ''}`}>
                <div className="container app-layout">
                    {}
                    <div className="main-content">
                        {renderPage()}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <Navbar user={user} profile={profile} onLoginClick={() => setLoginModalVisible(true)} onNavigate={handleNavigation} />
            {user ? renderUserContent() : <HomePage onLoginClick={() => setLoginModalVisible(true)} />}
            {loginModalVisible && <LoginModal onClose={() => setLoginModalVisible(false)} />}
        </>
    );
}