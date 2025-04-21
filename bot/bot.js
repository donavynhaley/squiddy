const {chromium} = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
    const PROD_URL = "https://prod.secpapp.com/call"
    const DEV_URL = "https://dev.secpapp.com/call"
    const TEST_URL = "https://test.secpapp.com/call"
    const roomCode = process.env.ROOM_CODE || 'default-room';
    const url = process.env.ENVIRONMENT === 'prod' ? PROD_URL : process.env.ENVIRONMENT === 'test' ? TEST_URL : DEV_URL;

    console.log("url :", url);

    const mediaDir = '/app/media';
    const files = fs.readdirSync(mediaDir).filter(file => file.endsWith('.y4m'));
    const mediaFile = files[Math.floor(Math.random() * files.length)];
    const mediaPath = path.join(mediaDir, mediaFile);

    console.log("Selected Video :", mediaFile);

    const browser = await chromium.launch({
        headless: true,
        args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            `--use-file-for-fake-video-capture=${mediaPath}`
        ]
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${url}/${roomCode}`);
})();
