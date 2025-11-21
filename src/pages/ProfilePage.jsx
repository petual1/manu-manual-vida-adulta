import React, { useState, useEffect, useRef } from 'react';
import { doc, updateDoc, onSnapshot, collection, query } from 'firebase/firestore'; 
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase'; 
import useLocationForm from '../hooks/useLocationForm';
import { runTaskEngine } from '../taskEngine';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import TrophyDisplay from '../components/TrophyDisplay'; 
import { useTrophyCalculator } from '../hooks/useTrophyCalculator'; 
import { toast } from 'sonner'; 

const interestOptions = [
    'Jovem Aprendiz', 'Primeiro Emprego (CLT)', 'Estágio',
    'Criar Currículo', 'Alistamento Militar', 'Documentos (RG, CPF)',
    'ENEM e Vestibulares', 'Prouni e FIES', 'Gestão Financeira'
];
const languageOptions = ['Português (Brasil)', 'Inglês', 'Espanhol', 'Francês', 'Libras'];
const proficiencyMap = { 'Básico': 25, 'Intermediário': 50, 'Avançado': 75, 'Fluente': 100 };
const BANNER_ASPECT = 4 / 1; 
const PROFILE_ASPECT = 1 / 1; 

function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){ u8arr[n] = bstr.charCodeAt(n); }
    return new Blob([u8arr], {type:mime});
}

function getCroppedImgAsDataUrl(image, crop) {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);
    return canvas.toDataURL('image/jpeg');
}

