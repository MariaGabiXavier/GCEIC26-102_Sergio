const request = require('supertest');
const app = require('../../src/app');

// ============================================================
// Time_2 (ETEC) — Testes de API das rotas /ETEC1
// ============================================================

describe('GET /ETEC1 — health check da equipe', () => {

    test('deve retornar identificação do Time_2', async () => {
        const res = await request(app).get('/ETEC1');
        expect(res.statusCode).toBe(200);
        expect(res.body.equipe).toBe('Time_2');
        expect(res.body.tema).toMatch(/Encargos/i);
        expect(res.body.rotas).toContain('/salario');
        expect(res.body.rotas).toContain('/ferias');
        expect(res.body.rotas).toContain('/rescisao');
        expect(res.body.rotas).toContain('/decimoterceiro');
    });

});

// ------------------------------------------------------------
describe('POST /ETEC1/salario', () => {

    test('deve calcular encargos para salário válido', async () => {
        const res = await request(app)
            .post('/ETEC1/salario')
            .send({ salario: 2000 });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('salarioBruto', 2000);
        expect(res.body).toHaveProperty('inss');
        expect(res.body).toHaveProperty('fgts');
        expect(res.body).toHaveProperty('patronal');
        expect(res.body).toHaveProperty('salarioLiquido');
        expect(res.body).toHaveProperty('custoTotalEmpregador');
    });

    test('FGTS deve ser 8% do salário bruto', async () => {
        const res = await request(app)
            .post('/ETEC1/salario')
            .send({ salario: 2000 });

        expect(res.body.fgts).toBe(160.00);
    });

    test('salário líquido deve ser menor que o bruto', async () => {
        const res = await request(app)
            .post('/ETEC1/salario')
            .send({ salario: 2000 });

        expect(res.body.salarioLiquido).toBeLessThan(res.body.salarioBruto);
    });

    test('deve retornar erro 400 para salário ausente', async () => {
        const res = await request(app)
            .post('/ETEC1/salario')
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('erro');
    });

    test('deve retornar erro 400 para salário negativo', async () => {
        const res = await request(app)
            .post('/ETEC1/salario')
            .send({ salario: -500 });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('erro');
    });

    test('deve retornar erro 400 para salário zero', async () => {
        const res = await request(app)
            .post('/ETEC1/salario')
            .send({ salario: 0 });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('erro');
    });

});

// ------------------------------------------------------------
describe('POST /ETEC1/ferias', () => {

    test('deve calcular férias para salário válido', async () => {
        const res = await request(app)
            .post('/ETEC1/ferias')
            .send({ salario: 3000 });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('ferias');
        expect(res.body).toHaveProperty('tercoConstitucional');
        expect(res.body).toHaveProperty('totalBruto');
        expect(res.body).toHaveProperty('totalLiquido');
    });

    test('1/3 constitucional deve ser salário / 3', async () => {
        const res = await request(app)
            .post('/ETEC1/ferias')
            .send({ salario: 3000 });

        expect(res.body.tercoConstitucional).toBe(1000);
    });

    test('total bruto deve ser salário + 1/3', async () => {
        const res = await request(app)
            .post('/ETEC1/ferias')
            .send({ salario: 3000 });

        expect(res.body.totalBruto).toBe(4000);
    });

    test('deve retornar erro 400 para salário ausente', async () => {
        const res = await request(app)
            .post('/ETEC1/ferias')
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('erro');
    });

});

// ------------------------------------------------------------
describe('POST /ETEC1/rescisao', () => {

    test('sem justa causa deve incluir aviso prévio e multa de 40%', async () => {
        const res = await request(app)
            .post('/ETEC1/rescisao')
            .send({ salario: 2000, mesesTrabalhados: 12, motivoDemissao: 'sem_justa_causa' });

        expect(res.statusCode).toBe(200);
        expect(res.body.avisoPrevio).toBe(2000);
        expect(res.body.multaFGTS).toBeGreaterThan(0);
        expect(res.body).toHaveProperty('totalRescisao');
    });

    test('justa causa não deve ter aviso prévio nem multa', async () => {
        const res = await request(app)
            .post('/ETEC1/rescisao')
            .send({ salario: 2000, mesesTrabalhados: 12, motivoDemissao: 'justa_causa' });

        expect(res.statusCode).toBe(200);
        expect(res.body.avisoPrevio).toBe(0);
        expect(res.body.multaFGTS).toBe(0);
    });

    test('pedido de demissão deve ter multa de 20% (metade da sem justa causa)', async () => {
        const [r1, r2] = await Promise.all([
            request(app).post('/ETEC1/rescisao').send({ salario: 2000, mesesTrabalhados: 12, motivoDemissao: 'pedido_demissao' }),
            request(app).post('/ETEC1/rescisao').send({ salario: 2000, mesesTrabalhados: 12, motivoDemissao: 'sem_justa_causa' }),
        ]);
        expect(r1.body.multaFGTS).toBe(+(r2.body.multaFGTS / 2).toFixed(2));
    });

    test('deve retornar erro 400 para motivo inválido', async () => {
        const res = await request(app)
            .post('/ETEC1/rescisao')
            .send({ salario: 2000, mesesTrabalhados: 12, motivoDemissao: 'motivo_invalido' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('erro');
    });

    test('deve retornar erro 400 para meses ausentes', async () => {
        const res = await request(app)
            .post('/ETEC1/rescisao')
            .send({ salario: 2000, motivoDemissao: 'sem_justa_causa' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('erro');
    });

    test('deve retornar erro 400 para salário ausente', async () => {
        const res = await request(app)
            .post('/ETEC1/rescisao')
            .send({ mesesTrabalhados: 12, motivoDemissao: 'sem_justa_causa' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('erro');
    });

});

// ------------------------------------------------------------
describe('POST /ETEC1/decimoterceiro', () => {

    test('deve calcular 13º para 12 meses trabalhados', async () => {
        const res = await request(app)
            .post('/ETEC1/decimoterceiro')
            .send({ salario: 2000, mesesTrabalhados: 12 });

        expect(res.statusCode).toBe(200);
        expect(res.body.decimoBruto).toBe(2000);
        expect(res.body).toHaveProperty('decimoLiquido');
        expect(res.body).toHaveProperty('inss');
    });

    test('deve calcular 13º proporcional para 6 meses', async () => {
        const res = await request(app)
            .post('/ETEC1/decimoterceiro')
            .send({ salario: 2000, mesesTrabalhados: 6 });

        expect(res.statusCode).toBe(200);
        expect(res.body.decimoBruto).toBe(1000);
    });

    test('décimo líquido deve ser menor que o bruto', async () => {
        const res = await request(app)
            .post('/ETEC1/decimoterceiro')
            .send({ salario: 2000, mesesTrabalhados: 12 });

        expect(res.body.decimoLiquido).toBeLessThan(res.body.decimoBruto);
    });

    test('deve retornar erro 400 para meses ausentes', async () => {
        const res = await request(app)
            .post('/ETEC1/decimoterceiro')
            .send({ salario: 2000 });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('erro');
    });

    test('deve retornar erro 400 para salário ausente', async () => {
        const res = await request(app)
            .post('/ETEC1/decimoterceiro')
            .send({ mesesTrabalhados: 12 });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('erro');
    });

});