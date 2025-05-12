const cas = require("../cas.js");
const puppeteer = require('puppeteer');
const assert = require("assert");

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());

    try {
        const page = await browser.newPage();
        const casHost = "https://localhost:8443";
        const service = "http://localhost:8046/test"

        // Login to cas
        // TODO : Can't put simple password because of chromium password breach popup that prevent pupeteer to take the focus
        await cas.loginWith(page, casHost, service, "test1000", "WmI7MM4J1Qr76uv")

        // Step 1 : Device registration
        // Get TOTP token
        const token = await page.$eval('#seckeypanel', div => {
            const paragraphs = div.querySelectorAll('p');
            return paragraphs[1]?.innerText || null;
        });
        // Confirm device registration
        await page.click('#confirm');
        // Enter code
        await page.waitForSelector("#otp");
        await page.$eval("#otp", el => el.value = '');
        await page.type("#otp", cas.generateTOTP(token));
        // Click to register device
        await page.click('#registerButton');
        await page.waitForNavigation();
        await page.waitForNetworkIdle();

        // Step 2 : final login
        // Enter code
        await page.waitForSelector("#otp");
        await page.$eval("#otp", el => el.value = '');
        await page.type("#otp", cas.generateTOTP(token));
        // Click to validate code
        await page.click('#loginButton');
        
        // Assert that the ST was successfully validated 
        const pageContent = await page.content();
        assert(pageContent.includes("SUCCESS SERVICE=" + service))

        process.exit(0)

    } catch (e) {
        cas.loge(e);
        process.exit(1)
    } finally {
        await browser.close();
    }
})();
