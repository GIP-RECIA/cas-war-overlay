const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8030/test"

        // Goto CAS login page
        await page.goto(`${casHost}/cas/login?service=${service}`);

        // Click on external idp button
        await page.click("#DELEGTEST");

        // Enter credentials and validate
        await cas.typeCredentialsAndEnter(page, "test2", "test");
        await page.waitForNavigation();

        await new Promise(resolve => setTimeout(resolve, 10000));

        // Assert that the we got the right error message
        const pageContent = await page.content();
        assert(pageContent.includes("You are not authorized to access this service. This may be due either to insufficient permissions or to an access restriction based on the date."))

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
