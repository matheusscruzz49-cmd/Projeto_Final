import * as React from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableHighlight, Alert, ScrollView
} from 'react-native';
import firebase from '../config/config';

class ComprarAcoes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      quantidade: '',
      carregando: false,
    };
  }

  getAcao() {
    return this.props.route?.params?.acao || null;
  }

  calcularTotal() {
    const acao = this.getAcao();
    if (!acao) return '0.00';

    const qtd = parseInt(this.state.quantidade) || 0;
    return (qtd * acao.preco).toFixed(2);
  }

  confirmarCompra() {
    const acao = this.getAcao();
    if (!acao) return;

    const qtd = parseInt(this.state.quantidade);

    if (!qtd || qtd <= 0) {
      Alert.alert('Atenção', 'Informe uma quantidade válida.');
      return;
    }

    const total = qtd * acao.preco;

    Alert.alert(
      'Confirmar Compra',
      `Ação: ${acao.ticker}\nQuantidade: ${qtd} cotas\nTotal: R$ ${total.toFixed(2)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Comprar', onPress: () => this.executarCompra(qtd, total, acao) }
      ]
    );
  }

  executarCompra(qtd, total, acao) {
    this.setState({ carregando: true });

    const transacao = {
      tipo: 'COMPRA',
      ticker: acao.ticker,
      nomeEmpresa: acao.nome,
      quantidade: qtd,
      precoUnitario: acao.preco,
      totalGasto: total,
      data: new Date().toISOString(),
    };

    firebase.database().ref('transacoes').push(transacao)
      .then(() => {
        return firebase.database()
          .ref('carteira')
          .orderByChild('ticker')
          .equalTo(acao.ticker)
          .once('value');
      })
      .then(snapshot => {
        if (snapshot.val()) {
          const chave = Object.keys(snapshot.val())[0];
          const existente = snapshot.val()[chave];

          const novaQtd = existente.quantidade + qtd;
          const novoPrecoMedio =
            ((existente.precoMedio * existente.quantidade) + (acao.preco * qtd)) / novaQtd;

          return firebase.database().ref(`carteira/${chave}`).update({
            quantidade: novaQtd,
            precoMedio: parseFloat(novoPrecoMedio.toFixed(2)),
          });
        } else {
          return firebase.database().ref('carteira').push({
            ticker: acao.ticker,
            nomeEmpresa: acao.nome,
            quantidade: qtd,
            precoMedio: acao.preco,
          });
        }
      })
      .then(() => {
        this.setState({ carregando: false, quantidade: '' });

        Alert.alert(
          'Compra realizada!',
          `Você comprou ${qtd} cotas de ${acao.ticker} por R$ ${total.toFixed(2)}`,
          [
            { text: 'Ver Carteira', onPress: () => this.props.navigation.navigate('Carteira') },
            { text: 'OK' }
          ]
        );
      })
      .catch(error => {
        this.setState({ carregando: false });
        Alert.alert('Erro', 'Falha ao processar compra: ' + error.message);
      });
  }

  render() {
  const acao = this.props.route?.params?.acao;

  if (!acao) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <Text>Nenhuma ação selecionada</Text>
      </View>
    );
  }

    const positivo = acao.variacao >= 0;
    const total = this.calcularTotal();

    return (
      <ScrollView style={estilos.container}>
        <View style={estilos.cardAcao}>
          <View style={estilos.avatarTicker}>
            <Text style={estilos.avatarLetra}>{acao.ticker[0]}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={estilos.ticker}>{acao.ticker}</Text>
            <Text style={estilos.nomeEmpresa}>{acao.nome}</Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={estilos.preco}>R$ {acao.preco.toFixed(2)}</Text>
            <Text style={[estilos.variacao, { color: positivo ? '#00b894' : '#d63031' }]}>
              {positivo ? '▲' : '▼'} {Math.abs(acao.variacao).toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={estilos.formulario}>
          <Text style={estilos.titulo}>Ordem de Compra</Text>

          <Text style={estilos.label}>Quantidade de cotas</Text>
          <TextInput
            style={estilos.input}
            placeholder="Ex: 10"
            keyboardType="numeric"
            value={this.state.quantidade}
            onChangeText={v => this.setState({ quantidade: v })}
          />

          <View style={estilos.resumoBox}>
            <View style={estilos.resumoLinha}>
              <Text style={estilos.resumoLabel}>Preço unitário:</Text>
              <Text style={estilos.resumoValor}>R$ {acao.preco.toFixed(2)}</Text>
            </View>

            <View style={estilos.resumoLinha}>
              <Text style={estilos.resumoLabel}>Quantidade:</Text>
              <Text style={estilos.resumoValor}>{this.state.quantidade || 0} cotas</Text>
            </View>

            <View style={[estilos.resumoLinha, estilos.totalLinha]}>
              <Text style={estilos.totalLabel}>Total estimado:</Text>
              <Text style={estilos.totalValor}>R$ {total}</Text>
            </View>
          </View>

          <TouchableHighlight
            style={[estilos.botaoComprar, this.state.carregando && { opacity: 0.6 }]}
            onPress={() => !this.state.carregando && this.confirmarCompra()}
          >
            <Text style={estilos.txtBotao}>
              {this.state.carregando ? 'Processando...' : '✔ Confirmar Compra'}
            </Text>
          </TouchableHighlight>

          <TouchableHighlight
            style={estilos.botaoCancelar}
            onPress={() => this.props.navigation.goBack()}
          >
            <Text style={estilos.txtCancelar}>Cancelar</Text>
          </TouchableHighlight>
        </View>
      </ScrollView>
    );
  }
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  cardAcao: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#008b8b',
    padding: 20,
    marginBottom: 16,
  },
  avatarTicker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarLetra: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  ticker: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  nomeEmpresa: { color: '#b2dfdf', fontSize: 13 },
  preco: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  variacao: { fontSize: 13, fontWeight: 'bold' },
  formulario: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 16,
    padding: 20,
  },
  titulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: 'bold' },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  resumoBox: { marginTop: 20 },
  resumoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLinha: { marginTop: 10 },
  totalLabel: { fontWeight: 'bold' },
  totalValor: { fontWeight: 'bold', color: '#008b8b' },
  botaoComprar: {
    height: 52,
    backgroundColor: '#008b8b',
    justifyContent: 'center',
    borderRadius: 10,
    marginTop: 20,
  },
  txtBotao: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  botaoCancelar: {
    height: 48,
    justifyContent: 'center',
    marginTop: 10,
  },
  txtCancelar: { textAlign: 'center', color: '#888' },
});

export default ComprarAcoes;