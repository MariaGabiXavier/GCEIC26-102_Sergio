const request = require('supertest');
const app = require('../../src/app');

const TOKEN = 'token-simulado-123';

// AUTH ROUTES 

describe('POST /api/exg/login', () => {
  test('retorna token com credenciais validas', async () => {
    const res = await request(app).post('/api/exg/login').send({ user: 'adm', password: 'adm' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('token retornado e uma string nao vazia', async () => {
    const res = await request(app).post('/api/exg/login').send({ user: 'adm', password: 'adm' });
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBeGreaterThan(0);
  });

  test('retorna 401 com usuario errado', async () => {
    const res = await request(app).post('/api/exg/login').send({ user: 'errado', password: 'adm' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('erro');
  });

  test('retorna 401 com senha errada', async () => {
    const res = await request(app).post('/api/exg/login').send({ user: 'adm', password: 'errada' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('erro');
  });

  test('retorna 401 sem body', async () => {
    const res = await request(app).post('/api/exg/login').send({});
    expect(res.statusCode).toBe(401);
  });

  test('retorna 401 para credenciais em maiusculo', async () => {
    const res = await request(app).post('/api/exg/login').send({ user: 'ADM', password: 'ADM' });
    expect(res.statusCode).toBe(401);
  });
});

describe('POST /api/exg/auth', () => {
  test('valida token correto', async () => {
    const res = await request(app).post('/api/exg/auth').send({ token: TOKEN });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBe(TOKEN);
  });

  test('retorna 401 para token invalido', async () => {
    const res = await request(app).post('/api/exg/auth').send({ token: 'invalido' });
    expect(res.statusCode).toBe(401);
  });

  test('retorna 401 para token vazio', async () => {
    const res = await request(app).post('/api/exg/auth').send({ token: '' });
    expect(res.statusCode).toBe(401);
  });

  test('token do login e aceito no auth', async () => {
    const login = await request(app).post('/api/exg/login').send({ user: 'adm', password: 'adm' });
    const auth = await request(app).post('/api/exg/auth').send({ token: login.body.token });
    expect(auth.statusCode).toBe(200);
  });
});

//  LIST CURRENCY ROUTE 

describe('GET /api/exg/listCurrency', () => {
  test('retorna lista de moedas', async () => {
    const res = await request(app).get('/api/exg/listCurrency');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('retorna exatamente 5 moedas', async () => {
    const res = await request(app).get('/api/exg/listCurrency');
    expect(res.body).toHaveLength(5);
  });

  test('cada moeda tem os campos obrigatorios', async () => {
    const res = await request(app).get('/api/exg/listCurrency');
    for (const moeda of res.body) {
      expect(moeda).toHaveProperty('codigo');
      expect(moeda).toHaveProperty('nome');
      expect(moeda).toHaveProperty('cotacao_brl');
      expect(moeda).toHaveProperty('spread');
    }
  });

  test('contem USD, EUR e GBP', async () => {
    const res = await request(app).get('/api/exg/listCurrency');
    const codigos = res.body.map(m => m.codigo);
    expect(codigos).toContain('USD');
    expect(codigos).toContain('EUR');
    expect(codigos).toContain('GBP');
  });
});

// EXCHANGE ROUTE

describe('POST /api/exg/exchange', () => {
  test('converte USD comercial', async () => {
    const res = await request(app).post('/api/exg/exchange').send({
      token: TOKEN, currencyCode: 'USD', value: 1000, type: 'comercial',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('valor_convertido');
    expect(res.body.valor_convertido).toBeGreaterThan(0);
  });

  test('converte EUR turismo', async () => {
    const res = await request(app).post('/api/exg/exchange').send({
      token: TOKEN, currencyCode: 'EUR', value: 500, type: 'turism',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.moeda.codigo).toBe('EUR');
  });

  test('aceita currencyCode em minusculo', async () => {
    const res = await request(app).post('/api/exg/exchange').send({
      token: TOKEN, currencyCode: 'usd', value: 1000, type: 'comercial',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.moeda.codigo).toBe('USD');
  });

  test('turismo tem IOF maior que comercial', async () => {
    const base = { token: TOKEN, currencyCode: 'USD', value: 1000 };
    const com = await request(app).post('/api/exg/exchange').send({ ...base, type: 'comercial' });
    const tur = await request(app).post('/api/exg/exchange').send({ ...base, type: 'turism' });
    expect(tur.body.descontos.iof).toBeGreaterThan(com.body.descontos.iof);
  });

  test('resposta tem estrutura completa de descontos', async () => {
    const res = await request(app).post('/api/exg/exchange').send({
      token: TOKEN, currencyCode: 'USD', value: 1000, type: 'comercial',
    });
    expect(res.body.descontos).toHaveProperty('iof');
    expect(res.body.descontos).toHaveProperty('iof_aliquota');
    expect(res.body.descontos).toHaveProperty('taxa_servico');
    expect(res.body.descontos).toHaveProperty('spread');
    expect(res.body.descontos).toHaveProperty('total');
    expect(res.body).toHaveProperty('cotacao');
    expect(res.body).toHaveProperty('entrada_brl');
    expect(res.body).toHaveProperty('valor_efetivo_brl');
  });

  test('retorna 401 sem token', async () => {
    const res = await request(app).post('/api/exg/exchange').send({
      currencyCode: 'USD', value: 1000, type: 'comercial',
    });
    expect(res.statusCode).toBe(401);
  });

  test('retorna 401 com token invalido', async () => {
    const res = await request(app).post('/api/exg/exchange').send({
      token: 'errado', currencyCode: 'USD', value: 1000, type: 'comercial',
    });
    expect(res.statusCode).toBe(401);
  });

  test('retorna 400 sem currencyCode', async () => {
    const res = await request(app).post('/api/exg/exchange').send({
      token: TOKEN, value: 1000, type: 'comercial',
    });
    expect(res.statusCode).toBe(400);
  });

  test('retorna 400 com valor zero', async () => {
    const res = await request(app).post('/api/exg/exchange').send({
      token: TOKEN, currencyCode: 'USD', value: 0, type: 'comercial',
    });
    expect(res.statusCode).toBe(400);
  });

  test('retorna 400 com valor negativo', async () => {
    const res = await request(app).post('/api/exg/exchange').send({
      token: TOKEN, currencyCode: 'USD', value: -100, type: 'comercial',
    });
    expect(res.statusCode).toBe(400);
  });

  test('retorna 400 com tipo invalido', async () => {
    const res = await request(app).post('/api/exg/exchange').send({
      token: TOKEN, currencyCode: 'USD', value: 1000, type: 'invalido',
    });
    expect(res.statusCode).toBe(400);
  });

  test('retorna 404 para moeda inexistente', async () => {
    const res = await request(app).post('/api/exg/exchange').send({
      token: TOKEN, currencyCode: 'XYZ', value: 1000, type: 'comercial',
    });
    expect(res.statusCode).toBe(404);
  });
});
