const TABELA = {
  agua_m3: 35,
  eletrica_com_iluminacao: 500,
  eletrica_sem_iluminacao: 250,
  manutencao_mensal: 300
};

function calcularVolume(comprimento, largura, profundidade) {

  comprimento = Number(comprimento);
  largura = Number(largura);
  profundidade = Number(profundidade);

  if (comprimento <= 0) {
    throw new Error('Comprimento inválido');
  }

  if (largura <= 0) {
    throw new Error('Largura inválida');
  }

  if (profundidade <= 0) {
    throw new Error('Profundidade inválida');
  }

  return comprimento * largura * profundidade;
}

function calcularCustoAgua(volume) {

  volume = Number(volume);

  if (volume <= 0) {
    throw new Error('Volume inválido');
  }

  return volume * TABELA.agua_m3;
}

function calcularCustoEletrico(temIluminacao = true) {

  return temIluminacao
    ? TABELA.eletrica_com_iluminacao
    : TABELA.eletrica_sem_iluminacao;
}

function calcularCustoHidraulico(volume) {

  volume = Number(volume);

  if (volume <= 0) {
    throw new Error('Volume inválido');
  }

  return volume * 120;
}

function calcularManutencaoMensal() {

  return TABELA.manutencao_mensal;
}

function calcularCustoTotal(dados) {

  const {
    comprimento,
    largura,
    profundidade,
    temIluminacao = true
  } = dados;

  const volume = calcularVolume(
    comprimento,
    largura,
    profundidade
  );

  const custoAgua = calcularCustoAgua(volume);

  const custoEletrico =
    calcularCustoEletrico(temIluminacao);

  const custoHidraulico =
    calcularCustoHidraulico(volume);

  const manutencao =
    calcularManutencaoMensal();

  const total =
    custoAgua +
    custoEletrico +
    custoHidraulico +
    manutencao;

  return {
    volume,
    custoAgua,
    custoEletrico,
    custoHidraulico,
    manutencao,
    total
  };
}

module.exports = {
  TABELA,
  calcularVolume,
  calcularCustoAgua,
  calcularCustoEletrico,
  calcularCustoHidraulico,
  calcularManutencaoMensal,
  calcularCustoTotal
};