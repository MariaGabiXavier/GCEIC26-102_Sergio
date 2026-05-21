const { Builder, By, until, Key } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.APP_URL || "http://localhost:3000";
const SCREENSHOTS_DIR = path.join(__dirname, "..", "..", "screenshots");

if (!fs.existsSync(SCREENSHOTS_DIR))
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

let driver;
const erros = [];

async function buildDriver() {
  const opts = new chrome.Options();
  opts.addArguments(
    "--headless=new",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--window-size=1280,800",
    "--disable-gpu",
  );
  driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(opts)
    .build();
  await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 15000 });
}

async function foto(nome) {
  try {
    const img = await driver.takeScreenshot();
    fs.writeFileSync(
      path.join(SCREENSHOTS_DIR, `CDD-${nome}.png`),
      img,
      "base64",
    );
    console.log(`  📸 CDD-${nome}.png`);
  } catch (e) {
    console.warn(`  Aviso: falha ao salvar ${nome}.png`);
  }
}

function ok(msg) {
  console.log(`  ✓ ${msg}`);
}
function fail(msg) {
  console.error(`  ✗ ${msg}`);
  erros.push(msg);
}

async function pause(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function clearAndType(id, value) {
  await driver.executeScript(
    `
    const el = document.getElementById(arguments[0]);
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    ).set;
    nativeSetter.call(el, arguments[1]);
    const reactPropsKey = Object.keys(el).find(k => k.startsWith('__reactProps'));
    if (reactPropsKey && el[reactPropsKey] && el[reactPropsKey].onChange) {
      el[reactPropsKey].onChange({ target: el, currentTarget: el });
    }
  `,
    id,
    value,
  );
  await pause(100);
}

async function reactClick(id) {
  await driver.executeScript(
    `
    const el = document.getElementById(arguments[0]);
    const reactPropsKey = Object.keys(el).find(k => k.startsWith('__reactProps'));
    if (reactPropsKey && el[reactPropsKey] && el[reactPropsKey].onClick) {
      el[reactPropsKey].onClick({
        target: el, currentTarget: el,
        preventDefault: () => {}, stopPropagation: () => {}
      });
    } else {
      el.click();
    }
  `,
    id,
  );
  await pause(200);
}

async function clickTab(id) {
  await driver.executeScript(
    `
        const tab = document.getElementById(arguments[0]);
        // Full sequence of events for a mouse click
        tab.focus();
        tab.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1, button: 0 }));
        tab.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 }));
        tab.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerId: 1, button: 0 }));
        tab.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, button: 0 }));
        tab.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
      `,
    id,
  );
  await pause(200);
}

async function autenticarCdd() {
  // Se o nav-dashboard já existe na tela atual, significa que já estamos logados!
  try {
    const navs = await driver.findElements(By.id("nav-dashboard"));
    if (navs.length > 0) {
      return; 
    }
  } catch (e) {}

  await driver.get(BASE_URL + "/cdd");
  
  await driver.wait(
    until.elementLocated(By.css('button[type="submit"]')),
    8000,
  );
  const url = await driver.getCurrentUrl();
  if (!url.includes("/cdd")) return;

  try {
    await clearAndType("username", "usuario1");
    await clearAndType("password", "1234");
  } catch {
    // Caso os ids não existam, tentamos com o executeScript e seletores CSS
    await driver.executeScript(`
      function setReactVal(selector, val) {
        const el = document.querySelector(selector);
        if(!el) return;
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(el, val);
        const reactPropsKey = Object.keys(el).find(k => k.startsWith('__reactProps'));
        if (reactPropsKey && el[reactPropsKey] && el[reactPropsKey].onChange) {
          el[reactPropsKey].onChange({ target: el, currentTarget: el });
        }
      }
      setReactVal('input[type="text"], input[name="login"]', 'usuario1');
      setReactVal('input[type="password"]', '1234');
    `);
    await pause(100);
  }
  await driver.findElement(By.css('button[type="submit"]')).click();
  await driver.wait(until.elementLocated(By.id("nav-dashboard")), 8000);
}

// 1. LOGIN
async function testeCddLogin() {
  console.log("\n[1/6] Login (/cdd)");
  try {
    await driver.get(BASE_URL + "/cdd");
    await foto("01-login-pagina");

    // Credenciais erradas
    try {
      await driver.findElement(By.id("login-input")).sendKeys("errado");
      await driver.findElement(By.id("password-input")).sendKeys("errado");
    } catch {
      await driver
        .findElement(By.css('input[type="text"], input[name="login"]'))
        .sendKeys("errado");
      await driver
        .findElement(By.css('input[type="password"]'))
        .sendKeys("errado");
    }
    await driver.findElement(By.css('button[type="submit"]')).click();
    await pause(800);
    await foto("01-login-credenciais-erradas");
    try {
      const msg = await driver
        .findElement(By.css('.erro, [class*="error"], [class*="Error"]'))
        .getText();
      msg
        ? ok(`Erro exibido: "${msg}"`)
        : fail("Mensagem de erro não apareceu");
    } catch {
      fail("Elemento de erro não encontrado");
    }

    // Login válido
    await driver.get(BASE_URL + "/cdd");
    try {
      await driver.findElement(By.id("login-input")).sendKeys("usuario1");
      await driver.findElement(By.id("password-input")).sendKeys("1234");
    } catch {
      await driver
        .findElement(By.css('input[type="text"], input[name="login"]'))
        .sendKeys("usuario1");
      await driver
        .findElement(By.css('input[type="password"]'))
        .sendKeys("1234");
    }
    await foto("01-login-campos-preenchidos");
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.elementLocated(By.id("nav-dashboard")), 8000);
    await foto("01-login-sucesso");
    ok("Login válido → dashboard carregado");
  } catch (e) {
    fail(`Login: ${e.message}`);
  }
}

