
async function allowCookies(page){
    // Wait for the page to load completely
    await page.waitForTimeout(3000); // Adjust the timeout as needed

    try {
        // Check if there's a visible element with "Allow all cookies" or "Zezwól na wszystkie pliki cookie" text
        const allowCookiesButton = await page.$x(
            "//span[contains(., 'Allow all cookies') or contains(., 'Zezwól na wszystkie pliki cookie')]"
        );
        if (allowCookiesButton.length > 0) {
            // Click the button
            await allowCookiesButton[0].click();
            console.log('Clicked "Allow all cookies" or "Zezwól na wszystkie pliki cookie" button.');
        } else {
            console.log('"Allow all cookies" or "Zezwól na wszystkie pliki cookie" button not found.');
        }
    } catch (error) {
        console.error('Error:', error);
    }

    try {
        await page.waitForSelector('[role="dialog"]', { timeout: 2000 });

        // Click the first element inside the dialog
        const dialog = await page.$('[role="dialog"]');
        if (dialog) {
            const firstElement = await dialog.$('*');
            if (firstElement) {
                await firstElement.click();
                console.log('Clicked the first element inside the dialog.');
            } else {
                console.log('No elements found inside the dialog.');
            }
        } else {
            console.log('Dialog with role="dialog" not found.');
        }
    } catch (error) {
        console.error('TIMEOUT FOR DIALOG IS OK');
        console.error('Error:', error);
    }
}

module.exports = {
    allowCookies
}