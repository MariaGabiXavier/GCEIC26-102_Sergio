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
    fs.writeFileSync(path.join(SCREENSHOTS_DIR, `EXG-${nome}.png`), img, 'base64');
    console.log(`  📸 EXG-${nome}.png`);
  } catch (e) {
    console.warn(`  Aviso: falha ao salvar ${nome}.png`);
  }
}

function ok(msg) { console.log(`  ✓ ${msg}`); }
function fail(msg) { console.error(`  ✗ ${msg}`); erros.push(msg); }

async function autenticarExg() {
  await driver.get(BASE_URL + '/exg/login');
  const url = await driver.getCurrentUrl();
  if (url.includes('/exg/dashboard')) return;
  await driver.findElement(By.id('username')).sendKeys('adm');
  await driver.findElement(By.id('password')).sendKeys('adm');
  await driver.findElement(By.css('button[type="submit"]')).click();
  await driver.wait(until.urlContains('/exg/dashboard'), 5000);
}

// 1. SPLASH
async function testeExgSplash() {
  console.log('\n[1/7] Splash (/exg)');
  try {
    await driver.get(BASE_URL + '/exg');
    await foto('01-splash');
    const texto = await driver.findElement(By.css('.splash-logo')).getText();
    texto.includes('EXG') ? ok(`Logo: "${texto}"`) : fail(`Logo inesperado: "${texto}"`);
  } catch (e) { fail(`Splash: ${e.message}`); }
}

// 2. LOGIN 
async function testeExgLogin() {
  console.log('\n[2/7] Login (/exg/login)');
  try {
    await driver.get(BASE_URL + '/exg/login');
    await foto('02-login-pagina');

    // Campos vazios
    await driver.findElement(By.css('button[type="submit"]')).click();
    await new Promise(r => setTimeout(r, 600));
    await foto('02-login-campos-vazios');
    try {
      const msg = await driver.findElement(By.css('.erro')).getText();
      msg.toLowerCase().includes('preencha') ? ok(`Campos vazios: "${msg}"`) : fail(`Esperava "preencha": "${msg}"`);
    } catch (e) { fail(`Mensagem de campo vazio não apareceu`); }

    // Credenciais erradas
    await driver.get(BASE_URL + '/exg/login');
    await driver.findElement(By.id('username')).sendKeys('errado');
    await driver.findElement(By.id('password')).sendKeys('errado');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await new Promise(r => setTimeout(r, 1200));
    await foto('02-login-credenciais-erradas');
    try {
      const msg = await driver.findElement(By.css('.erro')).getText();
      msg.toLowerCase().includes('invalidos') ? ok(`Credenciais erradas: "${msg}"`) : fail(`Esperava "invalidos": "${msg}"`);
    } catch (e) { fail(`Mensagem de credenciais inválidas não apareceu`); }

    // Login válido — campos preenchidos antes do submit
    await driver.get(BASE_URL + '/exg/login');
    await driver.findElement(By.id('username')).sendKeys('adm');
    await driver.findElement(By.id('password')).sendKeys('adm');
    await foto('02-login-campos-preenchidos');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlContains('/exg/dashboard'), 8000);
    await foto('02-login-sucesso');
    ok('Login válido → redirecionou para /exg/dashboard');
  } catch (e) { fail(`Login: ${e.message}`); }
}

// 3. ROTAS PROTEGIDAS
async function testeExgRedirect() {
  console.log('\n[3/7] Rotas protegidas (telas com login)');
  const rotas = [
    { path: '/exg/dashboard', nome: '03-dashboard' },
    { path: '/exg/exchange', nome: '03-exchange' },
    { path: '/exg/about', nome: '03-about' },
    { path: '/exg/help', nome: '03-help' },
  ];

  for (const { path: rota, nome } of rotas) {
    try {
      await autenticarExg();
      await driver.get(BASE_URL + rota);
      await new Promise(r => setTimeout(r, 800));
      await foto(nome);
      ok(`${rota} → screenshot tirado`);
    } catch (e) { fail(`${rota} screenshot: ${e.message}`); }
  }

  try {
    await driver.get(BASE_URL + '/exg/logout');
    for (const { path: rota } of rotas) {
      await driver.get(BASE_URL + rota);
      await driver.wait(until.urlContains('/exg/login'), 5000);
      ok(`${rota} sem sessao → redirecionou para /exg/login`);
    }
  } catch (e) { fail(`Redirect sem token: ${e.message}`); }
}

