const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();

        // Goto CAS login page by service
        await page.goto("http://localhost:8045/?sso");

        // Click on external idp for profile selection button
        const rWayf = await page.$("r-wayf");
        const shadowRoot = await rWayf.evaluateHandle(el => el.shadowRoot);
        const idpLink = await shadowRoot.$("#parentEleveEN-IdP"); 
        await idpLink.click();

        // Enter credentials and validate
        await cas.typeCredentialsAndEnter(page, "test5", "test");
        await page.waitForNavigation();
        await page.waitForNetworkIdle();
        
        // Select second profile
        const form = await page.$('#form-F6abc');
        await form.evaluate(f => f.submit());

        // Assert that TGC exists
        await page.waitForNavigation();
        await page.waitForNetworkIdle();
        await cas.verifyTGC(client)

        // waitForNetworkIdle is necessary in that case to obtain pageContent, or we get an error "Execution context was destroyed"
        await page.waitForNetworkIdle();
        const pageContent = await page.content();

        // Assert that user is logged in
        assert(pageContent.includes("authenticationDate"))
        assert(pageContent.includes("Logout"))
        assert(pageContent.includes("<li>F6abc</li>"))
        assert(pageContent.includes("<li>test6.test@test.com</li>"))
        assert(pageContent.includes("<li>TEST TESTSIX</li>"))
        assert(pageContent.includes("<li>Test</li>"))

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
