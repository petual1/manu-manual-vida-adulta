import React, { useState, useEffect } from 'react';

export default function HomePage({ onLoginClick }) {
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveImage((prev) => (prev === 0 ? 1 : 0));
        }, 3000); 

        return () => clearInterval(interval); 
    }, []);

    const scrollToFeatures = (e) => {
        e.preventDefault(); 
        const section = document.getElementById('features');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="public-home-wrapper">
            {}
            <div className="aurora-background">
                <div className="aurora-blob blob-1"></div>
                <div className="aurora-blob blob-2"></div>
                <div className="aurora-blob blob-3"></div>
            </div>

            {}
            <section className="modern-hero container">
                <div className="hero-badge animate-fade-down">
                    <span className="badge-icon"></span>Versão Beta 
                </div>

                <div className="hero-headlines animate-fade-up">
                    <h2 className="serif-italic-sub">O controle que você precisa</h2>
                    <h1 className="hero-title-main">
                        Sua vida adulta,<br />
                        <span className="highlight-serif">Descomplicada.</span>
                    </h1>
                    
                    <p className="hero-desc">
                        O <strong>Manu.</strong> centraliza documentos, carreira e estudos em um único lugar. 
                        Chega de burocracia. Organize seu futuro com menos estresse e mais autonomia.
                    </p>

                    <div className="hero-actions">
                        <button onClick={onLoginClick} className="btn-pill-primary">
                            Começar Gratuitamente <i className="fas fa-arrow-right"></i>
                        </button>
                        
                        {}
                        <a href="#features" onClick={scrollToFeatures} className="btn-pill-outline">
                            Ver funcionalidades
                        </a>
                    </div>
                </div>
            </section>

            {}
            <section id="features" className="editorial-features container">
                <div className="features-header">
                    <h2 className="section-title-serif">
                        Projetado para ajudar você a fazer<br />
                        <span className="italic-accent">mais</span> com <span className="italic-accent">menos</span> estresse.
                    </h2>
                    <p>Nossa plataforma produtiva foi construída para jovens modernos que querem se manter organizados.</p>
                </div>

                <div className="editorial-grid">
                    <div className="feature-minimal">
                        <div className="feature-icon"><i className="fas fa-file-alt"></i></div>
                        <h3>Documentação Inteligente</h3>
                        <p>Guias passo a passo para tirar RG, CPF e Carteira de Trabalho sem filas e sem dúvidas.</p>
                    </div>
                    <div className="feature-minimal">
                        <div className="feature-icon"><i className="fas fa-rocket"></i></div>
                        <h3>Carreira & Vagas</h3>
                        <p>Construtor de currículos profissional e acesso direto a vagas de Jovem Aprendiz.</p>
                    </div>
                    <div className="feature-minimal">
                        <div className="feature-icon"><i className="fas fa-brain"></i></div>
                        <h3>Educação & Futuro</h3>
                        <p>Tudo sobre ENEM, Prouni e FIES explicado de forma simples para garantir seu futuro.</p>
                    </div>
                </div>
            </section>

            {}
            <section className="origin-story container">
                <div className="story-card">
                    <div className="story-content">
                        <span className="overline">Nossa Origem</span>
                        <h2>Do Papel para o Digital</h2>
                        <p>
                            O que começou como um projeto de extensão universitária em papel, hoje é uma plataforma completa. 
                            Tecnologia a serviço da cidadania.
                        </p>
                    </div>
                    
                    <div className="story-visual">
                         <div className="origin-visuals-container">
                            <div className="static-interface-wrapper">
                                <img src="/image_7b8426.png" alt="Interface do App Manu" className="static-app-img" />
                            </div>

                            <div className="notebook-carousel-wrapper">
                                <img 
                                    src="/caderno1.png" 
                                    alt="Caderno Versão 1" 
                                    className={`book-fader ${activeImage === 0 ? 'active' : ''}`} 
                                />
                                <img 
                                    src="/caderno2.png" 
                                    alt="Caderno Versão 2" 
                                    className={`book-fader ${activeImage === 1 ? 'active' : ''}`} 
                                />
                            </div>
                         </div>
                    </div>
                </div>
            </section>

            {}
            <footer className="minimal-footer">
                <div className="container">
                    <div className="footer-flex">
                        <div className="brand-simple">
                            <h3>Manu.</h3>
                            <p>© 2025 Projeto de Extensão • Unima (Afya)</p>
                        </div>
                        <div className="footer-links">
                            <a href="#">Sobre</a>
                            <a href="#">Privacidade</a>
                            <a href="#">Contato</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}