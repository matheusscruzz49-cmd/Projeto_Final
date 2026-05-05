import * as React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import firebase from '../config/config';
import VenderAcoes from './VenderAcoes';

const PRECOS_ATUAIS = {
  PETR4: 35.42, VALE3: 68.90, ITUB4: 32.15,
  MGLU3: 2.45,  BBAS3: 55.10, WEGE3: 42.70,
  RENT3: 48.60, ABEV3: 12.30,
};

class MinhaCarteira extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      carteira: [],
      carregando: true,
      saldoAtual: props.usuario?.saldo || 0,
      itemVendendo: null, // ação selecionada para vender
    };
  }

  componentDidMount() {
    this.carregarCarteira();
  }

  carregarCarteira() {
    const { usuario } = this.props;
    if (!usuario?.uid) {
      this.setState({ carregando: false });
      return;
    }

    this.setState({ carregando: true });
    const uid = usuario.uid;

    // Lê carteira e saldo do usuário em paralelo
    Promise.all([
      firebase.database().ref(`usuarios/${uid}/carteira`).once('value'),
      firebase.database().ref(`usuarios/${uid}/saldo`).once('value'),
    ]).then(([carteiraSnap, saldoSnap]) => {
      const data = carteiraSnap.val();
      const saldo = saldoSnap.val() || 0;
      const lista = data ? Object.keys(data).map(key => ({ uid: key, ...data[key] })) : [];
      this.setState({ carteira: lista, saldoAtual: saldo, carregando: false });
    }).catch(() => {
      this.setState({ carregando: false });
    });
  }

  calcularResumo() {
    let totalInvestido = 0;
    let valorAtual = 0;

    this.state.carteira.forEach(item => {
      totalInvestido += item.precoMedio * item.quantidade;
      const precoAtual = PRECOS_ATUAIS[item.ticker] || item.precoMedio;
      valorAtual += precoAtual * item.quantidade;
    });

    const lucroPerda = valorAtual - totalInvestido;
    const percentual = totalInvestido > 0 ? (lucroPerda / totalInvestido) * 100 : 0;

    return { totalInvestido, valorAtual, lucroPerda, percentual };
  }

  abrirVenda(item) {
    this.setState({ itemVendendo: item });
  }

  fecharVenda() {
    this.setState({ itemVendendo: null });
  }

  onVendaRealizada(novoSaldo) {
    this.setState({ itemVendendo: null, saldoAtual: novoSaldo });
    this.carregarCarteira();
  }

  render() {
    const { carregando, carteira, itemVendendo, saldoAtual } = this.state;
    const { usuario } = this.props;
    const resumo = this.calcularResumo();
    const positivo = resumo.lucroPerda >= 0;

    // Tela de venda
    if (itemVendendo) {
      const precoAtual = PRECOS_ATUAIS[itemVendendo.ticker] || itemVendendo.precoMedio;
      return (
        <VenderAcoes
          item={itemVendendo}
          precoAtual={precoAtual}
          usuario={usuario}
          saldoAtual={saldoAtual}
          onFechar={() => this.fecharVenda()}
          onVendaRealizada={(novoSaldo) => this.onVendaRealizada(novoSaldo)}
        />
      );
    }

    if (carregando) {
      return (
        <View style={estilos.centralizador}>
          <ActivityIndicator size="large" color="#008b8b" />
          <Text style={estilos.carregandoTxt}>Carregando sua carteira...</Text>
        </View>
      );
    }

    return (
      <View style={estilos.container}>
        <View style={estilos.header}>
          <Text style={estilos.headerTitulo}>Minha Carteira</Text>
          <Text style={estilos.saldoLabel}>Saldo disponível</Text>
          <Text style={estilos.saldoValor}>R$ {parseFloat(saldoAtual).toFixed(2)}</Text>
          <View style={estilos.resumoRow}>
            <View style={estilos.resumoItem}>
              <Text style={estilos.resumoLabel}>Valor Investido</Text>
              <Text style={estilos.resumoValor}>R$ {resumo.totalInvestido.toFixed(2)}</Text>
            </View>
            <View style={estilos.resumoItem}>
              <Text style={estilos.resumoLabel}>Valor Atual</Text>
              <Text style={estilos.resumoValor}>R$ {resumo.valorAtual.toFixed(2)}</Text>
            </View>
          </View>
          {resumo.totalInvestido > 0 && (
            <View style={[estilos.lucroBox, { backgroundColor: positivo ? 'rgba(0,184,148,0.15)' : 'rgba(214,48,49,0.15)' }]}>
              <Text style={[estilos.lucroTxt, { color: positivo ? '#00b894' : '#d63031' }]}>
                {positivo ? '▲ Lucro' : '▼ Prejuízo'}: R$ {Math.abs(resumo.lucroPerda).toFixed(2)} ({Math.abs(resumo.percentual).toFixed(2)}%)
              </Text>
            </View>
          )}
        </View>

        {carteira.length === 0 ? (
          <View style={estilos.vazioBox}>
            <Text style={estilos.vazioEmoji}>📭</Text>
            <Text style={estilos.vazioTitulo}>Carteira vazia</Text>
            <Text style={estilos.vazioSub}>Você ainda não comprou nenhuma ação.</Text>
          </View>
        ) : (
          <FlatList
            data={carteira}
            keyExtractor={item => item.uid}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => {
              const precoAtual = PRECOS_ATUAIS[item.ticker] || item.precoMedio;
              const valorTotal = precoAtual * item.quantidade;
              const rentab = ((precoAtual - item.precoMedio) / item.precoMedio) * 100;
              const pos = rentab >= 0;

              return (
                <View style={estilos.card}>
                  <View style={estilos.cardTopo}>
                    <View style={estilos.avatarTicker}>
                      <Text style={estilos.avatarLetra}>{item.ticker[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={estilos.ticker}>{item.ticker}</Text>
                      <Text style={estilos.nomeEmpresa}>{item.nomeEmpresa}</Text>
                    </View>
                    <View style={[estilos.badgeRentab, { backgroundColor: pos ? '#e6f9f2' : '#fdecea' }]}>
                      <Text style={[estilos.rentabTxt, { color: pos ? '#00b894' : '#d63031' }]}>
                        {pos ? '▲' : '▼'} {Math.abs(rentab).toFixed(2)}%
                      </Text>
                    </View>
                  </View>

                  <View style={estilos.cardRodape}>
                    <View style={estilos.infoItem}>
                      <Text style={estilos.infoLabel}>Cotas</Text>
                      <Text style={estilos.infoValor}>{item.quantidade}</Text>
                    </View>
                    <View style={estilos.infoItem}>
                      <Text style={estilos.infoLabel}>Preço médio</Text>
                      <Text style={estilos.infoValor}>R$ {item.precoMedio.toFixed(2)}</Text>
                    </View>
                    <View style={estilos.infoItem}>
                      <Text style={estilos.infoLabel}>Preço atual</Text>
                      <Text style={estilos.infoValor}>R$ {precoAtual.toFixed(2)}</Text>
                    </View>
                    <View style={estilos.infoItem}>
                      <Text style={estilos.infoLabel}>Total</Text>
                      <Text style={[estilos.infoValor, { color: '#008b8b', fontWeight: 'bold' }]}>R$ {valorTotal.toFixed(2)}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={estilos.botaoVender}
                    onPress={() => this.abrirVenda(item)}
                  >
                    <Text style={estilos.txtBotaoVender}>💵 Vender</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}
      </View>
    );
  }
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  centralizador: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  carregandoTxt: { marginTop: 12, color: '#888' },
  header: {
    backgroundColor: '#008b8b', paddingTop: 50, paddingBottom: 24,
    paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    marginBottom: 12,
  },
  headerTitulo: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  saldoLabel: { color: '#b2dfdf', fontSize: 12, textAlign: 'center' },
  saldoValor: { color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 14 },
  resumoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  resumoItem: { flex: 1, alignItems: 'center' },
  resumoLabel: { color: '#b2dfdf', fontSize: 12 },
  resumoValor: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  lucroBox: { borderRadius: 10, padding: 10, marginTop: 14, alignItems: 'center' },
  lucroTxt: { fontSize: 15, fontWeight: 'bold' },
  vazioBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  vazioEmoji: { fontSize: 60, marginBottom: 12 },
  vazioTitulo: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  vazioSub: { color: '#888', textAlign: 'center', marginBottom: 20 },
  card: {
    backgroundColor: '#fff', marginHorizontal: 15, marginBottom: 10,
    borderRadius: 14, elevation: 2, overflow: 'hidden',
  },
  cardTopo: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  avatarTicker: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#e0f4f4', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarLetra: { color: '#008b8b', fontWeight: 'bold', fontSize: 18 },
  ticker: { fontSize: 16, fontWeight: 'bold', color: '#008b8b' },
  nomeEmpresa: { fontSize: 12, color: '#999', marginTop: 2 },
  badgeRentab: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  rentabTxt: { fontSize: 13, fontWeight: 'bold' },
  cardRodape: {
    flexDirection: 'row', backgroundColor: '#f9f9f9',
    paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderColor: '#eee',
  },
  infoItem: { flex: 1, alignItems: 'center' },
  infoLabel: { fontSize: 10, color: '#aaa', marginBottom: 2 },
  infoValor: { fontSize: 12, fontWeight: '600', color: '#444' },
  botaoVender: {
    backgroundColor: '#d63031', margin: 10, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  txtBotaoVender: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});

export default MinhaCarteira;
