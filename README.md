# Manu - Manual da Vida Adulta

> [cite_start]Projeto desenvolvido na disciplina **Project Lab** do curso de Ciência da Computação do **Centro Universitário UNIMA (Afya)**[cite: 1, 16].

![Badge em Desenvolvimento](http://img.shields.io/static/v1?label=STATUS&message=EM%20DESENVOLVIMENTO&color=GREEN&style=for-the-badge)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)

## 📘 Sobre o Projeto

A transição para a vida adulta é marcada por desafios burocráticos, financeiros e sociais. [cite_start]O **Manu (Manual da Vida Adulta)** é uma aplicação móvel (SPA) projetada para oferecer suporte interativo e personalizado para jovens que buscam autonomia[cite: 26, 29, 44].

[cite_start]A solução centraliza ferramentas práticas para organização pessoal, reduzindo esquecimentos e erros comuns em processos burocráticos[cite: 30, 32].

## ✨ Funcionalidades Principais

O aplicativo está estruturado em torno de áreas de interesse do usuário, oferecendo:

* [cite_start]**🆔 Carteira Virtual de Documentos:** Upload, visualização e gestão de documentos (RG, CPF, CNH, CTPS) com integração futura de OCR para extração de dados[cite: 48, 133, 159].
* [cite_start]**📝 Construtor de Currículos (CurriculoBuilder):** Ferramenta completa com templates (Moderno, Clássico, Criativo, Executivo) e exportação automática para PDF[cite: 72, 73].
* [cite_start]**🎯 Plano de Ação Gamificado:** Checklists dinâmicos e tarefas passo a passo (ex: "Como tirar o RG", "Alistamento Militar") com sistema de desbloqueio e troféus[cite: 50, 81, 82].
* [cite_start]**🎓 Recomendações Dinâmicas:** Integração com Google Custom Search para sugerir notícias, vídeos e dicas baseadas nos interesses do usuário e sua localização[cite: 77, 80].
* [cite_start]**👤 Perfil Inteligente:** Cadastro com preenchimento automático de endereço (ViaCEP) e localização (API IBGE)[cite: 79, 122].

## 🚀 Tecnologias Utilizadas

[cite_start]O projeto segue uma arquitetura moderna e escalável[cite: 64]:

* **Frontend:** React.js + Vite
* **Backend & Database:** Firebase (Authentication, Firestore, Storage, Cloud Functions)
* **Estilização:** CSS Puro (Variáveis CSS para temas Claro/Escuro/Cinza)
* **Manipulação de Imagem/PDF:** `react-image-crop`, `@react-pdf/renderer`, `opencv.js` (para scanner de documentos).
* **APIs Externas:**
    * Google Custom Search API
    * ViaCEP API
    * IBGE API (Estados e Municípios)

## 🛠️ Instalação e Configuração

### Pré-requisitos
* Node.js (v18 ou superior)
* NPM ou Yarn
* Conta no Google Firebase

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/SEU_USUARIO/NOME_DO_REPO.git](https://github.com/SEU_USUARIO/NOME_DO_REPO.git)
    cd NOME_DO_REPO
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configuração de Ambiente (Segurança):**
    O projeto utiliza variáveis de ambiente para proteger chaves de API. Crie um arquivo `.env` na raiz do projeto e preencha com suas credenciais:

    ```env
    # Google Custom Search
    VITE_GOOGLE_API_KEY=sua_chave_aqui
    VITE_SEARCH_ENGINE_ID=seu_id_aqui

    # Firebase Config
    VITE_FIREBASE_API_KEY=sua_api_key
    VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=seu_projeto_id
    VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.firebasestorage.app
    VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
    VITE_FIREBASE_APP_ID=seu_app_id
    VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id
    ```

4.  **Execute o projeto:**
    ```bash
    npm run dev
    ```

## 📱 Layout e UX

O projeto foi desenhado com foco em **Mobile First**, mas adaptável via CSS responsivo.
* [cite_start]**Navegação:** Sidebar "Sticky" no Desktop e Menu "Hambúrguer" com Overlay no Mobile[cite: 96, 141].
* **Temas:** Suporte nativo a temas Claro, Escuro e Cinza, configuráveis pelo usuário.

## 👥 Autores

[cite_start]Equipe de desenvolvimento do Project Lab [cite: 2-6]:

* **Daniel Alexandre Pereira de Abreu**
* **Gabriel Da Costa Vangasse**
* **Ivo Lucas Araújo Viveiros De Lima**
* **Jordana Gabriela Ferreira Costa**
* **José Gabriel Bonfim Severo Amorim**

[cite_start]Orientador: Prof. Icaro Santos Ferreira[cite: 17].



