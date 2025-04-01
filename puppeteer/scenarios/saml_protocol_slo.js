const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8033"

        // Login to cas
        await cas.goToPageAndEnterLocalCredentials(page, service+"/?sso", "test1", "test")

        // Assert that TGC exists
        await cas.verifyTGC(client)

        // waitForNetworkIdle is necessary in that case to obtain pageContent, or we get an error "Execution context was destroyed"
        await page.waitForNetworkIdle();
        var pageContent = await page.content();

        // Logout from CAS
        await page.goto(`${casHost}/cas/logout`);

        // Get logout status from app
        await page.goto(service+"/checkLogout");

        // Assert that principal that logged out is the same that logged in
        pageContent = await page.content();
        assert(pageContent.includes("F1abc"))
                
        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
