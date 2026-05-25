const {
  calcularINSS,
  calcularIRRF,
  calcularSalarioLiquido,
  calcularCustoEmpresa,
  calcularResultadoContratacao,
  listarTabelas,
} = require('../../src/clt/cltFuncoes');

describe('Calculos CLT - funcoes', () => {
  test('calcula INSS progressivo para salario de R$ 3000', () => {
    const resultado = calcularINSS(3000);
    expect(resultado.total).toBe(251.87);
    expect(resultado.detalhamento.length).toBe(3);
  });

  test('calcula IRRF com base apos INSS', () => {
    const irrf = calcularIRRF(5000, 518.82, 0);
    expect(irrf.valor).toBeGreaterThan(0);
    expect(irrf.baseCalculo).toBeGreaterThan(0);
    expect(irrf).toHaveProperty('metodo');
  });

  test('calcula salario liquido com descontos de funcionario', () => {
    const resultado = calcularSalarioLiquido({
      salarioBruto: 4000,
      valeTransporte: 300,
      descontoBeneficiosFuncionario: 50,
      outrosDescontos: 25,
    });

    expect(resultado.salarioBruto).toBe(4000);
    expect(resultado.descontos.inss).toBeGreaterThan(0);
    expect(resultado.descontos.valeTransporte).toBe(240);
    expect(resultado.salarioLiquido).toBeLessThan(4000);
  });

  test('calcula custo mensal e anual para empresa', () => {
    const resultado = calcularCustoEmpresa({
      salarioBruto: 3000,
      valeRefeicao: 500,
      planoSaude: 250,
      gympass: 80,
    });

    expect(resultado.encargos.fgts).toBe(240);
    expect(resultado.beneficios.total).toBe(830);
    expect(resultado.custoMensal).toBeGreaterThan(3000);
    expect(resultado.custoAnual).toBeCloseTo(resultado.custoMensal * 12, 1);
  });

  test('identifica lucro na contratacao', () => {
    const resultado = calcularResultadoContratacao({
      salarioBruto: 3000,
      valeRefeicao: 500,
      receitaGerada: 8000,
    });

    expect(resultado.resultado.status).toBe('lucro');
    expect(resultado.resultado.mensal).toBeGreaterThan(0);
  });

  test('identifica prejuizo na contratacao', () => {
    const resultado = calcularResultadoContratacao({
      salarioBruto: 6000,
      valeRefeicao: 800,
      planoSaude: 400,
      receitaGerada: 5000,
    });

    expect(resultado.resultado.status).toBe('prejuizo');
    expect(resultado.resultado.mensal).toBeLessThan(0);
  });

  test('lanca erro para salario bruto invalido', () => {
    expect(() => calcularSalarioLiquido({ salarioBruto: 0 })).toThrow('Salario bruto deve ser maior que zero');
    expect(() => calcularCustoEmpresa({ salarioBruto: -1 })).toThrow('Salario bruto nao pode ser negativo');
  });

  test('lista tabelas de referencia usadas nos calculos', () => {
    const tabelas = listarTabelas();
    expect(tabelas.referencia).toBe('2026');
    expect(tabelas.inss.length).toBeGreaterThan(0);
    expect(tabelas.irrf.length).toBeGreaterThan(0);
  });
});
