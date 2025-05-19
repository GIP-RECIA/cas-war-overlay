const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8047"

        // Login to cas
        await cas.loginWith(page, casHost, service+"/test", "test1", "test")

        // Logout from CAS
        await page.goto(`${casHost}/cas/logout?url=http://localhost:8047/test`);

        // Assert that the user is correctly redirected
        const url = page.url();
        assert(url.includes(service+"/redirection"))

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
