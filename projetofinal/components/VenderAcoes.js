import * as React from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, Alert, ScrollView, ActivityIndicator, Vibration, Image
} from 'react-native';
import firebase from '../config/config';

const LOGOS = {
  PETR4: 'https://s3-symbol-logo.tradingview.com/brasileiro-petrobras--600.png',
  VALE3: 'https://s3-symbol-logo.tradingview.com/vale--600.png',
  ITUB4: 'https://tiinside.com.br/wp-content/uploads/2022/08/Itau.png',
  MGLU3: 'https://s3-symbol-logo.tradingview.com/magaz-luiza-on-nm--600.png',
  BBAS3: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi4v4sz_PsGCe98ocnEokjkWgfBgThfi70u-36k6j3f81st-IBaIbW2InDiKlugsqyqTxkVApq4dcgSpFXVDrdNsla1jgm7Da8DyEfZjf1JNveDfj4S80-xIiX9Yy2D5Tx5or-Psg/s1600/BB+logo.jpg',
  WEGE3: 'https://s3-symbol-logo.tradingview.com/weg--600.png',
  RENT3: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRt7THTDECE6eaXEFGI7x1zEVSE_GwK7zujug&s',
  ABEV3: 'https://s3-symbol-logo.tradingview.com/ambev--600.png',
};

class VenderAcoes extends React.Component {
  constructor(props) {
    super(props);
    this.state = { quantidade: '', carregando: false };
  }

  calcularTotal() {
    const { item, precoAtual } = this.props;
    const qtd = parseInt(this.state.quantidade);
    if (!item || isNaN(qtd) || qtd <= 0) return 0;
    return qtd * precoAtual;
  }

