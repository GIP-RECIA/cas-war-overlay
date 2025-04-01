const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();

        // Login to cas
        await cas.goToPageAndEnterLocalCredentials(page, "http://localhost:8021/oidc/protected", "test1", "test")

        // Assert that TGC exists
        await cas.verifyTGC(client)

        // waitForNetworkIdle is necessary in that case to obtain pageContent, or we get an error "Execution context was destroyed"
        await page.waitForNetworkIdle();
        var pageContent = await page.content();

        // Assert we have recevied tokens from the CAS
        assert(pageContent.includes("access_token"));
        assert(pageContent.includes("id_token"));
        assert(pageContent.includes("\"aud\":\"client3-testcas\""));
        assert(pageContent.includes("\"iss\":\"https://localhost:8443/cas/oidc\""));
        assert(pageContent.includes("\"sub\":\"00000000-0000-0000-0000-000000000002\""));
        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
