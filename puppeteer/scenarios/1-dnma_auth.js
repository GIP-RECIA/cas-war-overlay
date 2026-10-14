const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        var page = await cas.getPage(browser);
        var client = await page.createCDPSession();
        var casHost = "https://localhost:8443";
        var service1 = "http://localhost:7005/service1"
        var service2 = "http://localhost:7005/service2"
        var service3 = "http://localhost:8070/test"
        var service4 = "http://localhost:7006/service1"
        var service5 = "http://localhost:7006/service1"
        var dnma1Status = "http://localhost:7005/dnma/auth/status"
        var dnma2Status = "http://localhost:7006/dnma/auth/status"

        // Login to cas
        await cas.loginWith(page, casHost, service1, "test3", "test")

        // Assert that TGC exists
        await cas.verifyTGC(client)

        // Assert that the ST was successfully validated 
        var pageContent = await page.content();
        assert(pageContent.includes("<cas:authenticationSuccess>"))
        assert(pageContent.includes("<cas:user>F3abc</cas:user>"))
        assert(pageContent.includes("SERVICE="+service1))

        // Assert DNMA auth is successful
        await page.goto(dnma1Status);
        pageContent = await page.content();
        assert(pageContent.includes("auth: 1"))

        // Same session but new service : login to cas again
        await cas.loginAgain(page, casHost, service2)

        // Assert that the ST was successfully validated
        pageContent = await page.content();
        assert(pageContent.includes("<cas:authenticationSuccess>"))
        assert(pageContent.includes("<cas:user>F3abc</cas:user>"))
        assert(pageContent.includes("SERVICE="+service2))

        // Assert only one DNMA auth
        await page.goto(dnma1Status);
        pageContent = await page.content();
        assert(pageContent.includes("auth: 1"))

        // Another service from another unknown domain, so same default domain is used, should not make new DNMA auth
        await cas.loginAgain(page, casHost, service3)
        pageContent = await page.content();
        assert(pageContent.includes("<cas:authenticationSuccess>"))
        assert(pageContent.includes("<cas:user>F3abc</cas:user>"))
        assert(pageContent.includes("SERVICE="+service3))
        await page.goto(dnma1Status);
        pageContent = await page.content();
        assert(pageContent.includes("auth: 1"))

        // Then auth with a different authorized domain : it should make a new DNMA auth
        await cas.loginAgain(page, casHost, service4)
        pageContent = await page.content();
        assert(pageContent.includes("<cas:authenticationSuccess>"))
        assert(pageContent.includes("<cas:user>F3abc</cas:user>"))
        assert(pageContent.includes("SERVICE="+service4))

        // Assert DNMA auth is successful
        await page.goto(dnma2Status);
        pageContent = await page.content();
        assert(pageContent.includes("auth: 1"))

        // Same session but new service, should not make new DNMA auth
        await cas.loginAgain(page, casHost, service5)
        pageContent = await page.content();
        assert(pageContent.includes("<cas:authenticationSuccess>"))
        assert(pageContent.includes("<cas:user>F3abc</cas:user>"))
        assert(pageContent.includes("SERVICE="+service5))
    
        // Assert only one DNMA auth
        await page.goto(dnma2Status);
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
