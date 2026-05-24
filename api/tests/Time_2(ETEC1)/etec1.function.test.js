// ============================================================
// Time_2 (ETEC) — Testes Unitários (Jest)
// ============================================================

const { calcularSalarioMensal, calcularFerias, calcularRescisao, calcularDecimoTerceiro, calcularINSS } = require('../../src/Time_2(ETEC1)/etec1.function');

describe('calcularINSS', () => {
  test('alíquota 7,5% para salário até R$1.412', () => {
    expect(calcularINSS(1412)).toBe(105.90);
  });
  test('alíquota 9% para salário R$2.000', () => {
    expect(calcularINSS(2000)).toBe(180.00);
  });
  test('alíquota 12% para salário R$3.500', () => {
    expect(calcularINSS(3500)).toBe(420.00);
  });
});

describe('calcularSalarioMensal', () => {
  test('retorna todos os campos esperados', () => {
    const result = calcularSalarioMensal(1412);
    expect(result).toHaveProperty('salarioBruto');
    expect(result).toHaveProperty('inss');
    expect(result).toHaveProperty('fgts');
    expect(result).toHaveProperty('patronal');
    expect(result).toHaveProperty('salarioLiquido');
    expect(result).toHaveProperty('custoTotalEmpregador');
  });
  test('FGTS é 8% do salário bruto', () => {
    const result = calcularSalarioMensal(2000);
    expect(result.fgts).toBe(160.00);
  });
  test('salário líquido = bruto - INSS', () => {
    const result = calcularSalarioMensal(2000);
    expect(result.salarioLiquido).toBe(+(2000 - result.inss).toFixed(2));
  });
});

describe('calcularFerias', () => {
  test('retorna campos de férias', () => {
    const result = calcularFerias(2000);
    expect(result).toHaveProperty('ferias');
    expect(result).toHaveProperty('tercoConstitucional');
    expect(result).toHaveProperty('totalBruto');
    expect(result).toHaveProperty('totalLiquido');
  });
  test('1/3 constitucional é salário/3', () => {
    const result = calcularFerias(3000);
    expect(result.tercoConstitucional).toBe(1000);
  });
});

describe('calcularRescisao', () => {
  test('sem justa causa inclui aviso prévio e multa 40%', () => {
    const result = calcularRescisao(2000, 12, 'sem_justa_causa');
    expect(result.avisoPrevio).toBe(2000);
    expect(result.multaFGTS).toBeGreaterThan(0);
  });
  test('justa causa não tem aviso prévio nem multa', () => {
    const result = calcularRescisao(2000, 12, 'justa_causa');
    expect(result.avisoPrevio).toBe(0);
    expect(result.multaFGTS).toBe(0);
  });
  test('pedido de demissão tem multa de 20%', () => {
    const resultPedido = calcularRescisao(2000, 12, 'pedido_demissao');
    const resultSemJusta = calcularRescisao(2000, 12, 'sem_justa_causa');
    expect(resultPedido.multaFGTS).toBe(+(resultSemJusta.multaFGTS / 2).toFixed(2));
  });
});

describe('calcularDecimoTerceiro', () => {
  test('12 meses = salário cheio bruto', () => {
    const result = calcularDecimoTerceiro(2000, 12);
    expect(result.decimoBruto).toBe(2000);
  });
  test('6 meses = metade do salário bruto', () => {
    const result = calcularDecimoTerceiro(2000, 6);
    expect(result.decimoBruto).toBe(1000);
  });
  test('décimo líquido = bruto - INSS', () => {
    const result = calcularDecimoTerceiro(2000, 12);
    expect(result.decimoLiquido).toBe(+(result.decimoBruto - result.inss).toFixed(2));
  });
});
