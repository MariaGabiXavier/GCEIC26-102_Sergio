"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dividendYield_1 = require("../controllers/dividendYield");
const payoutRatio_1 = require("../controllers/payoutRatio");
const drip_1 = require("../controllers/drip");
const login_1 = require("../controllers/login");
const router = (0, express_1.Router)();
router.post('/calculate/yield', dividendYield_1.calculateDividendYield);
router.post('/calculate/payout', payoutRatio_1.calculatePayoutRatio);
router.post('/calculate/drip', drip_1.calculateDRIP);
router.post('/login', login_1.login);
exports.default = router;
//# sourceMappingURL=dividendRouter.js.map