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
 * For iOS, uses mobile:tap
 * For Android, uses mobile:clickGesture
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
        const elementId = element.elementId
        await browser.execute('mobile: clickGesture', { elementId })
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
browser.addCommand('performActionsTap', async function (xCenter: number, yCenter: number) {
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
                    maxSwipes: maxSwipes,
                })
                logger.info(`scroll2Element :: Successfully scrolled to element`)
            } catch (error) {
                logger.error(`scroll2Element :: Failed to scroll to element: ${error}`)
                throw error
            }
        }
    }
)

/**
 * Calculates the x-coordinate position based on screen width and desired position
 *
 * @param position - The desired horizontal position (CENTER, LEFT, or RIGHT)
 * @param screenWidth - The total width of the screen in pixels
 * @param edgePadding - Optional padding from screen edges (default: 10px)
 * @returns The calculated x-coordinate in pixels
 *
 * @example
 * const x = await browser.getXCoordinate('CENTER', 375) // Returns 187.5 for 375px wide screen
 */
browser.addCommand('getXCoordinate', async function (position: XPosition, screenWidth: number, edgePadding = 10) {
    const coordinates: Record<XPosition, number> = {
        [XPosition.CENTER]: screenWidth / 2,
        [XPosition.LEFT]: edgePadding,
        [XPosition.RIGHT]: screenWidth - edgePadding,
    }
    return coordinates[position]
})

/**
 * Performs a mobile scroll gesture
 * Uses platform-specific scroll implementations
 *
 * @param startX - Starting X coordinate
 * @param startY - Starting Y coordinate
 * @param absoluteX - Ending X coordinate
 * @param yMax - Maximum Y coordinate
 *
 * @example
 * await browser.mobileScroll(100, 200, 100, 800)
 */
browser.addCommand('mobileScroll', async function (startX: number, startY: number, absoluteX: number, yMax: number) {
    const isIOS = (await browser.capabilities).platformName === 'iOS'

    if (isIOS) {
        await browser.execute('mobile: scroll', { direction: 'down' })
    } else {
        await browser.execute('mobile: scrollGesture', {
            left: 50,
            top: startY,
            width: absoluteX,
            height: yMax,
            direction: 'down',
            percent: 1.0,
            speed: 3000,
        })
    }
})

/**
 * Scrolls the page until the specified element is visible in the viewport
 * Android-specific implementation with configurable margins
 *
 * @param element - The WebdriverIO element to make visible
 * @param xPosition - The horizontal position to scroll from (CENTER, LEFT, or RIGHT), defaults to CENTER
 * @param screenMargins - Optional margins: {bottomMargin, topMargin, xPadding, scrollFactor}
 * @param maxScrolls - Maximum scroll attempts (default: 5)
 *
 * @example
 * await browser.scrollIntoView(await $('~button'))
 * await browser.scrollIntoView(await $('~button'), 'LEFT', { xPadding: 20 })
 */
browser.addCommand(
    'scrollIntoView',
    async function (
        element: WebdriverIO.Element,
        xPosition: XPosition = XPosition.CENTER,
        screenMargins?: ScreenMargins,
        maxScrolls = 5
    ) {
        const isIOS = (await browser.capabilities).platformName === 'iOS'
        const { xPadding = 10, scrollFactor = 0.5 } = screenMargins ?? {}
        const defaultUpperMenuHeight = isIOS ? 110 : 240
        const defaultBottomMenuHeight = isIOS ? 150 : 300
        const upperMenuHeight = screenMargins?.topMargin ?? defaultUpperMenuHeight
        const bottomMenuHeight = screenMargins?.bottomMargin ?? defaultBottomMenuHeight

        const wSize = await browser.getWindowSize()
        const yMax = wSize.height - bottomMenuHeight
        const xCoordinate = await (browser as any).getXCoordinate(xPosition, wSize.width, xPadding)
        const elementSelector = await element.selector
        const yDelta = Math.ceil((yMax - upperMenuHeight) * scrollFactor)

        let scrollIterations = 0
        const keepScrolling = async (xPosition: number, yMax: number, startY: number) => {
            if (scrollIterations < maxScrolls) {
                let isExisting = false
                try {
                    const isDisplayed = await element.isDisplayed()
                    if (isDisplayed) {
                        const elementY = await element.getLocation('y')
                        const maxVisibleY = wSize.height - bottomMenuHeight
                        isExisting = elementY < maxVisibleY
                        logger.info(
                            `scrollIntoView :: isDisplayed: ${isDisplayed}, elementY: ${elementY}, maxVisibleY: ${maxVisibleY}, isExisting: ${isExisting}`
                        )
                    } else {
                        logger.info(`scrollIntoView :: isExisting: ${isExisting}`)
                    }
                } catch (error) {
                    logger.debug(`scrollIntoView :: Error checking element visibility, continuing...`)
                }
                if (!isExisting) {
                    await (browser as any).mobileScroll(xPosition, startY, xPosition, yMax)
                    scrollIterations++
                    await keepScrolling(xPosition, yMax, startY)
                } else {
                    await element.waitForDisplayed()
                }
            }
        }
        logger.info(`scrollIntoView :: Scrolling to element: ${elementSelector}`)
        await keepScrolling(xCoordinate, yDelta, upperMenuHeight)
    }
)

