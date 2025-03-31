const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8038/test"

        // Goto CAS login page
        await page.goto(`${casHost}/cas/login?service=${service}`);

        // Click on external idp for profile selection button
        await page.click("#RCVDL");

        // Enter credentials and validate
        await cas.typeCredentialsAndEnter(page, "test8", "test");
        await page.waitForNavigation();
        await page.waitForNetworkIdle();

        // Assert that TGC exists
        var pageContent = await page.content();
        await cas.verifyTGC(client);
        
        // Assert that attributes are from the second profile
        pageContent = await page.content();
        assert(pageContent.includes("<cas:user>F8abc</cas:user>"));
        assert(pageContent.includes("<cas:mail>test8.test@idp2.com</cas:mail>"));
        assert(pageContent.includes("<cas:ENTPersonLogin>test8</cas:ENTPersonLogin>"));
        assert(pageContent.includes("<cas:uid>F8abc</cas:uid>"));

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
