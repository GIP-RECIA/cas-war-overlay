const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await cas.getPage(browser);
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8070/test"

        // Login to cas
        await cas.loginWith(page, casHost, service, "test17", "test")

        // Assert that the user is correctly redirected
        const pageContent = await page.content();
        assert(pageContent.includes('CERBERE UI'));
        const url = page.url();
        assert(url.includes("http://localhost:8070/cerbere"))

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
