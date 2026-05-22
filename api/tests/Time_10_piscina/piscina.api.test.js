const request = require('supertest');
const app     = require('../../src/app');

// ============================================================
describe('GET /health', () => {
  test('deve retornar status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});

// ============================================================
describe('GET /api/Time_10_piscina/tabelas', () => {
  test('deve retornar as constantes da tabela', async () => {
    const res = await request(app).get('/api/Time_10_piscina/tabelas');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('PRECO_AGUA_M3');
    expect(res.body.data).toHaveProperty('CUSTO_BOMBA');
  });
});

// ============================================================
describe('POST /api/Time_10_piscina/volume', () => {
  test('deve calcular o volume corretamente', async () => {
    const res = await request(app)
      .post('/api/Time_10_piscina/volume')
      .send({ comprimento: 5, largura: 3, profundidade: 1.5 });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.volume_m3).toBe(22.5);
  });

  test('deve retornar erro 400 se faltar campos', async () => {
    const res = await request(app)
      .post('/api/Time_10_piscina/volume')
      .send({ comprimento: 5 });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // cobre linha 29 — catch
  test('deve retornar erro 400 se comprimento for negativo', async () => {
    const res = await request(app)
      .post('/api/Time_10_piscina/volume')
      .send({ comprimento: -5, largura: 3, profundidade: 1.5 });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Comprimento/);
  });
});

// ============================================================
describe('POST /api/Time_10_piscina/custo-agua', () => {
  test('deve calcular custo da água', async () => {
    const res = await request(app)
      .post('/api/Time_10_piscina/custo-agua')
      .send({ volume: 22.5 });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.custo_agua).toBe(281.25);
  });

  test('deve retornar erro 400 se volume não informado', async () => {
    const res = await request(app)
      .post('/api/Time_10_piscina/custo-agua')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // cobre linha 41 — catch
  test('deve retornar erro 400 se volume for negativo', async () => {
    const res = await request(app)
      .post('/api/Time_10_piscina/custo-agua')
      .send({ volume: -10 });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Volume/);
  });
});

// ============================================================
describe('POST /api/Time_10_piscina/custo-eletrico', () => {
  test('com iluminação deve retornar 1900', async () => {
    const res = await request(app)
      .post('/api/Time_10_piscina/custo-eletrico')
      .send({ temIluminacao: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.custo_eletrico).toBe(1900);
  });

  test('sem iluminação deve retornar 1300', async () => {
    const res = await request(app)
      .post('/api/Time_10_piscina/custo-eletrico')
      .send({ temIluminacao: false });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.custo_eletrico).toBe(1300);
  });

  // cobre linha 52 — sem body usa padrão true
  test('deve funcionar sem body e usar iluminação padrão', async () => {
    const res = await request(app)
      .post('/api/Time_10_piscina/custo-eletrico')
      .send({});
    expect(res.statusCode).toBe(200);
    expect(res.body.data.custo_eletrico).toBe(1900);
  });
});

// ============================================================
describe('POST /api/Time_10_piscina/custo-hidraulico', () => {
  test('piscina pequena deve retornar 3700', async () => {
    const res = await request(app)
      .post('/api/Time_10_piscina/custo-hidraulico')
      .send({ volume: 22.5 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.custo_hidraulico).toBe(3700);
  });

  test('piscina grande (>50m³) deve retornar 4300', async () => {
    const res = await request(app)
      .post('/api/Time_10_piscina/custo-hidraulico')
      .send({ volume: 60 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.custo_hidraulico).toBe(4300);
  });

  test('deve retornar erro 400 se volume não informado', async () => {
    const res = await request(app)
      .post('/api/Time_10_piscina/custo-hidraulico')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // cobre linha 64 — catch
  test('deve retornar erro 400 se volume for negativo', async () => {
    const res = await request(app)
      .post('/api/Time_10_piscina/custo-hidraulico')
      .send({ volume: -5 });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Volume/);
  });
});

// ============================================================
describe('GET /api/Time_10_piscina/manutencao-mensal', () => {
  test('deve retornar custo mensal fixo', async () => {
    const res = await request(app).get('/api/Time_10_piscina/manutencao-mensal');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.manutencao_mensal).toBe(473);
  });
});

// ============================================================
describe('POST /api/Time_10_piscina/calcular-total', () => {
  test('deve retornar resumo completo', async () => {
    const res = await request(app)
      .post('/api/Time_10_piscina/calcular-total')
      .send({ comprimento: 5, largura: 3, profundidade: 1.5, temIluminacao: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('volume_m3');
    expect(res.body.data).toHaveProperty('total_construcao');
    expect(res.body.data).toHaveProperty('manutencao_mensal');
  });

  test('deve retornar resumo completo sem iluminação', async () => {
    const res = await request(app)
      .post('/api/Time_10_piscina/calcular-total')
      .send({ comprimento: 8, largura: 4, profundidade: 2, temIluminacao: false });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.volume_m3).toBe(64);
    expect(res.body.data.custo_eletrico).toBe(1300);
  });

  test('deve retornar erro 400 sem dados', async () => {
    const res = await request(app)
      .post('/api/Time_10_piscina/calcular-total')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // cobre linha 79 — catch
  test('deve retornar erro 400 se dimensões forem negativas', async () => {
    const res = await request(app)
      .post('/api/Time_10_piscina/calcular-total')
      .send({ comprimento: -5, largura: 3, profundidade: 1.5 });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Comprimento/);
  });
});