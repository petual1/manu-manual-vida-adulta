import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, auth, storage } from '../firebase';
import { toast } from 'sonner';
import { jsPDF } from "jspdf";
import DocumentScanner from '../components/DocumentScanner';
import DocumentData from '../components/DocumentData'; 

const getDocIcon = (type) => {
    switch (type) {
        case 'RG': return 'fa-id-card';
        case 'CNH': return 'fa-id-card-alt';
        case 'CPF': return 'fa-id-badge';
        case 'CTPS': return 'fa-book';
        default: return 'fa-file-alt';
    }
};
const formatDate = (timestamp) => {
    if (!timestamp) return 'Enviando...';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('pt-BR');
};
const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '---';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const DetailsEmptyState = () => (
    <div className="doc-detail-empty-state">
        <i className="fas fa-hand-pointer"></i>
        <p>Selecione um documento</p>
        <small>Clique em um item da lista para ver os detalhes.</small>
    </div>
);

export default function DocumentosPage() {
    const [documents, setDocuments] = useState([]);
    const [isScannerOpen, setIsScannerOpen] = useState(false); 
    const [selectedFile, setSelectedFile] = useState(null);
    const [docType, setDocType] = useState('RG'); 
    const [selectedDocId, setSelectedDocId] = useState(null); 
    
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isSourceModalOpen, setIsSourceModalOpen] = useState(false); 
    const [captureMode, setCaptureMode] = useState(null); 

    const fileInputRef = useRef(null); 
    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);


    const uploadableDocTypes = [
        { type: 'RG', icon: 'fa-id-card', label: 'Registro Geral' },
        { type: 'CPF', icon: 'fa-id-badge', label: 'Cadastro Pessoa Física' },
        { type: 'CNH', icon: 'fa-id-card-alt', label: 'Carteira de Motorista' },
        { type: 'CTPS', icon: 'fa-book', label: 'Carteira de Trabalho' }
    ];

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const q = query(collection(db, 'users', currentUser.uid, 'documents'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snap) => {
            setDocuments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsubscribe();
    }, []);

    const selectedDoc = useMemo(() => {
        return documents.find(doc => doc.id === selectedDocId);
    }, [documents, selectedDocId]);

    const handleTypeSelectAndOpenSourceModal = (type) => {
        setDocType(type); 
        setIsUploadModalOpen(false); 
        setIsSourceModalOpen(true); 
    };

    const handleSourceSelectAndTriggerUpload = (mode) => {
        setIsSourceModalOpen(false);
        setCaptureMode(mode);
        if (mode === 'camera' && cameraInputRef.current) {
            cameraInputRef.current.click();
        } else if (mode === 'gallery' && galleryInputRef.current) {
            galleryInputRef.current.click();
        }
    };
    

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            setIsScannerOpen(true); 
            e.target.value = null; 
        }
    };

    const handleScanConfirm = async (scannedFile) => {
        setIsScannerOpen(false);
        const currentUser = auth.currentUser;
        const toastId = toast.loading("Enviando documento...");
        try {
            const docsRef = collection(db, 'users', currentUser.uid, 'documents');
            const newDocRef = await addDoc(docsRef, {
                type: docType, 
                statusOCR: "PROCESSANDO",
                createdAt: serverTimestamp(),
                fileName: scannedFile.name,
                fileSize: scannedFile.size,
            });
            const storagePath = `documents/${currentUser.uid}/${newDocRef.id}.jpg`;
            const storageRef = ref(storage, storagePath);
            await uploadBytes(storageRef, scannedFile);
            const downloadURL = await getDownloadURL(storageRef);
            await updateDoc(newDocRef, { 
                fileUrl: downloadURL, 
                storagePath: storagePath 
            });
            toast.success("Documento salvo com sucesso!", { id: toastId });
        } catch (error) {
            console.error("Erro no upload:", error);
            toast.error("Erro ao salvar documento.", { id: toastId });
        }
    };

    const downloadPDF = (url, type) => {
        toast.success("Baixando PDF...", { description: "Seu download começará em instantes." });
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url;
        img.onload = () => {
            const doc = new jsPDF({
                orientation: img.width > img.height ? 'l' : 'p',
                unit: 'px',
                format: [img.width, img.height]
            });
            doc.addImage(img, 'JPEG', 0, 0, img.width, img.height);
            doc.save(`${type}_digitalizado.pdf`);
        };
    };

    const downloadImage = async (url) => {
        toast.success("Baixando Imagem...", { description: "Aguarde um momento." });
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'documento.jpg';
            link.click();
            URL.revokeObjectURL(blobUrl);
        } catch (e) {
            console.error(e);
            window.open(url, '_blank');
        }
    };

    const handleDelete = async (docToDelete) => {
        if (!docToDelete) return;
        if (!window.confirm(`Excluir "${docToDelete.type}"?`)) return;
        try {
            if (docToDelete.id === selectedDocId) setSelectedDocId(null);
            await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'documents', docToDelete.id));
            if (docToDelete.storagePath) await deleteObject(ref(storage, docToDelete.storagePath));
            toast.success("Documento excluído.");
        } catch (e) {
            toast.error("Erro ao excluir.");
        }
    };

    if (isScannerOpen && selectedFile) {
        return <DocumentScanner imageFile={selectedFile} onConfirm={handleScanConfirm} onCancel={() => setIsScannerOpen(false)} />;
    }

    return (
        <>
            {}
            {isSourceModalOpen && (
                <div className="upload-modal-overlay-styled visible" onClick={() => setIsSourceModalOpen(false)}>
                    <div className="modal-box upload-modal-styled" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="upload-modal-header">
                            <h3>{docType} - Escolha a Fonte</h3>
                            <button onClick={() => setIsSourceModalOpen(false)} className="close-btn-static">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <p className="upload-modal-desc">Você quer tirar uma foto agora ou selecionar um arquivo existente?</p>

                        <div className="doc-upload-grid">
                            <button 
                                className="doc-upload-card"
                                onClick={() => handleSourceSelectAndTriggerUpload('camera')}
                            >
                                <div className="upload-icon-circle">
                                    <i className="fas fa-camera"></i>
                                </div>
                                <span className="upload-label">Câmera</span>
                                <span className="upload-sublabel">Tirar foto agora</span>
                            </button>

                            <button 
                                className="doc-upload-card"
                                onClick={() => handleSourceSelectAndTriggerUpload('gallery')}
                            >
                                <div className="upload-icon-circle">
                                    <i className="fas fa-folder-open"></i>
                                </div>
                                <span className="upload-label">Arquivos</span>
                                <span className="upload-sublabel">Galeria / Arquivos</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {}
            {isUploadModalOpen && (
                <div className="upload-modal-overlay-styled visible" onClick={() => setIsUploadModalOpen(false)}>
                    <div className="modal-box upload-modal-styled" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="upload-modal-header">
                            <h3>Adicionar Documento</h3>
                            <button onClick={() => setIsUploadModalOpen(false)} className="close-btn-static">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <p className="upload-modal-desc">Escolha qual documento você deseja digitalizar agora.</p>

                        <div className="doc-upload-grid">
                            {uploadableDocTypes.map(doc => (
                                <button 
                                    key={doc.type} 
                                    className="doc-upload-card"
                                    onClick={() => handleTypeSelectAndOpenSourceModal(doc.type)}
                                >
                                    <div className="upload-icon-circle">
                                        <i className={`fas ${doc.icon}`}></i>
                                    </div>
                                    <span className="upload-label">{doc.type}</span>
                                    <span className="upload-sublabel">{doc.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {}
            <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                onChange={handleFileSelect} 
                style={{ display: 'none' }} 
                ref={cameraInputRef}
            />
            {}
            <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileSelect} 
                style={{ display: 'none' }} 
                ref={galleryInputRef}
            />

            <header className="content-header">
                <h2>Documentos</h2>
                <p>Armazene e gerencie seus documentos digitais.</p>
            </header>

            <div className="profile-card document-page">
                <div className="doc-layout-grid">
                    
                    {}
                    <div className="doc-list-view">
                        <div className="doc-list-view-header">
                            <h3 className="doc-section-title">Meus Arquivos</h3>
                            <button className="nav-button primary small" onClick={() => setIsUploadModalOpen(true)}>
                                <i className="fas fa-plus"></i> Novo
                            </button>
                        </div>
                        
                        <div className="doc-table-list">
                            {documents.length > 0 ? documents.map(docItem => (
                                <div 
                                    key={docItem.id} 
                                    className={`doc-list-item ${selectedDocId === docItem.id ? 'active' : ''}`}
                                    onClick={() => setSelectedDocId(docItem.id)}
                                >
                                    <div className="icon-col">
                                        <div className="doc-item-info">
                                            <div className="doc-item-icon">
                                                <i className={`fas ${getDocIcon(docItem.type)}`}></i>
                                            </div>
                                            <span className="doc-type-title">{docItem.type}</span>
                                            <span className="doc-date-mobile">{formatDate(docItem.createdAt)}</span>
                                        </div>
                                    </div>
                                    <span className="doc-size-desktop">{formatSize(docItem.fileSize)}</span>
                                    <span className="doc-date-desktop">{formatDate(docItem.createdAt)}</span>
                                </div>
                            )) : (
                                <div className="doc-list-empty">
                                    <div className="empty-icon-circle"><i className="fas fa-folder-open"></i></div>
                                    <p>Nenhum documento ainda.</p>
                                    <button className="nav-button secondary small" onClick={() => setIsUploadModalOpen(true)}>Adicionar agora</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {}
                    <div className="doc-detail-view">
                        {selectedDoc ? (
                            <>
                                <div className="detail-header">
                                    <h3 className="doc-section-title">Detalhes</h3>
                                    <button onClick={() => handleDelete(selectedDoc)} className="icon-btn-danger" title="Excluir">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>

                                <div className="doc-details-preview">
                                    <img src={selectedDoc.fileUrl} alt="Preview" />
                                </div>
                                
                                <DocumentData doc={selectedDoc} />
                                
                                <div className="doc-details-actions">
                                    <button onClick={() => downloadImage(selectedDoc.fileUrl)} className="nav-button secondary full">
                                        <i className="fas fa-image"></i> Baixar Imagem
                                    </button>
                                    <button onClick={() => downloadPDF(selectedDoc.fileUrl, selectedDoc.type)} className="nav-button secondary full">
                                        <i className="fas fa-file-pdf"></i> Baixar PDF
                                    </button>
                                </div>
                            </>
                        ) : (
                            <DetailsEmptyState />
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}