  confirmarVenda() {
    const { item, precoAtual } = this.props;
    const qtd = parseInt(this.state.quantidade);
    if (!item) { Alert.alert('Erro', 'Nenhuma ação selecionada.'); return; }
    if (isNaN(qtd) || qtd <= 0) { Alert.alert('Atenção', 'Informe uma quantidade válida.'); return; }
    if (qtd > item.quantidade) { Alert.alert('Erro', `Você só tem ${item.quantidade} cotas de ${item.ticker}.`); return; }
    const total = this.calcularTotal();
    const lucroPerda = (precoAtual - item.precoMedio) * qtd;
    const lucroStr = lucroPerda >= 0 ? `✅ Lucro: R$ ${lucroPerda.toFixed(2)}` : `❌ Prejuízo: R$ ${Math.abs(lucroPerda).toFixed(2)}`;
    Alert.alert('Confirmar Venda',
      `Ação: ${item.ticker}\nQuantidade: ${qtd} cotas\nPreço atual: R$ ${precoAtual.toFixed(2)}\nTotal recebido: R$ ${total.toFixed(2)}\n${lucroStr}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: '💵 Confirmar Venda', onPress: () => { Vibration.vibrate([0, 100, 80, 100]); this.executarVenda(qtd, total, lucroPerda); } }
      ]
    );
  }

  executarVenda(qtd, total, lucroPerda) {
    const { item, usuario, precoAtual, saldoAtual, onVendaRealizada } = this.props;
    if (!usuario?.uid) { Alert.alert('Erro', 'Usuário não identificado.'); return; }
    this.setState({ carregando: true });
    const uid = usuario.uid;
    const novoSaldo = saldoAtual + total;
    const transacao = { tipo: 'VENDA', ticker: item.ticker, nomeEmpresa: item.nomeEmpresa, quantidade: qtd, precoUnitario: precoAtual, totalRecebido: total, lucroPerda, data: new Date().toISOString() };
    firebase.database().ref(`usuarios/${uid}/transacoes`).push(transacao)
      .then(() => {
        const qtdRestante = item.quantidade - qtd;
        return qtdRestante <= 0
          ? firebase.database().ref(`usuarios/${uid}/carteira/${item.uid}`).remove()
          : firebase.database().ref(`usuarios/${uid}/carteira/${item.uid}`).update({ quantidade: qtdRestante });
      })
      .then(() => firebase.database().ref(`usuarios/${uid}`).update({ saldo: novoSaldo }))
      .then(() => {
        this.setState({ carregando: false, quantidade: '' });
        Vibration.vibrate([0, 200, 100, 200, 100, 400]);
        const lucroStr = lucroPerda >= 0 ? `Lucro: R$ ${lucroPerda.toFixed(2)} 🎉` : `Prejuízo: R$ ${Math.abs(lucroPerda).toFixed(2)} 😔`;
        Alert.alert('💵 Venda realizada!', `Você vendeu ${qtd} cotas de ${item.ticker}\nRecebeu: R$ ${total.toFixed(2)}\n${lucroStr}\nNovo saldo: R$ ${novoSaldo.toFixed(2)}`,
          [{ text: 'OK', onPress: () => onVendaRealizada(novoSaldo) }]);
      })
      .catch(error => { this.setState({ carregando: false }); Alert.alert('Erro', error.message); });
  }

  render() {
    const { item, precoAtual, onFechar } = this.props;
    if (!item) return null;
    const qtd = parseInt(this.state.quantidade) || 0;
    const total = this.calcularTotal();
    const lucroPerda = (precoAtual - item.precoMedio) * qtd;
    const qtdValida = qtd > 0 && qtd <= item.quantidade;
    const pos = lucroPerda >= 0;

    return (
      <ScrollView style={estilos.container} showsVerticalScrollIndicator={false}>
        <View style={estilos.header}>
          <TouchableOpacity style={estilos.backBtn} onPress={onFechar}>
            <Text style={estilos.backTxt}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={estilos.headerTitulo}>Vender Ação</Text>
        </View>

        <View style={estilos.cardAcao}>
          <View style={estilos.acaoTopo}>
            <View style={estilos.avatarGrande}>
              <Image source={{ uri: LOGOS[item.ticker] }} style={estilos.logoImg} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={estilos.ticker}>{item.ticker}</Text>
              <Text style={estilos.nomeEmpresa}>{item.nomeEmpresa}</Text>
            </View>
          </View>
          <View style={estilos.separator} />
          <View style={estilos.precoRow}>
            <View style={estilos.precoItem}><Text style={estilos.precoLabel}>Preço médio</Text><Text style={estilos.precoValor}>R$ {item.precoMedio.toFixed(2)}</Text></View>
            <View style={estilos.precoItem}><Text style={estilos.precoLabel}>Preço atual</Text><Text style={estilos.precoValor}>R$ {precoAtual.toFixed(2)}</Text></View>
            <View style={estilos.precoItem}><Text style={estilos.precoLabel}>Cotas em carteira</Text><Text style={estilos.precoValor}>{item.quantidade}</Text></View>
          </View>
        </View>

        <View style={estilos.formBox}>
          <Text style={estilos.formTitulo}>Quantas cotas deseja vender?</Text>
          <TextInput style={estilos.input} keyboardType="numeric" placeholder={`Máx: ${item.quantidade}`} placeholderTextColor="#ccc" value={this.state.quantidade} onChangeText={q => this.setState({ quantidade: q })} />
          <View style={estilos.atalhoRow}>
            {[{ label: 'Tudo', val: item.quantidade }, { label: '75%', val: Math.floor(item.quantidade * 0.75) }, { label: '50%', val: Math.floor(item.quantidade * 0.5) }, { label: '25%', val: Math.floor(item.quantidade * 0.25) }]
              .filter(b => b.val > 0).map(b => (
                <TouchableOpacity key={b.label} style={estilos.btnAtalho} onPress={() => this.setState({ quantidade: String(b.val) })}>
                  <Text style={estilos.txtAtalho}>{b.label}</Text>
                </TouchableOpacity>
              ))}
          </View>

          {qtd > 0 && (
            <View style={[estilos.resumoBox, { borderColor: qtdValida ? '#d63031' : '#ccc' }]}>
              <View style={estilos.resumoLinha}><Text style={estilos.resumoLabel}>Quantidade</Text><Text style={estilos.resumoValor}>{qtd} cotas</Text></View>
              <View style={estilos.resumoLinha}><Text style={estilos.resumoLabel}>Preço atual</Text><Text style={estilos.resumoValor}>R$ {precoAtual.toFixed(2)}</Text></View>
              <View style={[estilos.resumoLinha, { borderTopWidth: 1, borderColor: '#eee', paddingTop: 8, marginTop: 4 }]}>
                <Text style={[estilos.resumoLabel, { fontWeight: 'bold' }]}>Total a receber</Text>
                <Text style={[estilos.resumoValor, { fontWeight: 'bold', fontSize: 18 }]}>R$ {total.toFixed(2)}</Text>
              </View>
              {qtdValida && (
                <View style={[estilos.resumoLinha, { marginTop: 4 }]}>
                  <Text style={estilos.resumoLabel}>{pos ? 'Lucro' : 'Prejuízo'}</Text>
                  <Text style={[estilos.resumoValor, { color: pos ? '#00b894' : '#d63031', fontWeight: 'bold' }]}>{pos ? '+' : '-'} R$ {Math.abs(lucroPerda).toFixed(2)}</Text>
                </View>
              )}
              {!qtdValida && qtd > item.quantidade && <Text style={estilos.erroQtd}>⚠️ Você só tem {item.quantidade} cotas</Text>}
            </View>
          )}

          <TouchableOpacity
            style={[estilos.botaoVender, (!qtdValida || this.state.carregando) && estilos.botaoDesabilitado]}
            onPress={() => this.confirmarVenda()} disabled={!qtdValida || this.state.carregando}
          >
            {this.state.carregando ? <ActivityIndicator color="#fff" /> : (
              <Text style={estilos.txtBotaoVender}>{qtdValida ? `💵 Vender ${qtd} cotas de ${item.ticker}` : 'Informe a quantidade'}</Text>
            )}
          </TouchableOpacity>
          <Text style={estilos.aviso}>* Simulação educacional. Nenhuma transação real é realizada.</Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  header: { backgroundColor: '#d63031', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 15 },
  backBtn: { marginBottom: 10 },
  backTxt: { color: '#ffcccc', fontSize: 14 },
  headerTitulo: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  cardAcao: { backgroundColor: '#fff', marginHorizontal: 15, borderRadius: 16, padding: 16, elevation: 2, marginBottom: 15 },
  acaoTopo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatarGrande: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  logoImg: { width: 36, height: 36, borderRadius: 18, resizeMode: 'contain' },
  ticker: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  nomeEmpresa: { fontSize: 13, color: '#999', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 14 },
  precoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  precoItem: { alignItems: 'center', flex: 1 },
  precoLabel: { fontSize: 11, color: '#999', marginBottom: 4 },
  precoValor: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  formBox: { backgroundColor: '#fff', marginHorizontal: 15, borderRadius: 16, padding: 18, elevation: 2 },
  formTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 14 },
  input: { borderWidth: 1.5, borderColor: '#d63031', borderRadius: 12, height: 55, paddingHorizontal: 16, fontSize: 20, color: '#333', marginBottom: 12 },
  atalhoRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  btnAtalho: { flex: 1, backgroundColor: '#fff5f5', borderRadius: 10, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ffaaaa' },
  txtAtalho: { color: '#d63031', fontWeight: 'bold', fontSize: 12 },
  resumoBox: { borderWidth: 1.5, borderRadius: 12, padding: 14, marginBottom: 16, gap: 8 },
  resumoLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resumoLabel: { fontSize: 13, color: '#666' },
  resumoValor: { fontSize: 14, color: '#333' },
  erroQtd: { color: '#d63031', fontSize: 12, textAlign: 'center', marginTop: 4 },
  botaoVender: { backgroundColor: '#d63031', padding: 18, borderRadius: 14, alignItems: 'center', elevation: 3 },
  botaoDesabilitado: { backgroundColor: '#ffaaaa' },
  txtBotaoVender: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  aviso: { fontSize: 10, color: '#ccc', textAlign: 'center', marginTop: 16 },
});

export default VenderAcoes;