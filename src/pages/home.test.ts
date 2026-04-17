class HomeTestPage {
    get homeHeader() {
        const selector = driver.isIOS ? '~Hello, world!' : '//android.widget.Button[@content-desc="Hello, world!"]'
        return $(selector)
    }
}

export const homeTestPage = new HomeTestPage()
