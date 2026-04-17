/**
 * TypeScript declarations for custom mobile commands
 * This file extends the WebdriverIO Browser interface with custom command signatures
 */

declare global {
    namespace WebdriverIO {
        interface Browser {
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
            scroll2Element(
                element: WebdriverIO.Element,
                strategy?: string,
                selector?: string,
                maxSwipes?: number
            ): Promise<void>

            /**
             * Performs a tap action on an element using mobile-specific gestures
             * For iOS, calculates center coordinates and uses mobile:tap
             * For Android, uses standard click
             * 
             * @param element - The element to tap
             * 
             * @example
             * await browser.mobileTap(await $('~submitButton'))
             */
            mobileTap(element: WebdriverIO.Element): Promise<void>

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
            performTap(xCenter: number, yCenter: number): Promise<void>
        }
    }
}

export {}
