const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const casHost = "https://localhost:8443";
        const casDelegHost = "https://localhost:9443";
        const service = "http://localhost:8065/test"

        // Login with IDP initiated first time
        await page.goto(`${casDelegHost}/cas/idp/profile/SAML2/Unsolicited/SSO?providerId=${casHost}/cas/educonnect`);

        // Enter credentials, validate and select a profile
        await cas.typeCredentialsAndEnter(page, "test5", "test");
        await page.waitForNavigation();
        await page.waitForNetworkIdle();
        const form = await page.$('#form-F5abc');
        await form.evaluate(f => f.submit());
        await page.waitForNavigation();

        // Login with IDP initiated second time
        await page.goto(`${casDelegHost}/cas/idp/profile/SAML2/Unsolicited/SSO?providerId=${casHost}/cas/educonnect`);
        await page.waitForNavigation();

        // Validate a ST to get current attributes
        await page.goto(`${casHost}/cas/login?service=${service}`)

        // Assert that attributes are from the correct authentication (the first one)
        pageContent = await page.content();
        assert(pageContent.includes("<cas:user>F5abc</cas:user>"));
        assert(pageContent.includes(`SERVICE=${service}`));

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
