import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, doc } from 'firebase/firestore';
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
        <small>Clique em um item da lista para ver os detalhes, baixar ou excluir.</small>
    </div>
);


export default function DocumentosPage() {
    const [documents, setDocuments] = useState([]);
    const [isScannerOpen, setIsScannerOpen] = useState(false); 
    const [selectedFile, setSelectedFile] = useState(null);
    const [docType, setDocType] = useState('RG'); 
    const [selectedDocId, setSelectedDocId] = useState(null); 
    
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
    const fileInputRef = useRef(null); 

    const uploadableDocTypes = [
        { type: 'RG', icon: 'fa-id-card' },
        { type: 'CPF', icon: 'fa-id-badge' },
        { type: 'CNH', icon: 'fa-id-card-alt' },
        { type: 'CTPS', icon: 'fa-book' }
    ];

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const q = query(collection(db, 'users', currentUser.uid, 'documents'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snap) => {
            setDocuments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        
        return () => {
            unsubscribe();
        };
    }, []);

    const selectedDoc = useMemo(() => {
        return documents.find(doc => doc.id === selectedDocId);
    }, [documents, selectedDocId]);


    const handleTypeSelectAndTriggerUpload = (type) => {
        setDocType(type); 
        setIsUploadModalOpen(false); 
        fileInputRef.current.click(); 
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
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
            toast.success("Documento enviado! A IA está lendo...", { id: toastId });
        } catch (error) {
            console.error("Erro no upload:", error);
            toast.error("Erro ao salvar documento.", { id: toastId });
        }
    };

    const downloadPDF = (url, type) => {
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
        if (!window.confirm(`Excluir "${docToDelete.type} - ${docToDelete.id}"?`)) return;
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
            {isUploadModalOpen && (
                <div className="modal-overlay visible">
                    <div className="modal-box" style={{ maxWidth: '500px', textAlign: 'left' }}>
                        <button onClick={() => setIsUploadModalOpen(false)} className="close-btn">&times;</button>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Adicionar Novo Documento</h3>
                        
                        <p style={{marginTop: 0, marginBottom: '1rem', color: 'var(--secondary-text)'}}>Selecione o tipo de documento que você deseja enviar.</p>

                        <div className="doc-upload-grid">
                            {uploadableDocTypes.map(doc => (
                                <button 
                                    key={doc.type} 
                                    className="doc-upload-card"
                                    onClick={() => handleTypeSelectAndTriggerUpload(doc.type)}
                                >
                                    <i className={`fas ${doc.icon}`}></i>
                                    <span>{doc.type}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                onChange={handleFileSelect} 
                style={{ display: 'none' }} 
                ref={fileInputRef}
            />

            {}
            <header className="content-header">
                <h2>Documentos</h2>
                <p>Armazene, digitalize e baixe seus documentos com segurança.</p>
            </header>

            {}
            <div className="profile-card document-page">

                {}

                <div className="doc-layout-grid">
                
                    {}
                    <div className="doc-list-view">
                        
                        <div className="doc-list-view-header">
                            <h3 className="doc-section-title">Meus Documentos</h3>
                            
                            {}
                            <div className="doc-header-actions">
                                <button 
                                    className="nav-button small" 
                                    onClick={() => setIsUploadModalOpen(true)}
                                >
                                    <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
                                    Adicionar
                                </button>
                            </div>
                        </div>
                        
                        <div className="doc-table-list">
                            <div className="doc-list-header">
                                <span>Nome</span>
                                <span>Tamanho</span>
                                <span>Adicionado em</span>
                            </div>
                            
                            {}
                            {documents.length > 0 ? documents.map(docItem => (
                                <div 
                                    key={docItem.id} 
                                    className={`doc-list-item ${selectedDocId === docItem.id ? 'active' : ''}`}
                                    onClick={() => setSelectedDocId(docItem.id)}
                                >
                                    <div className="icon-col">
                                        <i className={`fas ${getDocIcon(docItem.type)}`}></i>
                                        {docItem.type}
                                    </div>
                                    <span>{formatSize(docItem.fileSize)}</span>
                                    <span>{formatDate(docItem.createdAt)}</span>
                                </div>
                            )) : (
                                <div className="doc-list-empty">
                                    <i className="fas fa-folder-open"></i>
                                    <p>Nenhum documento salvo</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {}
                    <div className="doc-detail-view">
                        {selectedDoc ? (
                            <>
                                <h3 className="doc-section-title">Detalhes do Arquivo</h3>
                                <div className="doc-details-preview">
                                    <img src={selectedDoc.fileUrl} alt="Preview" />
                                </div>
                                <DocumentData doc={selectedDoc} />
                                <h4 className="doc-section-title-small">Ações</h4>
                                <div className="doc-details-actions">
                                    <button onClick={() => downloadImage(selectedDoc.fileUrl)} className="nav-button secondary small">
                                        <i className="fas fa-download"></i> Imagem
                                    </button>
                                    <button onClick={() => downloadPDF(selectedDoc.fileUrl, selectedDoc.type)} className="nav-button secondary small">
                                        <i className="fas fa-file-pdf"></i> PDF
                                    </button>
                                    <button onClick={() => handleDelete(selectedDoc)} className="nav-button danger small">
                                        <i className="fas fa-trash"></i>
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