const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();
        const casHost = "https://localhost:8443";
        const service = "http://localhost2:8028/test"
        const serviceToRedirect = "http://localhost:8028/test"

        // Goto CAS login page
        await page.goto(`${casHost}/cas/login?service=${service}`);

        // Click on external idp button
        await page.click("#DELEGTEST");

        // Enter credentials and validate
        await cas.typeCredentialsAndEnter(page, "test2", "test");
        await page.waitForNavigation();
 
        // Assert that TGC exists
        await cas.verifyTGC(client)

        // Assert that the ST was successfully validated 
        const pageContent = await page.content();
        assert(pageContent.includes("SUCCESS SERVICE=" + serviceToRedirect))

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
