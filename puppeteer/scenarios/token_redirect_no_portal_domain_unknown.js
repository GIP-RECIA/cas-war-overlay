const cas = require("../cas.js");
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const casHost = "https://localhost:8443";
        const domain = "wrongdomain";
        const service = "https://"+domain+"/tokenredirectnoportal"
        const whereToRedirect = "https://pagetoredirectnetocentre.fr"

        // Assert that the user is redirected
        await cas.serviceAccessWithRedirectToPortal(page, casHost, service, "", whereToRedirect);

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
