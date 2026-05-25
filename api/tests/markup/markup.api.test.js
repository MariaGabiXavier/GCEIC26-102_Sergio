const request = require('supertest');
const app = require('../../src/app');

// ============================================================
// Markup — Testes de API das rotas /api/markup
// ============================================================

describe('GET /api/markup — health check da equipe', () => {

    test('deve retornar identificação do Markup', async () => {
        const res = await request(app).get('/api/markup');
        expect(res.statusCode).toBe(200);
        expect(res.body.equipe).toBe('Markup');
        expect(res.body.tema).toMatch(/Markup/i);
        expect(res.body.rotas).toContain('/calcularPrecoVenda');
        expect(res.body.rotas).toContain('/calcularMarkupMultiplicador');
        expect(res.body.rotas).toContain('/calcularDesconto');
    });

});

// ------------------------------------------------------------
describe('POST /api/markup/calcularPrecoVenda', () => {

    test('deve calcular preço de venda para dados válidos', async () => {
        const res = await request(app)
            .post('/api/markup/calcularPrecoVenda')
            .send({ preco: 100, dv: 10, df: 20, ml: 15 });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(parseFloat(res.body.data)).toBeGreaterThan(100);
    });

    test('deve retornar erro 400 para corpo inválido', async () => {
        const res = await request(app)
            .post('/api/markup/calcularPrecoVenda')
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body).toHaveProperty('error');
    });

    test('deve retornar erro 400 para preço zero', async () => {
        const res = await request(app)
            .post('/api/markup/calcularPrecoVenda')
            .send({ preco: 0, dv: 10, df: 20, ml: 15 });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body).toHaveProperty('error');
    });

    test('deve retornar erro 400 para dv zero', async () => {
        const res = await request(app)
            .post('/api/markup/calcularPrecoVenda')
            .send({ preco: 100, dv: 0, df: 20, ml: 15 });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body).toHaveProperty('error');
    });

});

// ------------------------------------------------------------
describe('POST /api/markup/calcularMarkupMultiplicador', () => {

    test('deve calcular markup para valores válidos', async () => {
        const res = await request(app)
            .post('/api/markup/calcularMarkupMultiplicador')
            .send({ dv: 10, df: 20, ml: 15 });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeGreaterThan(1);
    });

    test('deve retornar erro 400 para dv zero', async () => {
        const res = await request(app)
            .post('/api/markup/calcularMarkupMultiplicador')
            .send({ dv: 0, df: 20, ml: 15 });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body).toHaveProperty('error');
    });

    test('deve retornar erro 400 para df zero', async () => {
        const res = await request(app)
            .post('/api/markup/calcularMarkupMultiplicador')
            .send({ dv: 10, df: 0, ml: 15 });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body).toHaveProperty('error');
    });

    test('deve retornar erro 400 para ml zero', async () => {
        const res = await request(app)
            .post('/api/markup/calcularMarkupMultiplicador')
            .send({ dv: 10, df: 20, ml: 0 });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body).toHaveProperty('error');
    });

    test('deve retornar erro 400 para valores negativos', async () => {
        const res = await request(app)
            .post('/api/markup/calcularMarkupMultiplicador')
            .send({ dv: -10, df: -20, ml: -15 });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body).toHaveProperty('error');
    });

});

// ------------------------------------------------------------
describe('POST /api/markup/calcularDesconto', () => {

    test('deve calcular desconto de 10%', async () => {
        const res = await request(app)
            .post('/api/markup/calcularDesconto')
            .send({ preco: 100, desconto: 10 });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(parseFloat(res.body.data)).toBe(90);
    });

    test('deve calcular desconto de 0% (sem desconto)', async () => {
        const res = await request(app)
            .post('/api/markup/calcularDesconto')
            .send({ preco: 100, desconto: 0 });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(parseFloat(res.body.data)).toBe(100);
    });

    test('deve calcular desconto de 100% (preço zero)', async () => {
        const res = await request(app)
            .post('/api/markup/calcularDesconto')
            .send({ preco: 100, desconto: 100 });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(parseFloat(res.body.data)).toBe(0);
    });

    test('deve retornar erro 400 para preço zero', async () => {
        const res = await request(app)
            .post('/api/markup/calcularDesconto')
            .send({ preco: 0, desconto: 10 });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body).toHaveProperty('error');
    });

    test('deve retornar erro 400 para desconto negativo', async () => {
        const res = await request(app)
            .post('/api/markup/calcularDesconto')
            .send({ preco: 100, desconto: -10 });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body).toHaveProperty('error');
    });

    test('deve retornar erro 400 para desconto acima de 100%', async () => {
        const res = await request(app)
            .post('/api/markup/calcularDesconto')
            .send({ preco: 100, desconto: 150 });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body).toHaveProperty('error');
    });

});
