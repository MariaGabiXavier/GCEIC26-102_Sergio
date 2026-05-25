const TABELAS_2026 = {
  referencia: '2026',
  inss: [
    { ate: 1621.0, aliquota: 0.075 },
    { ate: 2793.88, aliquota: 0.09 },
    { ate: 4190.83, aliquota: 0.12 },
    { ate: 8475.55, aliquota: 0.14 },
  ],
  irrf: [
    { ate: 2428.8, aliquota: 0, deducao: 0 },
    { ate: 2826.65, aliquota: 0.075, deducao: 182.16 },
    { ate: 3751.05, aliquota: 0.15, deducao: 394.16 },
    { ate: 4664.68, aliquota: 0.225, deducao: 675.49 },
    { ate: Infinity, aliquota: 0.275, deducao: 908.73 },
  ],
  deducaoDependenteIrrf: 189.59,
  descontoSimplificadoIrrf: 607.2,
  fgts: 0.08,
  inssPatronal: 0.2,
  rat: 0.02,
  terceiros: 0.058,
};

const DEFAULTS = {
  dependentes: 0,
  valeTransporte: 0,
  valeRefeicao: 0,
  alimentacao: 0,
  planoSaude: 0,
  gympass: 0,
  outrosBeneficios: 0,
  outrosDescontos: 0,
  descontoValeTransporte: true,
  descontoBeneficiosFuncionario: 0,
  receitaGerada: 0,
  encargosCustomizados: null,
};

function arredondar(valor) {
  return Number((valor || 0).toFixed(2));
}

function numeroPositivo(valor, nome, obrigatorio = false) {
  if (valor === undefined || valor === null || valor === '') {
    if (obrigatorio) throw new Error(`${nome} deve ser informado`);
    return 0;
  }
  const numero = Number(valor);
  if (!Number.isFinite(numero)) throw new Error(`${nome} deve ser um numero valido`);
  if (numero < 0) throw new Error(`${nome} nao pode ser negativo`);
  return numero;
}

function normalizarDados(dados = {}) {
  if (!dados || typeof dados !== 'object') throw new Error('Dados invalidos');
  const entrada = { ...DEFAULTS, ...dados };

  return {
    salarioBruto: numeroPositivo(entrada.salarioBruto, 'Salario bruto', true),
    dependentes: Math.floor(numeroPositivo(entrada.dependentes, 'Dependentes')),
    valeTransporte: numeroPositivo(entrada.valeTransporte, 'Vale-transporte'),
    valeRefeicao: numeroPositivo(entrada.valeRefeicao, 'Vale-refeicao'),
    alimentacao: numeroPositivo(entrada.alimentacao, 'Alimentacao'),
    planoSaude: numeroPositivo(entrada.planoSaude, 'Plano de saude'),
    gympass: numeroPositivo(entrada.gympass, 'Gympass'),
    outrosBeneficios: numeroPositivo(entrada.outrosBeneficios, 'Outros beneficios'),
    outrosDescontos: numeroPositivo(entrada.outrosDescontos, 'Outros descontos'),
    descontoValeTransporte: entrada.descontoValeTransporte !== false,
    descontoBeneficiosFuncionario: numeroPositivo(entrada.descontoBeneficiosFuncionario, 'Desconto de beneficios'),
    receitaGerada: numeroPositivo(entrada.receitaGerada, 'Receita gerada'),
    encargosCustomizados: entrada.encargosCustomizados,
  };
}

function calcularProgressivo(valor, faixas) {
  let restante = Math.max(0, valor);
  let anterior = 0;
  let total = 0;
  const detalhamento = [];

  for (const faixa of faixas) {
    const limite = faixa.ate;
    const tamanhoFaixa = Math.max(0, limite - anterior);
    const baseFaixa = Math.min(restante, tamanhoFaixa);

    if (baseFaixa > 0) {
      const valorFaixa = baseFaixa * faixa.aliquota;
      total += valorFaixa;
      detalhamento.push({
        base: arredondar(baseFaixa),
        aliquota: faixa.aliquota,
        valor: arredondar(valorFaixa),
      });
    }

    restante -= baseFaixa;
    anterior = limite;
    if (restante <= 0) break;
  }

  return { total: arredondar(total), detalhamento };
}

function calcularINSS(salarioBruto) {
  const teto = TABELAS_2026.inss[TABELAS_2026.inss.length - 1].ate;
  return calcularProgressivo(Math.min(salarioBruto, teto), TABELAS_2026.inss);
}

function calcularIRRF(salarioBruto, inss, dependentes = 0) {
  const deducaoDependentes = dependentes * TABELAS_2026.deducaoDependenteIrrf;
  const baseLegal = Math.max(0, salarioBruto - inss - deducaoDependentes);
  const baseSimplificada = Math.max(0, salarioBruto - TABELAS_2026.descontoSimplificadoIrrf);
  const baseCalculo = Math.min(baseLegal, baseSimplificada);
  const faixa = TABELAS_2026.irrf.find((item) => baseCalculo <= item.ate);
  const imposto = Math.max(0, baseCalculo * faixa.aliquota - faixa.deducao);

  return {
    valor: arredondar(imposto),
    baseCalculo: arredondar(baseCalculo),
    deducaoDependentes: arredondar(deducaoDependentes),
    aliquota: faixa.aliquota,
    deducao: faixa.deducao,
    metodo: baseSimplificada < baseLegal ? 'simplificado' : 'deducoes legais',
  };
}

