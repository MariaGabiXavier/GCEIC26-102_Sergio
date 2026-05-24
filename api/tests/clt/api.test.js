const request = require('supertest');
const app = require('../../src/app');

const TOKEN = 'token-clt-empresarial-123';

describe('API CLT - autenticacao', () => {
  test('retorna token com credenciais validas', async () => {
    const res = await request(app).post('/api/clt/login').send({ user: 'adm', password: 'adm' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBe(TOKEN);
  });

  test('recusa credenciais invalidas', async () => {
    const res = await request(app).post('/api/clt/login').send({ user: 'adm', password: 'errada' });
    expect(res.statusCode).toBe(401);
  });

  test('valida token correto', async () => {
    const res = await request(app).post('/api/clt/auth').send({ token: TOKEN });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBe(TOKEN);
  });
});

describe('API CLT - calculos', () => {
  test('GET /api/clt/tabelas retorna referencias', async () => {
    const res = await request(app).get('/api/clt/tabelas');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('inss');
    expect(res.body.data).toHaveProperty('irrf');
  });

  test('POST /api/clt/salario-liquido calcula salario liquido', async () => {
    const res = await request(app).post('/api/clt/salario-liquido').send({
      token: TOKEN,
      salarioBruto: 4000,
      valeTransporte: 300,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('salarioLiquido');
  });

  test('POST /api/clt/custo-empresa calcula custo da empresa', async () => {
    const res = await request(app).post('/api/clt/custo-empresa').send({
      token: TOKEN,
      salarioBruto: 3000,
      valeRefeicao: 600,
      gympass: 80,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.custoMensal).toBeGreaterThan(3000);
    expect(res.body.data.encargos).toHaveProperty('fgts');
  });

  test('POST /api/clt/resultado-contratacao calcula lucro ou prejuizo', async () => {
    const res = await request(app).post('/api/clt/resultado-contratacao').send({
      token: TOKEN,
      salarioBruto: 3000,
      valeRefeicao: 500,
      receitaGerada: 9000,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.resultado.status).toBe('lucro');
    expect(res.body.data).toHaveProperty('salarioLiquido');
    expect(res.body.data).toHaveProperty('custoEmpresa');
  });

  test('retorna 401 sem token', async () => {
    const res = await request(app).post('/api/clt/custo-empresa').send({ salarioBruto: 3000 });
    expect(res.statusCode).toBe(401);
  });

  test('retorna 400 com salario invalido', async () => {
    const res = await request(app).post('/api/clt/salario-liquido').send({
      token: TOKEN,
      salarioBruto: 0,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
