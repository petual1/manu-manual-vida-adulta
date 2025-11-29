# Manu --- Manual da Vida Adulta

Projeto desenvolvido na disciplina **Project Lab** do curso de **Ciência
da Computação** do **Centro Universitário UNIMA (Afya)**.

![Status](http://img.shields.io/static/v1?label=STATUS&message=EM%20DESENVOLVIMENTO&color=GREEN&style=for-the-badge)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)
![Google
Cloud](https://img.shields.io/badge/Google_Cloud-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white)

------------------------------------------------------------------------

## Sobre o Projeto

A transição para a vida adulta envolve desafios burocráticos,
financeiros e sociais.\
O **Manu (Manual da Vida Adulta)** é um aplicativo desenvolvido para
apoiar jovens --- especialmente estudantes do ensino médio --- na
organização de documentos, tarefas e processos essenciais da vida
adulta.

A proposta é centralizar ferramentas práticas em uma única plataforma,
reduzindo esquecimentos e simplificando rotinas que antes eram complexas
ou confusas.

------------------------------------------------------------------------

## Inteligência Artificial e OCR 

O Manu utiliza uma pipeline completa que une visão computacional no
navegador e IA na nuvem para digitalização inteligente de documentos.

### **1. Visão Computacional no Frontend (OpenCV.js)**

-   Detecção automática das bordas do papel.\
-   Correção de perspectiva (warp perspective).\
-   Tratamento da imagem antes do envio para OCR.

### **2. OCR com Google Cloud Vision**

-   A imagem tratada é enviada ao Firebase Storage.\
-   Uma Cloud Function aciona a API do Google Cloud Vision.\
-   Extração de texto altamente precisa.

### **3. Extração Estruturada (Regex)**

Após o OCR, o sistema aplica regras e expressões regulares projetadas
para documentos brasileiros, identificando:

-   Nome completo\
-   CPF\
-   Número do RG\
-   Datas relevantes

Os dados são então organizados e armazenados de forma estruturada no
Firestore.

------------------------------------------------------------------------

## Funcionalidades Principais

✔ **Carteira Virtual de Documentos**\
Upload, leitura automatizada, organização e visualização de RG, CPF,
CNH, CTPS e outros.

✔ **Construtor de Currículos**\
Templates dinâmicos (Moderno, Clássico, Criativo, Executivo) com
exportação instantânea para PDF.

✔ **Plano de Ação Gamificado**\
Tarefas guiadas (ex.: *Como emitir RG*, *Alistamento Militar*, *Primeiro
Currículo*) com sistema de progresso e troféus.

✔ **Recomendações Inteligentes**\
Integração com Google Custom Search para sugerir conteúdos úteis com
base no perfil do usuário.

✔ **Perfil Inteligente**\
Preenchimento automático de endereço via ViaCEP e dados regionais via
API IBGE.

------------------------------------------------------------------------

## Tecnologias Utilizadas

**Frontend:** React + Vite\
**Backend Serverless:** Firebase Functions (Node.js)\
**Banco de Dados:** Firestore (NoSQL)\
**Autenticação:** Firebase Authentication\
**IA & OCR:** Google Cloud Vision + OpenCV.js\
**UI:** CSS puro com variáveis globais (Light/Dark/Gray)

------------------------------------------------------------------------

## Configuração de Ambiente

Crie um arquivo **.env** na raiz do projeto com as chaves de API:

``` env
# Google Custom Search & APIs
VITE_GOOGLE_API_KEY=sua_chave_aqui
VITE_SEARCH_ENGINE_ID=seu_id_aqui

# Firebase Config
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

------------------------------------------------------------------------

## Autores

Equipe de Desenvolvimento:

-   **Daniel Alexandre Pereira de Abreu**\
-   **Gabriel Da Costa Vangasse**\
