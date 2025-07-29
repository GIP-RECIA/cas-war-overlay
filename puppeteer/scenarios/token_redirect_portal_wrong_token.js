const cas = require("../cas.js");
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const casHost = "https://localhost:8443";
        const domain = "falsevaliddomain";
        const service = "https://"+domain+"/tokenredirectportal"
        const token = "&token=123456789"

        // Assert that the user is redirected
        await cas.serviceAccessWithRedirectToPortal(page, casHost, service, token, "https://"+domain+"/portail");

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
