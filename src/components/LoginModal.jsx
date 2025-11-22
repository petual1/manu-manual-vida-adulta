import React, { useState } from 'react';
import { 
    signInWithPopup, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { toast } from 'sonner';

export default function LoginModal({ onClose }) {
    const [isLoginTab, setIsLoginTab] = useState(true);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
            toast.success("Login com Google realizado!");
            onClose();
        } catch (err) {
            console.error(err);
            setError('Erro ao conectar com Google.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEmailPasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            if (isLoginTab) {
                await signInWithEmailAndPassword(auth, email, password);
                toast.success("Bem-vindo de volta!");
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                toast.success("Conta criada com sucesso!");
            }
            onClose();
        } catch (err) {
            const code = err.code;
            if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
                setError('Email ou senha incorretos.');
            } else if (code === 'auth/email-already-in-use') {
                setError('Este email já está cadastrado.');
            } else if (code === 'auth/weak-password') {
                setError('A senha deve ter pelo menos 6 caracteres.');
            } else {
                setError('Ocorreu um erro. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-overlay">
            <div className="login-container">
                
                <button onClick={onClose} className="login-close-btn">&times;</button>

                {}
                <div className="login-visual">
                    <div className="visual-logo">
                        <span>Manu.</span>
                    </div>
                    <div className="visual-text">
                        <h2>Sua vida adulta,<br/>descomplicada.</h2>
                        <p>Centralize documentos, carreira e estudos em um único lugar.</p>
                    </div>
                </div>

                {}
                <div className="login-form-wrapper">
                    <div className="login-header">
                        <div className="login-icon-mobile">Manu.</div>
                        <h2>{isLoginTab ? 'Bem-vindo de volta' : 'Crie sua conta'}</h2>
                        <p>
                            {isLoginTab ? 'Novo por aqui?' : 'Já tem uma conta?'}
                            <span onClick={() => {setIsLoginTab(!isLoginTab); setError('');}}>
                                {isLoginTab ? ' Criar conta' : ' Entrar'}
                            </span>
                        </p>
                    </div>

                    <form onSubmit={handleEmailPasswordSubmit} className="login-form">
                        <div className="input-block">
                            <label>Seu email</label>
                            <input name="email" type="email" placeholder="exemplo@email.com" required />
                        </div>
                        
                        <div className="input-block">
                            <label>Senha</label>
                            <input name="password" type="password" placeholder="••••••••" required />
                        </div>

                        {error && <div className="login-error">{error}</div>}

                        <button type="submit" className="btn-submit" disabled={isLoading}>
                            {isLoading ? 'Processando...' : (isLoginTab ? 'Entrar' : 'Começar Agora')}
                        </button>
                    </form>

                    <div className="login-divider">
                        <span>ou</span>
                    </div>

                    <div className="social-buttons">
                        {}
                        <button onClick={handleGoogleLogin} className="social-btn google-full" disabled={isLoading}>
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                            <span>Continuar com Google</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}