import puppeteer from 'puppeteer';

// Todo: Use a global browser instance to avoid launching a new browser for each request
export const captureAndStorePageScreenshotAsImage = async (url: string, outputPath?: string) => {
    const browser = await puppeteer.launch({
        headless: true,
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    if (!outputPath) {
        return await page.screenshot({
            path: outputPath,
            fullPage: true,
            encoding: 'binary',
            optimizeForSpeed: true,
        });
    }

    await page.screenshot({ path: outputPath, fullPage: true });

    await browser.close();
};

export const captureAndStorePageScreenshotAsPdf = async (url: string, outputPath?: string) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    if (!outputPath) {
        return await page.pdf({ format: 'A4' });
    }

    await page.pdf({ path: outputPath, format: 'A4' });

    await browser.close();
};
