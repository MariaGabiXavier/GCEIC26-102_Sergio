
function calcularMKD(dv, df, ml) {
  /*2. Calcule o Markup DivisorA fórmula para chegar ao Markup Divisor (em decimal) é:
            MKD= 100 - (DV + DF + ML)/100
            Onde:
            DV = percentual de despesas variáveis
            DF = percentual de despesas fixas
            ML = percentual de margem de lucro desejada
  */
	
  if (dv <= 0) throw new Error('Despesas variáveis com valor errado');
  if (df <=0) throw new Error('Despesas fixas com valor errado');
  if (ml <=0) throw new Error('Margem de lucro com valor errado');
  let resultado = 0;
  resultado = 100 - (dv + df + ml) / 100;
  return resultado.toFixed(2);

}

function calcularPrecoVenda(dados) {
  console.log(dados);	
  const {preco = 0, dv = 0 ,df =0, ml =0} = dados;	 
  if (preco <= 0) throw new Error('Preço com valor errado');
  if (dv <= 0) throw new Error('Despesas variáveis com valor errado');
  if (df <=0) throw new Error('Despesas fixas com valor errado');
  if (ml <=0) throw new Error('Margem de lucro com valor errado');
  let precoVenda = 0;
  precoVenda = preco / calcularMKD(dv, df, ml);
  return precoVenda.toFixed(2);

}


module.exports = {
	calcularMKD,
	calcularPrecoVenda,
};
