const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

let driver;
const erros = [];

async function buildDriver() {
  const opts = new chrome.Options();
  opts.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--window-size=1280,800', '--disable-gpu');
  driver = await new Builder().forBrowser('chrome').setChromeOptions(opts).build();
  await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 15000 });
}

async function foto(nome) {
  try {
    const img = await driver.takeScreenshot();
    fs.writeFileSync(path.join(SCREENSHOTS_DIR, `CLT-${nome}.png`), img, 'base64');
    console.log(`  Foto: CLT-${nome}.png`);
  } catch (e) {
    console.warn(`  Aviso: falha ao salvar ${nome}.png`);
  }
}

function ok(msg) {
  console.log(`  OK ${msg}`);
}

function fail(msg) {
  console.error(`  ERRO ${msg}`);
  erros.push(msg);
}

async function autenticarClt() {
  await driver.get(BASE_URL + '/clt/login');
  const url = await driver.getCurrentUrl();
  if (url.includes('/clt/dashboard')) return;
  await driver.findElement(By.id('username')).sendKeys('adm');
  await driver.findElement(By.id('password')).sendKeys('adm');
  await driver.findElement(By.css('button[type="submit"]')).click();
  await driver.wait(until.urlContains('/clt/dashboard'), 5000);
}

async function testeSplash() {
  console.log('\n[CLT 1/6] Splash');
  try {
    await driver.get(BASE_URL + '/clt');
    await foto('01-splash');
    const logo = await driver.findElement(By.css('.splash-logo')).getText();
    logo.includes('CLT+') ? ok(`Logo: ${logo}`) : fail(`Logo inesperado: ${logo}`);
  } catch (e) {
    fail(`Splash: ${e.message}`);
  }
}

async function testeLogin() {
  console.log('\n[CLT 2/6] Login');
  try {
    await driver.get(BASE_URL + '/clt/login');
    await foto('02-login-pagina');

    await driver.findElement(By.css('button[type="submit"]')).click();
    await new Promise((r) => setTimeout(r, 600));
    await foto('02-login-campos-vazios');
    const urlVazia = await driver.getCurrentUrl();
    urlVazia.includes('/clt/login') ? ok('Campos vazios mantem usuario no login') : fail(`Campos vazios mudaram a URL: ${urlVazia}`);

    await driver.get(BASE_URL + '/clt/login');
    await driver.findElement(By.id('username')).sendKeys('errado');
    await driver.findElement(By.id('password')).sendKeys('errado');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await new Promise((r) => setTimeout(r, 600));
    await foto('02-login-credenciais-erradas');
    const erro = await driver.findElement(By.css('.erro')).getText();
    erro.toLowerCase().includes('inválidos') ? ok('Credenciais inválidas exibidas') : fail(`Mensagem inesperada: ${erro}`);

    await driver.get(BASE_URL + '/clt/login');
    await driver.findElement(By.id('username')).sendKeys('adm');
    await driver.findElement(By.id('password')).sendKeys('adm');
    await foto('02-login-campos-preenchidos');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlContains('/clt/dashboard'), 5000);
    await foto('02-login-sucesso');
    const url = await driver.getCurrentUrl();
    url.includes('/clt/dashboard') ? ok('Login válido redirecionou') : fail(`URL inesperada: ${url}`);
  } catch (e) {
    fail(`Login: ${e.message}`);
  }
}

async function testeRotasProtegidas() {
  console.log('\n[CLT 3/6] Rotas protegidas');
  try {
    await driver.get(BASE_URL + '/clt/logout');
    await driver.get(BASE_URL + '/clt/calculadora');
    await driver.wait(until.urlContains('/clt/login'), 5000);
    ok('Calculadora sem sessão redireciona para login');
  } catch (e) {
    fail(`Protecao: ${e.message}`);
  }
}

async function testeDashboard() {
  console.log('\n[CLT 4/6] Dashboard');
  try {
    await autenticarClt();
    await driver.get(BASE_URL + '/clt/dashboard');
    await foto('04-dashboard');
    const cards = await driver.findElements(By.css('.metric'));
    cards.length >= 3 ? ok(`${cards.length} cards encontrados`) : fail('Cards principais não encontrados');
  } catch (e) {
    fail(`Dashboard: ${e.message}`);
  }
}

async function testeCalculadora() {
  console.log('\n[CLT 5/6] Calculadora');
  try {
    await autenticarClt();
    await driver.get(BASE_URL + '/clt/calculadora');
    await foto('05-calculadora-form');
    await driver.findElement(By.id('salarioBruto')).sendKeys('3000');
    await driver.findElement(By.id('receitaGerada')).sendKeys('8000');
    await driver.findElement(By.id('valeTransporte')).sendKeys('250');
    await driver.findElement(By.id('valeRefeicao')).sendKeys('600');
    await driver.findElement(By.id('planoSaude')).sendKeys('250');
    await driver.findElement(By.id('gympass')).sendKeys('80');
    await driver.findElement(By.id('submitBtn')).click();
    await driver.wait(until.elementLocated(By.css('.status-pill')), 8000);
    await foto('05-calculadora-resultado');
    const texto = await driver.findElement(By.css('.status-pill')).getText();
    texto ? ok(`Resultado exibido: ${texto}`) : fail('Status vazio');
  } catch (e) {
    fail(`Calculadora: ${e.message}`);
  }
}

async function testeAboutHelp() {
  console.log('\n[CLT 6/6] Sobre e ajuda');
  try {
    await autenticarClt();
    await driver.get(BASE_URL + '/clt/about');
    await foto('06-about');
    const membros = await driver.findElements(By.css('.team-member'));
    membros.length >= 3 ? ok('Equipe exibida') : fail('Equipe não encontrada');

    await driver.get(BASE_URL + '/clt/help');
    await foto('07-help');
    const texto = await driver.findElement(By.css('.hero h1')).getText();
    texto.toLowerCase().includes('ajuda') ? ok('Ajuda exibida') : fail(`Titulo inesperado: ${texto}`);
  } catch (e) {
    fail(`Sobre/Ajuda: ${e.message}`);
  }
}

async function main() {
  await buildDriver();
  try {
    await testeSplash();
    await testeLogin();
    await testeRotasProtegidas();
    await testeDashboard();
    await testeCalculadora();
    await testeAboutHelp();
  } finally {
    await driver.quit();
  }

  if (erros.length > 0) {
    erros.forEach((erro) => console.error(` - ${erro}`));
    process.exit(1);
  }
  console.log('\nTodos os testes CLT passaram.');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Erro fatal CLT', err);
    process.exit(1);
  });
} else {
  module.exports = main;
}
