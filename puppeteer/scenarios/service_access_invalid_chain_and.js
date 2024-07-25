const cas = require("../cas.js");
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8008/test"

        // Login to cas
        await cas.loginWith(page, casHost, service, "test2", "test")

        // Assert that TGC does not exists
        await cas.verifyNoTGC(client)

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
