const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8066"

        // Login to cas and verify original mail attribute
        await cas.loginWith(page, casHost, service+"/test", "test15", "test")
        var pageContent = await page.content();
        assert(pageContent.includes("test.test@test.com"))

        // Before logging out, modify the ldap attributes
        await page.goto(service+"/modifyLdap"); 

        // Assert that user is connected
        await cas.verifyTGC(client)

        // Logout from CAS
        await page.goto(`${casHost}/cas/logout?partialLogout=true`);
        var pageContent = await page.content();
        assert(pageContent.includes("You have successfully logged out of the Central Authentication Service."))

        // Get logout status from app
        await page.goto(service+"/checkLogout");

        // Assert that the user is logged out of the app but not of CAS
        await cas.verifyTGC(client)

        // Login to service again
        await page.goto(`${casHost}/cas/login?service=${service}/test`);
        
        // Verify that mail attribute has changed
        pageContent = await page.content();
        assert(pageContent.includes("test15.test15@test.com"))

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
