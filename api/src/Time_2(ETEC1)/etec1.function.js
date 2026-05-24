// ============================================================
// Time_2 (ETEC) — Funções de Encargos trabalhistas
// ============================================================

const INSS_EMPREGADOR = 0.08;
const FGTS            = 0.08;
const INSS_TABLE = [
  { ate: 1412.00,  aliquota: 0.075 },
  { ate: 2666.68,  aliquota: 0.09  },
  { ate: 4000.03,  aliquota: 0.12  },
  { ate: 7786.02,  aliquota: 0.14  },
];

function calcularSalarioMensal(salario) {
  const inss        = calcularINSS(salario);
  const fgts        = +(salario * FGTS).toFixed(2);
  const patronal    = +(salario * INSS_EMPLOYER).toFixed(2);
  const liquido     = +(salario - inss).toFixed(2);
  const custoTotal  = +(salario + fgts + patronal).toFixed(2);

  return { salarioBruto: salario, inss, fgts, patronal, salarioLiquido: liquido, custoTotalEmpregador: custoTotal };
}

function calcularFerias(salario) {
  const ferias          = +salario.toFixed(2);
  const tercoConstitucional = +(salario / 3).toFixed(2);
  const inssFerias      = calcularINSS(ferias + tercoConstitucional);
  const fgtsFerias      = +(salario * FGTS).toFixed(2);
  const liquido         = +(ferias + tercoConstitucional - inssFerias).toFixed(2);

  return { salario, ferias, tercoConstitucional, inssFerias, fgtsFerias, totalBruto: +(ferias + tercoConstitucional).toFixed(2), totalLiquido: liquido };
}

function calcularRescisao(salario, mesesTrabalhados, motivoDemissao) {
  // motivoDemissao: 'sem_justa_causa' | 'justa_causa' | 'pedido_demissao'
  const semJustaCausa = motivoDemissao === 'sem_justa_causa';
  const pedidoDemissao = motivoDemissao === 'pedido_demissao';

  const diasTrabalhados = mesesTrabalhados * 30;
  const avisoPrevio     = semJustaCausa ? salario : 0;

  // Saldo de salário (dias trabalhados no mês vigente = 15 dias como exemplo)
  const saldoSalario    = +(salario / 30 * 15).toFixed(2);

  // 13º proporcional
  const decimoTerceiro  = +(salario * (mesesTrabalhados % 12) / 12).toFixed(2);

  // Férias proporcionais + 1/3
  const feriasProp      = +(salario * (mesesTrabalhados % 12) / 12).toFixed(2);
  const tercoFerias     = +(feriasProp / 3).toFixed(2);

  // Multa FGTS (40% sem justa causa, 20% pedido demissão)
  const saldoFGTS       = +(salario * FGTS * mesesTrabalhados).toFixed(2);
  const multaFGTS       = semJustaCausa
    ? +(saldoFGTS * 0.40).toFixed(2)
    : pedidoDemissao ? +(saldoFGTS * 0.20).toFixed(2) : 0;

  const totalBruto = +(saldoSalario + decimoTerceiro + feriasProp + tercoFerias + avisoPrevio + multaFGTS).toFixed(2);

  return {
    motivoDemissao,
    mesesTrabalhados,
    saldoSalario,
    decimoTerceiro,
    feriasProporcional: feriasProp,
    tercoConstitucional: tercoFerias,
    avisoPrevio,
    saldoFGTS,
    multaFGTS,
    totalRescisao: totalBruto,
  };
}

function calcularDecimoTerceiro(salario, mesesTrabalhados) {
  const meses   = Math.min(mesesTrabalhados, 12);
  const bruto   = +(salario * meses / 12).toFixed(2);
  const inss    = calcularINSS(bruto);
  const liquido = +(bruto - inss).toFixed(2);
  return { salario, mesesTrabalhados: meses, decimoBruto: bruto, inss, decimoLiquido: liquido };
}

function calcularINSS(salario) {
  for (const faixa of INSS_TABLE) {
    if (salario <= faixa.ate) return +(salario * faixa.aliquota).toFixed(2);
  }
  return +(7786.02 * 0.14).toFixed(2); // teto
}

// corrigindo typo interno
const INSS_EMPLOYER = INSS_EMPREGADOR;

module.exports = { calcularSalarioMensal, calcularFerias, calcularRescisao, calcularDecimoTerceiro, calcularINSS };
