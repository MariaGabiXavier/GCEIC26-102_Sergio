const request = require('supertest');
const app = require('../../src/app');

describe('MKP API', () => {
  describe('GET /health', () => {
    it('retorna status ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });

  describe('POST /MKP/markup', () => {
    it('calcula markup e preço para entrada válida', async () => {
      const response = await request(app)
        .post('/MKP/markup')
        .send({
          custoProduto: 50,
          despesasVariaveis: 10,
          despesasFixas: 15,
          margemLucro: 20
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        multiplicador: '1.82',
        precoVenda: '90.91'
      });
    });

    it('rejeita payloads numéricos inválidos', async () => {
      const response = await request(app)
        .post('/MKP/markup')
        .send({
          custoProduto: 'abc',
          despesasVariaveis: 10,
          despesasFixas: 15,
          margemLucro: 20
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/custoProduto/i);
    });

    it('rejeita somas que atingem 100%', async () => {
      const response = await request(app)
        .post('/MKP/markup')
        .send({
          custoProduto: 50,
          despesasVariaveis: 50,
          despesasFixas: 30,
          margemLucro: 20
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/100%/);
    });
  });

  describe('POST /MKP/custos', () => {
    it('soma custos diretos e indiretos', async () => {
      const response = await request(app)
        .post('/MKP/custos')
        .send({ custosDiretos: 100, custosIndiretos: 25.5 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        custosDiretos: 100,
        custosIndiretos: 25.5,
        custoTotal: 125.5
      });
    });

    it('retorna erro para entradas não numéricas', async () => {
      const response = await request(app)
        .post('/MKP/custos')
        .send({ custosDiretos: 'x', custosIndiretos: 25.5 });

      expect(response.status).toBe(400);
      expect(response.body.erro).toMatch(/custosDiretos/i);
    });
  });

  describe('POST /MKP/preco-venda', () => {
    it('calcula preço de venda a partir do custo total e do markup', async () => {
      const response = await request(app)
        .post('/MKP/preco-venda')
        .send({ custoTotal: 125.5, indiceMarkup: 1.82 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        custoTotal: 125.5,
        indiceMarkup: 1.82,
        precoVenda: '228.41'
      });
    });

    it('aceita multiplicador como campo alternativo', async () => {
      const response = await request(app)
        .post('/MKP/preco-venda')
        .send({ custoTotal: 125.5, multiplicador: 1.82 });

      expect(response.status).toBe(200);
      expect(response.body.precoVenda).toBe('228.41');
    });

    it('retorna erro para payloads inválidos', async () => {
      const response = await request(app)
        .post('/MKP/preco-venda')
        .send({ custoTotal: 'x', indiceMarkup: 1.82 });

      expect(response.status).toBe(400);
      expect(response.body.erro).toMatch(/custoTotal/i);
    });
  });
});
