import * as React from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import firebase from '../config/config';

class ComprarAcoes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      quantidade: '',
      carregando: false,
      saldoDisponivel: props.usuario?.saldo || 10000.00,
    };
  }

  calcularTotal() {
    const { acao } = this.props;
    const qtd = parseInt(this.state.quantidade);
    if (!acao || isNaN(qtd) || qtd <= 0) return 0;
    return qtd * parseFloat(acao.preco);
  }

  confirmarCompra() {
    const { acao } = this.props;
    const qtd = parseInt(this.state.quantidade);

    if (!acao) { Alert.alert('Erro', 'Nenhuma ação selecionada.'); return; }
    if (isNaN(qtd) || qtd <= 0) { Alert.alert('Atenção', 'Informe uma quantidade válida.'); return; }

    const total = this.calcularTotal();
    if (total > this.state.saldoDisponivel) {
      Alert.alert('Saldo insuficiente', `Você precisa de R$ ${total.toFixed(2)} mas tem R$ ${this.state.saldoDisponivel.toFixed(2)}.`);
      return;
    }

    Alert.alert(
      'Confirmar Compra',
      `Ação: ${acao.ticker}\nQuantidade: ${qtd} cotas\nPreço unitário: R$ ${parseFloat(acao.preco).toFixed(2)}\nTotal: R$ ${total.toFixed(2)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: '✅ Confirmar', onPress: () => this.executarCompra(qtd, total, acao) }
      ]
    );
  }

  executarCompra(qtd, total, acao) {
    const { usuario } = this.props;
    if (!usuario?.uid) {
      Alert.alert('Erro', 'Usuário não identificado. Faça login novamente.');
      return;
    }

    this.setState({ carregando: true });

    const uid = usuario.uid;
    const novoSaldo = this.state.saldoDisponivel - total;

    const transacao = {
      tipo: 'COMPRA',
      ticker: acao.ticker,
      nomeEmpresa: acao.nome,
      quantidade: qtd,
      precoUnitario: parseFloat(acao.preco),
      totalGasto: total,
      data: new Date().toISOString(),
    };

    // Salva transação e atualiza carteira DENTRO do nó do usuário
    firebase.database().ref(`usuarios/${uid}/transacoes`).push(transacao)
      .then(() => {
        return firebase.database()
          .ref(`usuarios/${uid}/carteira`)
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
            ((existente.precoMedio * existente.quantidade) + (parseFloat(acao.preco) * qtd)) / novaQtd;
          return firebase.database().ref(`usuarios/${uid}/carteira/${chave}`).update({
            quantidade: novaQtd,
            precoMedio: parseFloat(novoPrecoMedio.toFixed(2)),
          });
        } else {
          return firebase.database().ref(`usuarios/${uid}/carteira`).push({
            ticker: acao.ticker,
            nomeEmpresa: acao.nome,
            quantidade: qtd,
            precoMedio: parseFloat(acao.preco),
          });
        }
      })
      .then(() => {
        // Atualiza saldo do usuário no Firebase
        return firebase.database().ref(`usuarios/${uid}`).update({ saldo: novoSaldo });
      })
      .then(() => {
        this.setState({ carregando: false, quantidade: '', saldoDisponivel: novoSaldo });
        Alert.alert(
          '🎉 Compra realizada!',
          `Você comprou ${qtd} cotas de ${acao.ticker} por R$ ${total.toFixed(2)}\nSaldo restante: R$ ${novoSaldo.toFixed(2)}`,
          [
            { text: 'Ver Carteira', onPress: () => this.props.onVerCarteira() },
            { text: 'OK' }
          ]
        );
      })
      .catch(error => {
        this.setState({ carregando: false });
        Alert.alert('Erro', error.message);
      });
  }

  render() {
    const { acao, onVoltar } = this.props;

    if (!acao) {
      return (
        <View style={estilos.center}>
          <Text style={estilos.semAcaoEmoji}>🔍</Text>
          <Text style={estilos.semAcaoTitulo}>Nenhuma ação selecionada</Text>
          <TouchableOpacity style={estilos.btnVoltarCenter} onPress={onVoltar}>
            <Text style={estilos.txtBtnVoltar}>← Voltar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const positivo = acao.variacao?.includes('+') || parseFloat(acao.variacaoNum) >= 0;
    const total = this.calcularTotal();
    const qtd = parseInt(this.state.quantidade) || 0;
    const saldoApos = this.state.saldoDisponivel - total;
    const saldoOk = total <= this.state.saldoDisponivel && qtd > 0;

    return (
      <ScrollView style={estilos.container} showsVerticalScrollIndicator={false}>
        <View style={estilos.header}>
          <TouchableOpacity style={estilos.backBtn} onPress={onVoltar}>
            <Text style={estilos.backTxt}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={estilos.headerTitulo}>Comprar Ação</Text>
        </View>

        <View style={estilos.cardAcao}>
          <View style={estilos.acaoTopo}>
            <View style={estilos.avatarGrande}>
              <Text style={estilos.avatarLetra}>{acao.ticker[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={estilos.ticker}>{acao.ticker}</Text>
              <Text style={estilos.nomeEmpresa}>{acao.nome}</Text>
            </View>
            <View style={[estilos.badgeVar, { backgroundColor: positivo ? '#e0f9f2' : '#fdecea' }]}>
              <Text style={[estilos.variacaoTxt, { color: positivo ? '#00b894' : '#d63031' }]}>
                {positivo ? '▲' : '▼'} {acao.variacao}
              </Text>
            </View>
          </View>

          <View style={estilos.separator} />

          <View style={estilos.precoRow}>
            <View style={estilos.precoItem}>
              <Text style={estilos.precoLabel}>Preço atual</Text>
              <Text style={estilos.precoValor}>R$ {parseFloat(acao.preco).toFixed(2)}</Text>
            </View>
            <View style={estilos.precoItem}>
              <Text style={estilos.precoLabel}>Seu saldo</Text>
              <Text style={estilos.precoValor}>R$ {this.state.saldoDisponivel.toFixed(2)}</Text>
            </View>
            <View style={estilos.precoItem}>
              <Text style={estilos.precoLabel}>Cotas possíveis</Text>
              <Text style={estilos.precoValor}>
                {Math.floor(this.state.saldoDisponivel / parseFloat(acao.preco))}
              </Text>
            </View>
          </View>
        </View>

        <View style={estilos.formBox}>
          <Text style={estilos.formTitulo}>Quantas cotas deseja comprar?</Text>

          <TextInput
            style={estilos.input}
            keyboardType="numeric"
            placeholder="Ex: 10"
            placeholderTextColor="#ccc"
            value={this.state.quantidade}
            onChangeText={q => this.setState({ quantidade: q })}
          />

          <View style={estilos.atalhoRow}>
            {[1, 5, 10, 50].map(n => (
              <TouchableOpacity
                key={n}
                style={estilos.btnAtalho}
                onPress={() => this.setState({ quantidade: String(n) })}
              >
                <Text style={estilos.txtAtalho}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {qtd > 0 && (
            <View style={[estilos.resumoBox, { borderColor: saldoOk ? '#008b8b' : '#d63031' }]}>
              <View style={estilos.resumoLinha}>
                <Text style={estilos.resumoLabel}>Quantidade</Text>
                <Text style={estilos.resumoValor}>{qtd} cotas</Text>
              </View>
              <View style={estilos.resumoLinha}>
                <Text style={estilos.resumoLabel}>Preço unitário</Text>
                <Text style={estilos.resumoValor}>R$ {parseFloat(acao.preco).toFixed(2)}</Text>
              </View>
              <View style={[estilos.resumoLinha, { borderTopWidth: 1, borderColor: '#eee', paddingTop: 8, marginTop: 4 }]}>
                <Text style={[estilos.resumoLabel, { fontWeight: 'bold' }]}>Total</Text>
                <Text style={[estilos.resumoValor, { fontWeight: 'bold', fontSize: 18 }]}>R$ {total.toFixed(2)}</Text>
              </View>
              <View style={estilos.resumoLinha}>
                <Text style={estilos.resumoLabel}>Saldo após compra</Text>
                <Text style={[estilos.resumoValor, { color: saldoOk ? '#00b894' : '#d63031' }]}>
                  R$ {saldoApos.toFixed(2)}
                </Text>
              </View>
              {!saldoOk && (
                <Text style={estilos.erroSaldo}>⚠️ Saldo insuficiente</Text>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[estilos.botaoComprar, (!saldoOk || this.state.carregando) && estilos.botaoDesabilitado]}
            onPress={() => this.confirmarCompra()}
            disabled={!saldoOk || this.state.carregando}
          >
            {this.state.carregando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={estilos.txtBotaoComprar}>
                {qtd > 0 && saldoOk ? `💰 Comprar ${qtd} cotas de ${acao.ticker}` : 'Informe a quantidade'}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={estilos.aviso}>
            * Simulação educacional. Nenhuma transação real é realizada.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  semAcaoEmoji: { fontSize: 60, marginBottom: 12 },
  semAcaoTitulo: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  btnVoltarCenter: { backgroundColor: '#008b8b', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  txtBtnVoltar: { color: '#fff', fontWeight: 'bold' },
  header: {
    backgroundColor: '#008b8b', paddingTop: 50, paddingBottom: 20,
    paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 15,
  },
  backBtn: { marginBottom: 10 },
  backTxt: { color: '#b2dfdf', fontSize: 14 },
  headerTitulo: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  cardAcao: { backgroundColor: '#fff', marginHorizontal: 15, borderRadius: 16, padding: 16, elevation: 2, marginBottom: 15 },
  acaoTopo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatarGrande: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#e0f4f4', justifyContent: 'center', alignItems: 'center' },
  avatarLetra: { color: '#008b8b', fontWeight: 'bold', fontSize: 22 },
  ticker: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  nomeEmpresa: { fontSize: 13, color: '#999', marginTop: 2 },
  badgeVar: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  variacaoTxt: { fontSize: 13, fontWeight: 'bold' },
  separator: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 14 },
  precoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  precoItem: { alignItems: 'center', flex: 1 },
  precoLabel: { fontSize: 11, color: '#999', marginBottom: 4 },
  precoValor: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  formBox: { backgroundColor: '#fff', marginHorizontal: 15, borderRadius: 16, padding: 18, elevation: 2 },
  formTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 14 },
  input: {
    borderWidth: 1.5, borderColor: '#008b8b', borderRadius: 12,
    height: 55, paddingHorizontal: 16, fontSize: 20, color: '#333', marginBottom: 12,
  },
  atalhoRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  btnAtalho: { flex: 1, backgroundColor: '#f0f9f9', borderRadius: 10, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#b2dfdf' },
  txtAtalho: { color: '#008b8b', fontWeight: 'bold' },
  resumoBox: { borderWidth: 1.5, borderRadius: 12, padding: 14, marginBottom: 16, gap: 8 },
  resumoLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resumoLabel: { fontSize: 13, color: '#666' },
  resumoValor: { fontSize: 14, color: '#333' },
  erroSaldo: { color: '#d63031', fontSize: 12, textAlign: 'center', marginTop: 4 },
  botaoComprar: { backgroundColor: '#008b8b', padding: 18, borderRadius: 14, alignItems: 'center', elevation: 3 },
  botaoDesabilitado: { backgroundColor: '#b2dfdf' },
  txtBotaoComprar: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  aviso: { fontSize: 10, color: '#ccc', textAlign: 'center', marginTop: 16 },
});

export default ComprarAcoes;
