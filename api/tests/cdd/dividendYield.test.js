const {
  calculateDividendYield,
  computeDividendYield,
} = require("../../src/cdd/controllers/dividendYield");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (body) => ({ body });

describe("dividendYield", () => {
  describe("computeDividendYield (pure function)", () => {
    describe("cálculo básico", () => {
      it("calcula DY corretamente para valores positivos", () => {
        const result = computeDividendYield({
          annualDividendPerShare: 5,
          sharePrice: 100,
        });

        expect(result.dividendYield).toBe(5);
        expect(result.classification).toBe("moderate");
      });

      it("arredonda DY para 2 casas decimais", () => {
        const result = computeDividendYield({
          annualDividendPerShare: 1,
          sharePrice: 3,
        });

        expect(result.dividendYield).toBe(33.33);
      });

      it("retorna DY = 0 quando dividendo é zero", () => {
        const result = computeDividendYield({
          annualDividendPerShare: 0,
          sharePrice: 50,
        });

        expect(result.dividendYield).toBe(0);
        expect(result.classification).toBe("low");
      });
    });

    describe("classificação", () => {
      it('classifica como "low" quando DY < 3%', () => {
        const result = computeDividendYield({
          annualDividendPerShare: 2,
          sharePrice: 100,
        });

        expect(result.classification).toBe("low");
      });

      it('classifica como "moderate" quando 3% ≤ DY < 6%', () => {
        const result = computeDividendYield({
          annualDividendPerShare: 4,
          sharePrice: 100,
        });

        expect(result.classification).toBe("moderate");
      });

      it('classifica como "high" quando 6% ≤ DY < 10%', () => {
        const result = computeDividendYield({
          annualDividendPerShare: 8,
          sharePrice: 100,
        });

        expect(result.classification).toBe("high");
      });

      it('classifica como "very_high" quando DY ≥ 10%', () => {
        const result = computeDividendYield({
          annualDividendPerShare: 15,
          sharePrice: 100,
        });

        expect(result.classification).toBe("very_high");
      });
    });

    describe("limites de classificação (boundaries)", () => {
      it('classifica DY = 3% como "moderate"', () => {
        const result = computeDividendYield({
          annualDividendPerShare: 3,
          sharePrice: 100,
        });

        expect(result.classification).toBe("moderate");
      });

      it('classifica DY = 6% como "high"', () => {
        const result = computeDividendYield({
          annualDividendPerShare: 6,
          sharePrice: 100,
        });

        expect(result.classification).toBe("high");
      });

      it('classifica DY = 10% como "very_high"', () => {
        const result = computeDividendYield({
          annualDividendPerShare: 10,
          sharePrice: 100,
        });

        expect(result.classification).toBe("very_high");
      });
    });

    describe("validações", () => {
      it("lança erro quando sharePrice é zero", () => {
        expect(() =>
          computeDividendYield({ annualDividendPerShare: 5, sharePrice: 0 }),
        ).toThrow("Share price must be positive");
      });

      it("lança erro quando sharePrice é negativo", () => {
        expect(() =>
          computeDividendYield({ annualDividendPerShare: 5, sharePrice: -10 }),
        ).toThrow("Share price must be positive");
      });

      it("lança erro quando dividendo é negativo", () => {
        expect(() =>
          computeDividendYield({ annualDividendPerShare: -1, sharePrice: 100 }),
        ).toThrow("Dividend cannot be negative");
      });
    });
  });

  describe("calculateDividendYield (HTTP handler)", () => {
    describe("sucesso (200)", () => {
      it("responde com 200 e o resultado quando o body é válido", () => {
        const req = mockRequest({ annualDividendPerShare: 5, sharePrice: 100 });
        const res = mockResponse();

        calculateDividendYield(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          dividendYield: 5,
          classification: "moderate",
        });
      });
    });

    describe("erro (400)", () => {
      it("responde com 400 quando sharePrice é zero", () => {
        const req = mockRequest({ annualDividendPerShare: 5, sharePrice: 0 });
        const res = mockResponse();

        calculateDividendYield(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Share price must be positive",
        });
      });

      it("responde com 400 quando dividendo é negativo", () => {
        const req = mockRequest({
          annualDividendPerShare: -1,
          sharePrice: 100,
        });
        const res = mockResponse();

        calculateDividendYield(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Dividend cannot be negative",
        });
      });

      it("responde com 400 e mensagem genérica quando body não é um objeto", () => {
        const req = mockRequest(undefined);
        const res = mockResponse();

        calculateDividendYield(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({ error: expect.any(String) }),
        );
      });
    });
  });
});
