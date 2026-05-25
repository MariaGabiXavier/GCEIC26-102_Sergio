function calcularFinanciamentoVeiculo(
    valorVeiculo,
    entrada,
    taxaJuros,
    parcelas
) {

    if (
        valorVeiculo === undefined ||
        entrada === undefined ||
        taxaJuros === undefined ||
        parcelas === undefined
    ) {
        throw new Error(
            'Informe "valorVeiculo", "entrada", "taxaJuros" e "parcelas".'
        );
    }

    const valor = Number(valorVeiculo);
    const entradaValor = Number(entrada);
    const juros = Number(taxaJuros);
    const n = Number(parcelas);

    if (
        isNaN(valor) ||
        isNaN(entradaValor) ||
        isNaN(juros) ||
        isNaN(n)
    ) {
        throw new Error("Todos os valores devem ser numéricos.");
    }

    if (valor <= 0) {
        throw new Error("O valor do veículo deve ser maior que zero.");
    }

    if (entradaValor < 0) {
        throw new Error("A entrada não pode ser negativa.");
    }

    if (entradaValor >= valor) {
        throw new Error(
            "A entrada não pode ser maior ou igual ao valor do veículo."
        );
    }

    if (juros < 0) {
        throw new Error("A taxa de juros não pode ser negativa.");
    }

    if (n <= 0 || !Number.isInteger(n)) {
        throw new Error(
            "O número de parcelas deve ser um inteiro maior que zero."
        );
    }

    const pv = valor - entradaValor;
    const i = juros / 100;

    let parcela;

    if (i === 0) {
        parcela = pv / n;
    } else {
        parcela =
            (pv * i) /
            (1 - Math.pow(1 + i, -n));
    }

    return {
        valorFinanciado: Number(pv.toFixed(2)),
        valorParcela: Number(parcela.toFixed(2))
    };
}



function calcularFundoEmergencia(
    gastosFixosMensais,
    gastosVariaveis,
    mesesSeguranca
) {

    if (
        gastosFixosMensais === undefined ||
        gastosVariaveis === undefined ||
        mesesSeguranca === undefined
    ) {
        throw new Error(
            'Informe "gastosFixosMensais", "gastosVariaveis" e "mesesSeguranca".'
        );
    }

    const fixos = Number(gastosFixosMensais);
    const variaveis = Number(gastosVariaveis);
    const meses = Number(mesesSeguranca);

    if (
        isNaN(fixos) ||
        isNaN(variaveis) ||
        isNaN(meses)
    ) {
        throw new Error("Todos os valores devem ser numéricos.");
    }

    if (fixos < 0) {
        throw new Error(
            "Os gastos fixos mensais não podem ser negativos."
        );
    }

    if (variaveis < 0) {
        throw new Error(
            "Os gastos variáveis não podem ser negativos."
        );
    }

    if (meses <= 0 || !Number.isInteger(meses)) {
        throw new Error(
            "Os meses de segurança devem ser um inteiro maior que zero."
        );
    }

    const custoMensalTotal = fixos + variaveis;

    const valorTotalFundo = custoMensalTotal * meses;

    return {
        custoMensalTotal: Number(custoMensalTotal.toFixed(2)),
        valorTotalGuardado: Number(valorTotalFundo.toFixed(2))
    };
}



function calcularJurosCompostos(
    valorInicial,
    aporteMensal,
    taxaJuros,
    tempo
) {

    if (
        valorInicial === undefined ||
        aporteMensal === undefined ||
        taxaJuros === undefined ||
        tempo === undefined
    ) {
        throw new Error(
            'Informe "valorInicial", "aporteMensal", "taxaJuros" e "tempo".'
        );
    }

    const principal = Number(valorInicial);
    const aporte = Number(aporteMensal);
    const juros = Number(taxaJuros);
    const meses = Number(tempo);

    if (
        isNaN(principal) ||
        isNaN(aporte) ||
        isNaN(juros) ||
        isNaN(meses)
    ) {
        throw new Error("Todos os valores devem ser numéricos.");
    }

    if (principal < 0) {
        throw new Error("O valor inicial não pode ser negativo.");
    }

    if (aporte < 0) {
        throw new Error("O aporte mensal não pode ser negativo.");
    }

    if (juros < 0) {
        throw new Error("A taxa de juros não pode ser negativa.");
    }

    if (meses <= 0 || !Number.isInteger(meses)) {
        throw new Error(
            "O tempo deve ser um inteiro maior que zero."
        );
    }

    const i = juros / 100;

    let montante;

    if (i === 0) {
        montante = principal + (aporte * meses);
    } else {
        montante =
            principal * Math.pow(1 + i, meses) +
            aporte *
            ((Math.pow(1 + i, meses) - 1) / i);
    }

    return {
        valorFinal: Number(montante.toFixed(2))
    };
}



function calcularRegra503020(
    salarioLiquido
) {

    if (
        salarioLiquido === undefined ||
        salarioLiquido === null
    ) {
        throw new Error(
            'Informe "salarioLiquido".'
        );
    }

    const salario = Number(salarioLiquido);

    if (isNaN(salario)) {
        throw new Error(
            "O salário líquido deve ser numérico."
        );
    }

    if (salario <= 0) {
        throw new Error(
            "O salário líquido deve ser maior que zero."
        );
    }

    const necessidades = salario * 0.50;
    const desejos = salario * 0.30;
    const investimentosDividas = salario * 0.20;

    return {
        salarioLiquido: Number(salario.toFixed(2)),
        divisoes: {
            necessidades: Number(necessidades.toFixed(2)),
            desejos: Number(desejos.toFixed(2)),
            investimentos_dividas: Number(
                investimentosDividas.toFixed(2)
            )
        }
    };
}

module.exports = {
  calcularFinanciamentoVeiculo,
  calcularFundoEmergencia,
  calcularJurosCompostos,
  calcularRegra503020
};