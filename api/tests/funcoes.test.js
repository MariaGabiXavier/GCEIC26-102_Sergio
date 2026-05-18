

const app     = require('../src/funcoes');

describe('Teste de unitario', () => {
	
	test('deve retornar calculos', async () => {
	  
        
		expect(app.calcularArea(2,3)).toBe("6.00" );
        expect(() => app.calcularArea(0,3)).toThrow(); 
        expect(() => app.calcularArea(3,0)).toThrow(); 
        expect(() => app.calcularArea(-10,3)).toThrow(); 
        
	});

});