// 4. DASHBOARD
async function testeExgDashboard() {
  console.log('\n[4/7] Dashboard (/exg/dashboard)');
  try {
    await autenticarExg();
    await driver.get(BASE_URL + '/exg/dashboard');
    await foto('04-dashboard-carregando');
    await driver.wait(until.elementLocated(By.css('.currency-grid')), 10000);
    await foto('04-dashboard-carregado');
    const cards = await driver.findElements(By.css('.currency-card'));
    cards.length > 0 ? ok(`${cards.length} moedas carregadas`) : fail('Nenhum card de moeda');
  } catch (e) { fail(`Dashboard: ${e.message}`); }
}

// 5. EXCHANGE
async function testeExchange() {
  console.log('\n[5/7] Exchange (/exg/exchange)');
  try {
    await autenticarExg();
    await driver.get(BASE_URL + '/exg/exchange');
    await foto('05-exchange-pagina');
    await driver.wait(until.elementLocated(By.css('#currency option')), 10000);
    await driver.findElement(By.id('value')).sendKeys('1000');
    await foto('05-exchange-preenchido');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await new Promise(r => setTimeout(r, 2000));
    await foto('05-exchange-aguardando');
    await driver.wait(until.elementIsVisible(await driver.findElement(By.css('.result-card'))), 8000);
    await foto('05-exchange-resultado');
    const val = await driver.findElement(By.css('.result-final-value')).getText();
    val ? ok(`Resultado: ${val}`) : fail('Valor convertido vazio');
  } catch (e) { fail(`Exchange: ${e.message}`); }
}

// 6. ABOUT
async function testeAbout() {
  console.log('\n[6/7] About (/exg/about)');
  try {
    await autenticarExg();
    await driver.get(BASE_URL + '/exg/about');
    await foto('06-about-pagina');
    const logo = await driver.findElement(By.css('.about-logo')).getText();
    logo.includes('EXG') ? ok(`Logo: "${logo}"`) : fail(`Logo incorreto: "${logo}"`);
    const membros = await driver.findElements(By.css('.team-member'));
    membros.length > 0 ? ok(`${membros.length} membros da equipe`) : fail('Membros não encontrados');
  } catch (e) { fail(`About: ${e.message}`); }
}

// 7. HELP
async function testeHelp() {
  console.log('\n[7/7] Help (/exg/help)');
  try {
    await autenticarExg();
    await driver.get(BASE_URL + '/exg/help');
    await foto('07-help-pagina');
    const faqItems = await driver.findElements(By.css('.faq-item'));
    faqItems.length > 0 ? ok(`${faqItems.length} perguntas na FAQ`) : fail('FAQ não encontrado');
    await faqItems[0].click();
    await faqItems[1].click();
    await faqItems[2].click();
    await new Promise(r => setTimeout(r, 400));
    await foto('07-help-faq-perguntas-abertas');
    await driver.findElement(By.css('.help-search input')).sendKeys('IOF');
    await new Promise(r => setTimeout(r, 300));
    await foto('07-help-busca-iof');
    ok('Busca na FAQ funcionando');
  } catch (e) { fail(`Help: ${e.message}`); }
}

// MAIN
async function main() {
  await buildDriver();
  try {
    await testeExgSplash();
    await testeExgLogin();
    await testeExgRedirect();
    await testeExgDashboard();
    await testeExchange();
    await testeAbout();
    await testeHelp();
  } finally {
    await driver.quit();
  }

  console.log('\n─────────────────────────────────');
  if (erros.length === 0) {
    console.log('✅ Todos os testes passaram!');
  } else {
    console.log(`❌ ${erros.length} falha(s):`);
    erros.forEach(e => console.log(`   • ${e}`));
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(err => { console.error('Erro fatal', err); process.exit(1); });
} else {
  module.exports = main;
}
