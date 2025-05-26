const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8048/test"
        const scimServer = "http://localhost:7003"

        // Login to cas
        await cas.loginWith(page, casHost, service, "test1", "test")

        // Assert that TGC exists
        await cas.verifyTGC(client)

        // Get SCIM status
        await page.goto(scimServer+"/status/48");
        var pageContent = await page.content();
        assert(pageContent.includes('{"USER_GET": true, "USER_POST": true, "ETAB_GET": true, "ETAB_POST": true, "CLASS_GET": true, "CLASS_POST": true, "ETAB_PATCH": true, "CLASS_PATCH": true}'))

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
