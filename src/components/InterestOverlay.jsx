import React, { useState, useEffect } from 'react';
import { GOOGLE_API_KEY, SEARCH_ENGINE_ID } from '../config';
import { staticContent } from '../data/staticContent';
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

const InicioView = ({ interest }) => {
    const interestData = staticContent[interest] || { title: `Guia sobre ${interest}`, summary: "Informações em breve.", sections: [] };
    return (
        <div className="overlay-view">
            <div className="static-content-box">
                <h3>{interestData.title}</h3>
                <p className="category-summary">{interestData.summary}</p>
                {interestData.sections.map((section, index) => (
                    <div key={index} className="faq-section">
                        <h4>{section.title}</h4>
                        <p>{section.content}</p>
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

            const fetchContent = async (queryText, sort = '', num = 8) => {
                let url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(queryText)}&lr=lang_pt&num=${num}`;
                if (sort) url += `&sort=${sort}`;
                try {
                    const response = await fetch(url);
                    if (!response.ok) return [];
                    const data = await response.json();
                    return data.items || [];
                } catch (error) { 
                    console.error("Erro ao fazer a requisição:", error);
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
                newsResults = await fetchContent(localNewsQuery, 'date', 8);
            }
            if (!userStateFullName || newsResults.length === 0) {
                const nationalNewsQuery = `"${interest}" (Brasil OR nacional OR edital) ${trustedSources}`;
                newsResults = await fetchContent(nationalNewsQuery, 'date', 8);
            }

            const finalResults = { noticias: newsResults, videos: videosResults, dicas: dicasResults };
            setResults(finalResults);

            const newCacheData = {
                results: finalResults,
                timestamp: now
            };
            localStorage.setItem(cacheKey, JSON.stringify(newCacheData));

            setIsLoading(false);
        };

        fetchAndCacheRecommendations();
    }, [interest, profile]);

    const getResultImage = (item) => {
        const ogImage = item.pagemap?.metatags?.[0]?.['og:image'];
        if (ogImage && ogImage.startsWith('http')) return ogImage;
        const cseImage = item.pagemap?.cse_image?.[0]?.src;
        if (cseImage && cseImage.startsWith('http')) return cseImage;
        const cseThumbnail = item.pagemap?.cse_thumbnail?.[0]?.src;
        if (cseThumbnail && cseThumbnail.startsWith('http')) return cseThumbnail;
        if (item.displayLink) {
            return `https://www.google.com/s2/favicons?sz=64&domain=${item.displayLink}`;
        }
        return '/avatar-padrao.png';
    };

    const renderContent = () => {
        if (isLoading) return <div className="spinner-container"><div className="spinner"></div></div>;
        const currentResults = results[activeRecTab];
        if (!currentResults || currentResults.length === 0) return <p>Nenhum conteúdo encontrado para esta seção no momento.</p>;
        
        return (
            <div className="articles-grid">
                {currentResults.map((item, index) => (
                    <a href={item.link} key={index} target="_blank" rel="noopener noreferrer" className="article-card">
                        <img 
                            src={getResultImage(item)} 
                            alt={item.title} 
                            className="article-image"
                            onError={(e) => { e.currentTarget.src = '/avatar-padrao.png'; }}
                        />
                        <div className="article-content">
                            <h5 className="article-title">{item.title}</h5>
                            <p className="article-description">{item.snippet}</p>
                            <span className="article-source">{item.displayLink}</span>
                        </div>
                    </a>
                ))}
            </div>
        );
    };

    return (
        <div className="overlay-view">
            <nav className="recommendations-navbar">
                <button className={`rec-tab-button ${activeRecTab === 'noticias' ? 'active' : ''}`} onClick={() => setActiveRecTab('noticias')}>Notícias</button>
                <button className={`rec-tab-button ${activeRecTab === 'videos' ? 'active' : ''}`} onClick={() => setActiveRecTab('videos')}>Vídeos</button>
                <button className={`rec-tab-button ${activeRecTab === 'dicas' ? 'active' : ''}`} onClick={() => setActiveRecTab('dicas')}>Dicas</button>
            </nav>
            <div className="recommendations-content">{renderContent()}</div>
        </div>
    );
};

export default function InterestOverlay({ interest, profile, onClose }) {
    
    const isCvInterest = interest === 'Criar Currículo';
    const [activeView, setActiveView] = useState('inicio');

    const handleNavigate = (view) => {
        setActiveView(view);
    };

    const renderMainView = () => {
        switch (activeView) {
            case 'inicio':
                return <InicioView interest={interest} />;
            case 'recommendations':
                return <RecomendacoesView interest={interest} profile={profile} />;
            case 'tasks':
                return <Tasks interest={interest} profile={profile} onNavigate={handleNavigate} />;
            case 'curriculo':
                return <div className="overlay-view"><CurriculoBuilder profile={profile} isEmbedded={true} /></div>;
            default:
                return <InicioView interest={interest} />;
        }
    };

    return (
        <div className="modal-overlay visible" onClick={onClose}>
            <div className="interest-overlay-box" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="close-btn">&times;</button>
                <header className="overlay-header"><h2>{interest}</h2></header>
                <div className="overlay-body">
                    <aside className="overlay-sidebar">
                        
                        {}
                        <button className={`overlay-nav-button ${activeView === 'inicio' ? 'primary' : 'secondary'}`} onClick={() => setActiveView('inicio')}>
                            <div className="sidebar-button-content"><span>Início</span><small>Guia sobre o tema</small></div>
                        </button>
                        <button className={`overlay-nav-button ${activeView === 'recommendations' ? 'primary' : 'secondary'}`} onClick={() => setActiveView('recommendations')}>
                            <div className="sidebar-button-content"><span>Recomendações</span><small>Conteúdo dinâmico</small></div>
                        </button>
                        <button className={`overlay-nav-button ${activeView === 'tasks' ? 'primary' : 'secondary'}`} onClick={() => setActiveView('tasks')}>
                            <div className="sidebar-button-content"><span>Plano de Ação</span><small>Suas metas e passos</small></div>
                        </button>
                        {isCvInterest && (
                             <button className={`overlay-nav-button ${activeView === 'curriculo' ? 'primary' : 'secondary'}`} onClick={() => setActiveView('curriculo')}>
                                <div className="sidebar-button-content"><span>Criar Currículo</span><small>Ferramenta de criação</small></div>
                            </button>
                        )}
                    </aside>
                    <main className="overlay-main-content">
                        {renderMainView()}
                    </main>
                </div>
            </div>
        </div>
    );
}