// 2. DASHBOARD
async function testeCddDashboard() {
  console.log("\n[2/6] Dashboard");
  try {
    await autenticarCdd();
    await clickTab("nav-dashboard");
    await driver.wait(until.elementLocated(By.id("dashboard-heading")), 8000);
    await pause(300);
    await foto("02-dashboard");
    const heading = await driver
      .findElement(By.id("dashboard-heading"))
      .getText();
    heading.toLowerCase().includes("dashboard")
      ? ok(`Heading: "${heading}"`)
      : fail(`Heading inesperado: "${heading}"`);
    const cards = await driver.findElements(By.css("#historico-list h3"));
    cards.length >= 1
      ? ok(`Histórico com ${cards.length} card(s)`)
      : fail(`Histórico vazio`);
  } catch (e) {
    fail(`Dashboard: ${e.message}`);
  }
}

// 3. CALCULATOR — DIVIDEND YIELD
async function testeCddCalculatorDY() {
  console.log("\n[3/6] Calculator — Dividend Yield");
  try {
    await autenticarCdd();
    await clickTab("nav-calculators");
    await driver.wait(until.elementLocated(By.id("tab-yield")), 8000);
    await clickTab("tab-yield");
    await pause(300);
    await foto("03-calculator-dy-inicial");

    await clearAndType("dy-dividend", "2.80");
    await clearAndType("dy-price", "32.50");
    await pause(200);
    await reactClick("dy-calcular");

    await driver.wait(until.elementLocated(By.id("dy-result")), 10000);
    await pause(500);
    const value = await driver.findElement(By.id("dy-result-value")).getText();
    const cls = await driver.findElement(By.id("dy-result-class")).getText();
    await foto("03-calculator-dy-resultado");

    value.includes("8.62")
      ? ok(`DY: ${value}`)
      : fail(`DY esperado 8.62%, obtido "${value}"`);
    cls.toLowerCase().includes("high")
      ? ok(`Classe: ${cls}`)
      : fail(`Classe esperada 'high', obtida: "${cls}"`);
  } catch (e) {
    fail(`Calculator DY: ${e.message}`);
  }
}

// 4. CALCULATOR — PAYOUT RATIO
async function testeCddCalculatorPayout() {
  console.log("\n[4/6] Calculator — Payout Ratio");
  try {
    await clickTab("tab-payout");
    await driver.wait(until.elementLocated(By.id("payout-dps")), 8000);
    await pause(200);

    await clearAndType("payout-dps", "2.50");
    await clearAndType("payout-eps", "4.00");
    await reactClick("payout-calcular");

    await driver.wait(until.elementLocated(By.id("payout-result")), 8000);
    await pause(200);
    const payout = await driver.findElement(By.id("payout-value")).getText();
    const ret = await driver.findElement(By.id("payout-retention")).getText();
    const risk = await driver.findElement(By.id("payout-risk")).getText();
    const status = await driver.findElement(By.id("payout-status")).getText();
    await foto("04-calculator-payout-resultado");

    payout.includes("62.5")
      ? ok(`Payout: ${payout}`)
      : fail(`Payout esperado 62.5%, obtido "${payout}"`);
    ret.includes("37.5")
      ? ok(`Retention: ${ret}`)
      : fail(`Retention esperado 37.5%, obtido "${ret}"`);
    risk.toLowerCase().includes("moderate")
      ? ok(`Risk: ${risk}`)
      : fail(`Risco esperado 'moderate', obtido: "${risk}"`);
    status.toLowerCase().includes("sustent")
      ? ok(`Status: ${status}`)
      : fail(`Status esperado 'Sustentável', obtido: "${status}"`);
  } catch (e) {
    fail(`Calculator Payout: ${e.message}`);
  }
}

