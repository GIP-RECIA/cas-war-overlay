const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8049/test"
        const scimServer = "http://localhost:7003"

        // Login to cas
        await cas.loginWith(page, casHost, service, "test1", "test")

        // Assert that TGC exists
        await cas.verifyTGC(client)

        // Get SCIM status
        await page.goto(scimServer+"/status/49");
        var pageContent = await page.content();
        assert(pageContent.includes('{"USER_GET": true, "ETAB_GET": true, "CLASS_GET": true, "CLASS_ADD": true, "CLASS_REMOVE": true}'))

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