/**
 * Clears a text field using platform-specific methods
 * For iOS, uses double tap and backspace
 * For Android, uses clearValue
 *
 * @param textElement - The text input element to clear
 *
 * @example
 * await browser.clearTextField(await $('~emailInput'))
 */
browser.addCommand('clearTextField', async function (textElement: WebdriverIO.Element) {
    const isIOS = (await browser.capabilities).platformName === 'iOS'

    if (isIOS) {
        try {
            await textElement.click()
            await browser.execute('mobile: doubleTap', { element: textElement })
            await browser.keys('\b')
        } catch (e) {
            // Appium doesn't like the '\b' key for some reason, but it still works even though it throws an error
            logger.debug('clearTextField :: Backspace key threw error but likely still worked')
        }
    } else {
        await textElement.waitForEnabled()
        await textElement.clearValue()
    }
})

/**
 * Gets the value/text from an element using platform-specific methods
 * For iOS, uses getValue
 * For Android, uses getText
 *
 * @param element - The element to get value from
 * @returns The element's value or text
 *
 * @example
 * const value = await browser.mobileValue(await $('~input'))
 */
browser.addCommand('mobileValue', async function (element: WebdriverIO.Element) {
    const isIOS = (await browser.capabilities).platformName === 'iOS'

    if (isIOS) {
        return await element.getValue()
    } else {
        return await element.getText()
    }
})

/**
 * Scrolls to the bottom of the page on Android devices
 * Continues scrolling until reaching bottom or max attempts
 *
 * @example
 * await browser.scrollToBottomAndroid()
 */
browser.addCommand('scrollToBottomAndroid', async function () {
    const wSize = await browser.getWindowSize()
    const centerX = Math.floor(wSize.width / 2)
    const yMax = Math.floor(wSize.height * 0.9)
    const maxScrolls = 25

    const keepScrolling = async (scrollIterations = 0) => {
        logger.info(`scrollToBottomAndroid :: scrollIterations :: ${scrollIterations}`)
        // UiAutomator2 'mobile: scrollGesture' returns a boolean, true if the object can still scroll
        const stillScrolling = await browser.execute('mobile: scrollGesture', {
            left: 50,
            top: 50,
            width: centerX,
            height: yMax,
            direction: 'down',
            percent: 1.0,
            speed: 3000,
        })

        logger.info(`scrollToBottomAndroid :: stillScrolling :: ${stillScrolling}`)

        if (stillScrolling && scrollIterations < maxScrolls) {
            await browser.pause(200)
            scrollIterations++
            await keepScrolling(scrollIterations)
        }
    }
    await keepScrolling()
})

/**
 * Scrolls by a specified height using platform-specific gestures
 *
 * @param height - The total height to scroll (positive number)
 *
 * @example
 * await browser.scrollHeight(6633)
 */
browser.addCommand('scrollHeight', async function (height: number) {
    const isIOS = (await browser.capabilities).platformName === 'iOS'
    const wSize = await browser.getWindowSize()
    const requiredScrolls = Math.ceil(Math.abs(height) / wSize.height)
    logger.info(`scrollHeight :: requiredScrolls :: ${requiredScrolls}`)

    const centerX = Math.floor(wSize.width / 2)
    const startY = Math.floor(wSize.height * 0.9)

    let scrollIterations = 0
    const keepScrolling = async () => {
        if (scrollIterations < requiredScrolls) {
            if (isIOS) {
                await browser.execute('mobile: scroll', { direction: 'down' })
            } else {
                await browser.execute('mobile: scrollGesture', {
                    left: centerX,
                    top: startY,
                    width: wSize.width,
                    height: wSize.height,
                    direction: 'down',
                    percent: 100,
                    speed: 3000,
                })
            }

            await browser.pause(200)
            scrollIterations++
            logger.info(`scrollHeight :: scrollIterations :: ${scrollIterations}`)
            await keepScrolling()
        }
    }
    await keepScrolling()
})

