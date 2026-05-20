const { calcularMKD, calcularPrecoVenda } = require('../src/funcoes');

describe('calcularMKD', () => {
  test('deve calcular MKD com valores válidos', () => {
    expect(calcularMKD(10, 15, 20)).toBe('99.55');
    expect(calcularMKD(5, 10, 15)).toBe('99.70');
    expect(calcularMKD(20, 20, 20)).toBe('99.40');
  });

  test('deve lançar erro quando dv for menor ou igual a zero', () => {
    expect(() => calcularMKD(0, 10, 15)).toThrow('Despesas variáveis com valor errado');
    expect(() => calcularMKD(-5, 10, 15)).toThrow('Despesas variáveis com valor errado');
  });

  test('deve lançar erro quando df for menor ou igual a zero', () => {
    expect(() => calcularMKD(10, 0, 15)).toThrow('Despesas fixas com valor errado');
    expect(() => calcularMKD(10, -10, 15)).toThrow('Despesas fixas com valor errado');
  });

  test('deve lançar erro quando ml for menor ou igual a zero', () => {
    expect(() => calcularMKD(10, 10, 0)).toThrow('Margem de lucro com valor errado');
    expect(() => calcularMKD(10, 10, -20)).toThrow('Margem de lucro com valor errado');
  });

  test('deve retornar string formatada com 2 casas decimais', () => {
    const resultado = calcularMKD(10, 15, 20);
    expect(typeof resultado).toBe('string');
    expect(resultado.split('.')[1]).toHaveLength(2);
  });
});

describe('calcularPrecoVenda', () => {
  test('deve calcular preço de venda com valores válidos', () => {
    expect(calcularPrecoVenda({ preco: 100, dv: 10, df: 15, ml: 20 })).toBe('1.00');
    expect(calcularPrecoVenda({ preco: 200, dv: 5, df: 10, ml: 15 })).toBe('2.01');
  });

  test('deve lançar erro quando preco for menor ou igual a zero', () => {
    expect(() => calcularPrecoVenda({ preco: 0, dv: 10, df: 15, ml: 20 })).toThrow('Preço com valor errado');
    expect(() => calcularPrecoVenda({ preco: -100, dv: 10, df: 15, ml: 20 })).toThrow('Preço com valor errado');
  });

  test('deve lançar erro quando dv for menor ou igual a zero', () => {
    expect(() => calcularPrecoVenda({ preco: 100, dv: 0, df: 15, ml: 20 })).toThrow('Despesas variáveis com valor errado');
    expect(() => calcularPrecoVenda({ preco: 100, dv: -10, df: 15, ml: 20 })).toThrow('Despesas variáveis com valor errado');
  });

  test('deve lançar erro quando df for menor ou igual a zero', () => {
    expect(() => calcularPrecoVenda({ preco: 100, dv: 10, df: 0, ml: 20 })).toThrow('Despesas fixas com valor errado');
    expect(() => calcularPrecoVenda({ preco: 100, dv: 10, df: -15, ml: 20 })).toThrow('Despesas fixas com valor errado');
  });

  test('deve lançar erro quando ml for menor ou igual a zero', () => {
    expect(() => calcularPrecoVenda({ preco: 100, dv: 10, df: 15, ml: 0 })).toThrow('Margem de lucro com valor errado');
    expect(() => calcularPrecoVenda({ preco: 100, dv: 10, df: 15, ml: -20 })).toThrow('Margem de lucro com valor errado');
  });

  test('deve usar valores padrão quando parâmetros não fornecidos', () => {
    expect(() => calcularPrecoVenda({})).toThrow('Preço com valor errado');
    expect(() => calcularPrecoVenda({ preco: 100 })).toThrow('Despesas variáveis com valor errado');
  });

  test('deve retornar string formatada com 2 casas decimais', () => {
    const resultado = calcularPrecoVenda({ preco: 100, dv: 10, df: 15, ml: 20 });
    expect(typeof resultado).toBe('string');
    expect(resultado.split('.')[1]).toHaveLength(2);
  });
});