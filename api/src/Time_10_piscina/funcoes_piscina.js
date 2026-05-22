// ============================================================
// TABELA DE REFERÊNCIA - constantes usadas nos cálculos
// ============================================================
const TABELA = {
  PRECO_AGUA_M3: 12.50,
  CUSTO_HIDRAULICO_BASE: 2500.00,
  CUSTO_FILTRO: 1200.00,
  CUSTO_BOMBA: 900.00,
  CUSTO_ILUMINACAO: 600.00,
  CUSTO_QUADRO_ELETRICO: 400.00,
  CUSTO_QUIMICOS_MENSAL: 120.00,
  CONSUMO_BOMBA_KWH_MES: 180,
  TARIFA_ENERGIA: 0.85,
  MOB_MENSAL: 200.00,
};

function calcularVolume(comprimento, largura, profundidade) {
  if (comprimento <= 0) throw new Error('Comprimento deve ser maior que zero');
  if (largura <= 0)     throw new Error('Largura deve ser maior que zero');
  if (profundidade <= 0) throw new Error('Profundidade deve ser maior que zero');

  const volume = comprimento * largura * profundidade;
  return parseFloat(volume.toFixed(2));
}

function calcularCustoAgua(volume) {
  if (volume <= 0) throw new Error('Volume deve ser maior que zero');
  const custo = volume * TABELA.PRECO_AGUA_M3;
  return parseFloat(custo.toFixed(2));
}

function calcularCustoEletrico(temIluminacao = true) {
  let custo = TABELA.CUSTO_BOMBA + TABELA.CUSTO_QUADRO_ELETRICO;
  if (temIluminacao) custo += TABELA.CUSTO_ILUMINACAO;
  return parseFloat(custo.toFixed(2));
}

function calcularCustoHidraulico(volume) {
  if (volume <= 0) throw new Error('Volume deve ser maior que zero');
  const custoFiltro = volume > 50 ? TABELA.CUSTO_FILTRO * 1.5 : TABELA.CUSTO_FILTRO;
  const custo = TABELA.CUSTO_HIDRAULICO_BASE + custoFiltro;
  return parseFloat(custo.toFixed(2));
}

function calcularManutencaoMensal() {
  const energiaMensal = TABELA.CONSUMO_BOMBA_KWH_MES * TABELA.TARIFA_ENERGIA;
  const total = TABELA.CUSTO_QUIMICOS_MENSAL + energiaMensal + TABELA.MOB_MENSAL;
  return parseFloat(total.toFixed(2));
}

function calcularCustoTotal(dados) {
  const { comprimento, largura, profundidade, temIluminacao = true } = dados;

  if (!comprimento || !largura || !profundidade) {
    throw new Error('Informe comprimento, largura e profundidade');
  }

  const volume          = calcularVolume(comprimento, largura, profundidade);
  const custoAgua       = calcularCustoAgua(volume);
  const custoEletrico   = calcularCustoEletrico(temIluminacao);
  const custoHidraulico = calcularCustoHidraulico(volume);
  const manutencaoMes   = calcularManutencaoMensal();
  const totalConstrucao = custoAgua + custoEletrico + custoHidraulico;

  return {
    volume_m3:         volume,
    custo_agua:        custoAgua,
    custo_eletrico:    custoEletrico,
    custo_hidraulico:  custoHidraulico,
    total_construcao:  parseFloat(totalConstrucao.toFixed(2)),
    manutencao_mensal: manutencaoMes,
  };
}

module.exports = {
  TABELA,
  calcularVolume,
  calcularCustoAgua,
  calcularCustoEletrico,
  calcularCustoHidraulico,
  calcularManutencaoMensal,
  calcularCustoTotal,
};