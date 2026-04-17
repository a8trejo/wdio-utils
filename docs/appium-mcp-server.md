# Using Appium MCP Server with wdio-utils

The Appium MCP (Model Context Protocol) server enables AI-assisted mobile automation directly from Roo Code. It allows you to inspect elements, validate testIDs, generate locators, and interact with your mobile app interactively.

## Prerequisites

1. **Appium Server running**: `appium --allow-cors` (Node v24+ recommended)
2. **MCP Server configured** in your Roo Code settings (should already be set up)
    - Follow the instructions in https://github.com/appium/appium-mcp and start the server with `npx -y appium-mcp@latest`
3. **Device/Simulator running** with the app already launched

## Quick Start

### 1. Check Appium Server Status

```bash
curl http://localhost:4723/status
```

Expected response:
```json
{"value":{"ready":true,"message":"The server is ready to accept new connections","build":{"version":"3.3.0"}}}
```

### 2. Find Your Device UDID

**For iOS Simulator:**
```bash
xcrun simctl list devices available | grep -i "iphone" | grep "Booted"
```

**For Android Emulator:**
```bash
adb devices
```

### 3. Connect to Your Device

Ask Roo Code to create an Appium session using your device details:

**Example for iOS:**
```typescript
// Create session with iPhone 17 simulator
mcp--appium-mcp--create_session({
  platform: "general",
  remoteServerUrl: "http://localhost:4723",
  capabilities: {
    "platformName": "iOS",
    "appium:automationName": "XCUITest",
    "appium:deviceName": "iPhone 17",
    "appium:platformVersion": "26.4",
    "appium:udid": "457A281B-6D65-42F9-B42E-6349F071AB01",
    "appium:settings[snapshotMaxDepth]": "62",
    "appium:autoAcceptAlerts": true,
    "appium:autoDismissAlerts": true,
    "appium:resetLocationService": true,
    "appium:newCommandTimeout": 3600,
    "appium:connectHardwareKeyboard": true
  }
})
```

**Example for Android:**
```typescript
mcp--appium-mcp--create_session({
  platform: "general",
  remoteServerUrl: "http://localhost:4723",
  capabilities: {
    "platformName": "Android",
    "appium:automationName": "UiAutomator2",
    "appium:deviceName": "Pixel 7",
    "appium:platformVersion": "14",
    "appium:udid": "emulator-5554",
    "appium:settings[snapshotMaxDepth]": 80,
    "appium:autoGrantPermissions": true
  }
})
```

## Common MCP Commands

### Inspect Current Screen

**Take Screenshot:**
```
Take a screenshot of the current screen
```

**Get Page Source (XML):**
```
Get the page source XML
```

**Generate Locators:**
```
Generate locators for all interactive elements
```

### Find and Interact with Elements

**Find Element:**
```
Find element with accessibility id "submitButton"
```

**Click Element:**
```
Click the element with accessibility id "loginButton"
```

**Enter Text:**
```
Enter "test@example.com" into the email field
```

**Scroll:**
```
Scroll down to find the submit button
```

### Device Control

**Get Device Info:**
```
Get device information
```

**Lock/Unlock Device:**
```
Lock the device for 5 seconds
```

**Press Keys:**
```
Press the home button
```

## Why Use "general" Platform Mode?

- **"ios" or "android" mode**: Applies platform-specific defaults and device selection logic (for local Appium drivers)
- **"general" mode**: Pass-through mode that sends capabilities exactly as provided (perfect for remote servers and existing sessions)

## Common Use Cases

### 1. Validate TestIDs
Connect to your running app and verify elements exist with expected accessibility IDs:
```
Find all elements with accessibility id containing "button"
```

### 2. Generate Locators
Get suggested locators for all interactive elements:
```
Generate locators for the current screen
```

### 3. Debug Element Issues
When a test fails, connect to the app and inspect the actual element hierarchy:
```
Get page source and find elements with text "Submit"
```

### 4. Interactive Testing
Test user flows interactively before writing automated tests:
```
1. Take a screenshot
2. Click the login button
3. Enter credentials
4. Take another screenshot
5. Verify success message
```

## Workflow Example

```bash
# Terminal 1: Start Appium server
appium --allow-cors

# Terminal 2: Start your app (if needed)
# For React Native:
npx react-native start

# Terminal 3: Launch app on simulator/emulator
# (or use Xcode/Android Studio to launch manually)
```

Then in Roo Code:
1. Ask Roo to connect to the session using your device capabilities
2. Use MCP tools like `appium_screenshot`, `appium_get_page_source`, `appium_find_element`
3. Validate your page object testIDs match the actual UI
4. Generate test code based on your interactions

## Troubleshooting

### Error: "platformName can't be blank"
**Solution:** Use `platform="general"` instead of `"ios"` or `"android"`

### Error: "Unknown device or simulator UDID"
**Solution:** 
- Verify device is running: `xcrun simctl list devices | grep Booted` (iOS)
- Check UDID matches exactly (case-sensitive)
- For Android: `adb devices`

### Error: "cannot be coerced to a valid version number"
**Solution:** Ensure `platformName` and `appium:automationName` are at the top level of capabilities (W3C requirement)

### Connection refused errors
**Solution:**
- Check Appium server is running: `curl http://localhost:4723/status`
- Try `localhost` instead of `127.0.0.1` or vice versa
- Ensure Node version is up to date (v24+ recommended)
- Make sure Appium is started with `--allow-cors` flag

## Tips

- **Keep session alive**: Set `appium:newCommandTimeout` to a high value (e.g., 3600 seconds)
- **Auto-dismiss alerts**: Use `appium:autoAcceptAlerts` and `appium:autoDismissAlerts` for iOS
- **Snapshot depth**: Increase `appium:settings[snapshotMaxDepth]` if elements are deeply nested
- **Multiple sessions**: You can have multiple sessions open and switch between them

## Ending Your Session

When done, ask Roo to delete the session:
```
Delete the current Appium session
```

Or it will automatically close when you close Roo Code.

## Integration with wdio-utils

The MCP server is perfect for:
- **Validating custom commands** - Test your custom commands interactively
- **Debugging test failures** - Connect to the app state when a test fails
- **Element discovery** - Find the right selectors before writing tests
- **Quick prototyping** - Try interactions before implementing them in code

## Example Session

```
You: "Connect to my iPhone 17 simulator at localhost:4723"
Roo: [Creates session with your device]

You: "Take a screenshot"
Roo: [Shows current screen]

You: "Find all buttons on the screen"
Roo: [Lists all button elements with their accessibility IDs]

You: "Click the login button"
Roo: [Clicks the button]

You: "Get the page source"
Roo: [Shows XML hierarchy]
```

This makes debugging and test development much faster and more interactive!