export default function ProfilePage({ user, profile, onProfileUpdate, onNavigate }) {
    const { states, cities, selectedState, setSelectedState, selectedCity, setSelectedCity, handleCepBlur, formatCep } = useLocationForm(profile);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editTab, setEditTab] = useState('pessoais'); 
    const [isDirty, setIsDirty] = useState(false); 
    
    const [mobileInterestsOpen, setMobileInterestsOpen] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '', dateOfBirth: '', cpf: '', phone: '', cep: '',
        street: '', number: '', complement: '', neighborhood: '',
        schoolName: '', bio: '' 
    });
    const [languages, setLanguages] = useState([]);
    const [selectedInterests, setSelectedInterests] = useState([]);
    
    const [imagePreview, setImagePreview] = useState('/avatar-padrao.png');
    const [bannerPreview, setBannerPreview] = useState(null); 
    
    const [profileImgSrc, setProfileImgSrc] = useState('');
    const [profileCrop, setProfileCrop] = useState();
    const [completedProfileCrop, setCompletedProfileCrop] = useState(null);
    const [showProfileCropper, setShowProfileCropper] = useState(false);
    const profileImgRef = useRef(null);

    const [bannerImgSrc, setBannerImgSrc] = useState('');
    const [bannerCrop, setBannerCrop] = useState();
    const [completedBannerCrop, setCompletedBannerCrop] = useState(null);
    const [showBannerCropper, setShowBannerCropper] = useState(false);
    const bannerImgRef = useRef(null);
    
    const numberInputRef = useRef(null); 
    const [activeTab, setActiveTab] = useState('perfil'); 
    const [allUserTasks, setAllUserTasks] = useState([]);

    useEffect(() => {
        const handleProfileModeChange = (event) => {
            setIsEditing(event.detail);
            if(event.detail === false) setIsDirty(false);
        };
        document.addEventListener('setProfileMode', handleProfileModeChange);
        return () => document.removeEventListener('setProfileMode', handleProfileModeChange);
    }, []);

    useEffect(() => {
        window.isProfileDirty = isDirty;
        const handleNavigationAttempt = (e) => {
            const targetPage = e.detail;
            toast("Atenção: Alterações não salvas", {
                description: "Se você sair agora, perderá suas edições.",
                action: {
                    label: "Sair sem salvar",
                    onClick: () => {
                        window.isProfileDirty = false;
                        setIsDirty(false);
                        setIsEditing(false);
                        onNavigate(targetPage);
                    }
                },
                cancel: { label: "Ficar" },
                duration: 5000,
            });
        };
        window.addEventListener('triggerProfileNavAlert', handleNavigationAttempt);
        return () => {
            window.isProfileDirty = false;
            window.removeEventListener('triggerProfileNavAlert', handleNavigationAttempt);
        };
    }, [isDirty, onNavigate]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = ''; 
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    useEffect(() => {
        if (profile) {
            setFormData({
                fullName: profile.fullName || '',
                dateOfBirth: profile.dateOfBirth || '',
                cpf: profile.cpf || '',
                phone: profile.phone || '',
                cep: profile.address?.cep || '',
                street: profile.address?.street || '',
                number: profile.address?.number || '',
                complement: profile.address?.complement || '',
                neighborhood: profile.address?.neighborhood || '',
                schoolName: profile.education?.schoolName || '',
                bio: profile.bio || '' 
            });
            setLanguages(Array.isArray(profile.languages) ? profile.languages : []);
            setSelectedInterests(profile.interests || []);
            setImagePreview(profile?.photoURL ? profile.photoURL : (user?.photoURL || '/avatar-padrao.png'));
            setBannerPreview(profile.bannerURL || null);
            setSelectedState(profile.address?.state || '');
            setSelectedCity(profile.address?.city || '');
        }
    }, [profile, user]); 

    useEffect(() => {
        if (!user?.uid) return;
        const tasksRef = collection(db, 'users', user.uid, 'tasks');
        const q = query(tasksRef); 
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userTasks = snapshot.docs.map(doc => ({ id: doc.data().id, status: doc.data().status }));
            setAllUserTasks(userTasks);
        });
        return () => unsubscribe(); 
    }, [user?.uid]); 

    const calculatedTrophies = useTrophyCalculator(profile?.interests, allUserTasks);

    const markAsDirty = () => setIsDirty(true);
    const discardChanges = () => { setIsEditing(false); setIsDirty(false); };
    const handleSafeTabChange = (newTab) => setEditTab(newTab);

    const handleCancelRequest = (e) => {
        e.preventDefault();
        if (isDirty) {
            toast("Descartar alterações?", {
                description: "Todo o progresso não salvo será perdido.",
                action: { label: "Sim, descartar", onClick: discardChanges },
                cancel: { label: "Não" }
            });
        } else {
            discardChanges();
        }
    };

    const handleSaveRequest = (e) => {
        e.preventDefault();
        if (!isDirty) {
            setIsEditing(false);
            return;
        }
        toast("Salvar alterações?", {
            description: "Seus dados serão atualizados no sistema.",
            action: { label: "Confirmar", onClick: performSave },
            cancel: { label: "Cancelar" }
        });
    };

    const performSave = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const toastId = toast.loading("Salvando...");
        let finalPhotoURL = profile.photoURL; 
        let finalBannerURL = profile.bannerURL; 

        try {
            if (imagePreview.startsWith('data:')) {
                const snapshot = await uploadBytesResumable(ref(storage, `users/${currentUser.uid}/profile/profile_pic.png`), dataURLtoBlob(imagePreview));
                finalPhotoURL = await getDownloadURL(snapshot.ref);
            } else if (imagePreview === '/avatar-padrao.png') finalPhotoURL = null;

            if (bannerPreview && bannerPreview.startsWith('data:')) {
                const snapshot = await uploadBytesResumable(ref(storage, `users/${currentUser.uid}/banner/banner_img.png`), dataURLtoBlob(bannerPreview));
                finalBannerURL = await getDownloadURL(snapshot.ref);
            } else if (bannerPreview === null) finalBannerURL = null;

            const updatedProfile = {
                ...profile, ...formData,
                photoURL: finalPhotoURL, bannerURL: finalBannerURL,
                interests: selectedInterests, languages: languages,
                address: { cep: formData.cep, street: formData.street, number: formData.number, complement: formData.complement, neighborhood: formData.neighborhood, city: selectedCity, state: selectedState },
                education: { schoolName: formData.schoolName },
                trophies: profile?.trophies || [] 
            };

            await updateDoc(doc(db, 'users', currentUser.uid), updatedProfile, { merge: true });
            runTaskEngine(updatedProfile, currentUser.uid);
            onProfileUpdate(updatedProfile); 
            toast.success('Perfil atualizado!', { id: toastId });
            setIsEditing(false);
            setIsDirty(false);
            window.isProfileDirty = false;
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar.", { id: toastId });
        }
    };

    const handleChange = (e) => { markAsDirty(); const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleCpfChange = (e) => { markAsDirty(); let value = e.target.value.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2"); setFormData(prev => ({ ...prev, cpf: value })); };
    const handlePhoneChange = (e) => { markAsDirty(); let value = e.target.value.replace(/\D/g, "").slice(0, 11).replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d)(\d{4})$/, "$1-$2"); setFormData(prev => ({ ...prev, phone: value })); };
    const handleLanguageChange = (e, id) => {
        markAsDirty();
        const { name, value } = e.target;
        setLanguages(languages.map(item => item.id === id ? { ...item, [name]: name === 'level' ? value : value, proficiency: name === 'level' ? (proficiencyMap[value] || 50) : item.proficiency } : item));
    };
    const addLanguage = () => { markAsDirty(); setLanguages([...languages, { id: `lang-${Date.now()}`, language: '', level: 'Intermediário', proficiency: 50 }]); };
    const removeLanguage = (id) => { markAsDirty(); setLanguages(languages.filter(item => item.id !== id)); };
    const toggleInterest = (interest) => { markAsDirty(); setSelectedInterests(prev => prev.includes(interest) ? prev.filter(item => item !== interest) : [...prev, interest]); };
    
    const handleImageChange = (e) => { if (e.target.files && e.target.files.length > 0) { markAsDirty(); setProfileCrop(undefined); const reader = new FileReader(); reader.addEventListener('load', () => setProfileImgSrc(reader.result.toString())); reader.readAsDataURL(e.target.files[0]); setShowProfileCropper(true); } };
    const handleBannerChange = (e) => { if (e.target.files && e.target.files.length > 0) { markAsDirty(); setBannerCrop(undefined); const reader = new FileReader(); reader.addEventListener('load', () => setBannerImgSrc(reader.result.toString())); reader.readAsDataURL(e.target.files[0]); setShowBannerCropper(true); } };
    const handleImageRemove = (e) => { e.preventDefault(); e.stopPropagation(); toast("Remover foto de perfil?", { action: { label: "Remover", onClick: () => { markAsDirty(); setImagePreview('/avatar-padrao.png'); } }, cancel: { label: "Cancelar" } }); };
    const handleBannerRemove = (e) => { e.preventDefault(); e.stopPropagation(); toast("Remover capa do perfil?", { action: { label: "Remover", onClick: () => { markAsDirty(); setBannerPreview(null); } }, cancel: { label: "Cancelar" } }); };

    function onProfileImageLoad(e) { const { width, height } = e.currentTarget; setProfileCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, PROFILE_ASPECT, width, height), width, height)); }
    function onBannerImageLoad(e) { const { width, height } = e.currentTarget; setBannerCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, BANNER_ASPECT, width, height), width, height)); }
    const handleProfileCropConfirm = async () => { if (completedProfileCrop?.width && completedProfileCrop?.height && profileImgRef.current) { setImagePreview(getCroppedImgAsDataUrl(profileImgRef.current, completedProfileCrop)); setShowProfileCropper(false); } };
    const handleBannerCropConfirm = async () => { if (completedBannerCrop?.width && completedBannerCrop?.height && bannerImgRef.current) { setBannerPreview(getCroppedImgAsDataUrl(bannerImgRef.current, completedBannerCrop)); setShowBannerCropper(false); } };
    
    const renderProfileForm = () => {
        const bannerStyle = bannerPreview ? { backgroundImage: `url(${bannerPreview})` } : {};
        
        return (
            <div className="profile-display-card">
                <div className="profile-banner" style={bannerStyle}>
                    <div className="edit-overlay-full">
                        <label htmlFor="banner-upload" className="overlay-action-btn" title="Alterar Capa"><i className="fas fa-camera"></i></label>
                        {bannerPreview && <button type="button" onClick={handleBannerRemove} className="overlay-action-btn danger" title="Remover Capa"><i className="fas fa-trash"></i></button>}
                        <input id="banner-upload" type="file" accept="image/*" onChange={handleBannerChange} style={{display: 'none'}}/>
                    </div>
                </div>
                <div className="profile-display-body no-padding-top">
                    <div className="profile-display-grid">
                        <div className="profile-info-column">
                            {}
                            <div className="profile-photo-wrapper">
                                <img src={imagePreview} alt="Preview do Perfil" className="profile-display-photo" />
                                <div className="edit-overlay-full rounded">
                                    <label htmlFor="profile-upload" className="overlay-action-btn" title="Alterar Foto"><i className="fas fa-camera"></i></label>
                                    {imagePreview !== '/avatar-padrao.png' && <button type="button" onClick={handleImageRemove} className="overlay-action-btn danger" title="Remover Foto"><i className="fas fa-trash"></i></button>}
                                    <input id="profile-upload" type="file" accept="image/*" onChange={handleImageChange} style={{display: 'none'}}/>
                                </div>
                            </div>
                            
                            <div style={{marginTop: '1rem'}}> 
                                <h2>{formData.fullName || 'Seu Nome'}</h2>
                                <p style={{color: 'var(--secondary-text)'}}>Modo de Edição</p>
                            </div>
                        </div>

                        <div className="profile-skills-column">
                            <div className="profile-tabs settings-tabs">
                                <button type="button" className={`profile-tab-btn ${editTab === 'pessoais' ? 'active' : ''}`} onClick={() => handleSafeTabChange('pessoais')}>Pessoais</button>
                                <button type="button" className={`profile-tab-btn ${editTab === 'endereco' ? 'active' : ''}`} onClick={() => handleSafeTabChange('endereco')}>Endereço</button>
                                <button type="button" className={`profile-tab-btn ${editTab === 'educacao' ? 'active' : ''}`} onClick={() => handleSafeTabChange('educacao')}>Educação</button>
                                <button type="button" className={`profile-tab-btn ${editTab === 'interesses' ? 'active' : ''}`} onClick={() => handleSafeTabChange('interesses')}>Interesses</button>
                            </div>
                        </div>
                    </div>
                    <form className="settings-content-area">
                        {editTab === 'pessoais' && (
                            <div className="animate-fade-in">
                                <div className="form-group"><label>Bio</label><textarea name="bio" rows="3" placeholder="Conte um pouco sobre você..." value={formData.bio} onChange={handleChange}></textarea></div>
                                <div className="form-row"><div className="form-group"><label>Nome Completo</label><input name="fullName" type="text" value={formData.fullName} onChange={handleChange} /></div><div className="form-group"><label>Nascimento</label><input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} /></div></div>
                                <div className="form-row"><div className="form-group"><label>CPF</label><input name="cpf" type="text" value={formData.cpf} onChange={handleCpfChange} /></div><div className="form-group"><label>Telefone</label><input name="phone" type="text" value={formData.phone} onChange={handlePhoneChange} /></div></div>
                            </div>
                        )}
                        {editTab === 'endereco' && (
                            <div className="animate-fade-in">
                                <div className="form-group"><label>CEP</label><input name="cep" type="text" value={formData.cep} onInput={formatCep} onChange={handleChange} onBlur={(e) => handleCepBlur(e, (newVal) => { setFormData(prev => ({...prev, ...newVal})); if(newVal.street) numberInputRef.current?.focus(); })} /></div>
                                <div className="form-row"><div className="form-group" style={{gridColumn: '1 / 3'}}><label>Rua</label><input name="street" type="text" value={formData.street} onChange={handleChange} /></div><div className="form-group"><label>Número</label><input name="number" type="text" value={formData.number} onChange={handleChange} ref={numberInputRef} /></div></div>
                                <div className="form-group"><label>Complemento</label><input name="complement" type="text" value={formData.complement} onChange={handleChange} /></div>
                                <div className="form-row"><div className="form-group"><label>Bairro</label><input name="neighborhood" type="text" value={formData.neighborhood} onChange={handleChange} /></div><div className="form-group"><label>Estado</label><select name="state" value={selectedState} onChange={(e) => { markAsDirty(); setSelectedState(e.target.value); }}><option value="">...</option>{states.map(s => <option key={s.id} value={s.sigla}>{s.nome}</option>)}</select></div><div className="form-group"><label>Cidade</label><select name="city" value={selectedCity} onChange={(e) => { markAsDirty(); setSelectedCity(e.target.value); }} disabled={!selectedState}><option value="">...</option>{cities.map(c => <option key={c} value={c}>{c}</option>)}</select></div></div>
                            </div>
                        )}
                        {editTab === 'educacao' && (
                            <div className="animate-fade-in">
                                <div className="form-group"><label>Instituição de Ensino</label><input name="schoolName" type="text" value={formData.schoolName} onChange={handleChange} /></div>
                                <hr/><h4>Idiomas</h4>
                                {languages.map((lang) => (
                                    <div className="form-array-item" key={lang.id} style={{padding: '10px'}}>
                                        <div className="form-row" style={{marginBottom: '10px'}}><input style={{marginBottom: 0}} list="idiomas-lista" type="text" name="language" value={lang.language} onChange={(e) => handleLanguageChange(e, lang.id)} placeholder="Idioma"/><select style={{marginBottom: 0}} name="level" value={lang.level} onChange={(e) => handleLanguageChange(e, lang.id)}><option>Básico</option><option>Intermediário</option><option>Avançado</option><option>Fluente</option></select></div>
                                        <button type="button" onClick={() => removeLanguage(lang.id)} className="nav-button danger small" style={{width: '100%'}}>Remover</button>
                                    </div>
                                ))}
                                <button type="button" onClick={addLanguage} className="nav-button secondary small" style={{marginBottom: '1.5rem'}}>+ Adicionar Idioma</button>
                                <datalist id="idiomas-lista">{languageOptions.map(opt => <option key={opt} value={opt} />)}</datalist>
                            </div>
                        )}
                        
                        {editTab === 'interesses' && (
                            <div className="animate-fade-in">
                                <h4>Selecione seus Interesses</h4>
                                <div className={`interests-selector-grid ${window.innerWidth <= 768 && !mobileInterestsOpen ? 'collapsed' : ''}`}>
                                    {interestOptions.map(interest => {
                                        const isSelected = selectedInterests.includes(interest);
                                        return (
                                            <div key={interest} className={`interest-pill-option ${isSelected ? 'selected' : ''}`} onClick={() => toggleInterest(interest)}>
                                                {interest} {isSelected && <i className="fas fa-check" style={{marginLeft: '8px', fontSize: '0.8em'}}></i>}
                                            </div>
                                        );
                                    })}
                                </div>

                                <button 
                                    type="button"
                                    className="mobile-interests-toggle-btn"
                                    style={{ display: window.innerWidth > 768 ? 'none' : 'flex' }}
                                    onClick={() => setMobileInterestsOpen(!mobileInterestsOpen)}
                                >
                                    {mobileInterestsOpen ? 'Ver menos' : 'Ver todos'}
                                    <i className={`fas fa-chevron-${mobileInterestsOpen ? 'up' : 'down'}`}></i>
                                </button>
                            </div>
                        )}

                        <div className="floating-save-bar">
                            <button type="button" onClick={handleCancelRequest} className="action-btn btn-cancel" title="Cancelar"><i className="fas fa-times"></i></button>
                            <button type="button" onClick={handleSaveRequest} className="action-btn btn-save" title="Salvar"><i className="fas fa-check"></i></button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };
    
    const renderProfileDisplay = () => {
        const bannerStyle = bannerPreview ? { backgroundImage: `url(${bannerPreview})` } : {};
        return (
            <div className="profile-display-card">
                <div className="profile-banner" style={bannerStyle}></div>
                <div className="profile-display-body">
                    <div className="profile-photo-wrapper"><img src={imagePreview} alt="Foto de Perfil" className="profile-display-photo" referrerPolicy="no-referrer"/></div>
                    <div className="profile-display-grid">
                        <div className="profile-info-column">
                            <h2>{profile?.fullName || user?.displayName}</h2>
                            <p className="profile-bio">{profile?.bio || 'Edite seu perfil para adicionar uma bio.'}</p>
                            <p>{profile?.address?.city || 'Localização não informada'}{profile?.address?.state ? `, ${profile.address.state}` : ''}</p>
                            <div className="profile-main-actions"><button onClick={() => setIsEditing(true)} className="nav-button"><i className="fas fa-pen"></i> Editar Perfil</button><button onClick={() => onNavigate('configuracoes')} className="nav-button secondary"><i className="fas fa-cog"></i> Configurações</button></div>
                        </div>
                        
                        <div className="profile-skills-column">
                            <div 
                                className={`skills-header ${window.innerWidth <= 768 ? 'mobile-toggle' : ''}`} 
                                onClick={() => window.innerWidth <= 768 && setMobileInterestsOpen(!mobileInterestsOpen)}
                                style={{cursor: window.innerWidth <= 768 ? 'pointer' : 'default'}}
                            >
                                <h4>Interesses</h4>
                                {window.innerWidth <= 768 ? (
                                    <i className={`fas fa-chevron-${mobileInterestsOpen ? 'up' : 'down'}`}></i>
                                ) : (
                                    <i className="fas fa-star"></i>
                                )}
                            </div>
                            
                            <div className={`skills-list ${window.innerWidth <= 768 && !mobileInterestsOpen ? 'hidden-mobile' : ''}`}>
                                {(profile?.interests || []).map(interest => (<span key={interest} className="skill-pill">{interest}</span>))}
                                {(!profile?.interests || profile.interests.length === 0) && (<p>Nenhum interesse selecionado.</p>)}
                            </div>
                        </div>
                        
                    </div>
                    <div className="profile-action-cards-grid">
                        <div className="profile-action-card" onClick={() => onNavigate('documentos')}><div><h4>Meus Documentos</h4><p>Ver e gerenciar seus documentos.</p></div><i className="fas fa-chevron-right"></i></div>
                        <div className="profile-action-card" onClick={() => onNavigate('inicio')}><div><h4>Meu Painel</h4><p>Ver suas tarefas e progresso.</p></div><i className="fas fa-chevron-right"></i></div>
                        <div className="profile-action-card" onClick={() => setActiveTab('trofeus')}><div><h4>Meus Troféus</h4><p>Ver suas conquistas e medalhas.</p></div><i className="fas fa-chevron-right"></i></div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {showProfileCropper && profileImgSrc && (<div className="modal-overlay visible"><div className="modal-box crop-modal"><h3>Ajustar Foto</h3><ReactCrop crop={profileCrop} onChange={c => setProfileCrop(c)} onComplete={c => setCompletedProfileCrop(c)} aspect={PROFILE_ASPECT}><img ref={profileImgRef} src={profileImgSrc} onLoad={onProfileImageLoad} alt="A cortar"/></ReactCrop><div className="crop-buttons"><button onClick={() => setShowProfileCropper(false)} className="nav-button">Cancelar</button><button onClick={handleProfileCropConfirm} className="nav-button primary">Confirmar</button></div></div></div>)}
            {showBannerCropper && bannerImgSrc && (<div className="modal-overlay visible"><div className="modal-box crop-modal large"><h3>Ajustar Banner</h3><ReactCrop crop={bannerCrop} onChange={c => setBannerCrop(c)} onComplete={c => setCompletedBannerCrop(c)} aspect={BANNER_ASPECT}><img ref={bannerImgRef} src={bannerImgSrc} onLoad={onBannerImageLoad} alt="A cortar"/></ReactCrop><div className="crop-buttons"><button onClick={() => setShowBannerCropper(false)} className="nav-button">Cancelar</button><button onClick={handleBannerCropConfirm} className="nav-button primary">Confirmar</button></div></div></div>)}
            <header className="content-header"><h2>Minha Conta</h2><p>Atualize suas informações e veja suas conquistas.</p></header>
            <div className="content-body">
                <div className="profile-tab-content">
                    {activeTab === 'perfil' && (isEditing ? renderProfileForm() : renderProfileDisplay())}
                    {activeTab === 'trofeus' && (<TrophyDisplay trophies={calculatedTrophies} />)}
                </div>
            </div>
        </>
    );
}