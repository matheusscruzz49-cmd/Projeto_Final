import * as React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl, Image
} from 'react-native';
import firebase from '../config/config';

const ACOES_BASE = [
  { id: '1', ticker: 'PETR4', nome: 'Petrobras', precoBase: 35.42, setor: 'Energia',
    logo: 'https://s3-symbol-logo.tradingview.com/brasileiro-petrobras--600.png' },
  { id: '2', ticker: 'VALE3', nome: 'Vale On', precoBase: 68.90, setor: 'Mineração',
    logo: 'https://s3-symbol-logo.tradingview.com/vale--600.png' },
  { id: '3', ticker: 'ITUB4', nome: 'Itaú Unibanco', precoBase: 32.15, setor: 'Bancos',
    logo: 'https://tiinside.com.br/wp-content/uploads/2022/08/Itau.png' },
  { id: '4', ticker: 'MGLU3', nome: 'Magazine Luiza', precoBase: 2.45, setor: 'Varejo',
    logo: 'https://s3-symbol-logo.tradingview.com/magaz-luiza-on-nm--600.png' },
  { id: '5', ticker: 'BBAS3', nome: 'Banco do Brasil', precoBase: 55.10, setor: 'Bancos',
    logo: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi4v4sz_PsGCe98ocnEokjkWgfBgThfi70u-36k6j3f81st-IBaIbW2InDiKlugsqyqTxkVApq4dcgSpFXVDrdNsla1jgm7Da8DyEfZjf1JNveDfj4S80-xIiX9Yy2D5Tx5or-Psg/s1600/BB+logo.jpg' },
  { id: '6', ticker: 'WEGE3', nome: 'WEG S.A.', precoBase: 42.70, setor: 'Indústria',
    logo: 'https://s3-symbol-logo.tradingview.com/weg--600.png' },
  { id: '7', ticker: 'RENT3', nome: 'Localiza', precoBase: 48.60, setor: 'Locação',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRt7THTDECE6eaXEFGI7x1zEVSE_GwK7zujug&s' },
  { id: '8', ticker: 'ABEV3', nome: 'Ambev', precoBase: 12.30, setor: 'Bebidas',
    logo: 'https://s3-symbol-logo.tradingview.com/ambev--600.png' },
];

function gerarMercado() {
  return ACOES_BASE.map(acao => {
    const varPct = ((Math.random() - 0.48) * 8);
    const preco = acao.precoBase * (1 + varPct / 100);
    return {
      ...acao,
      preco: preco.toFixed(2),
      variacao: `${varPct >= 0 ? '+' : ''}${varPct.toFixed(2)}%`,
      variacaoNum: varPct,
    };
  });
}

class Tela1 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      acoes: [],
      carregando: true,
      atualizando: false,
      ultimaAtualizacao: null,
      saldoAtual: props.usuario?.saldo || 10000, // saldo no state
    };
    this.saldoRef = null;
  }

  componentDidMount() {
    this.carregarMercado();
    this.intervalo = setInterval(() => this.carregarMercado(true), 30000);

    // Listener em tempo real do saldo no Firebase
    const { usuario } = this.props;
    if (usuario?.uid) {
      this.saldoRef = firebase.database().ref(`usuarios/${usuario.uid}/saldo`);
      this.saldoRef.on('value', snapshot => {
        this.setState({ saldoAtual: snapshot.val() || 0 });
      });
    }
  }

  componentWillUnmount() {
    if (this.intervalo) clearInterval(this.intervalo);
    if (this.saldoRef) this.saldoRef.off(); // cancela listener
  }

  carregarMercado(silencioso = false) {
    if (!silencioso) this.setState({ carregando: true });
    else this.setState({ atualizando: true });

    setTimeout(() => {
      const acoes = gerarMercado();
      const agora = new Date();
      const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.setState({ acoes, carregando: false, atualizando: false, ultimaAtualizacao: hora });
    }, 800);
  }

  render() {
    const { acoes, carregando, atualizando, ultimaAtualizacao, saldoAtual } = this.state;
    const { onVerGrafico } = this.props;
    const maioresAltas = [...acoes].sort((a, b) => b.variacaoNum - a.variacaoNum).slice(0, 3);
    const maioresBaixas = [...acoes].sort((a, b) => a.variacaoNum - b.variacaoNum).slice(0, 3);

    return (
      <View style={estilos.container}>
        <View style={estilos.header}>
          <View style={estilos.headerTopo}>
            <Text style={estilos.logo}>StockApp 📈</Text>
            <TouchableOpacity
              style={[estilos.btnAtualizar, atualizando && { opacity: 0.6 }]}
              onPress={() => this.carregarMercado(true)}
              disabled={atualizando}
            >
              {atualizando
                ? <ActivityIndicator size="small" color="#008b8b" />
                : <Text style={estilos.txtBtnAtualizar}>🔄 Atualizar</Text>
              }
            </TouchableOpacity>
          </View>
          <Text style={estilos.saldoLabel}>Seu Saldo Disponível</Text>
          <Text style={estilos.saldoValor}>
            R$ {parseFloat(saldoAtual).toFixed(2)}
          </Text>
          {ultimaAtualizacao && (
            <Text style={estilos.ultimaAtt}>Atualizado às {ultimaAtualizacao}</Text>
          )}
        </View>

        {carregando ? (
          <View style={estilos.loadingBox}>
            <ActivityIndicator size="large" color="#008b8b" />
            <Text style={estilos.loadingTxt}>Carregando mercado...</Text>
          </View>
        ) : (
          <FlatList
            data={acoes}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={atualizando}
                onRefresh={() => this.carregarMercado(true)}
                colors={['#008b8b']}
              />
            }
            ListHeaderComponent={() => (
              <>
                <View style={estilos.destaquesBox}>
                  <Text style={estilos.destaquesTitulo}>🚀 Maiores Altas</Text>
                  <View style={estilos.destaquesRow}>
                    {maioresAltas.map(a => (
                      <TouchableOpacity key={a.id} style={estilos.chipAlta} onPress={() => onVerGrafico(a)}>
                        <Text style={estilos.chipTicker}>{a.ticker}</Text>
                        <Text style={estilos.chipVar}>{a.variacao}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={[estilos.destaquesTitulo, { marginTop: 10 }]}>📉 Maiores Baixas</Text>
                  <View style={estilos.destaquesRow}>
                    {maioresBaixas.map(a => (
                      <TouchableOpacity key={a.id} style={estilos.chipBaixa} onPress={() => onVerGrafico(a)}>
                        <Text style={estilos.chipTicker}>{a.ticker}</Text>
                        <Text style={[estilos.chipVar, { color: '#d63031' }]}>{a.variacao}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <Text style={estilos.tituloSessao}>Todos os Ativos</Text>
                <Text style={estilos.subtituloSessao}>Toque em uma ação para ver o gráfico</Text>
              </>
            )}
            renderItem={({ item }) => {
              const positivo = item.variacaoNum >= 0;
              return (
                <TouchableOpacity style={estilos.cardAcao} onPress={() => onVerGrafico(item)} activeOpacity={0.7}>
                  <View style={estilos.cardEsquerda}>
                    <View style={[estilos.avatar, { backgroundColor: positivo ? '#e0f4f4' : '#fdecea' }]}>
                      <Image
                        source={{ uri: item.logo }}
                        style={estilos.logoImg}
                      />
                    </View>
                    <View>
                      <Text style={estilos.ticker}>{item.ticker}</Text>
                      <Text style={estilos.nomeEmpresa}>{item.nome}</Text>
                      <Text style={estilos.setor}>{item.setor}</Text>
                    </View>
                  </View>
                  <View style={estilos.cardDireita}>
                    <Text style={estilos.preco}>R$ {item.preco}</Text>
                    <View style={[estilos.badgeVar, { backgroundColor: positivo ? '#e0f9f2' : '#fdecea' }]}>
                      <Text style={[estilos.variacao, { color: positivo ? '#00b894' : '#d63031' }]}>
                        {positivo ? '▲' : '▼'} {item.variacao}
                      </Text>
                    </View>
                    <Text style={estilos.txtVer}>Ver gráfico →</Text>
                  </View>
                </TouchableOpacity>
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
  header: {
    backgroundColor: '#008b8b', paddingTop: 50, paddingBottom: 24,
    paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 10,
  },
  headerTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  logo: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  btnAtualizar: {
    backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, minWidth: 100, alignItems: 'center',
  },
  txtBtnAtualizar: { color: '#008b8b', fontSize: 13, fontWeight: '600' },
  saldoLabel: { color: '#b2dfdf', fontSize: 13 },
  saldoValor: { color: '#fff', fontSize: 30, fontWeight: 'bold', marginTop: 2 },
  ultimaAtt: { color: '#b2dfdf', fontSize: 11, marginTop: 6 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingTxt: { color: '#999', marginTop: 12 },
  destaquesBox: {
    backgroundColor: '#fff', marginHorizontal: 15, marginTop: 5,
    marginBottom: 10, borderRadius: 14, padding: 14, elevation: 1,
  },
  destaquesTitulo: { fontSize: 13, fontWeight: 'bold', color: '#444', marginBottom: 8 },
  destaquesRow: { flexDirection: 'row', gap: 8 },
  chipAlta: { flex: 1, backgroundColor: '#e0f9f2', borderRadius: 10, padding: 10, alignItems: 'center' },
  chipBaixa: { flex: 1, backgroundColor: '#fdecea', borderRadius: 10, padding: 10, alignItems: 'center' },
  chipTicker: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  chipVar: { fontSize: 12, fontWeight: '600', color: '#00b894', marginTop: 2 },
  tituloSessao: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 15, marginTop: 5, color: '#333' },
  subtituloSessao: { fontSize: 12, color: '#999', marginHorizontal: 15, marginBottom: 8 },
  cardAcao: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', padding: 14, marginHorizontal: 15,
    marginVertical: 5, borderRadius: 14, elevation: 1,
  },
  cardEsquerda: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  logoImg: { width: 32, height: 32, borderRadius: 16, resizeMode: 'contain' },
  ticker: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  nomeEmpresa: { fontSize: 12, color: '#999' },
  setor: { fontSize: 10, color: '#bbb', marginTop: 1 },
  cardDireita: { alignItems: 'flex-end' },
  preco: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  badgeVar: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  variacao: { fontSize: 13, fontWeight: 'bold' },
  txtVer: { fontSize: 10, color: '#008b8b', marginTop: 4, fontWeight: '600' },
});

export default Tela1;