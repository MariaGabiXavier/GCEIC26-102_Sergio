const express = require('express');
const router = express.Router();

router.post('/valida-limite', (req, res) => {
    const { receitaComercio, receitaServicos, mesesAtivos } = req.body;
    const receitaTotal = Number(receitaComercio) + Number(receitaServicos);
    const limitePermitido = Number(mesesAtivos) * 6750;
    const excedeuLimite = receitaTotal > limitePermitido;
    const valorExcedido = excedeuLimite ? receitaTotal - limitePermitido : 0;
    res.json({ receitaTotal, limitePermitido, excedeuLimite, valorExcedido });
});

router.post('/multa-atraso', (req, res) => {
    const { mesesAtraso } = req.body;
    const taxaMensal = 0.02;
    const impostoMensal = 70.00;
    let multa = (impostoMensal * taxaMensal) * Number(mesesAtraso);
    if (multa < 50.00 && Number(mesesAtraso) > 0) multa = 50.00;
    res.json({ multa });
});

router.post('/lucro-isento', (req, res) => {
    const { receitaServicos, despesas } = req.body;
    const presuncao = Number(receitaServicos) * 0.32;
    const lucroReal = Number(receitaServicos) - Number(despesas);
    const lucroTributavel = lucroReal - presuncao;
    res.json({ presuncao, lucroReal, lucroTributavel });
});

module.exports = router;