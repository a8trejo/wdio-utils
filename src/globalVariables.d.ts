// Import chai types
import * as ChaiNamespace from 'chai'
import { XPosition, ScreenMargins } from './commands/mobile.commands'

// Declare global chai variables
declare global {
    // Chai assertion library globals
    var chai: typeof ChaiNamespace
    var assert: typeof ChaiNamespace.assert

    // Global variables for test configuration
    var baseApiUrl: string
    var testEnvironment: string
    var currentSpec: string
    var apiLogLevel: string

    // WebdriverIO custom commands
    namespace WebdriverIO {
        interface Browser {
            /** Scroll to element using UiAutomator (Android) or mobile:scrollToElement (iOS) */
            scroll2Element(
                element: WebdriverIO.Element,
                strategy?: string,
                selector?: string,
                maxSwipes?: number
            ): Promise<void>

            /** Tap element using mobile:clickGesture (Android) or mobile:tap (iOS) */
            mobileTap(element: WebdriverIO.Element): Promise<void>

            /** Tap at specific coordinates using W3C Actions API */
            performTap(xCenter: number, yCenter: number): Promise<void>

            /** Calculate X coordinate based on position (CENTER, LEFT, RIGHT) */
            getXCoordinate(position: XPosition, screenWidth: number, edgePadding?: number): Promise<number>

            /** Scroll element into viewport with configurable margins */
            scrollIntoView(
                element: WebdriverIO.Element,
                xPosition?: XPosition,
                screenMargins?: ScreenMargins,
                maxScrolls?: number
            ): Promise<void>

            /** Perform platform-specific scroll gesture */
            mobileScroll(startX: number, startY: number, absoluteX: number, yMax: number): Promise<void>

            /** Clear text field using platform-specific methods */
            clearTextField(textElement: WebdriverIO.Element): Promise<void>

            /** Get element value (iOS) or text (Android) */
            mobileValue(element: WebdriverIO.Element): Promise<string>

            /** Scroll to bottom of page (Android only) */
            scrollToBottomAndroid(): Promise<void>

            /** Scroll by specified height */
            scrollHeight(height: number): Promise<void>

            /** Flick/swipe in direction (iOS: mobile:swipe, Android: mobile:flingGesture) */
            mobileFlick(direction?: 'up' | 'down' | 'left' | 'right'): Promise<void>

            /** Check if element is checked using platform-specific attributes */
            isChecked(element: WebdriverIO.Element): Promise<boolean>

            /** Type text using platform-specific methods */
            realType(textElement: WebdriverIO.Element, inputText: string): Promise<void>

            /** Close keyboard using specified strategy */
            closeKeyboard(strategy?: 'doneBtn' | 'tap' | 'driverHide'): Promise<void>

            /** Select value on iOS picker wheel (iOS only, no Android equivalent) */
            pickerWheelSelectiOS(options: {
                iosPickerWheel: WebdriverIO.Element
                numInList: number
                tapDone?: boolean
                nativeWheel?: boolean
                value?: string
                order?: 'next' | 'previous'
                offset?: number
            }): Promise<void>

            /** Navigate to URL using deep linking */
            navigateToUrl(url: string): Promise<void>

            /** Wait for element to exist and validate */
            shouldExist(options: {
                element: WebdriverIO.Element
                timeout?: number
                successMsg?: string
                failMsg?: string
            }): Promise<void>

            /** Click random element from array */
            clickRandomOption(elements: WebdriverIO.ElementArray): Promise<void>
        }
    }
}

export {}
