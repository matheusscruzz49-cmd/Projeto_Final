Readme · MD
Copiar

# StockSim — Simulador de Investimentos em Ações
 
Aplicativo mobile educacional de simulação de investimentos na bolsa de valores brasileira, desenvolvido com React Native e Firebase.
 
---
 
## Demonstração
 
[Clique aqui para assistir ao vídeo de demonstração do app](https://youtu.be/q8hznOVcTYY?si=7foqLJHhblRCQh76)
 
---
 
## Visão Geral e Requisitos
 
O **StockSim** é um simulador educacional que permite ao usuário aprender sobre o mercado de ações de forma prática e segura, sem envolver dinheiro real. O app simula operações de compra e venda de ações de empresas brasileiras listadas na B3, com atualização de saldo, carteira e histórico de transações em tempo real.
 
**Objetivos do projeto:**
- Permitir que o usuário crie uma conta e faça login com autenticação Firebase
- Simular compra e venda de ações com saldo virtual
- Exibir gráficos de variação de preço de cada ação
- Manter um histórico completo de todas as transações realizadas
- Exibir a carteira atual do usuário com preço médio e lucro/prejuízo
**Requisitos para executar o projeto:**
- Node.js instalado
- Expo CLI instalado globalmente
- Conta no Firebase (Realtime Database ativo)
- Dispositivo físico ou emulador Android/iOS
---
 
## Tecnologias Utilizadas
 
| Tecnologia | Finalidade |
|---|---|
| **React Native** | Framework principal para desenvolvimento mobile |
| **Expo** (~54.0.33) | Ambiente de desenvolvimento e build |
| **Firebase** (8.2.3) | Autenticação de usuários e banco de dados em tempo real |
| **Firebase Realtime Database** | Armazenamento de saldo, carteira e histórico |
| **Firebase Authentication** | Login e cadastro de usuários |
| **React Navigation** | Navegação entre telas (Bottom Tabs) |
| **@react-navigation/bottom-tabs** | Barra de navegação inferior |
| **react-native-paper** | Componentes visuais auxiliares |
| **react-native-gesture-handler** | Suporte a gestos na navegação |
| **JavaScript (ES6+)** | Linguagem de programação |
 
---
 
## Funcionalidades
 
### Autenticação
- Cadastro de usuário com e-mail e senha via Firebase Authentication
- Login com validação de credenciais
- Ao criar conta, o usuário recebe automaticamente **R$ 10.000,00 de saldo virtual** para iniciar as simulações
### Mercado de Ações
- Listagem de ações da B3 com preço atual, variação diária e logo da empresa
- Ativos disponíveis: PETR4, VALE3, ITUB4, MGLU3, BBAS3, WEGE3, RENT3, ABEV3
- Indicador visual de alta e queda para cada ativo
### Gráfico de Ação
- Visualização gráfica da variação histórica de preço de cada ação
- Exibe dados dos últimos períodos com linha de tendência
- Acesso direto à compra da ação a partir do gráfico
### Compra de Ações
- Seleção de quantidade de cotas a comprar com atalhos rápidos (1, 5, 10, 50 cotas)
- Cálculo automático do total, saldo disponível e cotas possíveis
- Validação de saldo antes de confirmar a operação
- Atualização automática do saldo e da carteira após a compra
### Venda de Ações
- Seleção de quantidade a vender com atalhos percentuais (25%, 50%, 75%, Tudo)
- Exibe preço médio de compra versus preço atual
- Cálculo de lucro ou prejuízo em tempo real
- Remoção do ativo da carteira quando todas as cotas são vendidas
### Minha Carteira
- Listagem de todos os ativos que o usuário possui
- Exibe quantidade de cotas, preço médio de compra e valor atual
- Indicador de lucro/prejuízo por ativo
- Acesso direto à tela de venda de cada ativo
### Histórico de Transações
- Lista completa de todas as compras e vendas realizadas
- Atualização em tempo real via Firebase listener (`.on('value')`)
- Filtros por tipo: Todos, Compras ou Vendas
- Resumo financeiro com total comprado, total vendido e lucro/prejuízo acumulado
- Data e hora de cada operação formatadas em pt-BR
- Possibilidade de excluir registros do histórico
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
 
Acesse o [Firebase Console](https://console.firebase.google.com/), crie um projeto, ative o **Realtime Database** e o **Authentication (e-mail/senha)**. Depois, substitua as credenciais no arquivo `config/config.js`:
 
```js
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
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
- Escaneie o QR Code com o aplicativo **Expo Go** (Android ou iOS)
- Ou pressione `a` para Android Emulator / `i` para iOS Simulator
---
 
## Aprendizados e Próximos Passos
 
### O que aprendi com este projeto
 
Durante o desenvolvimento do StockSim, foram aplicados na prática conceitos fundamentais do desenvolvimento mobile moderno. O projeto envolveu React Native orientado a classes, gerenciamento de estado local, integração com banco de dados em tempo real (Firebase Realtime Database) e autenticação de usuários. Um dos desafios mais relevantes foi compreender a diferença entre `.once()` e `.on()` do Firebase — onde o `.once()` carregava os dados apenas uma vez ao montar o componente, enquanto o `.on()` mantém a escuta ativa, permitindo que o histórico atualize automaticamente após cada transação. Também foi necessário implementar o cancelamento do listener no `componentWillUnmount` para evitar memory leaks.
 
### Melhorias futuras
 
- Migrar de Class Components para Hooks (Functional Components)
- Integrar uma API real de cotações (ex: Brapi, HG Brasil) para preços em tempo real
- Melhorar os gráficos com bibliotecas como Victory Native ou Gifted Charts
- Adicionar notificações push para alertas de variação de preço
- Implementar modo escuro
- Adicionar ranking entre usuários
- Reforçar as Firebase Security Rules
---