function calcularDescontoValeTransporte(salarioBruto, valeTransporte, descontar = true) {
  if (!descontar || valeTransporte <= 0) return 0;
  return arredondar(Math.min(salarioBruto * 0.06, valeTransporte));
}

function calcularSalarioLiquido(dados) {
  const entrada = normalizarDados(dados);
  if (entrada.salarioBruto <= 0) throw new Error('Salario bruto deve ser maior que zero');

  const inss = calcularINSS(entrada.salarioBruto);
  const irrf = calcularIRRF(entrada.salarioBruto, inss.total, entrada.dependentes);
  const descontoVT = calcularDescontoValeTransporte(
    entrada.salarioBruto,
    entrada.valeTransporte,
    entrada.descontoValeTransporte,
  );
  const totalDescontos =
    inss.total +
    irrf.valor +
    descontoVT +
    entrada.descontoBeneficiosFuncionario +
    entrada.outrosDescontos;

  return {
    salarioBruto: arredondar(entrada.salarioBruto),
    descontos: {
      inss: inss.total,
      irrf: irrf.valor,
      valeTransporte: descontoVT,
      beneficios: arredondar(entrada.descontoBeneficiosFuncionario),
      outros: arredondar(entrada.outrosDescontos),
      total: arredondar(totalDescontos),
    },
    detalhes: {
      inssFaixas: inss.detalhamento,
      irrf,
    },
    salarioLiquido: arredondar(entrada.salarioBruto - totalDescontos),
  };
}

function calcularCustoEmpresa(dados) {
  const entrada = normalizarDados(dados);
  if (entrada.salarioBruto <= 0) throw new Error('Salario bruto deve ser maior que zero');

  const percentuais = {
    inssPatronal: TABELAS_2026.inssPatronal,
    rat: TABELAS_2026.rat,
    terceiros: TABELAS_2026.terceiros,
    fgts: TABELAS_2026.fgts,
    ...(entrada.encargosCustomizados || {}),
  };

  const beneficios =
    entrada.valeTransporte +
    entrada.valeRefeicao +
    entrada.alimentacao +
    entrada.planoSaude +
    entrada.gympass +
    entrada.outrosBeneficios;
  const provisaoDecimoTerceiro = entrada.salarioBruto / 12;
  const provisaoFerias = (entrada.salarioBruto / 12) * (4 / 3);
  const encargos = {
    inssPatronal: entrada.salarioBruto * percentuais.inssPatronal,
    rat: entrada.salarioBruto * percentuais.rat,
    terceiros: entrada.salarioBruto * percentuais.terceiros,
    fgts: entrada.salarioBruto * percentuais.fgts,
  };
  const totalEncargos = Object.values(encargos).reduce((acc, valor) => acc + valor, 0);
  const custoMensal =
    entrada.salarioBruto + totalEncargos + beneficios + provisaoDecimoTerceiro + provisaoFerias;

  return {
    salarioBruto: arredondar(entrada.salarioBruto),
    encargos: {
      inssPatronal: arredondar(encargos.inssPatronal),
      rat: arredondar(encargos.rat),
      terceiros: arredondar(encargos.terceiros),
      fgts: arredondar(encargos.fgts),
      total: arredondar(totalEncargos),
    },
    provisoes: {
      decimoTerceiro: arredondar(provisaoDecimoTerceiro),
      feriasComUmTerco: arredondar(provisaoFerias),
      total: arredondar(provisaoDecimoTerceiro + provisaoFerias),
    },
    beneficios: {
      valeTransporte: arredondar(entrada.valeTransporte),
      valeRefeicao: arredondar(entrada.valeRefeicao),
      alimentacao: arredondar(entrada.alimentacao),
      planoSaude: arredondar(entrada.planoSaude),
      gympass: arredondar(entrada.gympass),
      outros: arredondar(entrada.outrosBeneficios),
      total: arredondar(beneficios),
    },
    custoMensal: arredondar(custoMensal),
    custoAnual: arredondar(custoMensal * 12),
    multiplicadorSalario: arredondar(custoMensal / entrada.salarioBruto),
  };
}

function calcularResultadoContratacao(dados) {
  const entrada = normalizarDados(dados);
  const salarioLiquido = calcularSalarioLiquido(entrada);
  const custoEmpresa = calcularCustoEmpresa(entrada);
  const resultadoMensal = entrada.receitaGerada - custoEmpresa.custoMensal;
  const margem = entrada.receitaGerada > 0 ? resultadoMensal / entrada.receitaGerada : 0;

  return {
    salarioLiquido,
    custoEmpresa,
    receitaGerada: arredondar(entrada.receitaGerada),
    resultado: {
      mensal: arredondar(resultadoMensal),
      anual: arredondar(resultadoMensal * 12),
      margem: arredondar(margem * 100),
      status: resultadoMensal >= 0 ? 'lucro' : 'prejuizo',
      pontoEquilibrio: custoEmpresa.custoMensal,
    },
  };
}

function listarTabelas() {
  return TABELAS_2026;
}

module.exports = {
  TABELAS_2026,
  arredondar,
  calcularINSS,
  calcularIRRF,
  calcularSalarioLiquido,
  calcularCustoEmpresa,
  calcularResultadoContratacao,
  listarTabelas,
};
