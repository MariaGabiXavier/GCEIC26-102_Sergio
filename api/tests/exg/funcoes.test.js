const {
  getCurrency, getAvailableCurrencies, isValidType,
  calcularIOF, calcularTaxaServico, calcularSpread, calcularConversao,
} = require('../../src/exg/exgFuncoes');

//  getCurrency 

describe('getCurrency', () => {
  test('retorna moeda para codigo valido em maiusculo', () => {
    const moeda = getCurrency('USD');
    expect(moeda).not.toBeNull();
    expect(moeda.nome).toBe('Dólar Americano');
  });

  test('retorna moeda para codigo valido em minusculo', () => {
    const moeda = getCurrency('eur');
    expect(moeda).not.toBeNull();
    expect(moeda.nome).toBe('Euro');
  });

  test('retorna null para codigo inexistente', () => {
    expect(getCurrency('XYZ')).toBeNull();
  });

  test('retorna null para string vazia', () => {
    expect(getCurrency('')).toBeNull();
  });
});

//  getAvailableCurrencies 

describe('getAvailableCurrencies', () => {
  test('retorna exatamente 5 moedas', () => {
    expect(getAvailableCurrencies()).toHaveLength(5);
  });

  test('contem USD, EUR, GBP, JPY e ARS', () => {
    const codigos = getAvailableCurrencies().map(m => m.codigo);
    expect(codigos).toEqual(expect.arrayContaining(['USD', 'EUR', 'GBP', 'JPY', 'ARS']));
  });

  test('cada moeda tem codigo, nome, cotacao_brl e spread', () => {
    getAvailableCurrencies().forEach(moeda => {
      expect(moeda).toHaveProperty('codigo');
      expect(moeda).toHaveProperty('nome');
      expect(moeda).toHaveProperty('cotacao_brl');
      expect(moeda).toHaveProperty('spread');
    });
  });

  test('valores corretos para USD', () => {
    const usd = getAvailableCurrencies().find(m => m.codigo === 'USD');
    expect(usd.cotacao_brl).toBe(5.25);
    expect(usd.spread).toBe('1.5%');
  });

  test('valores corretos para ARS', () => {
    const ars = getAvailableCurrencies().find(m => m.codigo === 'ARS');
    expect(ars.cotacao_brl).toBe(0.006);
    expect(ars.spread).toBe('5.0%');
  });

  test('spread formatado como percentual', () => {
    getAvailableCurrencies().forEach(moeda => {
      expect(moeda.spread).toMatch(/^\d+\.\d+%$/);
    });
  });
});

//  isValidType 

describe('isValidType', () => {
  test('retorna true para "comercial"', () => expect(isValidType('comercial')).toBe(true));
  test('retorna true para "turism"', () => expect(isValidType('turism')).toBe(true));
  test('retorna false para tipo inexistente', () => expect(isValidType('pessoal')).toBe(false));
  test('retorna false para string vazia', () => expect(isValidType('')).toBe(false));
});

// calcularIOF

describe('calcularIOF', () => {
  test('aliquota exata de 0.38% para comercial', () => {
    const r = calcularIOF(1000, 'comercial');
    expect(r.aliquota).toBe(0.0038);
    expect(r.valor).toBe(3.8);
  });

  test('aliquota exata de 6.38% para turism', () => {
    const r = calcularIOF(1000, 'turism');
    expect(r.aliquota).toBe(0.0638);
    expect(r.valor).toBe(63.8);
  });

  test('R$500 comercial: 500 × 0.38% = R$1.90', () => {
    expect(calcularIOF(500, 'comercial').valor).toBeCloseTo(1.9, 10);
  });

  test('R$2500 turism: 2500 × 6.38% = R$159.50', () => {
    expect(calcularIOF(2500, 'turism').valor).toBeCloseTo(159.5, 10);
  });

  test('IOF turism e ~16.8x maior que comercial', () => {
    const com = calcularIOF(1000, 'comercial');
    const tur = calcularIOF(1000, 'turism');
    expect(tur.valor / com.valor).toBeCloseTo(0.0638 / 0.0038, 5);
  });

  test('IOF e zero para valor zero', () => {
    expect(calcularIOF(0, 'comercial').valor).toBe(0);
    expect(calcularIOF(0, 'turism').valor).toBe(0);
  });

  test('lanca erro para valor negativo', () => {
    expect(() => calcularIOF(-100, 'comercial')).toThrow('Valor não pode ser negativo');
  });

  test('lanca erro para tipo invalido', () => {
    expect(() => calcularIOF(1000, 'pessoal')).toThrow('Tipo "pessoal" inválido');
  });

  test('lanca erro para tipo vazio', () => {
    expect(() => calcularIOF(1000, '')).toThrow('Tipo "" inválido');
  });
});

// calcularTaxaServico

describe('calcularTaxaServico', () => {
  test('R$1000 → R$20.00 (2%)', () => expect(calcularTaxaServico(1000)).toBe(20));
  test('R$250  → R$5.00  (2%)', () => expect(calcularTaxaServico(250)).toBe(5));
  test('R$1500 → R$30.00 (2%)', () => expect(calcularTaxaServico(1500)).toBe(30));

  test('retorna zero para valor zero', () => {
    expect(calcularTaxaServico(0)).toBe(0);
  });

  test('dobrar o valor dobra a taxa', () => {
    expect(calcularTaxaServico(2000)).toBe(calcularTaxaServico(1000) * 2);
  });

  test('lanca erro para valor negativo', () => {
    expect(() => calcularTaxaServico(-500)).toThrow('Valor não pode ser negativo');
  });
});

