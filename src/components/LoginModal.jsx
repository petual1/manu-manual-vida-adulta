import React, { useState } from 'react';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export default function LoginModal({ onClose }) {
    const [isLoginTab, setIsLoginTab] = useState(true);
    const [error, setError] = useState('');

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            onClose();
        } catch (err) {
            setError('Falha ao fazer login com o Google. Tente novamente.');
            console.error("Erro no login com Google:", err);
        }
    };
    
    const handleEmailPasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            if (isLoginTab) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            onClose();
        } catch (err) {
            switch (err.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    setError('E-mail ou senha inválidos.');
                    break;
                case 'auth/email-already-in-use':
                    setError('Este e-mail já está em uso.');
                    break;
                case 'auth/weak-password':
                    setError('A senha deve ter pelo menos 6 caracteres.');
                    break;
                default:
                    setError('Ocorreu um erro. Verifique suas informações.');
                    break;
            }
            console.error("Erro na autenticação:", err);
        }
    };

    return (
        <div className="modal-overlay visible">
            <div className="modal-box">
                <button onClick={onClose} className="close-btn">&times;</button>
                <div className="login-tabs">
                    <button onClick={() => { setIsLoginTab(true); setError(''); }} className={`tab-link ${isLoginTab ? 'active' : ''}`}>Entrar</button>
                    <button onClick={() => { setIsLoginTab(false); setError(''); }} className={`tab-link ${!isLoginTab ? 'active' : ''}`}>Registrar</button>
                </div>
                <div className={`tab-content ${isLoginTab ? 'active' : ''}`}><form onSubmit={handleEmailPasswordSubmit}><input name="email" type="email" placeholder="Seu e-mail" required /><input name="password" type="password" placeholder="Sua senha" required /><button type="submit" className="nav-button form-btn">Entrar</button></form></div>
                <div className={`tab-content ${!isLoginTab ? 'active' : ''}`}><form onSubmit={handleEmailPasswordSubmit}><input name="email" type="email" placeholder="Crie um e-mail" required /><input name="password" type="password" placeholder="Crie uma senha" required /><button type="submit" className="nav-button form-btn">Criar Conta</button></form></div>
                <div className="divider">ou</div>
                <button onClick={handleGoogleLogin} className="social-btn google"><i className="fab fa-google"></i> Continuar com Google</button>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
}