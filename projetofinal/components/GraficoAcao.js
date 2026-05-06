import * as React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, ActivityIndicator, Image
} from 'react-native';

const { width } = Dimensions.get('window');

function gerarHistorico(precoBase, dias = 30) {
  const dados = [];
  let preco = precoBase * 0.92;
  const hoje = new Date();

  for (let i = dias; i >= 0; i--) {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() - i);
    const variacao = (Math.random() - 0.48) * 0.06;
    preco = preco * (1 + variacao);
    dados.push({
      data: data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      preco: parseFloat(preco.toFixed(2)),
    });
  }
  dados[dados.length - 1].preco = precoBase;
  return dados;
}

const PERIODOS = ['1S', '1M', '3M', '6M', '1A'];

class GraficoAcao extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      periodoSelecionado: '1M',
      carregando: true,
      historico: [],
      indiceSelecionado: null,
    };
  }

  componentDidMount() {
    this.carregarDados('1M');
  }

  getDias(periodo) {
    const mapa = { '1S': 7, '1M': 30, '3M': 90, '6M': 180, '1A': 365 };
    return mapa[periodo] || 30;
  }

  carregarDados(periodo) {
    const acao = this.props.acao;
    if (!acao) return;
    this.setState({ carregando: true, periodoSelecionado: periodo });
    setTimeout(() => {
      const historico = gerarHistorico(parseFloat(acao.preco), this.getDias(periodo));
      this.setState({ historico, carregando: false, indiceSelecionado: null });
    }, 500);
  }

  renderGrafico() {
    const { historico, indiceSelecionado } = this.state;
    if (historico.length === 0) return null;

    const chartWidth = width - 40;
    const chartHeight = 180;
    const padding = { top: 15, bottom: 20, left: 10, right: 10 };

    const precos = historico.map(h => h.preco);
    const minPreco = Math.min(...precos);
    const maxPreco = Math.max(...precos);
    const range = maxPreco - minPreco || 1;

    const pontos = historico.map((h, i) => {
      const x = padding.left + (i / (historico.length - 1)) * (chartWidth - padding.left - padding.right);
      const y = padding.top + ((maxPreco - h.preco) / range) * (chartHeight - padding.top - padding.bottom);
      return { x, y, ...h };
    });

    const primeiroPreco = historico[0].preco;
    const ultimoPreco = historico[historico.length - 1].preco;
    const positivo = ultimoPreco >= primeiroPreco;
    const corLinha = positivo ? '#00b894' : '#d63031';

    const xLabels = [0, Math.floor(historico.length / 4), Math.floor(historico.length / 2),
      Math.floor(historico.length * 3 / 4), historico.length - 1];

    const pontoSelecionado = indiceSelecionado !== null ? pontos[indiceSelecionado] : null;

    return (
      <View style={{ position: 'relative' }}>
        {pontoSelecionado && (
          <View style={[estilos.tooltip, {
            left: Math.min(Math.max(pontoSelecionado.x - 50, 0), chartWidth - 110)
          }]}>
            <Text style={estilos.tooltipData}>{pontoSelecionado.data}</Text>
            <Text style={estilos.tooltipPreco}>R$ {pontoSelecionado.preco.toFixed(2)}</Text>
          </View>
        )}

        <View style={{ width: chartWidth, height: chartHeight + 30, backgroundColor: '#fff' }}>
          {[{ valor: maxPreco, frac: 0 }, { valor: (maxPreco + minPreco) / 2, frac: 0.5 }, { valor: minPreco, frac: 1 }].map((item, i) => {
            const yPos = padding.top + item.frac * (chartHeight - padding.top - padding.bottom) - 8;
            return (
              <Text key={i} style={[estilos.labelEixo, { position: 'absolute', top: yPos, right: 2, fontSize: 9 }]}>
                {item.valor.toFixed(0)}
              </Text>
            );
          })}

          {pontos.slice(0, -1).map((p, i) => {
            const p2 = pontos[i + 1];
            const dx = p2.x - p.x;
            const dy = p2.y - p.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
              <View key={i} style={{
                position: 'absolute', left: p.x, top: p.y,
                width: length, height: 2.5, backgroundColor: corLinha,
                transformOrigin: 'left center',
                transform: [{ rotate: `${angle}deg` }],
              }} />
            );
          })}

          {pontos.map((p, i) => {
            const alturaArea = (chartHeight - padding.bottom) - p.y;
            if (alturaArea <= 0) return null;
            return (
              <View key={`area-${i}`} style={{
                position: 'absolute', left: p.x - 0.8, top: p.y,
                width: 1.6, height: alturaArea,
                backgroundColor: positivo ? 'rgba(0,184,148,0.08)' : 'rgba(214,48,49,0.08)',
              }} />
            );
          })}

          {pontoSelecionado && (
            <>
              <View style={{
                position: 'absolute', left: pontoSelecionado.x, top: padding.top,
                width: 1, height: chartHeight - padding.top - padding.bottom,
                backgroundColor: corLinha, opacity: 0.4,
              }} />
              <View style={{
                position: 'absolute', left: pontoSelecionado.x - 6, top: pontoSelecionado.y - 6,
                width: 12, height: 12, borderRadius: 6,
                backgroundColor: corLinha, borderWidth: 2, borderColor: '#fff',
              }} />
            </>
          )}

          {pontos.map((p, i) => (
            <TouchableOpacity key={`touch-${i}`}
              onPress={() => this.setState({ indiceSelecionado: i === indiceSelecionado ? null : i })}
              style={{ position: 'absolute', left: p.x - 12, top: 0, width: 24, height: chartHeight }}
            />
          ))}

          {xLabels.map((idx, i) => {
            const p = pontos[idx];
            if (!p) return null;
            return (
              <Text key={`xlabel-${i}`} style={[estilos.labelEixo, {
                position: 'absolute', top: chartHeight - 12,
                left: p.x - 20, width: 40, textAlign: 'center',
              }]}>
                {historico[idx].data}
              </Text>
            );
          })}
        </View>
      </View>
    );
  }

  render() {
    const { acao, onVoltar, onComprar } = this.props;

    if (!acao) {
      return (
        <View style={estilos.center}>
          <Text>Ação não encontrada.</Text>
        </View>
      );
    }

    const { carregando, historico, periodoSelecionado } = this.state;
    const positivo = acao.variacao?.toString().includes('+') || parseFloat(acao.variacaoNum) >= 0;
    const corVariacao = positivo ? '#00b894' : '#d63031';

    let variacaoPeriodoPct = '—';
    if (historico.length >= 2) {
      const inicio = historico[0].preco;
      const fim = historico[historico.length - 1].preco;
      const diff = fim - inicio;
      const pct = ((diff / inicio) * 100).toFixed(2);
      variacaoPeriodoPct = `${diff >= 0 ? '+' : ''}${pct}%`;
    }

    return (
      <ScrollView style={estilos.container} showsVerticalScrollIndicator={false}>
        <View style={estilos.header}>
          <TouchableOpacity style={estilos.btnVoltar} onPress={onVoltar}>
            <Text style={estilos.txtVoltar}>← Voltar</Text>
          </TouchableOpacity>

          <View style={estilos.acaoInfo}>
            <View style={estilos.avatarGrande}>
              <Image
                source={{ uri: acao.logo }}
                style={estilos.logoImg}
              />
            </View>
            <View>
              <Text style={estilos.tickerGrande}>{acao.ticker}</Text>
              <Text style={estilos.nomeEmpresa}>{acao.nome}</Text>
            </View>
          </View>

          <Text style={estilos.precoGrande}>R$ {parseFloat(acao.preco).toFixed(2)}</Text>
          <Text style={[estilos.variacaoGrande, { color: corVariacao }]}>
            {positivo ? '▲' : '▼'} {acao.variacao} hoje
          </Text>
        </View>

        <View style={estilos.indicadoresRow}>
          <View style={estilos.indicadorCard}>
            <Text style={estilos.indicadorLabel}>Variação {periodoSelecionado}</Text>
            <Text style={[estilos.indicadorValor, {
              color: variacaoPeriodoPct.includes('+') ? '#00b894' : '#d63031'
            }]}>{variacaoPeriodoPct}</Text>
          </View>
          <View style={estilos.indicadorCard}>
            <Text style={estilos.indicadorLabel}>P/L (simulado)</Text>
            <Text style={estilos.indicadorValor}>{(Math.random() * 15 + 5).toFixed(1)}x</Text>
          </View>
          <View style={estilos.indicadorCard}>
            <Text style={estilos.indicadorLabel}>Volume médio</Text>
            <Text style={estilos.indicadorValor}>{(Math.random() * 50 + 10).toFixed(0)}M</Text>
          </View>
        </View>

        <View style={estilos.graficoBox}>
          <Text style={estilos.graficoTitulo}>Histórico de Preços</Text>
          <View style={estilos.periodoRow}>
            {PERIODOS.map(p => (
              <TouchableOpacity
                key={p}
                style={[estilos.btnPeriodo, periodoSelecionado === p && estilos.btnPeriodoAtivo]}
                onPress={() => this.carregarDados(p)}
              >
                <Text style={[estilos.txtPeriodo, periodoSelecionado === p && estilos.txtPeriodoAtivo]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {carregando ? (
            <View style={estilos.loadingGrafico}>
              <ActivityIndicator size="large" color="#008b8b" />
            </View>
          ) : (
            this.renderGrafico()
          )}

          <Text style={estilos.avisoGrafico}>
            * Dados simulados. Toque nos pontos para detalhes.
          </Text>
        </View>

        <TouchableOpacity style={estilos.btnComprar} onPress={() => onComprar(acao)}>
          <Text style={estilos.txtComprar}>💰 Comprar {acao.ticker}</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    );
  }
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#008b8b', paddingTop: 50, paddingBottom: 24,
    paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 15,
  },
  btnVoltar: { marginBottom: 16 },
  txtVoltar: { color: '#b2dfdf', fontSize: 15 },
  acaoInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarGrande: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  logoImg: { width: 38, height: 38, borderRadius: 19, resizeMode: 'contain' },
  tickerGrande: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  nomeEmpresa: { color: '#b2dfdf', fontSize: 13, marginTop: 2 },
  precoGrande: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginTop: 4 },
  variacaoGrande: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  indicadoresRow: { flexDirection: 'row', paddingHorizontal: 15, gap: 8, marginBottom: 15 },
  indicadorCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', elevation: 1 },
  indicadorLabel: { fontSize: 10, color: '#999', marginBottom: 4 },
  indicadorValor: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  graficoBox: { backgroundColor: '#fff', marginHorizontal: 15, borderRadius: 14, padding: 16, elevation: 1, marginBottom: 15 },
  graficoTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  periodoRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  btnPeriodo: { flex: 1, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f0f0f0', alignItems: 'center' },
  btnPeriodoAtivo: { backgroundColor: '#008b8b' },
  txtPeriodo: { fontSize: 12, color: '#666', fontWeight: '600' },
  txtPeriodoAtivo: { color: '#fff' },
  loadingGrafico: { height: 180, justifyContent: 'center', alignItems: 'center' },
  tooltip: {
    position: 'absolute', top: -50, backgroundColor: '#333',
    borderRadius: 8, padding: 8, zIndex: 99, minWidth: 110,
  },
  tooltipData: { color: '#ccc', fontSize: 11 },
  tooltipPreco: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  labelEixo: { fontSize: 9, color: '#bbb' },
  avisoGrafico: { fontSize: 9, color: '#ccc', textAlign: 'center', marginTop: 10 },
  btnComprar: { backgroundColor: '#008b8b', marginHorizontal: 15, padding: 18, borderRadius: 14, alignItems: 'center', elevation: 3 },
  txtComprar: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});

export default GraficoAcao;