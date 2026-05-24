const {
  calculatePayoutRatio,
  computePayoutRatio,
} = require("../../src/cdd/controllers/payoutRatio");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (body) => ({ body });

describe("payoutRatio", () => {
  describe("computePayoutRatio (pure function)", () => {
    describe("cálculo básico", () => {
      it("calcula payout e retention corretamente", () => {
        const result = computePayoutRatio({
          dividendPerShare: 2,
          earningsPerShare: 5,
        });

        expect(result.payoutRatio).toBe(40);
        expect(result.retentionRatio).toBe(60);
      });

      it("retorna payout=0 e retention=100 quando dividendo é zero", () => {
        const result = computePayoutRatio({
          dividendPerShare: 0,
          earningsPerShare: 10,
        });

        expect(result.payoutRatio).toBe(0);
        expect(result.retentionRatio).toBe(100);
        expect(result.risk).toBe("low");
        expect(result.isSustainable).toBe(true);
      });

      it("arredonda payout e retention para 2 casas decimais", () => {
        const result = computePayoutRatio({
          dividendPerShare: 1,
          earningsPerShare: 3,
        });

        expect(result.payoutRatio).toBe(33.33);
        expect(result.retentionRatio).toBe(66.67);
      });

      it("aceita payout acima de 100% (dividendo > lucro) com retention negativo", () => {
        const result = computePayoutRatio({
          dividendPerShare: 6,
          earningsPerShare: 5,
        });

        expect(result.payoutRatio).toBe(120);
        expect(result.retentionRatio).toBe(-20);
        expect(result.risk).toBe("high");
        expect(result.isSustainable).toBe(false);
      });
    });

    describe("classificação de risco", () => {
      it('classifica risco como "low" quando payout ≤ 50%', () => {
        const result = computePayoutRatio({
          dividendPerShare: 2,
          earningsPerShare: 5,
        });

        expect(result.risk).toBe("low");
        expect(result.isSustainable).toBe(true);
      });

      it('classifica risco como "moderate" quando 50% < payout ≤ 75%', () => {
        const result = computePayoutRatio({
          dividendPerShare: 6,
          earningsPerShare: 10,
        });

        expect(result.risk).toBe("moderate");
        expect(result.isSustainable).toBe(true);
      });

      it('classifica risco como "high" quando payout > 75%', () => {
        const result = computePayoutRatio({
          dividendPerShare: 8,
          earningsPerShare: 10,
        });

        expect(result.risk).toBe("high");
        expect(result.isSustainable).toBe(false);
      });
    });

    describe("limites de classificação (boundaries)", () => {
      it('classifica payout = 50% como "low" e sustentável', () => {
        const result = computePayoutRatio({
          dividendPerShare: 5,
          earningsPerShare: 10,
        });

        expect(result.payoutRatio).toBe(50);
        expect(result.risk).toBe("low");
        expect(result.isSustainable).toBe(true);
      });

      it('classifica payout = 75% como "moderate" e sustentável', () => {
        const result = computePayoutRatio({
          dividendPerShare: 7.5,
          earningsPerShare: 10,
        });

        expect(result.payoutRatio).toBe(75);
        expect(result.risk).toBe("moderate");
        expect(result.isSustainable).toBe(true);
      });

      it('classifica payout = 75.01% como "high" e não sustentável', () => {
        const result = computePayoutRatio({
          dividendPerShare: 7.501,
          earningsPerShare: 10,
        });

        expect(result.payoutRatio).toBe(75.01);
        expect(result.risk).toBe("high");
        expect(result.isSustainable).toBe(false);
      });
    });

    describe("validações", () => {
      it("lança erro quando EPS é zero", () => {
        expect(() =>
          computePayoutRatio({ dividendPerShare: 1, earningsPerShare: 0 }),
        ).toThrow("EPS must be positive");
      });

      it("lança erro quando EPS é negativo", () => {
        expect(() =>
          computePayoutRatio({ dividendPerShare: 1, earningsPerShare: -2 }),
        ).toThrow("EPS must be positive");
      });
    });
  });

  describe("calculatePayoutRatio (HTTP handler)", () => {
    describe("sucesso (200)", () => {
      it("responde com 200 e o resultado completo quando o body é válido", () => {
        const req = mockRequest({ dividendPerShare: 2, earningsPerShare: 5 });
        const res = mockResponse();

        calculatePayoutRatio(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          payoutRatio: 40,
          retentionRatio: 60,
          isSustainable: true,
          risk: "low",
        });
      });
    });

    describe("erro (400)", () => {
      it("responde com 400 quando EPS é zero", () => {
        const req = mockRequest({ dividendPerShare: 1, earningsPerShare: 0 });
        const res = mockResponse();

        calculatePayoutRatio(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "EPS must be positive",
        });
      });

      it("responde com 400 quando EPS é negativo", () => {
        const req = mockRequest({ dividendPerShare: 1, earningsPerShare: -1 });
        const res = mockResponse();

        calculatePayoutRatio(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "EPS must be positive",
        });
      });

      it("responde com 400 quando body não é um objeto", () => {
        const req = mockRequest(undefined);
        const res = mockResponse();

        calculatePayoutRatio(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({ error: expect.any(String) }),
        );
      });
    });
  });
});
