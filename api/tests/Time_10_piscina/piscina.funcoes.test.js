// Estamos em:          tests/Time_10_piscina/
// Precisamos chegar:   src/Time_10_piscina/funcoes_piscina.js
const {
  calcularVolume,
  calcularCustoAgua,
  calcularCustoEletrico,
  calcularCustoHidraulico,
  calcularManutencaoMensal,
  calcularCustoTotal,
  TABELA,
} = require('../../src/Time_10_piscina/funcoes_piscina');

// TESTES DE VOLUME
describe('calcularVolume', () => {
  test('calcula volume corretamente (5 x 3 x 1.5 = 22.5)', () => {
    expect(calcularVolume(5, 3, 1.5)).toBe(22.5);
  });
  test('lança erro se comprimento for zero', () => {
    expect(() => calcularVolume(0, 3, 1.5)).toThrow('Comprimento deve ser maior que zero');
  });
  test('lança erro se largura for negativa', () => {
    expect(() => calcularVolume(5, -1, 1.5)).toThrow('Largura deve ser maior que zero');
  });
  test('lança erro se profundidade for zero', () => {
    expect(() => calcularVolume(5, 3, 0)).toThrow('Profundidade deve ser maior que zero');
  });
});

// TESTES DE CUSTO DA ÁGUA
describe('calcularCustoAgua', () => {
  test('calcula custo da água para 22.5 m³', () => {
    expect(calcularCustoAgua(22.5)).toBe(281.25);
  });
  test('lança erro se volume for zero', () => {
    expect(() => calcularCustoAgua(0)).toThrow('Volume deve ser maior que zero');
  });
});

// TESTES DE CUSTO ELÉTRICO
describe('calcularCustoEletrico', () => {
  test('com iluminação: bomba + quadro + iluminação', () => {
    expect(calcularCustoEletrico(true)).toBe(1900);
  });
  test('sem iluminação: apenas bomba + quadro', () => {
    expect(calcularCustoEletrico(false)).toBe(1300);
  });
  test('padrão é com iluminação quando não informado', () => {
    expect(calcularCustoEletrico()).toBe(1900);
  });
});

// TESTES DE CUSTO HIDRÁULICO
describe('calcularCustoHidraulico', () => {
  test('piscina pequena (≤ 50m³): base + filtro normal', () => {
    expect(calcularCustoHidraulico(22.5)).toBe(3700);
  });
  test('piscina grande (> 50m³): base + filtro maior (×1.5)', () => {
    expect(calcularCustoHidraulico(60)).toBe(4300);
  });
  test('lança erro se volume for zero', () => {
    expect(() => calcularCustoHidraulico(0)).toThrow('Volume deve ser maior que zero');
  });
});

// TESTES DE MANUTENÇÃO MENSAL
describe('calcularManutencaoMensal', () => {
  test('retorna custo mensal correto', () => {
    expect(calcularManutencaoMensal()).toBe(473);
  });
});

// TESTES DE CUSTO TOTAL
describe('calcularCustoTotal', () => {
  test('retorna objeto com todos os campos', () => {
    const resultado = calcularCustoTotal({
      comprimento: 5, largura: 3, profundidade: 1.5, temIluminacao: true,
    });
    expect(resultado).toHaveProperty('volume_m3');
    expect(resultado).toHaveProperty('custo_agua');
    expect(resultado).toHaveProperty('custo_eletrico');
    expect(resultado).toHaveProperty('custo_hidraulico');
    expect(resultado).toHaveProperty('total_construcao');
    expect(resultado).toHaveProperty('manutencao_mensal');
  });
  test('volume calculado corretamente no total', () => {
    const resultado = calcularCustoTotal({ comprimento: 5, largura: 3, profundidade: 1.5 });
    expect(resultado.volume_m3).toBe(22.5);
  });
  test('lança erro se faltar campos obrigatórios', () => {
    expect(() => calcularCustoTotal({ comprimento: 5 }))
      .toThrow('Informe comprimento, largura e profundidade');
  });
});