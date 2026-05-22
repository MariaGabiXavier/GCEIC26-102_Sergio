"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeDRIP = computeDRIP;
exports.calculateDRIP = calculateDRIP;
/**
 * Simula um plano DRIP (Dividend Reinvestment Plan) ao longo de N anos com
 * pagamentos na frequência indicada (anual, trimestral ou mensal), aplicando
 * opcionalmente crescimento anual de dividendos, de número de cotas e aportes
 * mensais recorrentes. Os aportes são agrupados por período de pagamento e
 * já participam dos dividendos do próprio período. O retorno total é
 * calculado sobre o capital efetivamente aportado (inicial + aportes).
 */
function computeDRIP(input) {
    const { initialInvestment, annualDividendYield, years, frequency, annualDividendGrowth = 0, annualShareGrowth = 0, monthlyContribution = 0 } = input;
    let currentValue = initialInvestment;
    let currentYield = annualDividendYield / 100;
    let totalDividends = 0;
    let totalContributed = initialInvestment;
    const contributionPerPeriod = monthlyContribution * (12 / frequency);
    const yearByYear = [];
    for (let year = 1; year <= years; year++) {
        const periodYield = currentYield / frequency;
        let yearDivs = 0;
        for (let p = 0; p < frequency; p++) {
            currentValue += contributionPerPeriod;
            totalContributed += contributionPerPeriod;
            const periodDivs = currentValue * periodYield;
            currentValue += periodDivs;
            yearDivs += periodDivs;
        }
        currentValue *= (1 + annualShareGrowth / 100);
        currentYield *= (1 + annualDividendGrowth / 100);
        totalDividends += yearDivs;
        yearByYear.push({
            year,
            value: parseFloat(currentValue.toFixed(2)),
            dividends: parseFloat(yearDivs.toFixed(2)),
            contributed: parseFloat(totalContributed.toFixed(2)),
        });
    }
    return {
        futureValue: parseFloat(currentValue.toFixed(2)),
        totalContributed: parseFloat(totalContributed.toFixed(2)),
        totalDividendsReceived: parseFloat(totalDividends.toFixed(2)),
        totalReturn: parseFloat(((currentValue / totalContributed - 1) * 100).toFixed(2)),
        yearByYear,
    };
}
/**
 * Handler HTTP do endpoint DRIP. Lê os dados de `req.body`, delega a simulação
 * para `computeDRIP` e responde com o resultado em JSON, ou 400 + mensagem
 * de erro em caso de entrada inválida.
 */
function calculateDRIP(req, res) {
    try {
        const input = req.body;
        const result = computeDRIP(input);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid input data' });
    }
}
//# sourceMappingURL=drip.js.map