const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8059/test"

        // Goto CAS login page
        await page.goto(`${casHost}/cas/login?service=${service}`);

        // Click on external idp for profile selection button
        const rWayf = await page.$("r-wayf");
        const shadowRoot = await rWayf.evaluateHandle(el => el.shadowRoot);
        const idpLink = await shadowRoot.$("#agri-IdP"); 
        await idpLink.click();

        // Enter credentials and validate
        await cas.typeCredentialsAndEnter(page, "test7", "test");
        await page.waitForNavigation();
        await page.waitForNetworkIdle();

        // Assert that TGC exists
        var pageContent = await page.content();
        await cas.verifyTGC(client);
        
        // Logout from CAS
        await page.goto(`${casHost}/cas/logout?url=http://localhost:8059/redirect_after_slo`);

        // Assert that logout page has the link to disconnect to idp and to redirect
        pageContent = await page.content();
        assert(pageContent.includes('<a id="customLogoutLinkButton" href="https://logout_url_for_idp1.fr/logout" target="_blank" onclick="redirectAfterClick()"><p>Logout of agricultural authentication system</p></a>'));
        assert(pageContent.includes('<a id="customLogoutRedirectButton" href="http://localhost:8059/redirect_after_slo" style="display: none;"><p>http://localhost:8059/redirect_after_slo</p></a>'));

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
