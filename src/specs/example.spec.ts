import { homeTestPage } from '../pages/home.test.ts'

describe('As a new user', () => {

    it('should be able to see the welcome text', async () => {
        await homeTestPage.homeHeader.waitForExist()
        expect(await homeTestPage.homeHeader.isDisplayed()).toBe(true)
    })
})
