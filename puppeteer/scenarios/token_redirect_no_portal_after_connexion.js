const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        // Login to CAS for the first time
        const page = await browser.newPage();
        const client = await page.createCDPSession();
        const casHost = "https://localhost:8443";

        // Login to cas
        await cas.loginWithoutService(page, casHost, "test2", "test")

        // Assert that TGC exists
        await cas.verifyTGC(client)

        // Then login again but with another service that should be redirected if not already logged in
        const service = "http://localhost:8016/test"
        await cas.loginAgain(page, casHost, service)

        // Assert that the ST was successfully validated 
        const pageContent = await page.content();
        assert(pageContent.includes("SUCCESS SERVICE=" + service))

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
