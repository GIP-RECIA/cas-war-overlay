const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8057"

        // Login to cas
        await cas.loginWith(page, casHost, service+"/test", "test1", "test")

        // Assert that user is connected
        await cas.verifyTGC(client)

        // Logout from CAS
        await page.goto(casHost+"/cas/logout?url="+service+"/endpoint_to_redirect");

        // Assert that the user was redirected to the requested page
        const pageContent = await page.content();
        assert(pageContent.includes("Redirected to endpoint_to_redirect"))

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