/**
 * Performs a flick/swipe gesture
 * For Android, uses mobile:flingGesture
 * For iOS, uses mobile:swipe
 *
 * @param direction - Direction to flick ('up' | 'down' | 'left' | 'right')
 *
 * @example
 * await browser.mobileFlick('down')
 */
browser.addCommand('mobileFlick', async function (direction: 'up' | 'down' | 'left' | 'right' = 'down') {
    const isIOS = (await browser.capabilities).platformName === 'iOS'
    const windowSize = await browser.getWindowSize()

    if (isIOS) {
        // iOS uses mobile:swipe
        await browser.execute('mobile: swipe', { direction })
    } else {
        // Android uses mobile:flingGesture
        await browser.execute('mobile: flingGesture', {
            direction,
            left: windowSize.width / 2,
            top: windowSize.height / 4,
            width: windowSize.width / 4,
            height: windowSize.height / 4,
            speed: 1000,
        })
    }
})

/**
 * Checks if an element is checked using platform-specific attributes
 *
 * @param element - The checkbox/toggle element to check
 * @returns Boolean indicating if element is checked
 *
 * @example
 * const checked = await browser.isChecked(await $('~checkbox'))
 */
browser.addCommand('isChecked', async function (element: WebdriverIO.Element) {
    const isIOS = (await browser.capabilities).platformName === 'iOS'

    if (isIOS) {
        const isChecked = await element.getAttribute('value')
        return isChecked === 'checked'
    } else {
        const isChecked = await element.getAttribute('checked')
        return isChecked === 'true'
    }
})

/**
 * Types text into an element using platform-specific methods
 * For iOS, uses setValue
 * For Android, uses mobile:type
 *
 * @param textElement - The input element to type into
 * @param inputText - The text to type
 *
 * @example
 * await browser.realType(await $('~emailInput'), 'test@example.com')
 */
browser.addCommand('realType', async function (textElement: WebdriverIO.Element, inputText: string) {
    const isIOS = (await browser.capabilities).platformName === 'iOS'
    await textElement.click()

    if (isIOS) {
        await textElement.setValue(inputText)
    } else {
        await textElement.waitForEnabled()
        await browser.execute('mobile: type', { text: inputText })
    }
})

/**
 * Closes the keyboard using various strategies
 *
 * @param strategy - The strategy to use: 'doneBtn', 'tap', or 'driverHide'
 *
 * @example
 * await browser.closeKeyboard('doneBtn')
 */
browser.addCommand('closeKeyboard', async function (strategy: 'doneBtn' | 'tap' | 'driverHide' = 'doneBtn') {
    const isIOS = (await browser.capabilities).platformName === 'iOS'

    try {
        if (isIOS && strategy === 'doneBtn') {
            const doneButton = await $('~Done')
            await doneButton.waitForExist({ timeout: 12000 })
            const isDoneButtonDisplayed = await doneButton.isDisplayed()
            if (isDoneButtonDisplayed) {
                await doneButton.click()
                await browser.waitUntil(async () => !(await doneButton.isExisting()), {
                    timeout: 5000,
                    timeoutMsg: 'Keyboard done button still exists after clicking...',
                })
            }
        } else if (strategy === 'tap') {
            const keyboardFrame = await $('//XCUIElementTypeKeyboard')
            const xPos = await keyboardFrame.getLocation('x')
            const yPos = await keyboardFrame.getLocation('y')
            const width = await keyboardFrame.getSize('width')
            const xCenter = xPos + width / 2
            const yTop = yPos - 5
            await browser.execute('mobile: tap', { x: xCenter, y: yTop })
        } else {
            await browser.execute('mobile: hideKeyboard')
        }
    } catch (error) {
        logger.info('closeKeyboard :: No keyboard found or already closed')
    }
})

