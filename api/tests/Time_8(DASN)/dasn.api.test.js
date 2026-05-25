const request = require('supertest');
const express = require('express');
const dasnRouter = require('../../src/Time_8(DASN)/dasn');

const app = express();
app.use(express.json());
app.use('/DASN', dasnRouter);

describe('API DASN-SIMEI', () => {
    // Testes da API 1 (Limite) 
    it('Receita dentro do limite', async () => {
        const res = await request(app).post('/DASN/valida-limite').send({
            receitaComercio: 40000, receitaServicos: 20000, mesesAtivos: 12
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.excedeuLimite).toBe(false);
    });

    // Testes da API 2 (Multa)
    it('Calcula multa de atraso com valor minimo', async () => {
        const res = await request(app).post('/DASN/multa-atraso').send({ mesesAtraso: 2 });
        expect(res.statusCode).toBe(200);
        expect(res.body.multa).toBe(50);
    });

    // Testes da API 3 (Lucro Isento)
    it('Calcula lucro isento e tributavel', async () => {
        const res = await request(app).post('/DASN/lucro-isento').send({
            receitaServicos: 10000, despesas: 2000
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.presuncao).toBe(3200);
        expect(res.body.lucroReal).toBe(8000);
        expect(res.body.lucroTributavel).toBe(4800);
    });
});