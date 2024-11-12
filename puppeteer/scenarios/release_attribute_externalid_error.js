const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8022/test"

        // Login to cas
        await cas.loginWith(page, casHost, service, "test1", "test")

        // Assert that an error page is given
        const pageContent = await page.content();
        assert(pageContent.includes("<cas:authenticationFailure code=\"INVALID_AUTHENTICATION_CONTEXT\">"))

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