/**
 * Selects a value on an iOS picker wheel
 * Note: This is iOS-only. Android uses different picker mechanisms (spinners, dropdowns)
 *
 * @param options.iosPickerWheel - The picker wheel element (XCUIElementTypePickerWheel)
 * @param options.numInList - Number of times to scroll the picker wheel
 * @param options.tapDone - Whether to tap the "Done" link after selection (default: true)
 * @param options.nativeWheel - Use addValue instead of selectPickerWheelValue (default: false)
 * @param options.value - The target value to set directly on the picker wheel (required when nativeWheel is true)
 * @param options.order - Direction to scroll: 'next' or 'previous' (default: 'next')
 * @param options.offset - Offset from center for the click, range [0.01, 0.5] (default: 0.1)
 *
 * @example
 * // Default behavior (mobile: selectPickerWheelValue)
 * await browser.pickerWheelSelectiOS({ iosPickerWheel: await $('~hourPicker'), numInList: 3 })
 *
 * @example
 * // Alternative behavior (addValue) - useful when selectPickerWheelValue throws timeout errors
 * await browser.pickerWheelSelectiOS({
 *   iosPickerWheel: await $('~minutesPicker'),
 *   numInList: 1,
 *   nativeWheel: true,
 *   value: '30'
 * })
 */
browser.addCommand(
    'pickerWheelSelectiOS',
    async function (options: {
        iosPickerWheel: WebdriverIO.Element
        numInList: number
        tapDone?: boolean
        nativeWheel?: boolean
        value?: string
        order?: 'next' | 'previous'
        offset?: number
    }) {
        const {
            iosPickerWheel,
            numInList,
            tapDone = true,
            nativeWheel = false,
            value,
            order = 'next',
            offset = 0.1,
        } = options

        if (nativeWheel && value !== undefined) {
            logger.info(`pickerWheelSelectiOS :: Using alternative addValue approach with value: ${value}`)
            await iosPickerWheel.addValue(value)
        } else {
            const pickerParams = {
                order,
                offset,
                elementId: await iosPickerWheel.getAttribute('UID'),
            }
            for (let x = 0; x < numInList; x++) {
                await browser.execute('mobile: selectPickerWheelValue', pickerParams)
            }
        }

        if (tapDone) {
            await $('~Done-Link').click()
        }
    }
)

/**
 * Navigates to a URL using deep linking
 * Primarily for mobile apps that support deep links
 *
 * @param url - The URL path to navigate to (will be prepended with base URL)
 *
 * @example
 * await browser.navigateToUrl('/profile')
 */
browser.addCommand('navigateToUrl', async function (url: string) {
    const baseMobileUrl = process.env.BASE_MOBILE_URL || ''
    const appId = process.env.APP_ID || ''
    const fullUrl = baseMobileUrl + url

    try {
        await browser.execute('mobile: deepLink', { url: fullUrl, package: appId })
    } catch (error) {
        logger.info('navigateToUrl :: No deep link support or error occurred')
    }

    try {
        await $('~Open').click()
    } catch (error) {
        logger.info('navigateToUrl :: No Open button found')
    }
})

/**
 * Waits for an element to exist and validates it
 *
 * @param options.element - The element to check
 * @param options.timeout - Timeout in milliseconds (default: 10000)
 * @param options.successMsg - Success message to log
 * @param options.failMsg - Failure message to log
 *
 * @example
 * await browser.shouldExist({
 *   element: await $('~submitButton'),
 *   timeout: 15000,
 *   successMsg: 'Submit button found',
 *   failMsg: 'Submit button not found'
 * })
 */
browser.addCommand(
    'shouldExist',
    async function (options: {
        element: WebdriverIO.Element
        timeout?: number
        successMsg?: string
        failMsg?: string
    }) {
        const { timeout = 10000 } = options
        const elementSelector = await options.element.selector
        const notExistingMsg = `Error: element (${elementSelector}) still not existing after ${timeout}ms`
        const successMsg = options.successMsg ?? `Element ${elementSelector} exists`
        const failMsg = options.failMsg ?? notExistingMsg

        let exists = false
        try {
            await browser.waitUntil(async () => await options.element.isExisting(), {
                timeout,
                interval: 500,
                timeoutMsg: notExistingMsg,
            })
            exists = true
        } catch (error) {
            logger.error(notExistingMsg)
        }

        if (!exists) {
            throw new Error(failMsg)
        }
        logger.info(successMsg)
    }
)

/**
 * Clicks a random element from an array of elements
 *
 * @param elements - Array of WebdriverIO elements
 *
 * @example
 * const buttons = await $$('~button')
 * await browser.clickRandomOption(buttons)
 */
browser.addCommand('clickRandomOption', async function (elements: WebdriverIO.ElementArray) {
    if (elements.length === 0) {
        throw new Error('clickRandomOption :: No elements provided')
    }
    const randomIndex = Math.floor(Math.random() * elements.length)
    const randomElement = elements[randomIndex]
    await randomElement.click()
})

logger.info('Mobile custom commands loaded successfully')
