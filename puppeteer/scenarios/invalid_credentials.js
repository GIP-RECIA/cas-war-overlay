const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8052/test"

        // Fail to login to cas
        await cas.loginWith(page, casHost, service, "invalidusername", "invalidpassword")

        // Assert that we got an error in the login form page
        const pageContent = await page.content();
        assert(pageContent.includes("Authentication attempt has failed"))
        assert(pageContent.includes('<form method="post" id="fm1" onsubmit="loginFormSubmission();">'))

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
