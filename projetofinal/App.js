import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Cadastrar from './components/Cadastrar';
import Login from './components/Login';
import Tela1 from './components/Tela1';
import GraficoAcao from './components/GraficoAcao';
import ComprarAcoes from './components/ComprarAcoes';
import MinhaCarteira from './components/MinhaCarteira';

const Tab = createBottomTabNavigator();

export default function App() {
  const [logado, setLogado] = React.useState(false);
  const [telaAtual, setTelaAtual] = React.useState('mercado'); // 'mercado' | 'grafico' | 'comprar'
  const [acaoSelecionada, setAcaoSelecionada] = React.useState(null);

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
          onVoltar={voltarParaGrafico}
          onVerCarteira={() => setTelaAtual('mercado')}
        />
      );
    }
    return <Tela1 onVerGrafico={irParaGrafico} />;
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
          component={MinhaCarteira}
          options={{ tabBarLabel: '💼 Carteira' }}
        />
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
            {(props) => <Login {...props} setLogado={setLogado} />}
          </Tab.Screen>
          <Tab.Screen name="Cadastrar">
            {(props) => <Cadastrar {...props} setLogado={setLogado} />}
          </Tab.Screen>
        </Tab.Navigator>
      )}
    </NavigationContainer>
  );
}