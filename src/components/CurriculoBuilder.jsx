import React, { useState, useEffect, memo } from 'react';
import { Document, Page, Text, View, PDFViewer, Font, Image, Link, pdf } from '@react-pdf/renderer';
import { createCvStyles } from './cv-templates';

Font.register({
  family: 'Poppins',
  fonts: [
    { src: '/fonts/Poppins-Regular.ttf' },
    { src: '/fonts/Poppins-Bold.ttf', fontWeight: 'bold' },
  ],
});

const IDIOMAS_COMUNS = ["Português", "Inglês", "Espanhol", "Francês", "Alemão", "Italiano", "Japonês", "Mandarim", "Libras"];


const CurriculoPDF = ({ data, options }) => {
    const styles = createCvStyles(options);
    const { fullName, jobTitle, email, phone, address, summary, experience, education, skills, languages, links, projects, certifications } = data;
    const { template, photo } = options;
    const fullAddress = address?.city && address?.state ? `${address.city}, ${address.state}` : '';

    const ResumoSection = ({ titleStyle }) => summary ? <View wrap={false} style={styles.section}><Text style={titleStyle || styles.sectionTitle}>Resumo</Text><Text style={styles.description}>{summary}</Text></View> : null;
    const ExperienciaSection = ({ titleStyle }) => experience?.length > 0 ? <View style={styles.section}><Text style={titleStyle || styles.sectionTitle}>Experiência</Text>{experience.map(exp => (<View key={exp.id} style={styles.itemContainer}><Text style={styles.entryTitle}>{exp.title}</Text><Text style={styles.entrySub}>{exp.company} | {exp.startDate} - {exp.endDate}</Text><Text style={styles.description}>{exp.description}</Text></View>))}</View> : null;
    const FormacaoSection = ({ titleStyle }) => education?.length > 0 ? <View wrap={false} style={styles.section}><Text style={titleStyle || styles.sectionTitle}>Formação</Text>{education.map(edu => (<View key={edu.id} style={styles.itemContainer}><Text style={styles.entryTitle}>{edu.degree}</Text><Text style={styles.entrySub}>{edu.school} - {edu.year}</Text></View>))}</View> : null;
    const HabilidadesSection = ({ titleStyle }) => skills?.length > 0 ? <View wrap={false} style={styles.section}><Text style={titleStyle || styles.sectionTitle}>Habilidades</Text><View style={styles.skillsContainer}>{skills.map((skill, index) => (<Text key={index} style={styles.skillTag}>{skill}</Text>))}</View></View> : null;
    
    const IdiomasSection = ({ titleStyle }) => languages?.length > 0 ? <View wrap={false} style={styles.section}><Text style={titleStyle || styles.sectionTitle}>Idiomas</Text>{languages.map(lang => (<View key={lang.id} style={styles.itemContainer}><Text style={styles.languageName}>{lang.language} - {lang.level}</Text><View style={styles.languageLevelBar}><View style={{...styles.languageLevelProgress, width: `${lang.proficiency || 0}%`}} /></View></View>))}</View> : null;
    
    const ProjetosSection = ({ titleStyle }) => projects?.length > 0 ? <View style={styles.section}><Text style={titleStyle || styles.sectionTitle}>Projetos</Text>{projects.map(proj => (<View key={proj.id} style={styles.itemContainer}><Link src={proj.url} style={styles.entryTitle}><Text>{proj.name}</Text></Link><Text style={styles.description}>{proj.description}</Text></View>))}</View> : null;
    const CertificacoesSection = ({ titleStyle }) => certifications?.length > 0 ? <View style={styles.section}><Text style={titleStyle || styles.sectionTitle}>Certificações</Text>{certifications.map(cert => (<View key={cert.id} style={styles.itemContainer}><Text style={styles.entryTitle}>{cert.name}</Text></View>))}</View> : null;
    const LinksSection = ({ titleStyle }) => links?.length > 0 ? <View wrap={false} style={styles.section}><Text style={titleStyle || styles.sectionTitle}>Links</Text>{links.map(link => (<Link key={link.id} src={link.url} style={styles.linkItem}>{link.name}</Link>))}</View> : null;

    switch (template) {
        case 'moderno':
            return (
                <Document>
                    <Page size="A4" style={styles.page}>
                        <View style={styles.fixedBackgroundLeft} fixed />
                        <View style={styles.leftColumnContent}>
                            {photo && <Image src={photo} style={styles.photo} />}
                            <View wrap={false} style={styles.section}>
                                <Text style={styles.sectionTitleLeft}>Contato</Text>
                                <Text style={styles.contactItem}>{email}</Text>
                                <Text style={styles.contactItem}>{phone}</Text>
                                <Text style={styles.contactItem}>{fullAddress}</Text>
                            </View>
                            <FormacaoSection titleStyle={styles.sectionTitleLeft} />
                            <IdiomasSection titleStyle={styles.sectionTitleLeft} />
                            <LinksSection titleStyle={styles.sectionTitleLeft} />
                            <HabilidadesSection titleStyle={styles.sectionTitleLeft} />
                        </View>
                        <View style={styles.rightColumnContent}>
                            <View wrap={false} style={styles.headerRight}>
                                <Text style={styles.name}>{fullName}</Text>
                                <Text style={styles.jobTitle}>{jobTitle}</Text>
                            </View>
                            <ResumoSection titleStyle={styles.sectionTitle} />
                            <ExperienciaSection titleStyle={styles.sectionTitle} />
                            <ProjetosSection titleStyle={styles.sectionTitle} />
                            <CertificacoesSection titleStyle={styles.sectionTitle} />
                        </View>
                    </Page>
                </Document>
            );

        case 'classico':
            return <Document><Page size="A4" style={styles.page}><View style={styles.header}>{photo && <Image src={photo} style={styles.photo} />}<Text style={styles.name}>{fullName}</Text><Text style={styles.jobTitle}>{jobTitle}</Text><Text>{`${email} | ${phone} | ${fullAddress}`}</Text></View><ResumoSection /><ExperienciaSection /><ProjetosSection /><FormacaoSection /><HabilidadesSection /><IdiomasSection /><LinksSection /><CertificacoesSection /></Page></Document>;
        case 'criativo':
            return <Document><Page size="A4" style={styles.page}><View style={styles.headerContainer}>{photo && <View style={styles.photoContainer}><Image src={photo} style={styles.photo} /></View>}<View style={styles.headerText}><Text style={styles.name}>{fullName}</Text><Text style={styles.jobTitle}>{jobTitle}</Text></View></View><View style={styles.mainContent}><View style={styles.leftColumn}><ResumoSection /><ExperienciaSection /><ProjetosSection /></View><View style={styles.rightColumn}><View style={styles.section}><Text style={styles.sectionTitle}>Contato</Text><Text>{email}</Text><Text>{phone}</Text><Text>{fullAddress}</Text></View><FormacaoSection /><HabilidadesSection /><IdiomasSection /><LinksSection /><CertificacoesSection /></View></View></Page></Document>;
        case 'executivo':
            return <Document><Page size="A4" style={styles.page}><View style={styles.leftColumn}><View style={styles.header}><Text style={styles.name}>{fullName}</Text><Text style={styles.jobTitle}>{jobTitle}</Text><View style={styles.contactInfo}><Text style={styles.contactItem}>{email}</Text><Text style={styles.contactItem}>{phone}</Text></View></View><ResumoSection /><ExperienciaSection /><ProjetosSection /></View><View style={styles.rightColumn}>{photo && <Image src={photo} style={styles.photo} />}<FormacaoSection /><HabilidadesSection /><IdiomasSection /><LinksSection /><CertificacoesSection /></View></Page></Document>;
        default:
            return <Document><Page><Text>Template não encontrado.</Text></Page></Document>;
    }
};

