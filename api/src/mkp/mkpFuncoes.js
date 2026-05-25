function calcularMarkup(dados) {
  const { custoProduto, despesasVariaveis, despesasFixas, margemLucro } = dados;

  const cp = parseFloat(custoProduto);
  const dv = parseFloat(despesasVariaveis) || 0;
  const df = parseFloat(despesasFixas) || 0;
  const ml = Math.min(parseFloat(margemLucro) || 0, 20);

  if (Number.isNaN(cp) || Number.isNaN(parseFloat(despesasVariaveis)) || Number.isNaN(parseFloat(despesasFixas)) || Number.isNaN(parseFloat(margemLucro))) {
    throw new Error('Informe custoProduto, despesasVariaveis, despesasFixas e margemLucro como números.');
  }

  const somaTaxas = dv + df + ml;

  if (somaTaxas >= 100) {
    throw new Error('A soma das despesas e margem de lucro não pode atingir ou ultrapassar 100%.');
  }

  const mk = 100 / (100 - somaTaxas);
  const pv = cp * mk;

  return {
    multiplicador: mk.toFixed(2),
    precoVenda: pv.toFixed(2)
  };
}

function calcularCustos(dados) {
  const { custosDiretos, custosIndiretos } = dados;

  const custosDiretosNumero = parseFloat(custosDiretos);
  const custosIndiretosNumero = parseFloat(custosIndiretos);

  if (Number.isNaN(custosDiretosNumero) || Number.isNaN(custosIndiretosNumero)) {
    throw new Error('Informe custosDiretos e custosIndiretos como números.');
  }

  const custoTotal = custosDiretosNumero + custosIndiretosNumero;

  return {
    custosDiretos: custosDiretosNumero,
    custosIndiretos: custosIndiretosNumero,
    custoTotal: Number(custoTotal.toFixed(2))
  };
}

function calcularPrecoVenda(dados) {
  const { custoTotal, indiceMarkup, multiplicador } = dados;

  const custoTotalNumero = parseFloat(custoTotal);
  const indiceMarkupNumero = parseFloat(indiceMarkup ?? multiplicador);

  if (Number.isNaN(custoTotalNumero) || Number.isNaN(indiceMarkupNumero)) {
    throw new Error('Informe custoTotal e indiceMarkup como números.');
  }

  const precoVenda = custoTotalNumero * indiceMarkupNumero;

  return {
    custoTotal: Number(custoTotalNumero.toFixed(2)),
    indiceMarkup: Number(indiceMarkupNumero.toFixed(2)),
    precoVenda: precoVenda.toFixed(2)
  };
}

module.exports = {
  calcularMarkup,
  calcularCustos,
  calcularPrecoVenda
};
