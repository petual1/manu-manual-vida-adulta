
import React from 'react';

const DataRow = ({ label, value }) => {
    if (!value) return null; 
    return (
        <p style={{ margin: 0 }}>
            <strong>{label}:</strong> {value}
        </p>
    );
};

export default function DocumentData({ doc }) {
    
    const renderFields = () => {
        switch (doc.type) {
            case 'RG':
                return (
                    <>
                        <DataRow label="Nome" value={doc.nome} />
                        <DataRow label="Número RG" value={doc.numero} />
                        <DataRow label="Data de Emissão" value={doc.dataEmissao} />
                        <DataRow label="Data de Validade" value={doc.dataValidade} />
                        <DataRow label="CPF" value={doc.cpf} />
                        <DataRow label="Filiação" value={doc.filiacao} />
                        <DataRow label="Naturalidade" value={doc.naturalidade} />
                    </>
                );
            case 'CNH':
                return (
                    <>
                        <DataRow label="Nome" value={doc.nome} />
                        <DataRow label="Número" value={doc.numero} />
                        <DataRow label="Validade" value={doc.dataValidade} />
                        <DataRow label="Categoria" value={doc.categoria} />
                        <DataRow label="CPF" value={doc.cpf} />
                        <DataRow label="Data de Nasc." value={doc.dataNascimento} />
                    </>
                );
            case 'CTPS':
                return (
                    <>
                        <DataRow label="Nome" value={doc.nome} />
                        <DataRow label="PIS/PASEP" value={doc.pisPasep} />
                        <DataRow label="Número" value={doc.numero} />
                        <DataRow label="Série" value={doc.serie} />
                        <DataRow label="UF" value={doc.uf} />
                        <DataRow label="CPF" value={doc.cpf} />
                    </>
                );
            default:
                return (
                    <>
                        <DataRow label="Nome" value={doc.nome} />
                        <DataRow label="Número" value={doc.numero} />
                    </>
                );
        }
    };

    return (
        <div className="doc-data-grid">
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <strong>Status da Leitura:</strong> 
                {doc.statusOCR === 'CONCLUÍDO' 
                    ? <span style={{color:'var(--success-color)', fontWeight:'bold'}}>Concluído</span> 
                    : <span style={{color:'orange', display:'flex', alignItems:'center', gap:'5px'}}><div className="spinner" style={{width:14, height:14, borderWidth:2}}></div> Lendo...</span>
                }
            </div>
            
            {}
            {doc.statusOCR === 'CONCLUÍDO' ? (
                renderFields()
            ) : (
                <p style={{margin:0, color: '#666'}}>Aguardando leitura da IA...</p>
            )}

            {}
            {doc.fullText && (
                <details style={{marginTop: '10px'}}>
                    <summary style={{cursor:'pointer', fontSize:'0.9em', color:'var(--primary-color)'}}>Ver texto completo extraído</summary>
                    
                    {}
                    {}
                    <p className="full-text-box">{doc.fullText}</p>
                </details>
            )}
        </div>
    );
}