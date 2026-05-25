const request = require('supertest');
const app = require("../../src/app");


// JUROS COMPOSTOS
describe('POST /api/financecar/juros', () => {

    test('deve calcular corretamente os juros compostos', async () => {

        const response = await request(app)
            .post('/api/financecar/juros')
            .send({
                valorInicial: 1000,
                aporteMensal: 100,
                taxaJuros: 1,
                tempo: 12
            });

        expect(response.status).toBe(200);

        expect(response.body).toHaveProperty('valorFinal');

    });

    test('valorFinal deve ser maior que o valor inicial', async () => {

        const response = await request(app)
            .post('/api/financecar/juros')
            .send({
                valorInicial: 1000,
                aporteMensal: 100,
                taxaJuros: 1,
                tempo: 12
            });

        expect(response.body.valorFinal)
            .toBeGreaterThan(1000);

    });

    test('deve retornar erro para valor negativo', async () => {

        const response = await request(app)
            .post('/api/financecar/juros')
            .send({
                valorInicial: -1000,
                aporteMensal: 100,
                taxaJuros: 1,
                tempo: 12
            });

        expect(response.status).toBe(400);

    });

    test('deve retornar erro para texto', async () => {

        const response = await request(app)
            .post('/api/financecar/juros')
            .send({
                valorInicial: "abc",
                aporteMensal: 100,
                taxaJuros: 1,
                tempo: 12
            });

        expect(response.status).toBe(400);

    });

    test('deve retornar erro para tempo igual a zero', async () => {

        const response = await request(app)
            .post('/api/financecar/juros')
            .send({
                valorInicial: 1000,
                aporteMensal: 100,
                taxaJuros: 1,
                tempo: 0
            });

        expect(response.status).toBe(400);

    });

    test('deve retornar erro sem valorInicial', async () => {

        const response = await request(app)
            .post('/api/financecar/juros')
            .send({
                aporteMensal: 100,
                taxaJuros: 1,
                tempo: 12
            });

        expect(response.status).toBe(400);

    });

});


