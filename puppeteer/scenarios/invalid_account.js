const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8053/test"

        // Goto CAS login page
        await page.goto(`${casHost}/cas/login?service=${service}`);

        // Click on external idp for profile selection button
        const rWayf = await page.$("r-wayf");
        const shadowRoot = await rWayf.evaluateHandle(el => el.shadowRoot);
        const idpLink = await shadowRoot.$("#agri-IdP"); 
        await idpLink.click();

        // Enter credentials and validate
        await cas.typeCredentialsAndEnter(page, "test10", "test");
        await page.waitForNavigation();
        await page.waitForNetworkIdle();
     
        // Assert that attributes are from the second profile
        pageContent = await page.content();
        assert(pageContent.includes("Authentication response provided to CAS by the external identity provider cannot be accepted."));
        assert(pageContent.includes("Authentication response provided by the external identity provider did not provide a valid account."));

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
