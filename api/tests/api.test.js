
const request = require('supertest');
const app     = require('../src/app');

describe('Teste de Saude -> GET /health', () => {
	
	test('deve retornar status ok', async () => {
	  
		const res = await request(app).get('/health');
		expect(res.statusCode).toBe(200);
		expect(res.body.status).toBe('ok');

	});

});


