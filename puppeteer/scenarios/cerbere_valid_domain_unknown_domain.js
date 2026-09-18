const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await cas.getPage(browser);
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8072/test"

        // Login to cas
        await cas.loginWith(page, casHost, service, "test20", "test")

        // Assert that the ST was successfully validated 
        const pageContent = await page.content();
        assert(pageContent.includes("<cas:authenticationSuccess>"))
        assert(pageContent.includes("<cas:user>F20abc</cas:user>"))

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
