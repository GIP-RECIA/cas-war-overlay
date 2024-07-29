const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8010/test"

        // Login to cas
        await cas.loginWith(page, casHost, service, "test2", "test")

        // Assert that TGC exists
        await cas.verifyTGC(client)

        // Assert that the released attributes correspond to expectations
        const pageContent = await page.content();
        assert(pageContent.includes("<cas:authenticationSuccess>"))
        assert(pageContent.includes("<cas:sn>"))
        assert(pageContent.includes("<cas:cn>"))
        assert(pageContent.includes("<cas:mail>"))
        assert(pageContent.includes("<cas:mail>"))
        assert(pageContent.includes("<cas:externalIdTest>00000000-0000-0000-0000-000000000002</cas:externalIdTest>"))

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
