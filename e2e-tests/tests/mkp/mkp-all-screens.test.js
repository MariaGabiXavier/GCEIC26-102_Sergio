const { buildDriver } = require('./helpers');
const runSplashTest = require('./splash.test.js');
const runLoginInvalidoTest = require('./login-invalido.test.js');
const runLoginValidoTest = require('./login-valido.test.js');
const runDashboardTest = require('./dashboard.test.js');
const runCalculadoraTest = require('./calculadora.test.js');
const runSobreTest = require('./sobre.test.js');
const runHelpTest = require('./help.test.js');

module.exports = async function runMkpTests() {
  console.log('Iniciando os testes funcionais E2E do MKP (Selenium)...');
  const driver = await buildDriver();

  try {
    console.log('\n1. Testando Splash Screen...');
    await runSplashTest(driver);

    console.log('\n2. Testando Login com Credenciais InvÃ¡lidas...');
    await runLoginInvalidoTest(driver);

    console.log('\n3. Testando Login com Credenciais VÃ¡lidas...');
    await runLoginValidoTest(driver);

    console.log('\n4. Testando Carregamento do Dashboard...');
    await runDashboardTest(driver);

    console.log('\n5. Testando Calculadora de Markup...');
    await runCalculadoraTest(driver);

    console.log('\n6. Testando Tela Sobre a Equipe...');
    await runSobreTest(driver);

    console.log('\n7. Testando Central de Ajuda...');
    await runHelpTest(driver);

    console.log('\nTodos os testes funcionais do MKP passaram com sucesso!');
  } finally {
    console.log('Encerrando driver do Selenium...');
    await driver.quit();
  }
};
