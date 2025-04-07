const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();

        // Goto CAS login page by service
        await page.goto("http://localhost:8043/oidc/protected");

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
        var pageContent = await page.content();

        // Assert we have recevied tokens from the CAS
        assert(pageContent.includes("access_token"));
        assert(pageContent.includes("id_token"));
        assert(pageContent.includes("refresh_token"));
        assert(pageContent.includes("\"aud\":\"client7-testcas\""));
        assert(pageContent.includes("\"iss\":\"https://localhost:8443/cas/oidc\""));
        assert(pageContent.includes("\"sub\":\"F6abc\""));

        // Call userinfo OIDC endpoint to retrieve user attributes
        await page.goto("http://localhost:8043/oidc/userinfo");
        pageContent = await page.content();

        //Verify that attributes were received
        assert(pageContent.includes("attributes"));
        assert(pageContent.includes("isMemberOf")); //Custom claim
        assert(pageContent.includes("\"nickname\":\"test6\"")); //Mapped claim from ENTPersonLogin
        assert(pageContent.includes("\"uid\":[\"F6abc\"]"));
        assert(pageContent.includes("\"family_name\":\"TESTSIX\"")); //Mapped claim from cn
        assert(pageContent.includes("\"given_name\":\"Test\""));
        assert(pageContent.includes("\"usual_name\":\"TESTSIX\"")); //Mapped claim from cn
        assert(!pageContent.includes("email")); //Not in scopes

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
