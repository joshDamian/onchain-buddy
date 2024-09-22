import puppeteer from 'puppeteer';

export const captureAndStorePageScreenshotAsImage = async (url: string, outputPath: string) => {
    const browser = await puppeteer.launch({ headless: 'shell' });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.screenshot({ path: outputPath, fullPage: true });

    await browser.close();
};

export const captureAndStorePageScreenshotAsPdf = async (url: string, outputPath: string) => {
    const browser = await puppeteer.launch({ headless: 'shell' });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.pdf({ path: outputPath });

    await browser.close();
};
