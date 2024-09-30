const cas = require("../cas.js");
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const casHost = "https://localhost:8443";

        // Assert that the user is redirected to the right domain (first domain)
        page = await browser.newPage();
        domain = "mappeddomain1";
        service = "https://"+domain+"/tokenredirectnoportal"
        whereToRedirect = "https://mappeddomain3.fr/portail"
        await cas.serviceAccessWithRedirectToPortal(page, casHost, service, "", whereToRedirect);
        await page.close()

        // Wait before next test
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Assert that the user is redirected to the right domain (second domain)
        page = await browser.newPage();
        domain = "mappeddomain2";
        service = "https://"+domain+"/tokenredirectnoportal"
        whereToRedirect = "https://mappeddomain4.fr/portail"
        await cas.serviceAccessWithRedirectToPortal(page, casHost, service, "", whereToRedirect);
        await page.close()

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
