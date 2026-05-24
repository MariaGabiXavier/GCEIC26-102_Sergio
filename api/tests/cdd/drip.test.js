const { calculateDRIP, computeDRIP } = require("../../src/cdd/controllers/drip");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (body) => ({ body });

describe("drip", () => {
  describe("computeDRIP (pure function)", () => {
    describe("happy path", () => {
      it("simula DRIP anual simples por 1 ano sem aportes", () => {
        const result = computeDRIP({
          initialInvestment: 1000,
          annualDividendYield: 10,
          years: 1,
          frequency: 1,
        });

        expect(result.futureValue).toBe(1100);
        expect(result.totalContributed).toBe(1000);
        expect(result.totalDividendsReceived).toBe(100);
        expect(result.totalReturn).toBe(10);
        expect(result.yearByYear).toHaveLength(1);
      });

      it("simula DRIP anual por 3 anos (juros compostos)", () => {
        const result = computeDRIP({
          initialInvestment: 1000,
          annualDividendYield: 10,
          years: 3,
          frequency: 1,
        });

        expect(result.futureValue).toBe(1331);
        expect(result.totalContributed).toBe(1000);
        expect(result.yearByYear).toHaveLength(3);
      });
    });

    describe("frequência de pagamento", () => {
      it("produz valor futuro maior com frequência mensal vs anual", () => {
        const baseInput = {
          initialInvestment: 1000,
          annualDividendYield: 12,
          years: 1,
        };

        const monthly = computeDRIP({ ...baseInput, frequency: 12 });
        const annual = computeDRIP({ ...baseInput, frequency: 1 });

        expect(monthly.futureValue).toBeGreaterThan(annual.futureValue);
      });

      it("simula DRIP trimestral corretamente (4 períodos por ano)", () => {
        const result = computeDRIP({
          initialInvestment: 1000,
          annualDividendYield: 8,
          years: 1,
          frequency: 4,
        });

        const expected = 1000 * Math.pow(1 + 0.08 / 4, 4);
        expect(result.futureValue).toBeCloseTo(expected, 2);
      });
    });

    describe("parâmetros opcionais", () => {
      it("usa default 0 para growth e contribution quando omitidos", () => {
        const result = computeDRIP({
          initialInvestment: 1000,
          annualDividendYield: 5,
          years: 2,
          frequency: 1,
        });

        expect(result.totalContributed).toBe(1000);
      });

      it("soma aportes mensais corretamente com frequency=12", () => {
        const result = computeDRIP({
          initialInvestment: 0,
          annualDividendYield: 0,
          years: 1,
          frequency: 12,
          monthlyContribution: 100,
        });

        expect(result.totalContributed).toBe(1200);
        expect(result.futureValue).toBe(1200);
        expect(result.totalDividendsReceived).toBe(0);
      });

      it("agrega aportes mensais por período quando frequency=1", () => {
        const result = computeDRIP({
          initialInvestment: 0,
          annualDividendYield: 0,
          years: 1,
          frequency: 1,
          monthlyContribution: 100,
        });

        expect(result.totalContributed).toBe(1200);
      });

      it("aumenta dividendos ano a ano quando annualDividendGrowth > 0", () => {
        const result = computeDRIP({
          initialInvestment: 1000,
          annualDividendYield: 5,
          years: 2,
          frequency: 1,
          annualDividendGrowth: 10,
        });

        expect(result.yearByYear[1].dividends).toBeGreaterThan(
          result.yearByYear[0].dividends,
        );
      });

      it("aplica crescimento de cotas (annualShareGrowth) ao valor final do ano", () => {
        const result = computeDRIP({
          initialInvestment: 1000,
          annualDividendYield: 0,
          years: 1,
          frequency: 1,
          annualShareGrowth: 10,
        });

        expect(result.futureValue).toBe(1100);
        expect(result.totalDividendsReceived).toBe(0);
      });
    });

    describe("estrutura do yearByYear", () => {
      it("retorna um item por ano com os campos year, value, dividends, contributed", () => {
        const result = computeDRIP({
          initialInvestment: 1000,
          annualDividendYield: 5,
          years: 3,
          frequency: 1,
        });

        result.yearByYear.forEach((entry, index) => {
          expect(entry).toEqual(
            expect.objectContaining({
              year: index + 1,
              value: expect.any(Number),
              dividends: expect.any(Number),
              contributed: expect.any(Number),
            }),
          );
        });
      });

      it("mantém contributed monotonicamente crescente com aportes", () => {
        const result = computeDRIP({
          initialInvestment: 1000,
          annualDividendYield: 5,
          years: 3,
          frequency: 12,
          monthlyContribution: 100,
        });

        for (let i = 1; i < result.yearByYear.length; i++) {
          expect(result.yearByYear[i].contributed).toBeGreaterThan(
            result.yearByYear[i - 1].contributed,
          );
        }
      });
    });

    describe("retorno total", () => {
      it("calcula totalReturn como ((futureValue / totalContributed) - 1) * 100", () => {
        const result = computeDRIP({
          initialInvestment: 1000,
          annualDividendYield: 10,
          years: 1,
          frequency: 1,
        });

        const expected =
          (result.futureValue / result.totalContributed - 1) * 100;
        expect(result.totalReturn).toBeCloseTo(expected, 2);
      });

      it("mantém a fórmula de retorno quando há aportes", () => {
        const result = computeDRIP({
          initialInvestment: 1000,
          annualDividendYield: 8,
          years: 2,
          frequency: 12,
          monthlyContribution: 50,
        });

        const expected =
          (result.futureValue / result.totalContributed - 1) * 100;
        expect(Math.abs(result.totalReturn - expected)).toBeLessThan(0.01);
      });
    });

    describe("edge cases", () => {
      it("retorna estado inicial quando years = 0", () => {
        const result = computeDRIP({
          initialInvestment: 1000,
          annualDividendYield: 10,
          years: 0,
          frequency: 1,
        });

        expect(result.yearByYear).toEqual([]);
        expect(result.futureValue).toBe(1000);
        expect(result.totalContributed).toBe(1000);
        expect(result.totalDividendsReceived).toBe(0);
        expect(result.totalReturn).toBe(0);
      });

      it("arredonda todos os campos numéricos a 2 casas decimais", () => {
        const result = computeDRIP({
          initialInvestment: 1000,
          annualDividendYield: 7,
          years: 2,
          frequency: 12,
          monthlyContribution: 33,
        });

        const hasMaxTwoDecimals = (n) => {
          const str = n.toString();
          const dot = str.indexOf(".");
          return dot === -1 || str.length - dot - 1 <= 2;
        };

        expect(hasMaxTwoDecimals(result.futureValue)).toBe(true);
        expect(hasMaxTwoDecimals(result.totalContributed)).toBe(true);
        expect(hasMaxTwoDecimals(result.totalDividendsReceived)).toBe(true);
        expect(hasMaxTwoDecimals(result.totalReturn)).toBe(true);
        result.yearByYear.forEach((entry) => {
          expect(hasMaxTwoDecimals(entry.value)).toBe(true);
          expect(hasMaxTwoDecimals(entry.dividends)).toBe(true);
          expect(hasMaxTwoDecimals(entry.contributed)).toBe(true);
        });
      });
    });
  });

  describe("calculateDRIP (HTTP handler)", () => {
    describe("sucesso", () => {
      it("responde com o resultado em JSON quando o body é válido", () => {
        const req = mockRequest({
          initialInvestment: 1000,
          annualDividendYield: 10,
          years: 1,
          frequency: 1,
        });
        const res = mockResponse();

        calculateDRIP(req, res);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            futureValue: 1100,
            totalContributed: 1000,
            totalDividendsReceived: 100,
            totalReturn: 10,
            yearByYear: expect.any(Array),
          }),
        );
      });
    });

    describe("erro (400)", () => {
      it("responde com 400 e mensagem genérica quando body é undefined", () => {
        const req = mockRequest(undefined);
        const res = mockResponse();

        calculateDRIP(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid input data" });
      });
    });
  });
});
