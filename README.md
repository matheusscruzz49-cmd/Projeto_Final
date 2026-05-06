# StockSim — Simulador de Investimentos em Ações

Aplicativo mobile educacional de simulação de investimentos na bolsa de valores brasileira, desenvolvido com React Native e Firebase como projeto final da disciplina de Desenvolvimento Mobile.

---

## Visão Geral e Requisitos

O **StockSim** nasceu da ideia de tornar o aprendizado sobre o mercado financeiro acessível e prático. Muitas pessoas têm curiosidade sobre como funciona a bolsa de valores, mas têm medo de perder dinheiro real. O app resolve isso oferecendo um ambiente seguro de simulação, onde o usuário opera com saldo virtual e experimenta na prática os conceitos de compra, venda, carteira e histórico de transações — sem nenhum risco financeiro.

### Tema e Contexto

O projeto simula um **home broker simplificado**, com foco em ações de empresas brasileiras listadas na B3. O usuário cria uma conta, recebe R$ 10.000,00 de saldo virtual e pode comprar e vender ações livremente, acompanhar sua carteira e analisar seu desempenho ao longo do tempo.

### Objetivos

- Permitir cadastro e login com validação de e-mail e senha
- Simular compra e venda de ações com saldo virtual em tempo real
- Exibir gráficos de variação histórica de preço de cada ativo
- Manter um histórico completo e atualizado de todas as operações realizadas
- Exibir a carteira do usuário com preço médio, quantidade e lucro/prejuízo por ativo
- Atualizar o saldo automaticamente em todas as telas após cada operação

### Requisitos para executar o projeto

- Node.js (versão 18 ou superior)
- Expo CLI instalado globalmente (`npm install -g expo-cli`)
- Conta no Firebase com Realtime Database ativo
- Dispositivo físico com o aplicativo **Expo Go** instalado, ou emulador Android/iOS configurado

---

## Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **React Native** | 0.81.5 | Framework principal para desenvolvimento mobile multiplataforma |
| **Expo** | ~54.0.33 | Ambiente de desenvolvimento, build e execução do app |
| **Firebase Realtime Database** | 8.2.3 | Banco de dados em tempo real para saldo, carteira e histórico |
| **Firebase Authentication** | 8.2.3 | Gerenciamento de autenticação de usuários |
| **React Navigation** | ^5.7 | Sistema de navegação entre telas |
| **@react-navigation/bottom-tabs** | * | Barra de navegação inferior com abas |
| **@react-navigation/native-stack** | * | Navegação em pilha entre telas internas |
| **react-native-paper** | 4.9.2 | Componentes visuais auxiliares com Material Design |
| **react-native-gesture-handler** | ~2.28.0 | Suporte a gestos para a navegação |
| **react-native-safe-area-context** | ~5.6.0 | Adaptação segura às diferentes dimensões de tela |
| **JavaScript (ES6+)** | — | Linguagem de programação utilizada em todo o projeto |

### Por que essas tecnologias?

O **React Native** foi escolhido por permitir desenvolver um único código que roda tanto no Android quanto no iOS. O **Firebase** foi utilizado por oferecer banco de dados em tempo real sem necessidade de construir um backend próprio, o que foi fundamental para garantir que o saldo e o histórico atualizassem instantaneamente em todas as telas após cada operação.

---

## Funcionalidades

### Cadastro de Usuário

O usuário preenche nome completo, e-mail, senha e confirmação de senha. O sistema valida se todos os campos estão preenchidos, se o e-mail possui formato válido, se a senha tem no mínimo 6 caracteres, se as senhas coincidem e se o e-mail já não está cadastrado. Caso tudo esteja correto, a conta é criada no Firebase Realtime Database e o usuário recebe automaticamente **R$ 10.000,00 de saldo virtual** para iniciar as simulações.

### Login

O usuário informa e-mail e senha. O sistema busca o e-mail no banco de dados, verifica se existe e então compara a senha informada com a senha cadastrada. Caso a autenticação seja bem-sucedida, o usuário é redirecionado para a tela principal do app com seus dados carregados.

### Tela de Mercado

Exibe todos os ativos disponíveis para negociação: **PETR4, VALE3, ITUB4, MGLU3, BBAS3, WEGE3, RENT3 e ABEV3**. Para cada ativo são exibidos o logo da empresa, o ticker, o nome, o setor, o preço atual e a variação percentual do dia. Os preços são simulados com variação aleatória e se atualizam automaticamente a cada 30 segundos. O saldo disponível do usuário é exibido em destaque no topo e é atualizado em tempo real via listener do Firebase, ou seja, qualquer compra ou venda reflete imediatamente nessa tela. A tela também destaca os três ativos com maiores altas e as três com maiores baixas do momento.

### Gráfico de Ação

Ao tocar em qualquer ativo da lista, o usuário é direcionado para a tela de gráfico daquele ativo. O gráfico exibe a variação histórica simulada do preço ao longo do tempo, com suporte a diferentes períodos: 1 semana, 1 mês, 3 meses, 6 meses e 1 ano. O usuário pode tocar em qualquer ponto do gráfico para ver o preço exato naquela data. A partir dessa tela, é possível ir direto para a tela de compra do ativo.

### Compra de Ações

O usuário informa a quantidade de cotas que deseja comprar. A tela exibe em tempo real o valor total da operação, o saldo que restará após a compra e um indicador de saldo insuficiente caso o total supere o disponível. Existem atalhos rápidos de quantidade (1, 5, 10 e 50 cotas). Ao confirmar, o sistema salva a transação no Firebase, atualiza a carteira do usuário (criando o ativo ou somando ao existente com recálculo do preço médio) e debita o valor do saldo.

### Venda de Ações