// calcularSpread

describe('calcularSpread', () => {
  test('R$1000 com spread USD (1.5%) → R$15.00', () => expect(calcularSpread(1000, 0.015)).toBe(15));
  test('R$1000 com spread EUR (2.0%) → R$20.00', () => expect(calcularSpread(1000, 0.020)).toBe(20));
  test('R$1000 com spread GBP (2.5%) → R$25.00', () => expect(calcularSpread(1000, 0.025)).toBe(25));
  test('R$1000 com spread JPY (3.0%) → R$30.00', () => expect(calcularSpread(1000, 0.030)).toBe(30));
  test('R$1000 com spread ARS (5.0%) → R$50.00', () => expect(calcularSpread(1000, 0.050)).toBe(50));

  test('retorna zero para valor zero', () => expect(calcularSpread(0, 0.015)).toBe(0));
  test('retorna zero para spread zero', () => expect(calcularSpread(1000, 0)).toBe(0));

  test('lanca erro para valor negativo', () => {
    expect(() => calcularSpread(-100, 0.015)).toThrow('Valor não pode ser negativo');
  });

  test('lanca erro para spread negativo', () => {
    expect(() => calcularSpread(1000, -0.015)).toThrow('Spread não pode ser negativo');
  });
});

// calcularConversao

describe('calcularConversao', () => {
  test('USD comercial R$1000: descontos corretos', () => {
    const r = calcularConversao(1000, 'USD', 'comercial');
    expect(r.descontos.iof).toBe(3.8);
    expect(r.descontos.taxa_servico).toBe(20);
    expect(r.descontos.spread).toBe(15);
    expect(r.descontos.total).toBe(38.8);
  });

  test('USD comercial R$1000: valor efetivo = R$961.20', () => {
    expect(calcularConversao(1000, 'USD', 'comercial').valor_efetivo_brl).toBe(961.2);
  });

  test('USD comercial R$1000: cotacao base=5.25, com spread~5.3288', () => {
    const r = calcularConversao(1000, 'USD', 'comercial');
    expect(r.cotacao.base).toBe(5.25);
    expect(r.cotacao.com_spread).toBeCloseTo(5.32875, 3);
  });

  test('USD comercial R$1000: valor convertido = 180.38 USD', () => {
    expect(calcularConversao(1000, 'USD', 'comercial').valor_convertido).toBe(180.38);
  });

  test('USD turism R$1000: IOF = R$63.80', () => {
    const r = calcularConversao(1000, 'USD', 'turism');
    expect(r.descontos.iof).toBe(63.8);
    expect(r.descontos.total).toBe(98.8);
  });

  test('USD turism R$1000: valor convertido = 169.1203 USD', () => {
    expect(calcularConversao(1000, 'USD', 'turism').valor_convertido).toBe(169.1203);
  });

  test('EUR comercial R$1000: descontos corretos', () => {
    const r = calcularConversao(1000, 'EUR', 'comercial');
    expect(r.descontos.spread).toBe(20);
    expect(r.descontos.total).toBe(43.8);
    expect(r.valor_efetivo_brl).toBe(956.2);
  });

  test('EUR comercial R$1000: cotacao com spread = 5.814', () => {
    expect(calcularConversao(1000, 'EUR', 'comercial').cotacao.com_spread).toBe(5.814);
  });

  test('GBP comercial R$1000: descontos corretos', () => {
    const r = calcularConversao(1000, 'GBP', 'comercial');
    expect(r.descontos.spread).toBe(25);
    expect(r.descontos.total).toBe(48.8);
    expect(r.cotacao.com_spread).toBe(6.97);
  });

  test('ARS comercial R$1000: spread alto (5%) = R$50.00', () => {
    const r = calcularConversao(1000, 'ARS', 'comercial');
    expect(r.descontos.spread).toBe(50);
    expect(r.descontos.total).toBe(73.8);
  });

  test('turism tem mais desconto que comercial para todas as moedas', () => {
    ['USD', 'EUR', 'GBP', 'JPY', 'ARS'].forEach(codigo => {
      const com = calcularConversao(1000, codigo, 'comercial');
      const tur = calcularConversao(1000, codigo, 'turism');
      expect(tur.descontos.total).toBeGreaterThan(com.descontos.total);
      expect(tur.valor_convertido).toBeLessThan(com.valor_convertido);
    });
  });

  test('aliquota de IOF correta na resposta', () => {
    expect(calcularConversao(1000, 'USD', 'comercial').descontos.iof_aliquota).toBe('0.38%');
    expect(calcularConversao(1000, 'USD', 'turism').descontos.iof_aliquota).toBe('6.38%');
  });

  test('codigo da moeda retornado em maiusculo', () => {
    expect(calcularConversao(1000, 'usd', 'comercial').moeda.codigo).toBe('USD');
  });

  test('lanca erro para moeda inexistente', () => {
    expect(() => calcularConversao(1000, 'XYZ', 'comercial')).toThrow('Moeda "XYZ" não encontrada');
  });

  test('lanca erro para valor negativo', () => {
    expect(() => calcularConversao(-100, 'USD', 'comercial')).toThrow('Valor deve ser maior que zero');
  });

  test('lanca erro para valor zero', () => {
    expect(() => calcularConversao(0, 'USD', 'comercial')).toThrow('Valor deve ser maior que zero');
  });

  test('lanca erro para tipo invalido', () => {
    expect(() => calcularConversao(1000, 'USD', 'pessoal')).toThrow('Tipo "pessoal" inválido');
  });
});
