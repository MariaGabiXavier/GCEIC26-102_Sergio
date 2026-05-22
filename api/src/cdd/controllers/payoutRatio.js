"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computePayoutRatio = computePayoutRatio;
exports.calculatePayoutRatio = calculatePayoutRatio;
/**
 * Calcula o Payout Ratio (proporção do lucro distribuído como dividendo) e
 * o Retention Ratio (parcela retida), além de classificar o risco da política
 * de dividendos como low, moderate ou high, e indicar se ela é sustentável
 * (payout <= 75%). Lança erro se o EPS for não-positivo.
 */
function computePayoutRatio(input) {
    const { dividendPerShare, earningsPerShare } = input;
    if (earningsPerShare <= 0)
        throw new Error('EPS must be positive');
    const payoutRatio = (dividendPerShare / earningsPerShare) * 100;
    const retentionRatio = 100 - payoutRatio;
    const isSustainable = payoutRatio <= 75;
    const risk = payoutRatio <= 50 ? 'low' : payoutRatio <= 75 ? 'moderate' : 'high';
    return {
        payoutRatio: parseFloat(payoutRatio.toFixed(2)),
        retentionRatio: parseFloat(retentionRatio.toFixed(2)),
        isSustainable,
        risk,
    };
}
/**
 * Handler HTTP do endpoint de Payout Ratio. Lê os dados de `req.body`,
 * delega o cálculo para `computePayoutRatio` e responde com 200 + resultado
 * em caso de sucesso, ou 400 + mensagem de erro em caso de entrada inválida.
 */
function calculatePayoutRatio(req, res) {
    try {
        const result = computePayoutRatio(req.body);
        res.status(200).json(result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        res.status(400).json({ error: message });
    }
}
//# sourceMappingURL=payoutRatio.js.map