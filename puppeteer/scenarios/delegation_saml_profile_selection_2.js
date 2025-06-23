const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const client = await page.createCDPSession();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8060/test"

        // Goto CAS login page
        await page.goto(`${casHost}/cas/login?service=${service}&idpId=parentEleveEN-IdP-client2`);

        // Enter credentials and validate
        await cas.typeCredentialsAndEnter(page, "test5", "test");
        await page.waitForNavigation();
        await page.waitForNetworkIdle();

        // Assert that there is two profiles
        var pageContent = await page.content();
        assert(pageContent.includes("NOM ETAB NUMERO 55555555555"));
        assert(pageContent.includes("NOM ETAB NUMERO 6666666666"));
        
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