// 5. CALCULATOR — DRIP
async function testeCddCalculatorDRIP() {
  console.log("\n[5/6] Calculator — DRIP");
  try {
    await clickTab("tab-drip");
    await driver.wait(until.elementLocated(By.id("drip-initial")), 8000);
    await pause(200);

    await clearAndType("drip-initial", "10000");
    await clearAndType("drip-yield", "8");
    await clearAndType("drip-years", "10");
    await reactClick("drip-simular");

    await driver.wait(until.elementLocated(By.id("drip-table")), 8000);
    await pause(300);
    const rows = await driver.findElements(By.css("#drip-table tbody tr"));
    const fv = await driver.findElement(By.id("drip-future-value")).getText();
    await foto("05-calculator-drip-resultado");

    rows.length === 10
      ? ok(`Tabela com ${rows.length} linhas`)
      : fail(`Esperado 10 linhas, obtido ${rows.length}`);
    fv.includes("R$")
      ? ok(`Valor futuro: ${fv}`)
      : fail(`Valor futuro sem formatação BRL: "${fv}"`);
  } catch (e) {
    fail(`Calculator DRIP: ${e.message}`);
  }
}

// 6. ABOUT + HELP
async function testeCddAboutHelp() {
  console.log("\n[6/6] About & Help");
  try {
    // About
    await autenticarCdd();
    await clickTab("nav-about");
    await driver.wait(until.elementLocated(By.id("about-heading")), 8000);
    await pause(300);
    await foto("06-about");
    const html = await driver.getPageSource();
    for (const nome of ["Letícia Sumida", "Lucas Ranzani", "Luis Silva"]) {
      html.includes(nome)
        ? ok(`Integrante: ${nome}`)
        : fail(`Nome ausente em About: ${nome}`);
    }

    // Help
    await clickTab("nav-help");
    await driver.wait(until.elementLocated(By.id("help-tab-yield")), 8000);

    await clickTab("help-tab-yield");
    await pause(300);
    const formulaDY = await driver.findElement(By.id("help-formula")).getText();
    formulaDY.includes("DY")
      ? ok("Fórmula DY presente")
      : fail(`Fórmula DY ausente: "${formulaDY}"`);
    await foto("06-help-dy");

    const fact1 = await driver.findElement(By.id("help-fact-text")).getText();
    await clickTab("help-next-fact");
    await pause(300);
    const fact2 = await driver.findElement(By.id("help-fact-text")).getText();
    fact1 !== fact2
      ? ok("Fact rotacionou")
      : fail('Fact não trocou após "próxima"');

    await clickTab("help-tab-payout");
    await pause(300);
    const formulaPayout = await driver
      .findElement(By.id("help-formula"))
      .getText();
    formulaPayout.includes("Payout")
      ? ok("Fórmula Payout presente")
      : fail(`Fórmula Payout ausente: "${formulaPayout}"`);
    await foto("06-help-payout");

    await clickTab("help-tab-drip");
    await pause(300);
    const formulaDRIP = await driver
      .findElement(By.id("help-formula"))
      .getText();
    formulaDRIP.includes("Valor Futuro") ||
    formulaDRIP.toLowerCase().includes("drip")
      ? ok("Fórmula DRIP presente")
      : fail(`Fórmula DRIP ausente: "${formulaDRIP}"`);
    await foto("06-help-drip");
  } catch (e) {
    fail(`About/Help: ${e.message}`);
  }
}

// MAIN
async function main() {
  await buildDriver();
  try {
    await testeCddLogin();
    await testeCddDashboard();
    await testeCddCalculatorDY();
    await testeCddCalculatorPayout();
    await testeCddCalculatorDRIP();
    await testeCddAboutHelp();
  } finally {
    await driver.quit();
  }

  console.log("\n─────────────────────────────────");
  if (erros.length === 0) {
    console.log("✅ Todos os testes CDD passaram!");
  } else {
    console.log(`❌ ${erros.length} falha(s):`);
    erros.forEach((e) => console.log(`   • ${e}`));
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Erro fatal", err);
    process.exit(1);
  });
} else {
  module.exports = main;
}
