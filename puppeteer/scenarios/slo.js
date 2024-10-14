const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8019"

        // Login to cas
        await cas.loginWith(page, casHost, service+"/test", "test1", "test")

        // Assert that user is connected
        await cas.verifyTGC(client)

        // Logout from CAS
        await page.goto(`${casHost}/cas/logout`);

        // Get logout status from app
        await page.goto(service+"/checkLogout");

        // Assert that the user is logged out of the app
        const pageContent = await page.content();
        assert(pageContent.includes("LOGGED IN=False"))

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
