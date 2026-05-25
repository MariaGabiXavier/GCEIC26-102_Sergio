const { buildDriver } = require('./helpers');

const { splashTest } = require('./splash.test');
const { loginTest } = require('./login.test');
const { protectedRoutesTest } = require('./protected-redirect.test');
const { dashboardTest } = require('./dashboard.test');
const { financiamentoTest } = require('./financiamento.test');
const { jurosTest } = require('./juros.test');
const { fundoTest } = require('./fundo.test');
const { regraTest } = require('./regra.test');
const { aboutTest } = require('./about.test');

async function main() {
    let driver;

    try {
        driver = await buildDriver();

        await driver.manage().window().setRect({
            width: 1400,
            height: 900
        });

        console.log("🚀 Iniciando suíte de testes Financecar...");

        await splashTest(driver);
        await loginTest(driver);
        await dashboardTest(driver);
        await financiamentoTest(driver);
        await jurosTest(driver);
        await fundoTest(driver);
        await regraTest(driver);
        await aboutTest(driver);

        console.log("✅ Todos os testes passaram!");

    } catch (err) {
        console.error("❌ Erro nos testes:", err);
    } finally {
        if (driver) await driver.quit();
    }
}

main();