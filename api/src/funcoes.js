

const TABELA = {
	BASE_CALC: {
		faixas: [
		 { ate: 15, alicota: 0.01 },
		 { ate: 30, alicota: 0.03 },
		],
	},
	REFERENCIA : 20/100,
};

function calcularArea(base,altura) {
	
  if (base <= 0) throw new Error('Base com valor errado');
  if (altura <=0) throw new Error('Altura com valor errado');
  let resultado = 0;
  resultado = base * altura;
  return resultado.toFixed(2);

}

function calcular(dados) {
  console.log(dados);	
  const {altura = 0, largura = 0 ,} = dados;	 
  if (altura <= 0) throw new Error('Base com valor errado');
  if (largura <=0) throw new Error('Altura com valor errado');
  let resultado = 0;
  resultado = largura * altura;
  return resultado.toFixed(2);

}


module.exports = {
	calcularArea,
	TABELA,
	calcular,
};
