const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8061/test"

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

        // Delete the TST like if it was missing from the ticket registry
        const { cookies } = await client.send('Network.getAllCookies');
        const cookieToDelete = cookies.find(c => c.name === 'DISSESSIONAuthnDelegation');
        assert(cookieToDelete.name.includes('DISSESSIONAuthnDelegation'))
        if (cookieToDelete) {
            await client.send('Network.deleteCookies', {
            name: cookieToDelete.name,
            domain: cookieToDelete.domain,
            path: cookieToDelete.path,
            });
        }

        // Logout from CAS
        await page.goto(`${casHost}/cas/logout`);

        // Assert that logout page has the link to disconnect to idp
        pageContent = await page.content();
        assert(pageContent.includes('<a id="customLogoutLinkButton" href="https://logout_url_for_idp1.fr/logout" target="_blank" onclick="redirectAfterClick()"><p>Logout of agricultural authentication system</p></a>'));

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
