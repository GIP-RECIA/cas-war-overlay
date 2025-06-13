const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8056/test"

        // Goto CAS login page
        await page.goto(`${casHost}/cas/login?service=${service}`);

        // Click on external idp for profile selection button
        const rWayf = await page.$("r-wayf");
        const shadowRoot = await rWayf.evaluateHandle(el => el.shadowRoot);
        const idpLink = await shadowRoot.$("#autres-publics"); 
        await idpLink.click();

        // Assert that the links are correct
        await page.waitForNavigation();
        await page.waitForNetworkIdle();
        const pageContent = await page.content();
        assert(pageContent.includes('<a href="https://default_example_domain/cerbere2/stylesheets/perdu.xhtml" id="password-forgotten">'))
        assert(pageContent.includes('<a href="https://default_example_domain/cerbere2/"'))

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
