/**
 * Custom WebdriverIO commands for mobile interactions
 * These commands extend the browser and element objects with mobile-specific functionality
 * 
 * @see https://webdriver.io/docs/customcommands/
 */

import logger from '../helpers/lib/logger.js'

/**
 * Enum for X-axis positioning on screen
 */
export enum XPosition {
    CENTER = 'CENTER',
    LEFT = 'LEFT',
    RIGHT = 'RIGHT',
}

/**
 * Interface for screen margin configuration
 */
export interface ScreenMargins {
    bottomMargin?: number
    topMargin?: number
    xPadding?: number
    scrollFactor?: number
}

/**
 * Performs a tap action on an element using mobile-specific gestures
 * For iOS, calculates center coordinates and uses mobile:tap
 * For Android, uses standard click
 * 
 * @example
 * await browser.mobileTap(await $('~submitButton'))
 */
browser.addCommand('mobileTap', async function (element: WebdriverIO.Element) {
    const isIOS = (await browser.capabilities).platformName === 'iOS'
    
    if (isIOS) {
        const xPos = await element.getLocation('x')
        const yPos = await element.getLocation('y')
        const height = await element.getSize('height')
        const width = await element.getSize('width')
        const xCenter = xPos + width / 2
        const yCenter = yPos + height / 2
        await browser.execute('mobile: tap', { x: xCenter, y: yCenter })
    } else {
        await element.waitForExist()
        await element.click()
    }
})

/**
 * Performs a tap action at specific coordinates using W3C Actions API
 * Works cross-platform using pointer actions
 * 
 * @param xCenter - X coordinate for tap
 * @param yCenter - Y coordinate for tap
 * 
 * @example
 * await browser.performTap(100, 200)
 */
browser.addCommand('performTap', async function (xCenter: number, yCenter: number) {
    await browser.performActions([
        {
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 500, origin: 'viewport', x: xCenter, y: yCenter },
                { type: 'pointerDown', button: 0 },
                { type: 'pointerUp', button: 0 },
            ],
        },
    ])
})

/** 
* Scrolls the page until the specified element is visible
 * Uses platform-specific scroll implementations:
 * - iOS: Uses mobile:scrollToElement
 * - Android: Uses mobile:scroll with UiAutomator strategy
 * 
 * @param element - The WebdriverIO element to scroll to
 * @param strategy - The UiAutomator strategy to use (default: 'accessibility id')
 * @param selector - The selector value for the element
 * @param maxSwipes - Maximum number of swipes to perform (default: 10)
 * 
 * @example
 * // Using accessibility id (default)
 * await browser.scroll2Element(await $('~submitButton'), 'accessibility id', 'submitButton')
 * 
 * @example
 * // Using -android uiautomator
 * await browser.scroll2Element(
 *   await $('android=new UiSelector().text("Submit")'),
 *   '-android uiautomator',
 *   'new UiSelector().text("Submit")'
 * )
 */
browser.addCommand(
    'scroll2Element',
    async function (
        element: WebdriverIO.Element,
        strategy: string = 'accessibility id',
        selector: string,
        maxSwipes: number = 10
    ) {
        const isIOS = (await browser.capabilities).platformName === 'iOS'
        const elementSelector = await element.selector

        if (isIOS) {
            logger.info(`scroll2Element :: waitForExist :: ${elementSelector}`)
            await element.waitForExist({ timeout: 15000 })
            const isVisible = await element.isDisplayed()
            logger.info(`scroll2Element :: Scrolling to element :: ${elementSelector}`)
            if (!isVisible) {
                const elementId = element.elementId
                await browser.execute('mobile: scrollToElement', { elementId: elementId })
            }
        } else {
            // For Android, use mobile:scroll with UiAutomator
            logger.info(`scroll2Element :: Android :: strategy: ${strategy}, selector: ${selector}`)
            try {
                await browser.execute('mobile: scroll', {
                    strategy: strategy,
                    selector: selector,
                    maxSwipes: maxSwipes
                })
                logger.info(`scroll2Element :: Successfully scrolled to element`)
            } catch (error) {
                logger.error(`scroll2Element :: Failed to scroll to element: ${error}`)
                throw error
            }
        }
    }
)


logger.info('Mobile custom commands loaded successfully')
