import { homeTestPage } from '../pages/home.test.ts'
import { XPosition } from '../commands/mobile.commands.ts'

describe('As a new user', () => {
    it('should be able to see the welcome text', async () => {
        await homeTestPage.homeHeader.waitForExist()
        expect(await homeTestPage.homeHeader.isDisplayed()).toBe(true)

        const x = await browser.getXCoordinate(XPosition.CENTER, 375)
        console.log(x)
    })
})
