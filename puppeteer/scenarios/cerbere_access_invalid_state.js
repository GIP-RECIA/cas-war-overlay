const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8062/test"

        // Goto CAS login page
        await page.goto(`${casHost}/cas/login?service=${service}`);

        // Click on external idp for profile selection button
        const rWayf = await page.$("r-wayf");
        const shadowRoot = await rWayf.evaluateHandle(el => el.shadowRoot);
        const idpLink = await shadowRoot.$("#agri-IdP");
        await idpLink.click();

        // Enter credentials and validate
        await cas.typeCredentialsAndEnter(page, "test14", "test");
        await page.waitForNavigation();
        await page.waitForNetworkIdle();

        // Assert that the user is logged in on cerbere
        const pageContent = await page.content();
        assert(pageContent.includes('<cas:authenticationSuccess>'));
        assert(pageContent.includes('<cas:user>F14abc</cas:user>'));
        assert(pageContent.includes('SERVICE=http://localhost:8062/test'));

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
