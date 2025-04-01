const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();

        // Login to cas
        await page.goto("http://localhost:8026/?sso");
        await page.click("#LOCAL_AUTH");
        await cas.typeCredentialsAndEnter(page, "test1", "test");
        await page.waitForNavigation();

        // Assert that TGC exists
        await cas.verifyTGC(client)

        // waitForNetworkIdle is necessary in that case to obtain pageContent, or we get an error "Execution context was destroyed"
        await page.waitForNetworkIdle();
        const pageContent = await page.content();

        // Assert that attributes were received
        assert(pageContent.includes("urn:oid:1.3.6.1.4.1.5923.1.1.1.10"));
        assert(pageContent.includes("https://localhost:8443/cas/idp/metadata!http://localhost:8026/!JXQDG2DSYRU742NC7PYHAXNJST5LKX6M"));
        assert(pageContent.includes("urn:oid:urn:oasis:names:tc:SAML:attribute:pairwise-id"));
        assert(pageContent.includes("JXQDG2DSYRU742NC7PYHAXNJST5LKX6M@cas-ci.git"));

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
