const { Builder, By, until, Key } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.APP_URL || "http://localhost:3000";
const SCREENSHOTS_DIR = path.join(__dirname, "..", "..", "screenshots");

if (!fs.existsSync(SCREENSHOTS_DIR))
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function pause(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function foto(driver, nome) {
  const img = await driver.takeScreenshot();
  fs.writeFileSync(path.join(SCREENSHOTS_DIR, `DEBUG-${nome}.png`), img, "base64");
  console.log(`  📸 DEBUG-${nome}.png`);
}

async function main() {
  const opts = new chrome.Options();
  opts.addArguments(
    "--headless=new",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--window-size=1280,800",
    "--disable-gpu",
  );
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(opts)
    .build();
  await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 15000 });

  try {
    // Login
    await driver.get(BASE_URL + "/cdd");
    await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 8000);
    try {
      await driver.findElement(By.id("username")).sendKeys("usuario1");
      await driver.findElement(By.id("password")).sendKeys("1234");
    } catch {
      await driver.findElement(By.css('input[type="text"], input[name="login"]')).sendKeys("usuario1");
      await driver.findElement(By.css('input[type="password"]')).sendKeys("1234");
    }
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.elementLocated(By.id("nav-dashboard")), 8000);
    console.log("Login OK");

    await driver.findElement(By.id("nav-calculators")).click();
    await driver.wait(until.elementLocated(By.id("tab-yield")), 8000);
    await pause(500);

    // Test: Actions API click (real mouse interaction)
    console.log("\n--- Test: Actions API click on tab-payout ---");
    const tabPayout = await driver.findElement(By.id("tab-payout"));
    await driver.actions().click(tabPayout).perform();
    await pause(500);
    await foto(driver, "80-actions-click");
    
    const state1 = await driver.executeScript(`
      return {
        payoutState: document.getElementById('tab-payout')?.getAttribute('data-state'),
        payoutContent: document.querySelector('[aria-labelledby*="payout"]')?.getAttribute('data-state'),
        panels: Array.from(document.querySelectorAll('[role="tabpanel"]')).map(p => ({
          id: p.id, state: p.getAttribute('data-state'), hidden: p.hidden, childCount: p.children.length
        }))
      };
    `);
    console.log("  After Actions click:", JSON.stringify(state1, null, 2));

    // Also check if payout-dps exists now
    try {
      await driver.findElement(By.id("payout-dps"));
      console.log("  ✓ payout-dps found!");
    } catch {
      console.log("  ✗ payout-dps NOT found");
      
      // Try JavaScript-based approach: directly fire all needed events
      console.log("\n--- Test: Full JS event sequence ---");
      await driver.findElement(By.id("tab-yield")).click(); // Reset to yield
      await pause(300);
      
      await driver.executeScript(`
        const tab = document.getElementById('tab-payout');
        // Full sequence of events for a mouse click
        tab.focus();
        tab.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1, button: 0 }));
        tab.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 }));
        tab.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerId: 1, button: 0 }));
        tab.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, button: 0 }));
        tab.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
      `);
      await pause(500);
      await foto(driver, "81-full-events");
      
      const state2 = await driver.executeScript(`
        return {
          payoutState: document.getElementById('tab-payout')?.getAttribute('data-state'),
          panels: Array.from(document.querySelectorAll('[role="tabpanel"]')).map(p => ({
            id: p.id, state: p.getAttribute('data-state'), childCount: p.children.length
          }))
        };
      `);
      console.log("  After full events:", JSON.stringify(state2, null, 2));
      
      try {
        await driver.findElement(By.id("payout-dps"));
        console.log("  ✓ payout-dps found!");
      } catch {
        console.log("  ✗ payout-dps still NOT found");
      }
    }
    
  } finally {
    await driver.quit();
  }
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
