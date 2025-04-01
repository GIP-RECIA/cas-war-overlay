const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();

        // Login to cas
        await cas.goToPageAndEnterLocalCredentials(page, "http://localhost:8025/?sso", "test1", "test")

        // Assert that TGC exists
        await cas.verifyTGC(client)

        // waitForNetworkIdle is necessary in that case to obtain pageContent, or we get an error "Execution context was destroyed"
        await page.waitForNetworkIdle();
        const pageContent = await page.content();

        // Assert that user is logged in
        assert(pageContent.includes("urn:oid:0.9.2342.19200300.100.1.3"))
        assert(pageContent.includes("<li>test.test@test.com</li>"))
        assert(pageContent.includes("urn:oid:2.5.4.3"))
        assert(pageContent.includes("<li>TEST TEST</li>"))
        assert(!pageContent.includes("<li>TEST</li>"))
        assert(!pageContent.includes("urn:oid:2.5.4.4"))
        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
