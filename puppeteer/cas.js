const pino = require('pino');
const puppeteer = require('puppeteer');
const assert = require("assert");
const crypto = require('crypto');

const LOGGER = pino({
    level: "debug",
    transport: {
        target: "pino-pretty"
    }
});

const BROWSER_OPTIONS = {
    headless: true,
    ignoreHTTPSErrors: true,
    devtools: false,
    defaultViewport: null,
    slowMo: 5,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
};

exports.browserOptions = () => BROWSER_OPTIONS;

exports.logw = async (text) => {
    await LOGGER.warn(`🔥 ${text}`);
};

exports.logd = async (text) => {
    await LOGGER.debug(`💬 ${text}`);
};

exports.logi = async (text) => {
    await LOGGER.info(`✅ ${text}`);
};

exports.loge = async (text) => {
    await LOGGER.error(`📛 ${text}`);
};

exports.loginWith = async (page, casHost, service, username, password) => {
    // Go to login page
    await page.goto(`${casHost}/cas/login?service=${service}`);
    await this.typeCredentialsAndEnter(page, username, password);
    return page.waitForNavigation();
};

exports.loginWithoutService = async (page, casHost, username, password) => {
    // Go to login page
    await page.goto(`${casHost}/cas/login`);
    await this.typeCredentialsAndEnter(page, username, password);
    return page.waitForNavigation();
};

exports.loginAgain = async (page, casHost, service) => {
    // Go to login page and log in instantly because TGC is present
    await page.goto(`${casHost}/cas/login?service=${service}`);
};

exports.typeCredentialsAndEnter = async (page, username, password) => {
    // Type credentials
    await page.waitForSelector("#username", {visible: true});
    await page.$eval("#username", el => el.value = '');
    await page.type("#username", username);
    await page.waitForSelector("#password", {visible: true});
    await page.$eval("#password", el => el.value = '');
    await page.type("#password", password);

    // Validate credentials and send request to CAs
    await page.keyboard.press('Enter');
};

exports.serviceAccessWithRedirectToPortal = async (page, casHost, service, token, whereToRedirect) => {
    // Activate request interception
    await page.setRequestInterception(true);

    page.on('request', request => {
        // Stop rediects
        if (request.isNavigationRequest() && request.redirectChain().length > 0) {
            request.abort();
        } else {
            request.continue();
        }
    });

    page.on('response', async response => {
        // Ignore responses to requets we don't want to test
        if(!response.request().url().startsWith("data:image/")){
            // Assert answer is the one expected
            assert(response.status() == 302)
            assert(response.headers().location == whereToRedirect)
        }
    });

    try {
        // Access cas via service who asks redirect to portal
        await page.goto(casHost+"/cas/login?service="+service+token)
        this.loge("No error thrown !")
        throw new Error("Request was not redirected !");
    } catch (error) {
        // Check thrown error by the redirect by puppeteer is the one excepected
        assert(error.message.startsWith("net::ERR_FAILED"))
    }    
}

exports.verifyTGC = async (client) => {
    // Storage.getCookies is needed to get all cookies from browser (page cookies are not enough)
    const cookies = (await client.send('Storage.getCookies')).cookies;
    this.logi(`Cookie:\n${JSON.stringify(cookies, undefined, 2)}`)

    // Verify that we have the TGC
    const tgc = cookies.filter(c => {
        this.logd(`Checking cookie ${c.name}:${c.value}`);
        return c.name === "TGC";
    });
    assert(tgc.length !== 0);
};

exports.verifyNoTGC = async (client) => {
    // Storage.getCookies is needed to get all cookies from browser (page cookies are not enough)
    const cookies = (await client.send('Storage.getCookies')).cookies;
    this.logi(`Cookie:\n${JSON.stringify(cookies, undefined, 2)}`)

    // Verify that we have the TGC
    const tgc = cookies.filter(c => {
        this.logd(`Checking cookie ${c.name}:${c.value}`);
        return c.name === "TGC";
    });
    assert(tgc.length == 0);
};

exports.generateToken = () => {
    const period = Math.floor((Date.now() + 14400000) / 86400000);
    const md5Digester = crypto.createHash('md5');
    const hashedPeriod = md5Digester.update(String(period)).digest();
    if (hashedPeriod && hashedPeriod.length > 0) {
        let sb = '';
        for (const b of hashedPeriod) {
            const hex = b.toString(16);
            sb += (hex.length === 1 ? '0' + hex : hex).slice(-2);
        }
        return sb;
    }
}