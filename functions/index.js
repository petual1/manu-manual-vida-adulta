// functions/index.js
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const vision = require("@google-cloud/vision");

admin.initializeApp();

const visionClient = new vision.ImageAnnotatorClient();
const db = admin.firestore();

exports.processDocumentImage = functions
    .runWith({
        memory: "1GB", 
        timeoutSeconds: 120, 
    })
    .storage.object()
    .onFinalize(async (object) => {
        const filePath = object.name; 
        const contentType = object.contentType;
        
        // 1. Verifica se é imagem e pasta correta
        if (!contentType.startsWith("image/") || !filePath.startsWith("documents/")) {
            return null;
        }

        // 2. IDs
        const parts = filePath.split("/");
        const userId = parts[1];
        const fileName = parts[2]; // ex: DOC_ID.jpg
        const docId = fileName.split(".")[0];

        try {
            // 3. Google Vision OCR
            const [result] = await visionClient.documentTextDetection(
                `gs://${object.bucket}/${filePath}`
            );
            
            const fullText = result.fullTextAnnotation?.text;
            
            if (!fullText) {
                console.log("Nenhum texto encontrado.");
                return updateDocStatus(userId, docId, "ERRO", "Texto ilegível");
            }

            // 4. Extração Inteligente (RG Antigo vs Novo)
            const parsedData = parseDocumentText(fullText);

            // 5. Atualiza Firestore
            await db.collection("users").doc(userId).collection("documents").doc(docId).update({
                numero: parsedData.numero || "Não identificado",
                dataValidade: parsedData.dataValidade || "",
                emissor: parsedData.emissor || "Não identificado",
                statusOCR: "CONCLUÍDO",
                fullText: fullText,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`Doc ${docId} processado com sucesso.`);
            return null;

        } catch (error) {
            console.error("Erro no OCR:", error);
            return updateDocStatus(userId, docId, "ERRO", error.message);
        }
    });

// Helper para atualizar status em caso de erro
async function updateDocStatus(userId, docId, status, errorMsg) {
    return db.collection("users").doc(userId).collection("documents").doc(docId).update({
        statusOCR: status,
        ocrError: errorMsg || ""
    });
}

/**
 * CÉREBRO DA EXTRAÇÃO
 * Atualizado para suportar o NOVO RG (CIN) e o Antigo
 */
function parseDocumentText(text) {
    const data = {};
    
    // --- 1. NÚMERO DO DOCUMENTO ---
    
    // Padrão CPF (Novo RG): 000.000.000-00
    const cpfRegex = /(\d{3}\.\d{3}\.\d{3}-\d{2})/;
    // Padrão RG Antigo: 00.000.000-0 ou variações
    const rgRegex = /(\d{1,2}\.\d{3}\.\d{3}-[\dX])/;

    const cpfMatch = text.match(cpfRegex);
    const rgMatch = text.match(rgRegex);

    if (cpfMatch) {
        data.numero = cpfMatch[0]; // Prioriza CPF (Novo RG)
    } else if (rgMatch) {
        data.numero = rgMatch[0]; // Fallback para RG antigo
    }

    // --- 2. DATA DE VALIDADE ---
    
    // Procura por "Validade", "Expiry" ou "Válida até"
    // O [\s\S]*? permite pular linhas até achar a data dd/mm/aaaa
    const validadeRegex = /(?:Validade|Expiry|VÁLIDA ATÉ)[\s\S]*?(\d{2}\/\d{2}\/\d{4})/;
    const validadeMatch = text.match(validadeRegex);

    if (validadeMatch) {
        // Converte de DD/MM/AAAA para YYYY-MM-DD (Padrão internacional para salvar no banco)
        const [dia, mes, ano] = validadeMatch[1].split('/');
        data.dataValidade = `${ano}-${mes}-${dia}`;
    }

    // --- 3. ÓRGÃO EMISSOR / ESTADO ---
    
    // Tenta achar "Estado de ..." (Padrão do Novo RG)
    // Ex: "Estado de Mato Grosso do Sul"
    const estadoRegex = /Estado d[eo] ([A-ZÀ-ÿ\s]+)/i;
    const estadoMatch = text.match(estadoRegex);

    if (estadoMatch) {
        // Pega o nome do estado, limpa e remove quebras de linha
        let estado = estadoMatch[1].split('\n')[0].trim();
        // Remove palavras comuns que podem vir junto
        estado = estado.replace("Secretaria", "").trim();
        data.emissor = estado; 
    } else {
        // Fallback: Procura siglas de estados (SP, RJ, MS...) soltas ou com barra
        const ufs = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
        const emissorRegex = new RegExp(`\\b(${ufs.join('|')})\\b`, 'i');
        
        // Tenta achar siglas perto de "SSP" ou "DETRAN"
        const oldEmissorRegex = /(SSP|DETRAN|PC)\s*[\/-]?\s*([A-Z]{2})/;
        const oldMatch = text.match(oldEmissorRegex);

        if (oldMatch) {
            data.emissor = `${oldMatch[1]}/${oldMatch[2]}`;
        }
    }

    return data;
}