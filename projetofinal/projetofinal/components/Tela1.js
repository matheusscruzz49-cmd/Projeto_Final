import * as React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

class Tela1 extends React.Component {
  constructor(props) {
    super(props);
    // Dados fictícios para o mercado de ações
    this.state = {
      acoes: [
        { id: '1', ticker: 'PETR4', nome: 'Petrobras', preco: '35.42', variacao: '+1.2%' },
        { id: '2', ticker: 'VALE3', nome: 'Vale On', preco: '68.90', variacao: '-0.5%' },
        { id: '3', ticker: 'ITUB4', nome: 'Itaú Unibanco', preco: '32.15', variacao: '+2.1%' },
        { id: '4', ticker: 'MGLU3', nome: 'Magazine Luiza', preco: '2.45', variacao: '-4.3%' },
        { id: '5', ticker: 'BBAS3', nome: 'Banco do Brasil', preco: '55.10', variacao: '+0.8%' },
      ]
    };
  }

  render() {
    return (
      <View style={estilos.container}>
        <View style={estilos.header}>
          <Text style={estilos.logo}>StockApp 📈</Text>
          <Text style={estilos.saldoLabel}>Seu Saldo Disponível:</Text>
          <Text style={estilos.saldoValor}>R$ 10.000,00</Text>
        </View>

        <Text style={estilos.tituloSessao}>Principais Ativos</Text>

        <FlatList
          data={this.state.acoes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={estilos.cardAcao}>
              <View>
                <Text style={estilos.ticker}>{item.ticker}</Text>
                <Text style={estilos.nomeEmpresa}>{item.nome}</Text>
              </View>
              <View style={estilos.areaPreco}>
                <Text style={estilos.preco}>R$ {item.preco}</Text>
                <Text style={[
                  estilos.variacao, 
                  { color: item.variacao.includes('+') ? '#00b894' : '#d63031' }
                ]}>
                  {item.variacao}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#008b8b',
    padding: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  logo: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  saldoLabel: {
    color: '#e0e0e0',
    fontSize: 14,
  },
  saldoValor: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  tituloSessao: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 15,
    color: '#333',
  },
  cardAcao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
  },
  ticker: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#008b8b',
  },
  nomeEmpresa: {
    fontSize: 12,
    color: '#888',
  },
  areaPreco: {
    alignItems: 'flex-end',
  },
  preco: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  variacao: {
    fontSize: 14,
    fontWeight: 'bold',
  }
});

export default Tela1;