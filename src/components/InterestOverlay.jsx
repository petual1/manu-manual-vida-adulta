import React, { useState, useEffect } from 'react';
import { GOOGLE_API_KEY, SEARCH_ENGINE_ID } from '../config';
import { staticContent } from '../data/staticContent';
import { trophyImages } from '../data/trophyData';
import CurriculoBuilder from './CurriculoBuilder';
import Tasks from './Tasks'; 

const UF_TO_STATE_NAME = {
    'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas',
    'BA': 'Bahia', 'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo',
    'GO': 'Goiás', 'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul',
    'MG': 'Minas Gerais', 'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná',
    'PE': 'Pernambuco', 'PI': 'Piauí', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
    'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina',
    'SP': 'São Paulo', 'SE': 'Sergipe', 'TO': 'Tocantins'
};

const getInterestImage = (interest) => trophyImages[interest] || trophyImages.default;


const InicioView = ({ interest }) => {
    const interestData = staticContent[interest] || { title: `Guia sobre ${interest}`, summary: "Informações em breve.", sections: [] };
    return (
        <div className="overlay-content-fade">
            <div className="guide-intro-card">
                <h4>Sobre esta trilha</h4>
                <p>{interestData.summary}</p>
            </div>
            
            <div className="guide-sections-grid">
                {interestData.sections.map((section, index) => (
                    <div key={index} className="guide-section-card">
                        <div className="section-icon"><i className="fas fa-book-open"></i></div>
                        <div className="section-text">
                            <h5>{section.title}</h5>
                            <p>{section.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RecomendacoesView = ({ interest, profile }) => {
    const [activeRecTab, setActiveRecTab] = useState('noticias');
    const [results, setResults] = useState({ noticias: [], videos: [], dicas: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAndCacheRecommendations = async () => {
            const cacheKey = `recommendations_cache_${interest.replace(/\s/g, '_')}`;
            const cachedDataJSON = localStorage.getItem(cacheKey);
            const now = new Date().getTime();
            const twentyFourHours = 24 * 60 * 60 * 1000;

            if (cachedDataJSON) {
                const cachedData = JSON.parse(cachedDataJSON);
                if (now - cachedData.timestamp < twentyFourHours) {
                    setResults(cachedData.results);
                    setIsLoading(false);
                    return;
                }
            }

            setIsLoading(true);

            const fetchContent = async (queryText, sort = '', num = 6) => {
                let url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(queryText)}&lr=lang_pt&num=${num}`;
                if (sort) url += `&sort=${sort}`;
                try {
                    const response = await fetch(url);
                    if (!response.ok) return [];
                    const data = await response.json();
                    return data.items || [];
                } catch (error) { 
                    console.error("Erro API:", error);
                    return []; 
                }
            };

            const trustedSources = `(site:gov.br OR site:g1.globo.com OR site:r7.com OR site:estadao.com.br OR site:folha.uol.com.br)`;
            const userStateUF = profile?.address?.state;
            const userStateFullName = UF_TO_STATE_NAME[userStateUF];

            const videosQuery = `(tutorial OR guia OR "o que é") "${interest}" site:youtube.com`;
            const dicasQuery = `(dicas OR "passo a passo" OR "como fazer") para "${interest}"`;
            
            const [videosResults, dicasResults] = await Promise.all([
                fetchContent(videosQuery, 'date'),
                fetchContent(dicasQuery)
            ]);

            let newsResults = [];
            if (userStateFullName) {
                const localNewsQuery = `"${interest}" em "${userStateFullName}" ${trustedSources}`;
                newsResults = await fetchContent(localNewsQuery, 'date', 6);
            }
            if (!userStateFullName || newsResults.length === 0) {
                const nationalNewsQuery = `"${interest}" (Brasil OR nacional OR edital) ${trustedSources}`;
                newsResults = await fetchContent(nationalNewsQuery, 'date', 6);
            }

            const finalResults = { noticias: newsResults, videos: videosResults, dicas: dicasResults };
            setResults(finalResults);
            localStorage.setItem(cacheKey, JSON.stringify({ results: finalResults, timestamp: now }));
            setIsLoading(false);
        };

        fetchAndCacheRecommendations();
    }, [interest, profile]);

    const getResultImage = (item) => {
        const ogImage = item.pagemap?.metatags?.[0]?.['og:image'];
        if (ogImage && ogImage.startsWith('http')) return ogImage;
        const cseThumbnail = item.pagemap?.cse_thumbnail?.[0]?.src;
        if (cseThumbnail && cseThumbnail.startsWith('http')) return cseThumbnail;
        return null; 
    };

    const renderContent = () => {
        if (isLoading) return <div className="spinner-container"><div className="spinner"></div></div>;
        const currentResults = results[activeRecTab];
        if (!currentResults || currentResults.length === 0) return <div className="empty-state-small">Nenhum conteúdo encontrado.</div>;
        
        return (
            <div className="rec-cards-list">
                {currentResults.map((item, index) => {
                    const img = getResultImage(item);
                    return (
                        <a href={item.link} key={index} target="_blank" rel="noopener noreferrer" className="rec-card-row">
                            {img && <div className="rec-card-thumb" style={{backgroundImage: `url(${img})`}}></div>}
                            <div className="rec-card-body">
                                <h6>{item.title}</h6>
                                <p>{item.snippet}</p>
                                <span className="rec-source">{item.displayLink}</span>
                            </div>
                            <div className="rec-card-icon"><i className="fas fa-external-link-alt"></i></div>
                        </a>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="overlay-content-fade">
            <div className="rec-pill-filter">
                <button className={`filter-pill ${activeRecTab === 'noticias' ? 'active' : ''}`} onClick={() => setActiveRecTab('noticias')}>Notícias</button>
                <button className={`filter-pill ${activeRecTab === 'videos' ? 'active' : ''}`} onClick={() => setActiveRecTab('videos')}>Vídeos</button>
                <button className={`filter-pill ${activeRecTab === 'dicas' ? 'active' : ''}`} onClick={() => setActiveRecTab('dicas')}>Dicas</button>
            </div>
            {renderContent()}
        </div>
    );
};



export default function InterestOverlay({ interest, profile, onClose }) {
    const isCvInterest = interest === 'Criar Currículo';
    const [activeView, setActiveView] = useState('tasks'); 

    const bgImage = getInterestImage(interest);

    const handleNavigate = (view) => {
        setActiveView(view);
    };

    const renderMainView = () => {
        switch (activeView) {
            case 'inicio': return <InicioView interest={interest} />;
            case 'recommendations': return <RecomendacoesView interest={interest} profile={profile} />;
            case 'tasks': return <Tasks interest={interest} profile={profile} onNavigate={handleNavigate} />;
            case 'curriculo': return <div className="overlay-content-fade"><CurriculoBuilder profile={profile} isEmbedded={true} /></div>;
            default: return <InicioView interest={interest} />;
        }
    };

    return (
        <div className="modal-overlay visible" onClick={onClose}>
            <div className="modern-overlay-box" onClick={(e) => e.stopPropagation()}>
                
                {}
                <div className="overlay-hero" style={{ backgroundImage: `url(${bgImage})` }}>
                    <div className="hero-gradient-mask">
                        <button onClick={onClose} className="hero-close-btn"><i className="fas fa-times"></i></button>
                        <div className="hero-content">
                            <div className="hero-badges">
                                <span className="hero-badge primary">Trilha de Aprendizado</span>
                            </div>
                            <h2>{interest}</h2>
                            <p>Complete as etapas abaixo para dominar este assunto e ganhar seu certificado.</p>
                        </div>
                    </div>
                </div>

                {}
                <div className="overlay-nav-bar">
                    <button className={`nav-pill-tab ${activeView === 'tasks' ? 'active' : ''}`} onClick={() => setActiveView('tasks')}>
                        Plano de Estudo
                    </button>
                    <button className={`nav-pill-tab ${activeView === 'inicio' ? 'active' : ''}`} onClick={() => setActiveView('inicio')}>
                        Resumo
                    </button>
                    <button className={`nav-pill-tab ${activeView === 'recommendations' ? 'active' : ''}`} onClick={() => setActiveView('recommendations')}>
                        Recomendações
                    </button>
                    {isCvInterest && (
                         <button className={`nav-pill-tab ${activeView === 'curriculo' ? 'active' : ''}`} onClick={() => setActiveView('curriculo')}>
                            Ferramenta
                        </button>
                    )}
                </div>

                {}
                <main className="overlay-body-scroll">
                    {renderMainView()}
                </main>

            </div>
        </div>
    );
}