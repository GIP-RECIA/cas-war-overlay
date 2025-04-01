const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();

        // Login to cas
        await page.goto("http://localhost:8018/oidc/protected");
        await page.click("#LOCAL_AUTH");
        await cas.typeCredentialsAndEnter(page, "test1", "test");
        await page.waitForNavigation();

        // Assert that TGC exists
        await cas.verifyTGC(client)

        // waitForNetworkIdle is necessary in that case to obtain pageContent, or we get an error "Execution context was destroyed"
        await page.waitForNetworkIdle();
        var pageContent = await page.content();

        // Assert we have recevied tokens from the CAS
        assert(pageContent.includes("access_token"));
        assert(pageContent.includes("id_token"));
        assert(pageContent.includes("refresh_token"));
        assert(pageContent.includes("\"aud\":\"client-testcas\""));
        assert(pageContent.includes("\"iss\":\"https://localhost:8443/cas/oidc\""));
        assert(pageContent.includes("\"sub\":\"F1abc\""));

        // Call userinfo OIDC endpoint to retrieve user attributes
        await page.goto("http://localhost:8018/oidc/userinfo");
        pageContent = await page.content();

        //Verify that attributes were received
        assert(pageContent.includes("attributes"));
        assert(pageContent.includes("isMemberOf")); //Custom claim
        assert(pageContent.includes("\"nickname\":\"test1\"")); //Mapped claim from ENTPersonLogin
        assert(pageContent.includes("\"uid\":[\"F1abc\"]"));
        assert(pageContent.includes("\"family_name\":\"TEST\"")); //Mapped claim from cn
        assert(pageContent.includes("\"given_name\":\"Test\""));
        assert(pageContent.includes("\"usual_name\":\"TEST\"")); //Mapped claim from cn
        assert(!pageContent.includes("email")); //Not in scopes

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
