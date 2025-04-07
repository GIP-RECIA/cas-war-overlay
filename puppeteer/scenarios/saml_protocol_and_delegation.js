const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();

        // Goto CAS login page by service
        await page.goto("http://localhost:8044/?sso");

        // Click on external idp for profile selection button
        const rWayf = await page.$("r-wayf");
        const shadowRoot = await rWayf.evaluateHandle(el => el.shadowRoot);
        const idpLink = await shadowRoot.$("#eleves-parents"); 
        await idpLink.click();

        // Enter credentials and validate
        await cas.typeCredentialsAndEnter(page, "test7", "test");
        await page.waitForNavigation();
        await page.waitForNetworkIdle();

        // Assert that TGC exists
        await cas.verifyTGC(client)

        // waitForNetworkIdle is necessary in that case to obtain pageContent, or we get an error "Execution context was destroyed"
        await page.waitForNetworkIdle();
        const pageContent = await page.content();

        // Assert that user is logged in
        assert(pageContent.includes("authenticationDate"))
        assert(pageContent.includes("Logout"))
        assert(pageContent.includes("<li>F7abc</li>"))
        assert(pageContent.includes("<li>test7.test@idp1.com</li>"))
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
