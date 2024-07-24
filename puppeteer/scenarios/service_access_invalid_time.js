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
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8005/test"

        // Go to login page
        const response = await page.goto(`${casHost}/cas/login?service=${service}`);
        // It should respond with a 403 because we can't access the service
        assert(response.status() == 403)

        process.exit(0)

    } catch (e) {
        logger.error(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
