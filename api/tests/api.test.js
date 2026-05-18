
const request = require('supertest');
const app     = require('../src/app');

describe('Teste de Saude -> GET /health', () => {
	
	test('deve retornar status ok', async () => {
	  
		const res = await request(app).get('/health');
		expect(res.statusCode).toBe(200);
		expect(res.body.status).toBe('ok');

	});

});

describe('GET /api/tabelas', () => {
  test('deve retornar a tebela de constantes ', async () => {
    const res = await request(app).get('/api/tabelas');
 
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('base');
    expect(res.body.data).toHaveProperty('referencia');

  });
});
