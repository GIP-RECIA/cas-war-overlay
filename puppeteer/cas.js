const pino = require('pino');
const puppeteer = require('puppeteer');
const assert = require("assert");

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
    slowMo: 5
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

    // Type credentials
    await page.waitForSelector("#username", {visible: true});
    await page.$eval("#username", el => el.value = '');
    await page.type("#username", username);
    await page.waitForSelector("#password", {visible: true});
    await page.$eval("#password", el => el.value = '');
    await page.type("#password", password);

    // Validate credentials and send request to CAs
    await page.keyboard.press('Enter');
    return page.waitForNavigation();
};

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
