const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8001/test"
        const serviceToRedirect = "http://localhost:8040/test"

        // Goto CAS login page
        await page.goto(`${casHost}/cas/login?service=${service}`);

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

        // Assert that the ST was successfully validated 
        const pageContent = await page.content();
        assert(pageContent.includes("SUCCESS SERVICE=" + serviceToRedirect))

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
