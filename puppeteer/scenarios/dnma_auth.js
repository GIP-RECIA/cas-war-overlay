const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        var page = await browser.newPage();
        var client = await page.createCDPSession();
        var casHost = "https://localhost:8443";
        var service = "http://localhost:8070/test"

        // TODO : Same test with two different authorized domains should make two DNMA auth
        // DNMA needs to be on same domain than service
        
        // Login to cas
        await cas.loginWith(page, casHost, service, "test3", "test")

        // Assert that TGC exists
        await cas.verifyTGC(client)

        // Assert that the ST was successfully validated 
        var pageContent = await page.content();
        assert(pageContent.includes("<cas:authenticationSuccess>"))
        assert(pageContent.includes("<cas:user>F3abc</cas:user>"))
        assert(pageContent.includes("SERVICE=http://localhost:8070/test"))

        // Assert DNMA auth is successful
        await page.goto("http://localhost:7005/dnma/auth/status");
        pageContent = await page.content();
        assert(pageContent.includes("auth: 1"))

        // Same session but new service
        service = "http://localhost:8071/test"

        // Login to cas again
        await cas.loginAgain(page, casHost, service, "test3", "test")

        // Assert that the ST was successfully validated
        pageContent = await page.content();
        assert(pageContent.includes("<cas:authenticationSuccess>"))
        assert(pageContent.includes("<cas:user>F3abc</cas:user>"))
        assert(pageContent.includes("SERVICE=http://localhost:8071/test"))

        // Assert only one DNMA auth
        await page.goto("http://localhost:7005/dnma/auth/status");
        pageContent = await page.content();
        assert(pageContent.includes("auth: 1"))

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
