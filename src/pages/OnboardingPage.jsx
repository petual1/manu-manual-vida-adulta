import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth'; 
import { db, auth } from '../firebase';
import useLocationForm from '../hooks/useLocationForm';
import { runTaskEngine } from '../taskEngine';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const interestOptions = [
    'Jovem Aprendiz', 'Primeiro Emprego (CLT)', 'Estágio',
    'Criar Currículo', 'Alistamento Militar', 'Documentos (RG, CPF)',
    'ENEM e Vestibulares', 'Prouni e FIES', 'Gestão Financeira'
];

const languageOptions = ['Português', 'Inglês', 'Espanhol', 'Francês', 'Libras'];

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

export default function OnboardingPage({ user, profile, onProfileUpdate }) {
    const { states, cities, selectedState, setSelectedState, selectedCity, setSelectedCity, handleCepBlur, formatCep } = useLocationForm();
    
    const [step, setStep] = useState(1); 
    const [formData, setFormData] = useState({
        fullName: profile?.displayName || user?.displayName || '',
        dateOfBirth: '', cpf: '', phone: '', language: '',
        cep: '', street: '', number: '', complement: '', neighborhood: '',
        schoolName: ''
    });
    
    const [selectedInterests, setSelectedInterests] = useState(['Jovem Aprendiz']);
    
    const [imagePreview, setImagePreview] = useState(
        profile?.photoURL || user?.photoURL || '/avatar-padrao.png'
    );
    
    // Cropper states
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const imgRef = useRef(null);
    const numberInputRef = useRef(null);

    useEffect(() => {
        if (profile?.photoURL) {
            setImagePreview(profile.photoURL);
        } else if (user?.photoURL) {
            setImagePreview(user.photoURL);
        } else {
            setImagePreview('/avatar-padrao.png');
        }
    }, [profile, user]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Erro ao sair:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCpfChange = (e) => {
        let value = e.target.value.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        setFormData(prev => ({ ...prev, cpf: value }));
    };
    
    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, "").slice(0, 11).replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d)(\d{4})$/, "$1-$2");
        setFormData(prev => ({ ...prev, phone: value }));
    };

    const toggleInterest = (interest) => {
        setSelectedInterests(prev => 
            prev.includes(interest) ? prev.filter(item => item !== interest) : [...prev, interest]
        );
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined);
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
            setShowCropper(true);
        }
    };
    
    function onImageLoad(e) {
        const { width, height } = e.currentTarget;
        setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height));
    }

    const handleCropConfirm = async () => {
        if (completedCrop?.width && completedCrop?.height && imgRef.current) {
            const dataUrl = getCroppedImgAsDataUrl(imgRef.current, completedCrop);
            setImagePreview(dataUrl);
            setShowCropper(false);
        }
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        if (!formData.fullName || !formData.dateOfBirth || !formData.cpf || !formData.phone || !formData.language) {
            alert("Por favor, preencha todos os campos obrigatórios do passo 1.");
            return;
        }
        setStep(2);
    };

    const handlePrevStep = (e) => {
        e.preventDefault();
        setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.cep || !formData.street || !formData.number || !formData.neighborhood || !formData.schoolName || !selectedState || !selectedCity) {
            alert("Por favor, preencha todos os campos de endereço e escolaridade.");
            return;
        }

        const userProfile = {
            ...profile, ...formData,
            photoURL: imagePreview,
            interests: selectedInterests,
            address: { cep: formData.cep, street: formData.street, number: formData.number, complement: formData.complement, neighborhood: formData.neighborhood, city: selectedCity, state: selectedState },
            education: { schoolName: formData.schoolName },
            profileComplete: true,
            email: user.email,
            trophies: [] 
        };
        await setDoc(doc(db, 'users', user.uid), userProfile, { merge: true });
        runTaskEngine(userProfile, user.uid);
        onProfileUpdate(userProfile);
    };

    return (
        <>
            {showCropper && (
                <div className="modal-overlay visible">
                    <div className="modal-box crop-modal">
                        <h3>Ajustar Foto</h3>
                        <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={1}><img ref={imgRef} src={imgSrc} onLoad={onImageLoad} alt="Cortar" /></ReactCrop>
                        <div className="crop-buttons"><button onClick={() => setShowCropper(false)} className="nav-button">Cancelar</button><button onClick={handleCropConfirm} className="nav-button primary">Confirmar</button></div>
                    </div>
                </div>
            )}

            <div className="onboarding-wrapper">
                
                <div className="onboarding-header-simple" style={{marginTop: '30px'}}> 
                    <h2>Olá! Boas-vindas ao Manu.</h2>
                    <p>Vamos configurar seu perfil rapidinho.</p>
                </div>

                <form onSubmit={handleSubmit} className="onboarding-form-area">
                    
                    {step === 1 && (
                        <div className="onboarding-step-grid animate-fade-in">
                            
                            {/* Card 1: Identidade */}
                            <div className="onboarding-card centered-content">
                                <div className="ob-photo-container">
                                    {imagePreview && imagePreview !== '/avatar-padrao.png' ? (
                                        <img src={imagePreview} alt="Perfil" referrerPolicy="no-referrer" />
                                    ) : (
                                        <svg className="ob-default-avatar" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                        </svg>
                                    )}
                                    <label htmlFor="ob-upload" className="ob-photo-edit-btn">
                                        <i className="fas fa-camera"></i>
                                    </label>
                                    <input id="ob-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                                </div>
                                <h4>Identidade</h4>
                                <div className="form-group w-100"><label>Nome Completo *</label><input name="fullName" type="text" value={formData.fullName} onChange={handleChange} required /></div>
                                <div className="form-group w-100"><label>Nascimento *</label><input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required /></div>
                                <div className="form-group w-100"><label>CPF *</label><input name="cpf" type="text" placeholder="000.000.000-00" value={formData.cpf} onChange={handleCpfChange} required /></div>
                            </div>

                            {/* Card 2: Contato */}
                            <div className="onboarding-card">
                                <div className="card-header-icon"><i className="fas fa-address-book"></i> <h4>Contato</h4></div>
                                <div className="form-group"><label>Telefone *</label><input name="phone" type="text" value={formData.phone} onChange={handlePhoneChange} placeholder="(00) 00000-0000" required /></div>
                                <div className="form-group">
                                    <label>Idioma *</label>
                                    <select name="language" value={formData.language} onChange={handleChange} required>
                                        <option value="">Selecione...</option>
                                        {languageOptions.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                                <p className="ob-hint">Esses dados ajudam a personalizar suas tarefas.</p>
                            </div>

                            {/* Card 3: Interesses */}
                            <div className="onboarding-card">
                                <div className="card-header-icon"><i className="fas fa-star"></i> <h4>Interesses</h4></div>
                                <div className="interests-selector-grid compact">
                                    {interestOptions.map(interest => (
                                        <div key={interest} className={`interest-pill-option ${selectedInterests.includes(interest) ? 'selected' : ''}`} onClick={() => toggleInterest(interest)}>
                                            {interest}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="onboarding-single-card animate-fade-in">
                            <div className="card-header-icon center"><i className="fas fa-map-marker-alt"></i> <h4>Endereço & Estudo</h4></div>
                            
                            <div className="form-row">
                                <div className="form-group"><label>CEP *</label><input name="cep" type="text" value={formData.cep} onInput={formatCep} onChange={handleChange} onBlur={(e) => handleCepBlur(e, (newVal) => { setFormData(prev => ({...prev, ...newVal})); if(newVal.street) numberInputRef.current?.focus(); })} required /></div>
                                <div className="form-group" style={{flex: 2}}><label>Rua *</label><input name="street" type="text" value={formData.street} onChange={handleChange} required /></div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group"><label>Número *</label><input name="number" type="text" value={formData.number} onChange={handleChange} ref={numberInputRef} required /></div>
                                <div className="form-group"><label>Bairro *</label><input name="neighborhood" type="text" value={formData.neighborhood} onChange={handleChange} required /></div>
                                <div className="form-group"><label>Cidade/UF *</label><input type="text" value={`${selectedCity} - ${selectedState}`} disabled style={{background: '#f0f0f0'}} /></div>
                            </div>

                            <div className="form-group"><label>Nome da Escola / Instituição *</label><input name="schoolName" type="text" value={formData.schoolName} onChange={handleChange} required /></div>
                        </div>
                    )}

                    {}
                    <div className="onboarding-footer-fixed">
                        {step === 1 ? (
                            <>
                                <button type="button" onClick={handleLogout} className="nav-button secondary pill-btn">
                                    <i className="fas fa-sign-out-alt"></i> Sair
                                </button>
                                <button type="button" onClick={handleNextStep} className="nav-button primary pill-btn">
                                    Continuar <i className="fas fa-arrow-right"></i>
                                </button>
                            </>
                        ) : (
                            <>
                                <button type="button" onClick={handlePrevStep} className="nav-button secondary pill-btn">
                                    Voltar
                                </button>
                                <button type="submit" className="nav-button success pill-btn">
                                    Finalizar <i className="fas fa-check"></i>
                                </button>
                            </>
                        )}
                    </div>

                </form>
            </div>
        </>
    );
}