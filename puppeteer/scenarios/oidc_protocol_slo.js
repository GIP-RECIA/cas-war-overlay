const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8031"

        // Login to cas
        await page.goto(service+"/oidc/protected");
        await page.click("#LOCAL_AUTH");
        await cas.typeCredentialsAndEnter(page, "test1", "test");
        await page.waitForNavigation();

        // Assert that TGC exists
        await cas.verifyTGC(client)

        // waitForNetworkIdle is necessary in that case to obtain pageContent, or we get an error "Execution context was destroyed"
        await page.waitForNetworkIdle();
        var pageContent = await page.content();

        // Assert principal value
        assert(pageContent.includes("\"sub\":\"F1abc\""))

        // Logout from CAS
        await page.goto(`${casHost}/cas/logout`);

        // Get logout status from app
        await page.goto(service+"/checkLogout");

        // Assert that principal that logged out is the same that logged in
        pageContent = await page.content();
        assert(pageContent.includes("\"sub\":\"F1abc\""))
        
        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
