import { collection, doc, setDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

export const taskKnowledgeBase = {
    'Jovem Aprendiz': {
        summary: 'Passos essenciais para conquistar a sua primeira oportunidade no mercado de trabalho como aprendiz.',
        image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&q=80',
        tasks: [
            { 
                id: 'JA1', 
                title: 'Preparar um currículo para Aprendiz', 
                priority: 'Alta', 
                description: "Seu currículo é o primeiro contato com a empresa. Vamos garantir que ele esteja perfeito para vagas de aprendiz.",
                steps: [
                    { title: "Use o Construtor de Currículo", content: "Clique aqui para ir ao Construtor de Currículo e preencher seus dados.", action: 'NAV_CURRICULO' },
                    { title: "Destaque seu Objetivo", content: "No campo 'Resumo' ou 'Objetivo', deixe claro que você busca uma 'Vaga de Jovem Aprendiz' para iniciar sua carreira." },
                    { title: "Revise 100%", content: "Peça para um professor, seus pais ou um amigo ler seu currículo. Erros de português podem eliminar um candidato." }
                ]
            },
            { 
                id: 'JA2', 
                title: 'Cadastrar-se nos portais de vagas', 
                priority: 'Alta', 
                dependencies: ['JA1'], 
                description: "Agora que seu CV está pronto, é hora de encontrar as vagas certas nos locais certos.",
                steps: [
                    { title: "Cadastro no CIEE", content: "O CIEE é um dos maiores portais para aprendizes. Crie seu perfil.", link: "https://portal.ciee.org.br/" },
                    { title: "Cadastro no Nube", content: "O Nube também é um grande portal focado em vagas de entrada.", link: "https://www.nube.com.br/" },
                    { title: "Use a aba 'Recomendações'", content: "Aqui no app, na aba 'Recomendações', filtramos notícias e vagas que podem ser do seu interesse." }
                ]
            },
            { 
                id: 'JA3', 
                title: 'Preparar-se para a Entrevista de Aprendiz', 
                priority: 'Média', 
                dependencies: ['JA2'], 
                description: "A entrevista de Jovem Aprendiz foca mais no seu potencial e vontade de aprender do que na sua experiência (que você ainda não tem).",
                steps: [
                    { title: "Pesquise a Empresa", content: "Saiba o que a empresa faz. Demonstra interesse." },
                    { title: "Pense em Exemplos", content: "Pense em situações da escola ou da vida em que você foi responsável, proativo ou trabalhou bem em grupo (um trabalho escolar, um projeto, etc.)." },
                    { title: "Seja Pontual e Vist-se Adequadamente", content: "Chegue no horário e use roupas discretas. Evite camisetas de time, bonés ou chinelos." }
                ]
            },
            { 
                id: 'JA4', 
                title: 'Separar Documentos Básicos', 
                priority: 'Alta',
                description: "Se você for aprovado, a empresa pedirá seus documentos. Ter isso pronto agiliza a contratação.",
                steps: [
                    { title: "Documentos Essenciais", content: "Tenha em mãos (ou em um local de fácil acesso) seu RG, CPF e o Comprovante de Matrícula da sua escola." },
                    { title: "Carteira de Trabalho Digital", content: "Baixe o app 'CTPS Digital' e já deixe sua conta ativada. Você precisará do CPF para isso." },
                ]
            },
            { 
                id: 'JA5', 
                title: 'Entender seus Direitos de Aprendiz', 
                priority: 'Baixa',
                description: "Saber seus direitos é fundamental para garantir que seu contrato seja cumprido corretamente.",
                steps: [
                    { title: "Carga Horária", content: "Sua jornada de trabalho não pode passar de 6 horas por dia." },
                    { title: "Dois Contratos", content: "Você terá um contrato com a empresa (prática) e uma matrícula na instituição de ensino (teoria). Você deve fazer os dois." },
                    { title: "Direitos", content: "Você tem direito a salário (baseado no salário-mínimo-hora), férias (junto com as férias escolares), 13º salário e vale-transporte." }
                ]
            }
        ]
    },
    'Primeiro Emprego (CLT)': {
        summary: 'O caminho para conseguir o seu primeiro emprego com carteira assinada.',
        image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80',
        tasks: [
            { 
                id: 'CLT1', 
                title: 'Ter um Currículo focado em CLT', 
                priority: 'Alta', 
                description: "Para vagas CLT, seu currículo deve ser mais focado em habilidades e resultados, mesmo que de trabalhos voluntários ou acadêmicos.",
                steps: [
                    { title: "Use o Construtor de Currículo", content: "Clique aqui para ir ao Construtor de Currículo e preencher seus dados.", action: 'NAV_CURRICULO' },
                    { title: "Adapte o Objetivo", content: "Mude seu objetivo para 'Em busca da primeira oportunidade profissional na área de [Sua Área]...'." },
                    { title: "Destaque Habilidades", content: "Se a vaga pede 'Pacote Office', liste isso na seção 'Habilidades'. Adapte seu CV para cada vaga." }
                ]
            },
            { 
                id: 'CLT2', 
                title: 'Ativar a Carteira de Trabalho Digital', 
                priority: 'Alta', 
                description: "A contratação CLT exige uma série de documentos. Ter tudo separado agiliza muito o processo.",
                steps: [
                    { title: "Acesse o portal da CTPS Digital", content: "Você pode baixar o app no seu celular ou acessar o portal web.", link: "https://www.gov.br/trabalho-e-emprego/pt-br/servicos/trabalhador/carteira-de-trabalho/carteira-de-trabalho-digital" },
                    { title: "Documentos Básicos", content: "Separe em uma pasta (física ou digital) seu RG, CPF e Título de Eleitor." }
                ]
            },
            {
                id: 'CLT4',
                title: 'Criar um perfil no LinkedIn',
                priority: 'Média',
                dependencies: ['CLT1'], 
                description: "O LinkedIn é sua vitrine profissional. Um perfil bem feito atrai recrutadores.",
                steps: [
                    { title: "Crie sua conta", content: "Acesse o site e crie seu perfil profissional.", link: "https://www.linkedin.com/" },
                    { title: "Foto Profissional", content: "Use uma foto clara, com fundo neutro, onde você pareça profissional. Evite fotos na praia, em festas ou com óculos escuros." },
                    { title: "Seção 'Sobre'", content: "Use o 'Resumo' do seu currículo aqui. Fale sobre seus interesses e o que você sabe fazer." }
                ]
            },
            { 
                id: 'CLT3', 
                title: 'Pesquisar vagas CLT para iniciantes', 
                priority: 'Média', 
                dependencies: ['CLT4'], 
                description: "Diferente de Jovem Aprendiz, vagas CLT 'Júnior' ou 'Iniciante' podem ser encontradas em mais lugares.",
                steps: [
                    { title: "Pesquise no LinkedIn", content: "Use o filtro de 'Vagas' do LinkedIn, procurando por termos como 'Júnior' ou 'Assistente'.", link: "https://www.linkedin.com/jobs/" },
                    { title: "Outros Portais", content: "Vagas.com.br, Gupy e InfoJobs são muito usados por empresas brasileiras para gerenciar candidaturas." }
                ]
            },
            {
                id: 'CLT5',
                title: 'Preparar-se para Entrevistas (CLT)',
                priority: 'Média',
                dependencies: ['CLT3'], 
                description: "A entrevista para CLT é mais focada em suas habilidades (soft skills) e alinhamento com a empresa.",
                steps: [
                    { title: "Perguntas Comuns", content: "Prepare respostas para: 'Fale sobre você', 'Quais seus pontos fortes e fracos?', 'Por que você quer trabalhar aqui?'." },
                    { title: "Metodologia STAR", content: "Ao dar exemplos, use o método STAR: Situação (o contexto), Tarefa (o que precisava ser feito), Ação (o que você fez), Resultado (o que aconteceu)." }
                ]
            }
        ]
    },
    'Estágio': {
        summary: 'Como encontrar e se preparar para uma vaga de estágio na sua área de estudo.',
        image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80',
        tasks: [
            { 
                id: 'EST1', 
                title: 'Adaptar o Currículo para Vagas de Estágio', 
                priority: 'Alta', 
                description: "O currículo de estágio deve destacar sua formação acadêmica e seu interesse na área.",
                steps: [
                    // --- MUDANÇA AQUI ---
                    { title: "Use o Construtor de Currículo", content: "Clique aqui para ir ao Construtor de Currículo e preencher seus dados.", action: 'NAV_CURRICULO' },
                    { title: "Objetivo Focado", content: "Exemplo: 'Estudante de [Seu Curso], busco oportunidade de estágio em [Área da Vaga] para aplicar meus conhecimentos...'" },
                    { title: "Destaque Acadêmico", content: "Coloque a seção 'Formação Acadêmica' logo após o 'Objetivo'. Liste a faculdade, curso, período e ano de conclusão." }
                ]
            },
            { 
                id: 'EST2', 
                title: 'Cadastro nos portais de estágio', 
                priority: 'Alta', 
                dependencies: ['EST1'], 
                description: "Muitas empresas centralizam suas vagas de estágio em grandes integradores.",
                steps: [
                    { title: "Cadastro no CIEE", content: "O CIEE é um dos maiores portais para aprendizes.", link: "https://portal.ciee.org.br/" },
                    { title: "Cadastro no Nube", content: "O Nube também é um grande portal focado em vagas de entrada.", link: "https://www.nube.com.br/" },
                    { title: "Portais Universitários", content: "Verifique se sua faculdade tem um portal próprio de vagas ou parcerias." }
                ]
            },
            { 
                id: 'EST3', 
                title: 'Estudar conceitos chave da sua área', 
                priority: 'Média', 
                dependencies: ['EST2'], 
                description: "Na entrevista de estágio, o recrutador sabe que você não tem experiência, mas quer saber se você tem o conhecimento teórico.",
                steps: [
                    { title: "Revise a Matéria", content: "Revise as matérias básicas do seu curso que se aplicam à vaga." },
                    { title: "Prepare-se para 'Cases'", content: "Algumas empresas aplicam pequenos 'testes' ou 'desafios' sobre situações do dia-a-dia da área. Pesquise sobre 'cases de entrevista de estágio' para sua área." }
                ]
            },
            {
                id: 'EST4',
                title: 'Entender a Lei do Estágio',
                priority: 'Baixa',
                description: "O estágio não é CLT e tem uma lei própria. Conhecê-la te ajuda a garantir seus direitos.",
                steps: [
                    { title: "Contrato (TCE)", content: "Você precisa assinar um 'Termo de Compromisso de Estágio', que também deve ser assinado pela empresa e pela sua faculdade." },
                    { title: "Carga Horária", content: "A lei limita o estágio a 6 horas por dia e 30 horas por semana." },
                    { title: "Direitos", content: "Você tem direito a bolsa-auxílio, vale-transporte e recesso remunerado (férias) de 30 dias após 1 ano." }
                ]
            },
            {
                id: 'EST5',
                title: 'Fazer networking com professores',
                priority: 'Média',
                description: "Muitas vagas de estágio não são publicadas; elas chegam por indicação.",
                steps: [
                    { title: "Converse com Professores", content: "Seus professores conhecem o mercado. Pergunte sobre a área, peça dicas e mencione que está buscando um estágio." },
                    { title: "Participe de Eventos", content: "Vá a palestras, semanas acadêmicas e feiras da sua área. Converse com os palestrantes." }
                ]
            }
        ]
    },
    'Criar Currículo': {
        summary: 'O passo a passo para criar um currículo profissional e atrativo do zero.',
        image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80',
        tasks: [
            { 
                id: 'CV1', 
                title: 'Reunir Informações Pessoais e de Contato', 
                priority: 'Alta',
                description: "Esta é a primeira seção do seu currículo. O recrutador precisa saber quem você é e como te contatar.",
                steps: [
                    { title: "Dados Pessoais Essenciais", content: "Nome completo (em destaque), idade ou data de nascimento, e bairro/cidade (Ex: Pinheiros, São Paulo - SP)." },
                    { title: "Não inclua", content: "Número de RG, CPF ou nome dos seus pais. Isso não é necessário e é um risco de segurança." },
                    { title: "Contatos Profissionais", content: "Use um e-mail que pareça profissional (ex: nome.sobrenome@gmail.com) e seu número de WhatsApp. Se tiver LinkedIn, inclua o link." }
                ]
            },
            { 
                id: 'CV2', 
                title: 'Listar Experiências Profissionais e Acadêmicas', 
                priority: 'Alta', 
                dependencies: ['CV1'],
                description: "Aqui você mostra onde estudou e (se tiver) onde trabalhou. Ordem é importante.",
                steps: [
                    { title: "Ordem Cronológica Inversa", content: "Sempre coloque o item mais recente primeiro. Seu emprego atual (ou último) vem antes do anterior." },
                    { title: "Formação Acadêmica", content: "Inclua o nome do curso, a instituição e o status (cursando, concluído) e o ano de conclusão." },
                    { title: "Sem Experiência?", content: "Se não tiver experiência profissional, inclua trabalhos voluntários, projetos da escola ou 'bicos' relevantes." }
                ]
            },
            {
                id: 'CV5',
                title: 'Listar Habilidades e Competências',
                priority: 'Média',
                dependencies: ['CV2'],
                description: "Esta seção mostra o que você sabe fazer. Inclua cursos, idiomas e habilidades (softwares, etc.).",
                steps: [
                    { title: "Habilidades Técnicas (Hard Skills)", content: "Ex: 'Pacote Office (Word, Excel)', 'Inglês (Básico)', 'Conhecimento em Mídias Sociais (Instagram, TikTok)'." },
                    { title: "Habilidades Comportamentais (Soft Skills)", content: "Ex: 'Boa comunicação', 'Facilidade em aprender', 'Proatividade', 'Trabalho em equipe'." }
                ]
            },
            { 
                id: 'CV3', 
                title: 'Escrever um Resumo de Qualificações', 
                priority: 'Média', 
                dependencies: ['CV5'],
                description: "Esta é a seção mais importante. É um parágrafo curto (3-5 linhas) que diz ao recrutador quem você é e o que você busca.",
                steps: [
                    { title: "Seja Direto", content: "Exemplo: 'Busco minha primeira oportunidade como Jovem Aprendiz na área administrativa, com o objetivo de desenvolver habilidades e contribuir para a empresa.'" },
                    { title: "Adapte para a Vaga", content: "Sempre que possível, mude essa frase para se encaixar exatamente na vaga que você está se candidatando." }
                ]
            },
            { 
                id: 'CV4', 
                title: 'Formatar e Salvar o Currículo em PDF', 
                priority: 'Média', 
                dependencies: ['CV3'],
                description: "Com todas as informações reunidas, é hora de montar o documento final.",
                steps: [
                    { title: "Use nossa Ferramenta", content: "Clique aqui para ir ao Construtor de Currículo e preencher seus dados.", action: 'NAV_CURRICULO' },
                    { title: "Escolha um Template Limpo", content: "Prefira os templates 'Clássico' ou 'Moderno'. Evite muitos ícones ou cores." },
                    { title: "Sempre envie em PDF", content: "Nunca envie seu currículo em Word (.doc). O formato PDF garante que ele não será desconfigurado. Use o botão 'Exportar PDF' da nossa ferramenta." }
                ]
            }
        ]
    },
    'Alistamento Militar': {
        summary: 'Entenda as suas obrigações militares e cumpra os prazos para ficar em dia.',
        image: 'https://images.unsplash.com/photo-1611124221944-43b86081e7a4?auto=format&fit=crop&q=80',
        tasks: [
            { 
                id: 'AM1', 
                title: 'Verificar o Período de Alistamento', 
                priority: 'Alta',
                description: "O alistamento militar obrigatório ocorre no ano em que o jovem completa 18 anos.",
                steps: [
                    { title: "Prazo", content: "O período de alistamento vai de 1º de janeiro até 30 de junho do ano em que você completa 18 anos." },
                    { title: "Não perca o prazo", content: "Perder o prazo gera multa e impede a retirada de vários documentos (como passaporte) e a inscrição em concursos." }
                ]
            },
            { 
                id: 'AM2', 
                title: 'Realizar o Alistamento Militar Online', 
                priority: 'Alta', 
                dependencies: ['AM1'], 
                description: "O processo é feito quase inteiramente pela internet, facilitando sua vida.",
                steps: [
                    { title: "Acesse o Site Oficial", content: "O alistamento é feito no site oficial.", link: "https://alistamento.eb.mil.br/" },
                    { title: "Tenha em mãos", content: "Você precisará do seu CPF e de uma conta no portal 'gov.br' para fazer o login." },
                    { title: "Preencha os Dados", content: "Siga as instruções e preencha o formulário com seus dados pessoais. Ao final, guarde o número de protocolo." }
                ]
            },
            { 
                id: 'AM3', 
                title: 'Acompanhar a sua Situação Militar', 
                priority: 'Média', 
                dependencies: ['AM2'],
                description: "Após o alistamento, você precisa acompanhar para saber se foi dispensado ou se terá que se apresentar.",
                steps: [
                    { title: "Consulte o Site", content: "A partir de julho, acesse o mesmo site do alistamento para verificar sua situação.", link: "https://alistamento.eb.mil.br/" },
                    { title: "Certificado de Dispensa (CDI)", content: "Se você for dispensado (o mais comum), será convocado para a cerimônia de Juramento à Bandeira e para a retirada do seu Certificado de Dispensa de Incorporação (CDI)." },
                    { title: "Seleção Geral", content: "Se for convocado, você passará por exames médicos e entrevistas para a seleção geral." }
                ]
            },
            {
                id: 'AM4',
                title: 'Participar do Juramento à Bandeira',
                priority: 'Média',
                dependencies: ['AM3'],
                description: "Se você for dispensado, o último passo é o Juramento à Bandeira para retirar seu documento.",
                steps: [
                    { title: "Data e Local", content: "Ao consultar sua situação (na tarefa anterior), o site informará a data e o local do juramento. Anote." },
                    { title: "Compareça", content: "O juramento é um ato cívico obrigatório. Você deve comparecer no horário marcado." },
                    { title: "Retire o CDI", content: "Após a cerimônia, você receberá seu Certificado de Dispensa de Incorporação (CDI). Guarde este documento, ele é muito importante." }
                ]
            },
            {
                id: 'AM5',
                title: 'O que fazer se perdi o prazo?',
                priority: 'Alta',
                description: "Se você não se alistou no ano dos 18 anos, você está 'refratário' e precisa regularizar sua situação.",
                steps: [
                    { title: "Vá à Junta Militar (JSM)", content: "Diferente do alistamento normal, quem perdeu o prazo geralmente precisa ir presencialmente à Junta de Serviço Militar mais próxima." },
                    { title: "Pague a Multa", content: "Será gerada uma multa (valor baixo) que deve ser paga em um banco para regularizar a situação." },
                    { title: "Processo", content: "Após pagar a multa, você voltará à JSM para finalizar o processo e, eventualmente, conseguir seu certificado de dispensa." }
                ]
            }
        ]
    },
    'Documentos (RG, CPF)': {
        summary: 'Como emitir e manter os seus principais documentos de identificação sempre regulares.',
        image: 'https://images.unsplash.com/photo-1633935345917-31717859067b?auto=format&fit=crop&q=80',
        tasks: [
            { 
                id: 'DOC1', 
                title: 'Verificar Validade e Estado do RG', 
                priority: 'Média',
                description: "O RG (Registro Geral) é seu principal documento de identificação física.",
                steps: [
                    { title: "RG tem validade?", content: "Embora a lei não estabeleça uma 'validade', RGs muito antigos (com mais de 10 anos ou com foto de quando você era criança) são recusados em bancos, aeroportos e concursos." },
                    { title: "Segunda Via", content: "Se seu RG está danificado, foi perdido/roubado, ou está muito velho, é hora de tirar a 2ª via." }
                ]
            },
            { 
                id: 'DOC2', 
                title: 'Agendar Emissão de 2ª via do RG', 
                priority: 'Alta', 
                dependencies: ['DOC1'],
                description: "A emissão de segunda via é um processo que exige agendamento prévio.",
                steps: [
                    { title: "Procure o Órgão Emissor", content: "Busque no Google por 'emissão RG [Nome do seu Estado]' (Ex: 'emissão RG São Paulo' levará ao Poupatempo)." },
                    { title: "Agende Online", content: "Quase todos os estados exigem agendamento online. Marque um horário no posto mais próximo." },
                    { title: "Documentos Necessários", content: "Leve sua Certidão de Nascimento ou Casamento (original ou cópia autenticada) e, se aplicável, o Boletim de Ocorrência (em caso de roubo)." }
                ]
            },
            { 
                id: 'DOC3', 
                title: 'Consultar Situação Cadastral do CPF', 
                priority: 'Alta',
                description: "O CPF é seu documento mais importante. Se ele estiver 'irregular', você não pode fazer quase nada (abrir conta, receber salário, etc.).",
                steps: [
                    { title: "Consulta Rápida", content: "Você pode consultar a situação do seu CPF diretamente no site da Receita Federal.", link: "https://servicos.receita.fazenda.gov.br/servicos/cpf/consultasituacao/consultapublica.asp" },
                    { title: "Digite seu CPF e Data de Nascimento", content: "O site informará na hora se sua situação está 'Regular'." },
                    { title: "Situação Irregular", content: "Se estiver 'Pendente de Regularização', 'Suspensa' ou 'Cancelada', você precisará regularizar no próprio site da Receita, geralmente por pendência com a Justiça Eleitoral ou Imposto de Renda." }
                ]
            },
            {
                id: 'DOC4',
                title: 'Verificar Título de Eleitor',
                priority: 'Média',
                description: "Estar em dia com a Justiça Eleitoral é essencial para emitir passaporte, assumir cargos públicos e regularizar o CPF.",
                steps: [
                    { title: "Consulte sua Situação", content: "Acesse o site do TSE (Tribunal Superior Eleitoral) e procure por 'Situação Eleitoral'.", link: "https://www.tse.jus.br/servicos-eleitorais/titulo-e-local-de-votacao/situacao-eleitoral/consulta-por-nome-ou-titulo" },
                    { title: "Multa por não votar", content: "Se você não votou e não justificou, você pode ter uma pendência. A regularização e o pagamento da multa (valor baixo) são feitos online pelo site." }
                ]
            },
            {
                id: 'DOC5',
                title: 'Ativar a CTPS Digital',
                priority: 'Alta',
                description: "A Carteira de Trabalho física (de papel) não é mais necessária para a maioria das contratações. Agora tudo é feito pelo app.",
                steps: [
                    { title: "Acesse o portal da CTPS Digital", content: "Você pode baixar o app no seu celular ou acessar o portal web.", link: "https://www.gov.br/trabalho-e-emprego/pt-br/servicos/trabalhador/carteira-de-trabalho/carteira-de-trabalho-digital" },
                    { title: "Use a conta Gov.br", content: "O login é o mesmo da conta Gov.br (a mesma do ENEM e do Alistamento). Se você não tem, crie uma." }
                ]
            }
        ]
    },
    'ENEM e Vestibulares': {
        summary: 'Organize os seus estudos e não perca nenhum prazo importante para entrar na universidade.',
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80',
        tasks: [
            { 
                id: 'ENEM1', 
                title: 'Montar um Plano de Estudos', 
                priority: 'Alta',
                description: "O ENEM é uma maratona, não uma corrida. Organização é mais importante que estudar 12 horas por dia.",
                steps: [
                    { title: "Defina seus Horários", content: "Seja realista. É melhor estudar 1 hora com foco todos os dias do que prometer 6 horas e não cumprir." },
                    { title: "Divida as Matérias", content: "Intercale matérias de exatas (Matemática, Física) com humanas (História, Redação). Nunca estude só o que você gosta." },
                    { title: "Foco em Redação", content: "Faça, no mínimo, uma redação por semana. A nota da redação tem um peso enorme e pode te salvar." }
                ]
            },
            {
                id: 'ENEM4',
                title: 'Solicitar Isenção da Taxa de Inscrição',
                priority: 'Alta',
                description: "Se você se enquadra nos critérios, pode fazer a prova de graça. O prazo para pedir isenção é ANTES da inscrição regular.",
                steps: [
                    { title: "Quem tem direito?", content: "Geralmente: alunos de escola pública no último ano, quem cursou todo o ensino médio em escola pública, ou bolsistas integrais de escola particular, e pessoas com baixa renda (CadÚnico)." },
                    { title: "Prazo e Local", content: "O pedido de isenção abre ANTES das inscrições normais, geralmente em Abril. Fique atento à Página do Participante.", link: "https://enem.inep.gov.br/participante/" }
                ]
            },
            { 
                id: 'ENEM2', 
                title: 'Fazer a Inscrição para o ENEM', 
                priority: 'Alta', 
                dueDate: `${new Date().getFullYear()}-06-15T00:00:00`,
                dependencies: ['ENEM4'],
                description: "Não adianta estudar o ano todo e perder o prazo de inscrição.",
                steps: [
                    { title: "Atenção às Datas", content: "A inscrição geralmente abre em Maio e dura poucas semanas. Fique atento ao site do INEP/MEC." },
                    { title: "Acesse a Página do Participante", content: "As inscrições são feitas na Página do Participante do INEP.", link: "https://enem.inep.gov.br/participante/" },
                    { title: "Pagamento da Taxa", content: "Após a inscrição (caso não tenha isenção), você deve pagar a taxa (GRU). Guarde o comprovante." }
                ]
            },
            { 
                id: 'ENEM3', 
                title: 'Estudar Redações de Anos Anteriores', 
                priority: 'Média', 
                dependencies: ['ENEM1'],
                description: "Entender o que o ENEM espera de uma redação é o segredo para tirar uma nota alta (900+).",
                steps: [
                    { title: "Leia as Redações Nota 1000", content: "Busque pela 'cartilha do participante ENEM redação' do ano anterior. O INEP publica exemplos de redações nota 1000 e explica o porquê da nota." },
                    { title: "Entenda a Estrutura", content: "Toda redação nota 1000 tem: Introdução (Tese), Desenvolvimento 1, Desenvolvimento 2, e Conclusão (Proposta de Intervenção)." },
                    { title: "Proposta de Intervenção", content: "A conclusão do ENEM *exige* uma proposta que resolva o problema, dizendo: O que fazer? Quem vai fazer? Como fazer? Para qual finalidade?" }
                ]
            },
            {
                id: 'ENEM5',
                title: 'Consultar o Local de Prova',
                priority: 'Alta',
                dependencies: ['ENEM2'],
                description: "Saber com antecedência onde você fará a prova é crucial para evitar atrasos no dia.",
                steps: [
                    { title: "Cartão de Confirmação", content: "Algumas semanas antes da prova, o INEP libera o 'Cartão de Confirmação' na Página do Participante.", link: "https://enem.inep.gov.br/participante/" },
                    { title: "Visite o Local", content: "Se possível, visite o local de prova um fim de semana antes para saber exatamente como chegar, qual ônibus pegar e quanto tempo você leva." }
                ]
            }
        ]
    },
    'Prouni e FIES': {
        summary: 'Entenda como funcionam os programas do governo para financiar os seus estudos superiores.',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80',
        tasks: [
             {
                id: 'PF5',
                title: 'Saber a diferença: Sisu, Prouni e FIES',
                priority: 'Alta',
                description: "É essencial saber o que cada programa faz para não perder oportunidades.",
                steps: [
                    { title: "Sisu (Universidade PÚBLICA)", content: "Usa a nota do ENEM para vagas em faculdades Federais e Estaduais (gratuitas). É o mais concorrido." },
                    { title: "Prouni (Bolsa 100% ou 50%)", content: "Usa a nota do ENEM para te dar uma BOLSA em faculdade PARTICULAR. Você não paga (ou paga metade) e não deve nada depois." },
                    { title: "FIES (Financiamento)", content: "Usa a nota do ENEM para conseguir um EMPRÉSTIMO do governo para pagar a faculdade PARTICULAR. Você paga o governo de volta depois de se formar, com juros baixos." }
                ]
            },
            { 
                id: 'PF1', 
                title: 'Entender os critérios do Prouni/FIES', 
                priority: 'Alta', 
                dependencies: ['PF5'],
                description: "Ambos os programas usam sua nota do ENEM, mas têm regras de renda específicas.",
                steps: [
                    { title: "Prouni (Bolsa)", content: "Exige nota mínima de 450 pontos no ENEM e não ter zerado a redação. Foco em alunos de escola pública ou bolsistas de particular, com renda familiar de até 3 salários mínimos." },
                    { title: "FIES (Financiamento)", content: "Exige ter feito o ENEM (a partir de 2010), nota mínima de 450 e não ter zerado a redação. A renda familiar varia, mas geralmente atende até 3 salários mínimos por pessoa." }
                ]
            },
            { 
                id: 'PF2', 
                title: 'Verificar as datas de inscrição', 
                priority: 'Alta', 
                dependencies: ['PF1'],
                description: "As inscrições abrem logo após o resultado do ENEM (para o Sisu) e são muito rápidas.",
                steps: [
                    { title: "Acesse o Portal de Acesso Único", content: "As inscrições para Sisu, Prouni e FIES são centralizadas no Portal de Acesso Único do MEC.", link: "https://acessounico.mec.gov.br/" },
                    { title: "Quando Abre?", content: "Geralmente em Janeiro/Fevereiro (para o 1º semestre) e em Junho/Julho (para o 2º semestre)." }
                ]
            },
            { 
                id: 'PF3', 
                title: 'Reunir a documentação de comprovação', 
                priority: 'Média', 
                dependencies: ['PF2'],
                description: "Se você for pré-selecionado, terá um prazo curto (geralmente 3-5 dias) para levar uma montanha de documentos na faculdade.",
                steps: [
                    { title: "Comprovação de Renda", content: "É a parte mais difícil. Você precisará de documentos de TODOS que moram na sua casa (RG, CPF, Carteira de Trabalho, Holerites, etc.)." },
                    { title: "Documentos Escolares", content: "Separe seu Histórico Escolar do Ensino Médio." },
                    { title: "Consulte a Lista Oficial", content: "Não deixe para a última hora. Consulte a lista oficial de documentos no site do Prouni/FIES e comece a separar *antes* do resultado sair." }
                ]
            },
            {
                id: 'PF4',
                title: 'Entender a Lista de Espera',
                priority: 'Média',
                dependencies: ['PF2'],
                description: "Não passar na primeira chamada não é o fim. A lista de espera roda muito e aprova muitos alunos.",
                steps: [
                    { title: "Manifestar Interesse", content: "Se você não for chamado na 1ª ou 2ª chamada, você DEVE entrar no site e 'Manifestar Interesse na Lista de Espera'. Não é automático." },
                    { title: "Acompanhar a Faculdade", content: "Após manifestar interesse, o controle sai do MEC e passa para a faculdade. Você deve acompanhar as chamadas no site da própria universidade." }
                ]
            }
        ]
    },
    'Gestão Financeira': {
        summary: 'Aprenda a organizar o seu dinheiro, a poupar e a dar os primeiros passos para o futuro.',
        image: 'https://images.unsplash.com/photo-1642795023268-23c5a044eee6?auto=format&fit=crop&q=80',
        tasks: [
            {
                id: 'GF4',
                title: 'Abrir uma conta em um Banco Digital',
                priority: 'Alta',
                description: "Bancos digitais (como Nubank, Inter, C6) não cobram taxas de manutenção e oferecem investimentos simples direto no app.",
                steps: [
                    { title: "Pesquise as Opções", content: "Nubank, Inter, C6 Bank são os mais populares. Todos são gratuitos." },
                    { title: "Abra a Conta", content: "O processo é 100% online pelo celular. Você precisará de um documento com foto (RG ou CNH)." }
                ]
            },
            { 
                id: 'GF1', 
                title: 'Criar um controle de gastos (Orçamento)', 
                priority: 'Alta',
                dependencies: ['GF4'],
                description: "O primeiro passo para controlar seu dinheiro é saber para onde ele está indo.",
                steps: [
                    { title: "Use um App ou Planilha", content: "Use um aplicativo (como 'Mobills' ou 'Organizze') ou a planilha do seu próprio banco digital." },
                    { title: "Anote TUDO", content: "Nos primeiros 30 dias, anote absolutamente tudo que você gasta, do aluguel ao chiclete. Você vai se surpreender." },
                    { title: "Categorize", content: "Separe os gastos (Moradia, Transporte, Alimentação, Lazer). Isso mostra onde você pode economizar." }
                ]
            },
            { 
                id: 'GF2', 
                title: 'Definir uma meta de poupança', 
                priority: 'Média', 
                dependencies: ['GF1'],
                description: "Poupar não é o que sobra no fim do mês. É o primeiro 'boleto' que você se paga.",
                steps: [
                    { title: "Pague-se Primeiro", content: "Assim que receber seu salário, transfira imediatamente o valor que você quer guardar (Ex: 10% ou R$ 100) para uma conta separada ou para um 'cofrinho' do seu app do banco." },
                    { title: "Comece Pequeno", content: "É melhor guardar R$ 50 todo mês do que tentar guardar R$ 500 em um mês e falhar no próximo. Crie o hábito." }
                ]
            },
            {
                id: 'GF5',
                title: 'Entender o Cartão de Crédito',
                priority: 'Alta',
                description: "O cartão de crédito é uma ferramenta excelente se usado corretamente, mas uma armadilha perigosa se usado sem controle.",
                steps: [
                    { title: "Não é Dinheiro Extra", content: "O cartão é um empréstimo de curto prazo. Você *terá* que pagar. Só gaste o que você *sabe* que pode pagar no fim do mês." },
                    { title: "Pague a Fatura TOTAL", content: "Nunca pague só o 'mínimo' da fatura. Os juros (rotativo) são os mais altos do mercado e criam uma dívida impagável." },
                    { title: "Limite", content: "Use o cartão para organizar gastos (ex: só para assinaturas como Netflix) e construir um histórico de crédito. Mantenha o limite baixo no início." }
                ]
            },
            { 
                id: 'GF3', 
                title: 'Estudar sobre investimentos para iniciantes', 
                priority: 'Baixa', 
                dependencies: ['GF2'],
                description: "Com o dinheiro poupado, você pode fazê-lo trabalhar para você. Mas comece pelo básico.",
                steps: [
                    { title: "Reserva de Emergência", content: "Seu primeiro investimento deve ser a 'Reserva de Emergência' (dinheiro para 6 meses de gastos). Deixe em um lugar seguro e que renda mais que a poupança, como Tesouro Selic ou um CDB 100%." },
                    { title: "Não caia em golpes", content: "Ignore promessas de 'ganho fácil', 'Pix de 100 vira 500' ou 'robô de investimento'. Invista apenas em corretoras grandes e regulamentadas (XP, Rico, BTG, Inter)." }
                ]
            }
        ]
    }
};


const addTaskToFirestore = async (userId, taskData) => {
    const taskRef = doc(db, 'users', userId, 'tasks', taskData.id);
    const docSnap = await getDoc(taskRef);

    if (!docSnap.exists()) {
        const { steps, ...taskDataLite } = taskData;
        await setDoc(taskRef, { ...taskDataLite, status: 'pendente', createdAt: new Date() });
    }
};


export const runTaskEngine = async (profile, userId) => {
    const interests = profile.interests || [];
    const userAge = profile.dateOfBirth ? new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear() : null;
    
    for (const interest of interests) {
        if (taskKnowledgeBase[interest]) {
            const category = taskKnowledgeBase[interest];
            
            for (const taskTemplate of category.tasks) {
                
                if (interest === 'Alistamento Militar' && (!userAge || userAge < 17)) {
                    continue;
                }
                
              
                
                const taskData = {
                    ...taskTemplate,
                    category: interest,
                    categoryImage: category.image,
                    categorySummary: category.summary
                };
                await addTaskToFirestore(userId, taskData);
            }
        }
    }
};