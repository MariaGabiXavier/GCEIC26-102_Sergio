// ============================================================
// Markup — Testes Unitários (Jest)
// ============================================================

const { calcularMKM, calcularPrecoVenda, calcularDesconto } = require('../../src/markup/markup.funcoes');

describe('calcularMKM', () => {
  test('deve calcular MKM com valores válidos', () => {
    expect(calcularMKM(10, 15, 20)).toBeCloseTo(1.81818, 4);
    expect(calcularMKM(5, 10, 15)).toBeCloseTo(1.42857, 4);
    expect(calcularMKM(20, 20, 20)).toBe(2.5);
  });

  test('deve lançar erro quando dv for menor ou igual a zero', () => {
    expect(() => calcularMKM(0, 10, 15)).toThrow('Despesas variáveis com valor errado');
    expect(() => calcularMKM(-5, 10, 15)).toThrow('Despesas variáveis com valor errado');
  });

  test('deve lançar erro quando df for menor ou igual a zero', () => {
    expect(() => calcularMKM(10, 0, 15)).toThrow('Despesas fixas com valor errado');
    expect(() => calcularMKM(10, -10, 15)).toThrow('Despesas fixas com valor errado');
  });

  test('deve lançar erro quando ml for menor ou igual a zero', () => {
    expect(() => calcularMKM(10, 10, 0)).toThrow('Margem de lucro com valor errado');
    expect(() => calcularMKM(10, 10, -20)).toThrow('Margem de lucro com valor errado');
  });

  test('deve retornar valor numérico', () => {
    const resultado = calcularMKM(10, 15, 20);
    expect(typeof resultado).toBe('number');
    expect(isNaN(resultado)).toBe(false);
  });
});

describe('calcularPrecoVenda', () => {
  test('deve calcular preço de venda com valores válidos', () => {
    expect(calcularPrecoVenda({ preco: 100, dv: 10, df: 15, ml: 20 })).toBe('181.82');
    expect(calcularPrecoVenda({ preco: 200, dv: 5, df: 10, ml: 15 })).toBe('285.71');
  });

  test('deve lançar erro quando preco for menor ou igual a zero', () => {
    expect(() => calcularPrecoVenda({ preco: 0, dv: 10, df: 15, ml: 20 })).toThrow('Custo com valor errado');
    expect(() => calcularPrecoVenda({ preco: -100, dv: 10, df: 15, ml: 20 })).toThrow('Custo com valor errado');
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
    expect(() => calcularPrecoVenda({})).toThrow('Custo com valor errado');
    expect(() => calcularPrecoVenda({ preco: 100 })).toThrow('Despesas variáveis com valor errado');
  });

  test('deve retornar string formatada com 2 casas decimais', () => {
    const resultado = calcularPrecoVenda({ preco: 100, dv: 10, df: 15, ml: 20 });
    expect(typeof resultado).toBe('string');
    expect(resultado.split('.')[1]).toHaveLength(2);
  });
});

describe('calcularDesconto', () => {
  test('deve calcular preço com desconto com valores válidos', () => {
    expect(calcularDesconto({ preco: 100, desconto: 10 })).toBe('90.00');
    expect(calcularDesconto({ preco: 200, desconto: 25 })).toBe('150.00');
    expect(calcularDesconto({ preco: 50, desconto: 0 })).toBe('50.00');
    expect(calcularDesconto({ preco: 80, desconto: 100 })).toBe('0.00');
  });

  test('deve lançar erro quando preco for menor ou igual a zero', () => {
    expect(() => calcularDesconto({ preco: 0, desconto: 10 })).toThrow('Preço com valor errado');
    expect(() => calcularDesconto({ preco: -50, desconto: 10 })).toThrow('Preço com valor errado');
  });

  test('deve lançar erro quando desconto for menor que zero', () => {
    expect(() => calcularDesconto({ preco: 100, desconto: -1 })).toThrow('Desconto com valor errado');
  });

  test('deve lançar erro quando desconto for maior que 100', () => {
    expect(() => calcularDesconto({ preco: 100, desconto: 101 })).toThrow('Desconto com valor errado');
  });

  test('deve retornar string formatada com 2 casas decimais', () => {
    const resultado = calcularDesconto({ preco: 100, desconto: 10 });
    expect(typeof resultado).toBe('string');
    expect(resultado.split('.')[1]).toHaveLength(2);
  });
});