O usuário seleciona quantas cotas de um ativo da carteira deseja vender. Estão disponíveis atalhos percentuais (25%, 50%, 75% e Tudo). A tela exibe o preço médio de compra, o preço atual, o total a receber e o lucro ou prejuízo estimado da operação. Ao confirmar, o sistema registra a transação, atualiza ou remove o ativo da carteira e credita o valor no saldo do usuário.

### Minha Carteira

Exibe todos os ativos que o usuário possui no momento, com quantidade de cotas, preço médio de compra, valor atual e indicador de lucro ou prejuízo por posição. O saldo disponível é exibido no topo. A partir de cada ativo, o usuário pode iniciar uma venda diretamente.

### Histórico de Transações

Lista todas as operações realizadas pelo usuário em ordem cronológica decrescente. O histórico utiliza o listener `.on('value')` do Firebase, o que garante atualização automática em tempo real sempre que uma nova compra ou venda é concluída — sem necessidade de recarregar a tela manualmente. É possível filtrar por tipo de operação (Todos, Compras ou Vendas). Um painel de resumo exibe o total comprado, total vendido e o lucro ou prejuízo acumulado. O usuário também pode excluir registros individuais do histórico.

---

## Demonstração

Assista ao vídeo abaixo para ver o aplicativo em funcionamento:

[Clique aqui para assistir ao vídeo de demonstração](https://youtu.be/j5VfA1b7YR8?si=TEziIZML6_6nVIMa)

O vídeo apresenta o fluxo completo do app: cadastro, login, navegação pelo mercado, visualização de gráfico, compra de ações, acompanhamento da carteira e consulta ao histórico de transações.

---

## Instalação e Execução

**1. Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```

**2. Instale as dependências:**
```bash
npm install
```

**3. Configure o Firebase:**

Acesse o [Firebase Console](https://console.firebase.google.com/), crie um projeto e ative os serviços **Realtime Database** e **Authentication** (método e-mail/senha). Em seguida, substitua as credenciais no arquivo `config/config.js`:

```js
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  databaseURL: "https://SEU_PROJETO-default-rtdb.firebaseio.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_ID",
  appId: "SEU_APP_ID",
};
```

**4. Inicie o projeto:**
```bash
npx expo start
```

**5. Abra no dispositivo:**
- Escaneie o QR Code com o aplicativo **Expo Go** (disponível na Play Store e App Store)
- Ou pressione `a` no terminal para abrir no Android Emulator
- Ou pressione `i` no terminal para abrir no iOS Simulator

### Estrutura de Pastas

```
projetofinal/
├── App.js                  # Componente raiz, controla autenticação e navegação
├── index.js                # Ponto de entrada do Expo
├── package.json            # Dependências do projeto
├── config/
│   └── config.js           # Configuração e inicialização do Firebase
├── components/
│   ├── Login.js            # Tela de login com validação de e-mail e senha
│   ├── Cadastrar.js        # Tela de cadastro com validação completa
│   ├── Tela1.js            # Tela de mercado com listagem de ativos
│   ├── GraficoAcao.js      # Tela de gráfico histórico do ativo
│   ├── ComprarAcoes.js     # Tela de compra de cotas
│   ├── VenderAcoes.js      # Tela de venda de cotas
│   ├── MinhaCarteira.js    # Tela da carteira do usuário
│   └── HistoricoTransacoes.js  # Tela do histórico de operações
└── assets/                 # Ícones e imagens do app
```

---

## Aprendizados e Próximos Passos

### O que aprendi com este projeto

O desenvolvimento do StockSim foi uma experiência muito completa para consolidar conhecimentos em desenvolvimento mobile. Os principais aprendizados foram:

**Integração com Firebase em tempo real:** A maior evolução técnica do projeto foi compreender a diferença entre `.once()` e `.on()` do Firebase Realtime Database. Inicialmente o histórico de transações usava `.once()`, o que fazia com que ele carregasse os dados apenas uma vez ao abrir a tela e não refletisse novas compras ou vendas sem recarregar manualmente. A correção para `.on()` transformou o comportamento do app, tornando o histórico reativo e sempre atualizado. Junto a isso, foi necessário aprender a cancelar o listener no `componentWillUnmount` para evitar memory leaks quando o componente é desmontado.

**Gerenciamento de estado entre telas:** Manter o saldo sincronizado em todas as telas foi um desafio interessante. A solução foi implementar um listener independente do Firebase diretamente na tela de mercado, fazendo com que o saldo exibido no topo se atualize automaticamente após qualquer operação, independente de qual tela realizou a transação.

**Lógica financeira:** Implementar o cálculo de preço médio ponderado ao comprar mais cotas de um mesmo ativo, o cálculo de lucro e prejuízo na venda e a validação de saldo insuficiente foram exercícios práticos valiosos de lógica de negócio aplicada.

**Componentização e navegação:** Organizar o projeto em componentes independentes e gerenciar a navegação entre eles com React Navigation, passando props e callbacks entre telas, foi fundamental para manter o código organizado e escalável.

### Melhorias futuras

- Integrar uma API real de cotações, como Brapi ou HG Brasil, para substituir os preços simulados por dados reais do mercado
- Migrar os componentes de Class Components para Hooks (Functional Components), tornando o código mais moderno e conciso
- Implementar autenticação via Firebase Authentication com e-mail verificado, substituindo o sistema manual de senha armazenada no banco
- Adicionar notificações push para alertar o usuário sobre variações expressivas nos ativos da sua carteira
- Criar um painel de desempenho com gráfico de evolução do patrimônio total ao longo do tempo
- Implementar modo escuro
- Reforçar as Firebase Security Rules para proteger os dados de cada usuário

---