const MemoizedPDFPreview = memo(({ data, options }) => {
    const contentMetrics = {
        summaryLength: data.summary?.length || 0,
        experienceCount: data.experience?.length || 0,
        educationCount: data.education?.length || 0,
        skillsCount: data.skills?.length || 0,
        projectsCount: data.projects?.length || 0,
        languagesCount: data.languages?.length || 0,
        certificationsCount: data.certifications?.length || 0,
    };
    const combinedOptions = { ...options, ...contentMetrics };
    return (
        <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
            <CurriculoPDF data={data} options={combinedOptions} />
        </PDFViewer>
    );
});


export default function CurriculoBuilder({ profile }) {
    const placeholders = {
        fullName: 'Digite seu nome completo',
        jobTitle: 'Ex: Desenvolvedor Front-end Sênior',
        email: 'seu.email@site.com',
        phone: '(XX) XXXXX-XXXX',
        summary: 'Faça um breve resumo sobre suas qualificações e objetivos...',
        expTitle: 'Ex: Desenvolvedor React',
        expCompany: 'Nome da Empresa',
        expDesc: 'Descreva suas atividades, responsabilidades e conquistas...',
        eduDegree: 'Ex: Bacharelado em Ciência da Computação',
        eduSchool: 'Nome da Instituição de Ensino',
        skills: 'Digite uma habilidade e pressione vírgula ou Enter',
        langName: 'Ex: Inglês',
        projName: 'Nome do Projeto',
        projDesc: 'Descreva o objetivo e as tecnologias usadas no projeto...',
        projUrl: 'https://github.com/seu-usuario/seu-projeto',
        certName: 'Ex: AWS Certified Cloud Practitioner',
        linkName: 'Ex: Portfólio Pessoal',
        linkUrl: 'https://seu-site.com'
    };
    
    const [formData, setFormData] = useState({
        fullName: profile?.fullName || '',
        jobTitle: profile?.jobTitle || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        address: { state: profile?.address?.state || '', city: profile?.address?.city || '' },
        summary: profile?.summary || '',
        experience: Array.isArray(profile?.experience) ? profile.experience : [],
        education: Array.isArray(profile?.education) ? profile.education : [],
        skills: Array.isArray(profile?.skills) ? profile.skills : [],
        languages: Array.isArray(profile?.languages) ? profile.languages : [],
        links: Array.isArray(profile?.links) ? profile.links : [],
        projects: Array.isArray(profile?.projects) ? profile.projects : [],
        certifications: Array.isArray(profile?.certifications) ? profile.certifications : []
    });

    const colorPalette = ['#2d3748', '#2f855a', '#b83280', '#c05621', '#4338ca', '#000000'];
    const [template, setTemplate] = useState('moderno');
    const [primaryColor, setPrimaryColor] = useState(colorPalette[0]);
    const [photo, setPhoto] = useState(null);
    const [photoShape, setPhotoShape] = useState('round');
    const [isExporting, setIsExporting] = useState(false);
    const [debouncedOptions, setDebouncedOptions] = useState({ template, primaryColor, photo, photoShape });
    const [debouncedData, setDebouncedData] = useState(formData);
    const [isPdfVisible, setIsPdfVisible] = useState(true);
    const [skillInput, setSkillInput] = useState('');
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
            .then(response => response.json())
            .then(data => setStates(data));
    }, []);

    useEffect(() => {
        const selectedStateUF = formData.address.state;
        if (selectedStateUF) {
            fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedStateUF}/municipios`)
                .then(response => response.json())
                .then(data => setCities(data.map(city => city.nome)));
        } else {
            setCities([]);
        }
    }, [formData.address.state]);

    useEffect(() => {
        setIsPdfVisible(false);
        const handler = setTimeout(() => {
            setDebouncedData(formData);
            setDebouncedOptions({ template, primaryColor, photo, photoShape });
            setIsPdfVisible(true);
        }, 500);
        return () => clearTimeout(handler);
    }, [formData, template, primaryColor, photo, photoShape]);
    
    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { setPhoto(reader.result); };
            reader.readAsDataURL(file);
        }
    };

    const handleSimpleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

    const handlePhoneChange = (e) => {
        let value = e.target.value;
        value = value.replace(/\D/g, "");
        value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
        value = value.replace(/(\d)(\d{4})$/, "$1-$2");
        setFormData(prev => ({ ...prev, phone: value }));
    };

    const handleStateChange = (e) => {
        const stateUF = e.target.value;
        setFormData(prev => ({ ...prev, address: { state: stateUF, city: '' } }));
    };

    const handleCityChange = (e) => {
        const cityName = e.target.value;
        setFormData(prev => ({ ...prev, address: { ...prev.address, city: cityName } }));
    };
    
    const handleArrayChange = (e, id, section) => { 
      const { name, value } = e.target; 
      const list = formData[section].map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [name]: value };
          if (name === 'level' && section === 'languages') {
            const proficiencyMap = { 'Básico': 25, 'Intermediário': 50, 'Avançado': 75, 'Fluente': 100 };
            updatedItem.proficiency = proficiencyMap[value] || 0;
          }
          return updatedItem;
        }
        return item;
      });
      setFormData(prev => ({ ...prev, [section]: list }));
    };
    
    const addArrayItem = (section) => { 
        const newId = `item-${Date.now()}`; 
        let newItem; 
        if (section === 'experience') newItem = { id: newId, title: '', company: '', location: '', startDate: '', endDate: '', description: '' }; 
        if (section === 'education') newItem = { id: newId, school: '', degree: '', year: '' };
        if (section === 'languages') newItem = { id: newId, language: '', level: 'Intermediário', proficiency: 50 };
        if (section === 'links') newItem = { id: newId, name: '', url: '' };
        if (section === 'projects') newItem = { id: newId, name: '', description: '', url: '' };
        if (section === 'certifications') newItem = { id: newId, name: '' };
        setFormData(prev => ({ ...prev, [section]: [...prev[section], newItem]})); 
    };

    const removeArrayItem = (id, section) => { const list = formData[section].filter(item => item.id !== id); setFormData(prev => ({...prev, [section]: list})); };
    
    const handleSkillKeyDown = (e) => {
        if (e.key === ',' || e.key === 'Enter') {
            e.preventDefault();
            const value = skillInput.trim();
            if (value && !formData.skills.includes(value)) {
                setFormData(prev => ({ ...prev, skills: [...prev.skills, value] }));
            }
            setSkillInput('');
        }
    };
    const removeSkill = (skillToRemove) => {
        setFormData(prev => ({ ...prev, skills: prev.skills.filter(skill => skill !== skillToRemove) }));
    };
    
    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            const blob = await pdf(<CurriculoPDF data={formData} options={{ template, primaryColor, photo, photoShape }} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `curriculo_${formData.fullName.replace(/\s/g, '_') || 'sem_nome'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Erro ao gerar o PDF:", error);
            alert("Desculpe, ocorreu um erro ao gerar o PDF. Tente novamente.");
        } finally {
            setIsExporting(false);
        }
    };
    
    return (
        <div className="cv-builder-layout">
            <div className="cv-builder-form">
                <div className="cv-form-section customizer">
                    <h4>Personalize seu Currículo</h4>
                    <div className="form-group">
                        <label>Template</label>
                        <div className="template-selector">
                            <button className={template === 'moderno' ? 'active' : ''} onClick={() => setTemplate('moderno')}>Moderno</button>
                            <button className={template === 'classico' ? 'active' : ''} onClick={() => setTemplate('classico')}>Clássico</button>
                            <button className={template === 'criativo' ? 'active' : ''} onClick={() => setTemplate('criativo')}>Criativo</button>
                            <button className={template === 'executivo' ? 'active' : ''} onClick={() => setTemplate('executivo')}>Executivo</button>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Cores Predefinidas</label>
                            <div className="color-palette">
                                {colorPalette.map(color => ( <div key={color} className="color-swatch" style={{ backgroundColor: color }} onClick={() => setPrimaryColor(color)} /> ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Cor Personalizada</label>
                            <input type="color" className="custom-color-picker" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Sua Foto</label>
                            <input type="file" accept="image/png, image/jpeg" onChange={handlePhotoUpload} />
                             {photo && (
                                <div className="template-selector" style={{marginTop: '10px'}}>
                                    <label>Formato da Foto</label>
                                    <button className={photoShape === 'round' ? 'active' : ''} onClick={() => setPhotoShape('round')}>Redonda</button>
                                    <button className={photoShape === 'square' ? 'active' : ''} onClick={() => setPhotoShape('square')}>Quadrada</button>
                                </div>
                            )}
                             {photo && <button className="nav-button danger small" style={{marginTop: '10px'}} onClick={() => setPhoto(null)}>Remover Foto</button>}
                        </div>
                    </div>
                </div>

                <div className="form-header">
                    <h3>Preencha os Dados</h3>
                    <button onClick={handleExportPDF} className="nav-button success" disabled={isExporting}>
                        {isExporting ? 'Gerando...' : 'Exportar PDF'}
                    </button>
                </div>

                <div className="cv-form-section"><h4>Informações Pessoais</h4>
                    <div className="form-group"><label>Nome Completo</label><input type="text" name="fullName" value={formData.fullName} onChange={handleSimpleChange} placeholder={placeholders.fullName} /></div>
                    <div className="form-group"><label>Título Profissional / Cargo Desejado</label><input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleSimpleChange} placeholder={placeholders.jobTitle} /></div>
                    <div className="form-row"><div className="form-group"><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleSimpleChange} placeholder={placeholders.email} /></div><div className="form-group"><label>Telefone</label><input type="text" name="phone" value={formData.phone} onChange={handlePhoneChange} placeholder={placeholders.phone} maxLength="15" /></div></div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Estado</label>
                            <select name="state" value={formData.address.state} onChange={handleStateChange}>
                                <option value="">Selecione...</option>
                                {states.map(s => <option key={s.id} value={s.sigla}>{s.nome}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Cidade</label>
                            <select name="city" value={formData.address.city} onChange={handleCityChange} disabled={!formData.address.state}>
                                <option value="">Selecione o estado</option>
                                {cities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="cv-form-section"><h4>Resumo Profissional</h4><div className="form-group"><textarea name="summary" rows="4" value={formData.summary} onChange={handleSimpleChange} placeholder={placeholders.summary}></textarea></div></div>
                
                <div className="cv-form-section"><h4>Experiência Profissional</h4>{formData.experience.map((exp) => (<div className="form-array-item" key={exp.id}><div className="form-row"><div className="form-group"><label>Cargo</label><input type="text" name="title" value={exp.title} onChange={(e) => handleArrayChange(e, exp.id, 'experience')} placeholder={placeholders.expTitle}/></div><div className="form-group"><label>Empresa</label><input type="text" name="company" value={exp.company} onChange={(e) => handleArrayChange(e, exp.id, 'experience')} placeholder={placeholders.expCompany}/></div></div><div className="form-row"><div className="form-group"><label>Data de Início</label><input type="date" name="startDate" value={exp.startDate} onChange={(e) => handleArrayChange(e, exp.id, 'experience')} /></div><div className="form-group"><label>Data de Fim</label><input type="date" name="endDate" value={exp.endDate} onChange={(e) => handleArrayChange(e, exp.id, 'experience')} /></div></div><div className="form-group"><label>Descrição das Atividades</label><textarea name="description" rows="3" value={exp.description} onChange={(e) => handleArrayChange(e, exp.id, 'experience')} placeholder={placeholders.expDesc}></textarea></div><button type="button" onClick={() => removeArrayItem(exp.id, 'experience')} className="nav-button danger small">Remover</button></div>))}<button type="button" onClick={() => addArrayItem('experience')} className="nav-button secondary small">Adicionar Experiência</button></div>
                
                <div className="cv-form-section"><h4>Formação Acadêmica</h4>{formData.education.map((edu) => (<div className="form-array-item" key={edu.id}><div className="form-row"><div className="form-group"><label>Instituição</label><input type="text" name="school" value={edu.school} onChange={(e) => handleArrayChange(e, edu.id, 'education')} placeholder={placeholders.eduSchool}/></div><div className="form-group"><label>Curso/Grau</label><input type="text" name="degree" value={edu.degree} onChange={(e) => handleArrayChange(e, edu.id, 'education')} placeholder={placeholders.eduDegree}/></div></div><div className="form-group"><label>Ano de Conclusão</label><input type="number" name="year" placeholder="AAAA" value={edu.year} onChange={(e) => handleArrayChange(e, edu.id, 'education')} min="1950" max={(new Date().getFullYear()) + 5}/></div><button type="button" onClick={() => removeArrayItem(edu.id, 'education')} className="nav-button danger small">Remover</button></div>))}<button type="button" onClick={() => addArrayItem('education')} className="nav-button secondary small">Adicionar Formação</button></div>
                
                <div className="cv-form-section"><h4>Habilidades</h4><div className="form-group"><div className="skills-container">{formData.skills.map((skill, index) => (<div key={index} className="skill-tag">{skill}<button onClick={() => removeSkill(skill)}>×</button></div>))}</div><input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleSkillKeyDown} placeholder={placeholders.skills}/></div></div>

                <div className="cv-form-section"><h4>Idiomas</h4>{formData.languages.map((lang) => (<div className="form-array-item" key={lang.id}><div className="form-row">
                    <div className="form-group"><label>Idioma</label>
                        <input 
                            list="idiomas-lista" 
                            type="text" 
                            name="language" 
                            value={lang.language} 
                            onChange={(e) => handleArrayChange(e, lang.id, 'languages')} 
                            placeholder={placeholders.langName} 
                        />
                        <datalist id="idiomas-lista">
                            {IDIOMAS_COMUNS.map(idioma => <option key={idioma} value={idioma} />)}
                        </datalist>
                    </div>
                    <div className="form-group"><label>Nível</label>
                        <select name="level" value={lang.level} onChange={(e) => handleArrayChange(e, lang.id, 'languages')}>
                            <option value="Básico">Básico</option>
                            <option value="Intermediário">Intermediário</option>
                            <option value="Avançado">Avançado</option>
                            <option value="Fluente">Fluente</option>
                        </select>
                    </div>
                </div><button type="button" onClick={() => removeArrayItem(lang.id, 'languages')} className="nav-button danger small">Remover</button></div>))}<button type="button" onClick={() => addArrayItem('languages')} className="nav-button secondary small">Adicionar Idioma</button></div>
                
                <div className="cv-form-section"><h4>Projetos</h4>{formData.projects.map((proj) => (<div className="form-array-item" key={proj.id}><div className="form-group"><label>Nome do Projeto</label><input type="text" name="name" value={proj.name} onChange={(e) => handleArrayChange(e, proj.id, 'projects')} placeholder={placeholders.projName}/></div><div className="form-group"><label>Link do Projeto</label><input type="url" name="url" value={proj.url} onChange={(e) => handleArrayChange(e, proj.id, 'projects')} placeholder={placeholders.projUrl}/></div><div className="form-group"><label>Descrição do Projeto</label><textarea name="description" rows="3" value={proj.description} onChange={(e) => handleArrayChange(e, proj.id, 'projects')} placeholder={placeholders.projDesc}></textarea></div><button type="button" onClick={() => removeArrayItem(proj.id, 'projects')} className="nav-button danger small">Remover</button></div>))}<button type="button" onClick={() => addArrayItem('projects')} className="nav-button secondary small">Adicionar Projeto</button></div>
                
                <div className="cv-form-section"><h4>Certificações</h4>{formData.certifications.map((cert) => (<div className="form-array-item" key={cert.id}><div className="form-group"><label>Nome do Curso/Certificação</label><input type="text" name="name" value={cert.name} onChange={(e) => handleArrayChange(e, cert.id, 'certifications')} placeholder={placeholders.certName}/></div><button type="button" onClick={() => removeArrayItem(cert.id, 'certifications')} className="nav-button danger small">Remover</button></div>))}<button type="button" onClick={() => addArrayItem('certifications')} className="nav-button secondary small">Adicionar Certificação</button></div>
                
                <div className="cv-form-section"><h4>Links</h4>{formData.links.map((link) => (<div className="form-array-item" key={link.id}><div className="form-row"><div className="form-group"><label>Nome (Ex: Portfólio)</label><input type="text" name="name" value={link.name} onChange={(e) => handleArrayChange(e, link.id, 'links')} placeholder={placeholders.linkName}/></div><div className="form-group"><label>URL</label><input type="url" name="url" value={link.url} onChange={(e) => handleArrayChange(e, link.id, 'links')} placeholder={placeholders.linkUrl}/></div></div><button type="button" onClick={() => removeArrayItem(link.id, 'links')} className="nav-button danger small">Remover Link</button></div>))}<button type="button" onClick={() => addArrayItem('links')} className="nav-button secondary small">Adicionar Link</button></div>
            </div>

            <div className="cv-builder-preview pdf-viewer">
                {isPdfVisible ? (
                    <MemoizedPDFPreview data={debouncedData} options={debouncedOptions} />
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>
                        <p>Atualizando pré-visualização...</p>
                    </div>
                )}
            </div>
        </div>
    );
}