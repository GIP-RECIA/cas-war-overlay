const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();

        // Login to cas
        await page.goto("http://localhost:8024/?sso");
        await cas.typeCredentialsAndEnter(page, "test1", "test");
        await page.waitForNavigation();

        // Assert that TGC exists
        await cas.verifyTGC(client)

        // waitForNetworkIdle is necessary in that case to obtain pageContent, or we get an error "Execution context was destroyed"
        await page.waitForNetworkIdle();
        const pageContent = await page.content();

        // Assert that user is logged in
        assert(pageContent.includes("urn:oid:0.9.2342.19200300.100.1.3"))
        assert(pageContent.includes("test.test@test.com"))
        assert(pageContent.includes("urn:oid:2.5.4.4"))
        assert(pageContent.includes("TEST"))
        assert(pageContent.includes("newIdMappedFromExternal"))
        assert(pageContent.includes("00000000-0000-0000-0000-000000000005"))
        assert(!pageContent.includes("externalId"))
        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
