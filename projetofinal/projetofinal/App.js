import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Cadastrar from './components/Cadastrar';
import Login from './components/Login';
import Tela1 from './components/Tela1';
import GraficoAcao from './components/GraficoAcao';
import ComprarAcoes from './components/ComprarAcoes';
import MinhaCarteira from './components/MinhaCarteira';
import HistoricoTransacoes from './components/HistoricoTransacoes';

const Tab = createBottomTabNavigator();

export default function App() {
  const [logado, setLogado] = React.useState(false);
  const [usuarioLogado, setUsuarioLogado] = React.useState(null);
  const [telaAtual, setTelaAtual] = React.useState('mercado');
  const [acaoSelecionada, setAcaoSelecionada] = React.useState(null);

  function handleLogin(usuario) {
    setUsuarioLogado(usuario);
    setLogado(true);
  }

  function irParaGrafico(acao) {
    setAcaoSelecionada(acao);
    setTelaAtual('grafico');
  }

  function irParaComprar(acao) {
    setAcaoSelecionada(acao);
    setTelaAtual('comprar');
  }

  function voltarParaMercado() {
    setTelaAtual('mercado');
    setAcaoSelecionada(null);
  }

  function voltarParaGrafico() {
    setTelaAtual('grafico');
  }

  function TelasMercado() {
    if (telaAtual === 'grafico' && acaoSelecionada) {
      return (
        <GraficoAcao
          acao={acaoSelecionada}
          onVoltar={voltarParaMercado}
          onComprar={irParaComprar}
        />
      );
    }
    if (telaAtual === 'comprar' && acaoSelecionada) {
      return (
        <ComprarAcoes
          acao={acaoSelecionada}
          usuario={usuarioLogado}
          onVoltar={voltarParaGrafico}
          onVerCarteira={() => setTelaAtual('mercado')}
        />
      );
    }
    return <Tela1 onVerGrafico={irParaGrafico} usuario={usuarioLogado} />;
  }

  function TabsLogado() {
    return (
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#008b8b',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 4 },
        }}
      >
        <Tab.Screen
          name="Mercado"
          options={{ tabBarLabel: '📈 Mercado' }}
        >
          {() => <TelasMercado />}
        </Tab.Screen>
        <Tab.Screen
          name="MinhaCarteira"
          options={{ tabBarLabel: '💼 Carteira' }}
        >
          {() => <MinhaCarteira usuario={usuarioLogado} />}
        </Tab.Screen>
        <Tab.Screen
          name="Historico"
          options={{ tabBarLabel: '📋 Histórico' }}
        >
          {() => <HistoricoTransacoes usuario={usuarioLogado} />}
        </Tab.Screen>
      </Tab.Navigator>
    );
  }

  return (
    <NavigationContainer>
      {logado ? (
        <TabsLogado />
      ) : (
        <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#008b8b' }}>
          <Tab.Screen name="Entrar">
            {(props) => <Login {...props} onLogin={handleLogin} />}
          </Tab.Screen>
          <Tab.Screen name="Cadastrar">
            {(props) => <Cadastrar {...props} onLogin={handleLogin} />}
          </Tab.Screen>
        </Tab.Navigator>
      )}
    </NavigationContainer>
  );
}