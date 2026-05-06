import * as React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, Alert, Vibration, Image
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

class HistoricoTransacoes extends React.Component {
  constructor(props) {
    super(props);
    this.state = { transacoes: [], carregando: true, filtro: 'TODOS' };
    this._listener = null; // 🔧 referência ao listener para cancelar depois
  }

  componentDidMount() { this.carregarHistorico(); }

  // 🔧 CORREÇÃO: cancelar o listener ao desmontar para evitar memory leak
  componentWillUnmount() {
    const { usuario } = this.props;
    if (usuario?.uid && this._listener) {
      firebase.database()
        .ref(`usuarios/${usuario.uid}/transacoes`)
        .off('value', this._listener);
    }
  }

  carregarHistorico() {
    const { usuario } = this.props;
    if (!usuario?.uid) { this.setState({ carregando: false }); return; }
    this.setState({ carregando: true });

    // 🔧 CORREÇÃO PRINCIPAL: trocado .once() por .on() para escuta em tempo real.
    // Agora o histórico atualiza automaticamente sempre que uma compra ou venda é realizada.
    this._listener = firebase.database()
      .ref(`usuarios/${usuario.uid}/transacoes`)
      .orderByChild('data')
      .on('value', snapshot => {
        const data = snapshot.val();
        const lista = data
          ? Object.keys(data).map(key => ({ uid: key, ...data[key] })).reverse()
          : [];
        this.setState({ transacoes: lista, carregando: false });
      }, error => {
        console.error('Erro ao carregar histórico:', error);
        this.setState({ carregando: false });
      });
  }

  formatarData(isoString) {
    const d = new Date(isoString);
    return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  }

  calcularResumo() {
    let totalComprado = 0, totalVendido = 0, lucroTotal = 0;
    this.state.transacoes.forEach(t => {
      if (t.tipo === 'COMPRA') totalComprado += t.totalGasto || 0;
      if (t.tipo === 'VENDA') { totalVendido += t.totalRecebido || 0; lucroTotal += t.lucroPerda || 0; }
    });
    return { totalComprado, totalVendido, lucroTotal };
  }