// FINANCIAMENTO DE VEICULO
describe('POST /api/financecar/financiamento', () => {

    test('deve calcular corretamente a parcela do financiamento', async () => {

        const response = await request(app)
            .post('/api/financecar/financiamento')
            .send({
                valorVeiculo: 50000,
                entrada: 10000,
                taxaJuros: 1,
                parcelas: 48
            });

        expect(response.status).toBe(200);

        expect(response.body).toHaveProperty('valorFinanciado');
        expect(response.body).toHaveProperty('valorParcela');

    });

    test('valorParcela deve ser maior que zero', async () => {

        const response = await request(app)
            .post('/api/financecar/financiamento')
            .send({
                valorVeiculo: 50000,
                entrada: 10000,
                taxaJuros: 1,
                parcelas: 48
            });

        expect(response.body.valorParcela)
            .toBeGreaterThan(0);

    });

    test('deve retornar erro para valor do veículo negativo', async () => {

        const response = await request(app)
            .post('/api/financecar/financiamento')
            .send({
                valorVeiculo: -50000,
                entrada: 10000,
                taxaJuros: 1,
                parcelas: 48
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('erro');

    });

    test('deve retornar erro para texto', async () => {

        const response = await request(app)
            .post('/api/financecar/financiamento')
            .send({
                valorVeiculo: "texto",
                entrada: 10000,
                taxaJuros: 1,
                parcelas: 48
            });

        expect(response.status).toBe(400);

    });

    test('deve retornar erro para parcelas igual a zero', async () => {

        const response = await request(app)
            .post('/api/financecar/financiamento')
            .send({
                valorVeiculo: 50000,
                entrada: 10000,
                taxaJuros: 1,
                parcelas: 0
            });

        expect(response.status).toBe(400);

    });

    test('deve retornar erro quando entrada for maior que o valor do veículo', async () => {

        const response = await request(app)
            .post('/api/financecar/financiamento')
            .send({
                valorVeiculo: 50000,
                entrada: 60000,
                taxaJuros: 1,
                parcelas: 48
            });

        expect(response.status).toBe(400);

    });

    test('deve retornar erro sem valorVeiculo', async () => {

        const response = await request(app)
            .post('/api/financecar/financiamento')
            .send({
                entrada: 10000,
                taxaJuros: 1,
                parcelas: 48
            });

        expect(response.status).toBe(400);

    });
});


// FUNDO DE EMERGENCIA
describe('POST /api/financecar/fundo', () => {

    test('deve calcular corretamente o fundo de emergência', async () => {

        const response = await request(app)
            .post('/api/financecar/fundo')
            .send({
                gastosFixosMensais: 2000,
                gastosVariaveis: 1000,
                mesesSeguranca: 6
            });

        expect(response.status).toBe(200);

        expect(response.body).toHaveProperty('custoMensalTotal');
        expect(response.body).toHaveProperty('valorTotalGuardado');

    });

    test('valorTotalGuardado deve ser maior que zero', async () => {

        const response = await request(app)
            .post('/api/financecar/fundo')
            .send({
                gastosFixosMensais: 2000,
                gastosVariaveis: 1000,
                mesesSeguranca: 6
            });

        expect(response.body.valorTotalGuardado)
            .toBeGreaterThan(0);

    });

    test('deve retornar erro para valores negativos', async () => {

        const response = await request(app)
            .post('/api/financecar/fundo')
            .send({
                gastosFixosMensais: -2000,
                gastosVariaveis: 1000,
                mesesSeguranca: 6
            });

        expect(response.status).toBe(400);

    });

    test('deve retornar erro para texto', async () => {

        const response = await request(app)
            .post('/api/financecar/fundo')
            .send({
                gastosFixosMensais: "abc",
                gastosVariaveis: 1000,
                mesesSeguranca: 6
            });

        expect(response.status).toBe(400);

    });

    test('deve retornar erro para mesesSeguranca igual a zero', async () => {

        const response = await request(app)
            .post('/api/financecar/fundo')
            .send({
                gastosFixosMensais: 2000,
                gastosVariaveis: 1000,
                mesesSeguranca: 0
            });

        expect(response.status).toBe(400);

    });

    test('deve retornar erro sem gastosFixosMensais', async () => {

        const response = await request(app)
            .post('/api/financecar/fundo')
            .send({
                gastosVariaveis: 1000,
                mesesSeguranca: 6
            });

        expect(response.status).toBe(400);

    });

});


// REGRA 50/30/20
describe('POST /api/financecar/regra', () => {

    test('deve calcular corretamente a divisão 50/30/20', async () => {

        const response = await request(app)
            .post('/api/financecar/regra')
            .send({
                salarioLiquido: 4000
            });

        expect(response.status).toBe(200);

        expect(response.body).toHaveProperty('salarioLiquido');
        expect(response.body).toHaveProperty('divisoes');

    });

    test('divisões devem somar o salário líquido', async () => {

        const response = await request(app)
            .post('/api/financecar/regra')
            .send({
                salarioLiquido: 4000
            });

        const total =
            response.body.divisoes.necessidades +
            response.body.divisoes.desejos +
            response.body.divisoes.investimentos_dividas;

        expect(total).toBe(4000);

    });

    test('deve retornar erro para salário negativo', async () => {

        const response = await request(app)
            .post('/api/financecar/regra')
            .send({
                salarioLiquido: -500
            });

        expect(response.status).toBe(400);

    });

    test('deve retornar erro para salário nulo', async () => {

        const response = await request(app)
            .post('/api/financecar/regra')
            .send({
                salarioLiquido: null
            });

        expect(response.status).toBe(400);

    });

    test('deve retornar erro para texto', async () => {

        const response = await request(app)
            .post('/api/financecar/regra')
            .send({
                salarioLiquido: "texto"
            });

        expect(response.status).toBe(400);

    });

    test('deve retornar erro para salário igual a zero', async () => {

        const response = await request(app)
            .post('/api/financecar/regra')
            .send({
                salarioLiquido: 0
            });

        expect(response.status).toBe(400);

    });

    test('deve retornar erro sem salarioLiquido', async () => {

        const response = await request(app)
            .post('/api/financecar/regra')
            .send({});

        expect(response.status).toBe(400);

    });

});


