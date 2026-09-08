const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await cas.getPage(browser);
        const client = await page.createCDPSession();

        // Login to cas
        await cas.goToPageAndEnterLocalCredentials(page, "http://localhost:8011/?sso", "test1", "test")

        // Assert that TGC exists
        await cas.verifyTGC(client)

        // waitForNetworkIdle is necessary in that case to obtain pageContent, or we get an error "Execution context was destroyed"
        await page.waitForNetworkIdle();
        const pageContent = await page.content();

        // Assert that user is logged in
        assert(pageContent.includes("authenticationDate"))
        assert(pageContent.includes("Logout"))
        assert(pageContent.includes("<li>F1abc</li>"))
        assert(pageContent.includes("<li>test.test@test.com</li>"))
        assert(pageContent.includes("<li>TEST TEST</li>"))
        assert(pageContent.includes("<li>Test</li>"))

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
