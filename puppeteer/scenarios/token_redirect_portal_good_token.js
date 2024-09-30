const cas = require("../cas.js");
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const casHost = "https://localhost:8443";
        const domain = "falsevaliddomain";
        const service = "https://"+domain+"/tokenredirectportal"
        const token = "&token="+cas.generateToken()
        const client = await page.createCDPSession();
        
        // Login to cas
        await cas.loginWith(page, casHost, service+token, "test2", "test")

        // Assert that TGC exists
        await cas.verifyTGC(client)

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
