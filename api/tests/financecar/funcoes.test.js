const {
  calcularFinanciamentoVeiculo,
  calcularFundoEmergencia,
  calcularJurosCompostos,
  calcularRegra503020
} = require('../../src/financecar/financeFuncoes.js');

describe('Testes unitários das funções financeiras', () => {

    // FINANCIAMENTO
    test('deve calcular financiamento corretamente', () => {

        const resultado = calcularFinanciamentoVeiculo(
            50000,
            10000,
            1,
            48
        );

        expect(resultado).toHaveProperty('valorFinanciado');
        expect(resultado).toHaveProperty('valorParcela');

        expect(resultado.valorFinanciado).toBe(40000);

    });

    test('deve lançar erro para valor negativo no financiamento', () => {

        expect(() =>
            calcularFinanciamentoVeiculo(
                -50000,
                10000,
                1,
                48
            )
        ).toThrow();

    });


    // FUNDO DE EMERGÊNCIA
    test('deve calcular fundo de emergência corretamente', () => {

        const resultado = calcularFundoEmergencia(
            2000,
            1000,
            6
        );

        expect(resultado.valorTotalGuardado)
            .toBe(18000);

    });

    test('deve lançar erro para meses iguais a zero', () => {

        expect(() =>
            calcularFundoEmergencia(
                2000,
                1000,
                0
            )
        ).toThrow();

    });


    // JUROS COMPOSTOS
    test('deve calcular juros compostos corretamente', () => {

        const resultado = calcularJurosCompostos(
            1000,
            100,
            1,
            12
        );

        expect(resultado).toHaveProperty('valorFinal');

        expect(resultado.valorFinal)
            .toBeGreaterThan(1000);

    });

    test('deve lançar erro para juros negativos', () => {

        expect(() =>
            calcularJurosCompostos(
                1000,
                100,
                -1,
                12
            )
        ).toThrow();

    });


    // REGRA 50/30/20
    test('deve calcular regra 50/30/20 corretamente', () => {

        const resultado =
            calcularRegra503020(4000);

        expect(resultado.divisoes.necessidades)
            .toBe(2000);

        expect(resultado.divisoes.desejos)
            .toBe(1200);

        expect(resultado.divisoes.investimentos_dividas)
            .toBe(800);

    });

    test('deve lançar erro para salário inválido', () => {

        expect(() =>
            calcularRegra503020(-1000)
        ).toThrow();

    });

});