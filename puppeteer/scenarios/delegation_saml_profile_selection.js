const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8036/test"

        // Goto CAS login page
        await page.goto(`${casHost}/cas/login?service=${service}`);

        // Click on external idp for profile selection button
        await page.click("#EDUCONNECT");

        // Enter credentials and validate
        await cas.typeCredentialsAndEnter(page, "test5", "test");
        await page.waitForNavigation();
        await page.waitForNetworkIdle();

        // Assert that there is two profiles
        var pageContent = await page.content();
        assert(pageContent.includes("<code><kbd>F5abc</kbd></code>"));
        assert(pageContent.includes("<code><kbd>F6abc</kbd></code>"));
        assert(pageContent.includes("mail=[test5.test@test.com]"));
        assert(pageContent.includes("mail=[test6.test@test.com]"));
        
        // Select second profile
        const form = await page.$('#form-F6abc');
        await form.evaluate(f => f.submit());

        // Assert that TGC exists
        await page.waitForNavigation();
        await page.waitForNetworkIdle();
        await cas.verifyTGC(client);
        
        // Assert that attributes are from the second profile
        pageContent = await page.content();
        assert(pageContent.includes("<cas:user>F6abc</cas:user>"));
        assert(pageContent.includes("<cas:mail>test6.test@test.com</cas:mail>"));

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