  excluirTransacao(item) {
    const { usuario } = this.props;
    Alert.alert('Excluir registro', `Deseja excluir este registro de ${item.tipo === 'COMPRA' ? 'compra' : 'venda'} de ${item.ticker}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir', style: 'destructive',
          onPress: () => {
            Vibration.vibrate(200);
            // 🔧 CORREÇÃO: como agora usamos .on(), não precisamos atualizar o state manualmente.
            // O listener já vai detectar a remoção e atualizar a lista automaticamente.
            firebase.database()
              .ref(`usuarios/${usuario.uid}/transacoes/${item.uid}`)
              .remove()
              .catch(err => Alert.alert('Erro', err.message));
          }
        }
      ]
    );
  }

  render() {
    const { carregando, filtro } = this.state;
    const resumo = this.calcularResumo();
    const lista = filtro === 'TODOS' ? this.state.transacoes : this.state.transacoes.filter(t => t.tipo === filtro);
    const lucroPos = resumo.lucroTotal >= 0;

    if (carregando) {
      return (
        <View style={estilos.centralizador}>
          <ActivityIndicator size="large" color="#008b8b" />
          <Text style={estilos.carregandoTxt}>Carregando histórico...</Text>
        </View>
      );
    }

    return (
      <View style={estilos.container}>
        <View style={estilos.header}>
          <Text style={estilos.headerTitulo}>Histórico</Text>
          <View style={estilos.resumoRow}>
            <View style={estilos.resumoItem}>
              <Text style={estilos.resumoLabel}>Total Comprado</Text>
              <Text style={estilos.resumoValor}>R$ {resumo.totalComprado.toFixed(2)}</Text>
            </View>
            <View style={estilos.resumoItem}>
              <Text style={estilos.resumoLabel}>Total Vendido</Text>
              <Text style={estilos.resumoValor}>R$ {resumo.totalVendido.toFixed(2)}</Text>
            </View>
          </View>
          {resumo.totalVendido > 0 && (
            <View style={[estilos.lucroBox, { backgroundColor: lucroPos ? 'rgba(0,184,148,0.15)' : 'rgba(214,48,49,0.15)' }]}>
              <Text style={[estilos.lucroTxt, { color: lucroPos ? '#00b894' : '#d63031' }]}>
                {lucroPos ? '▲ Lucro realizado' : '▼ Prejuízo realizado'}: R$ {Math.abs(resumo.lucroTotal).toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        <View style={estilos.filtroRow}>
          {['TODOS', 'COMPRA', 'VENDA'].map(f => (
            <TouchableOpacity key={f} style={[estilos.filtroBotao, filtro === f && estilos.filtroAtivo]} onPress={() => this.setState({ filtro: f })}>
              <Text style={[estilos.filtroTxt, filtro === f && estilos.filtroTxtAtivo]}>
                {f === 'TODOS' ? '📋 Todos' : f === 'COMPRA' ? '💰 Compras' : '💵 Vendas'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {lista.length === 0 ? (
          <View style={estilos.vazioBox}>
            <Text style={estilos.vazioEmoji}>📭</Text>
            <Text style={estilos.vazioTitulo}>Nenhuma transação</Text>
            <Text style={estilos.vazioSub}>{filtro === 'TODOS' ? 'Você ainda não realizou nenhuma operação.' : `Você não tem nenhuma ${filtro.toLowerCase()} registrada.`}</Text>
          </View>
        ) : (
          <FlatList
            data={lista}
            keyExtractor={item => item.uid}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20, paddingTop: 4 }}
            renderItem={({ item }) => {
              const isCompra = item.tipo === 'COMPRA';
              const valor = isCompra ? item.totalGasto : item.totalRecebido;
              const lucroPerda = !isCompra && item.lucroPerda != null ? item.lucroPerda : null;
              const lucroPos = lucroPerda >= 0;
              return (
                <View style={estilos.card}>
                  <View style={[estilos.tipoFaixa, { backgroundColor: isCompra ? '#008b8b' : '#d63031' }]}>
                    <Text style={estilos.tipoTxt}>{isCompra ? '💰 COMPRA' : '💵 VENDA'}</Text>
                  </View>
                  <View style={estilos.cardBody}>
                    <View style={estilos.cardTopo}>
                      <View style={[estilos.avatar, { backgroundColor: '#fff' }]}>
                        <Image source={{ uri: LOGOS[item.ticker] }} style={estilos.logoImg} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={estilos.ticker}>{item.ticker}</Text>
                        <Text style={estilos.nomeEmpresa}>{item.nomeEmpresa}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[estilos.valorTotal, { color: isCompra ? '#008b8b' : '#d63031' }]}>
                          {isCompra ? '-' : '+'} R$ {valor?.toFixed(2)}
                        </Text>
                        {lucroPerda != null && (
                          <Text style={[estilos.lucroPerdaTxt, { color: lucroPos ? '#00b894' : '#d63031' }]}>
                            {lucroPos ? '▲' : '▼'} R$ {Math.abs(lucroPerda).toFixed(2)}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={estilos.cardRodape}>
                      <Text style={estilos.detalhe}>{item.quantidade} cotas · R$ {item.precoUnitario?.toFixed(2)} cada</Text>
                      <Text style={estilos.data}>{this.formatarData(item.data)}</Text>
                    </View>
                    <TouchableOpacity style={estilos.botaoExcluir} onPress={() => this.excluirTransacao(item)}>
                      <Text style={estilos.txtExcluir}>🗑️ Excluir registro</Text>
                    </TouchableOpacity>
                  </View>
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
  header: { backgroundColor: '#008b8b', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 10 },
  headerTitulo: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  resumoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  resumoItem: { flex: 1, alignItems: 'center' },
  resumoLabel: { color: '#b2dfdf', fontSize: 12 },
  resumoValor: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginTop: 4 },
  lucroBox: { borderRadius: 10, padding: 10, marginTop: 14, alignItems: 'center' },
  lucroTxt: { fontSize: 14, fontWeight: 'bold' },
  filtroRow: { flexDirection: 'row', marginHorizontal: 15, marginBottom: 8, gap: 8 },
  filtroBotao: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center', backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e0e0e0' },
  filtroAtivo: { backgroundColor: '#008b8b', borderColor: '#008b8b' },
  filtroTxt: { fontSize: 12, fontWeight: '600', color: '#888' },
  filtroTxtAtivo: { color: '#fff' },
  vazioBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  vazioEmoji: { fontSize: 60, marginBottom: 12 },
  vazioTitulo: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  vazioSub: { color: '#888', textAlign: 'center' },
  card: { backgroundColor: '#fff', marginHorizontal: 15, marginBottom: 10, borderRadius: 14, elevation: 2, overflow: 'hidden' },
  tipoFaixa: { paddingHorizontal: 14, paddingVertical: 5 },
  tipoTxt: { color: '#fff', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  cardBody: { padding: 14 },
  cardTopo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  logoImg: { width: 28, height: 28, borderRadius: 14, resizeMode: 'contain' },
  ticker: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  nomeEmpresa: { fontSize: 12, color: '#999', marginTop: 2 },
  valorTotal: { fontSize: 16, fontWeight: 'bold' },
  lucroPerdaTxt: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  cardRodape: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#f0f0f0', paddingTop: 8, marginBottom: 8 },
  detalhe: { fontSize: 12, color: '#888' },
  data: { fontSize: 11, color: '#bbb' },
  botaoExcluir: { paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: '#fff5f5', borderWidth: 1, borderColor: '#ffcccc' },
  txtExcluir: { color: '#d63031', fontSize: 12, fontWeight: '600' },
});

export default HistoricoTransacoes;