const puppeteer = require('puppeteer');
const assert = require("assert");
const pino = require('pino');
const logger = pino({
    level: "info",
    transport: {
        target: 'pino-pretty'
    }
});

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        ignoreHTTPSErrors: true,
        devtools: false,
        defaultViewport: null,
        slowMo: 5
    });

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8006/test"

        // Go to login page
        await page.goto(`${casHost}/cas/login?service=${service}`);

        // Type credentials
        await page.waitForSelector("#username", { visible: true });
        await page.$eval("#username", el => el.value = '');
        await page.type("#username", "test2");
        await page.waitForSelector("#password", { visible: true });
        await page.$eval("#password", el => el.value = '');
        await page.type("#password", "test");

        // Validate credentials and send request to CAS
        await page.keyboard.press('Enter');
        const response = await page.waitForNavigation();

        // Storage.getCookies can get all cookies from browser (page cookies are not enough)
        const cookies = (await client.send('Storage.getCookies')).cookies;
        logger.info(`Cookie:\n${JSON.stringify(cookies, undefined, 2)}`);

        // Verify that we don't have a TGC
        const tgc = cookies.filter(c => {
            logger.debug(`Checking cookie ${c.name}:${c.value}`);
            return c.name === "TGC";
        });
        assert(tgc.length == 0);

        process.exit(0)

    } catch (e) {
        logger.error(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
