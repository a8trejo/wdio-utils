# WebdriverIO Utils

A WebdriverIO testing framework with custom mobile commands and utilities.

## Configuration Structure
This project uses a modular configuration structure with environment-based settings using `dotenv` and `deepmerge`.


### Base Configuration (`src/config/wdio.conf.ts`)
Contains the shared base configuration that applies to all environments:
- Runner configuration
- Test file patterns
- Framework settings (Mocha)
- Reporters
- Logging levels
- Hooks (can be overridden in local config)

### Local Configuration (`src/config/wdio.local.conf.ts`)
Merges with the base configuration and adds:
- Platform-specific capabilities (iOS/Android)
- Environment-specific settings
- Sauce Labs configuration (when enabled)
- Custom hooks for setup and teardown
- Spec filtering based on environment variables

## Environment Variables

Copy `.env.local.example` to `.env.local` and configure your settings:

```bash
cp .env.local.example .env.local
```

## Running Tests

### Run all tests locally
```bash
npm run test
```

### Run specific tests
Set the `TEST_SPECS` environment variable in your `.env.local`:
```bash
TEST_SPECS="example.spec.ts,another.spec.ts"
```

Or pass it inline:
```bash
TEST_SPECS="example.spec.ts" npm run wdio
```

## Custom Mobile Commands

This project includes custom WebdriverIO commands for mobile testing that extend the `browser` object with mobile-specific functionality. These provide a cleaner alternative to static methods in Page Object Models.

### Available Commands

- **`browser.scroll2Element()`** - Scrolls until an element is visible (iOS & Android)
- **`browser.mobileTap()`** - Performs mobile-specific tap gestures
- **`browser.performTap()`** - Taps at specific coordinates using W3C Actions

### Quick Example

```typescript
// Scroll to an element and tap it
const submitButton = await $('~submitButton')
await browser.scroll2Element(submitButton, 'accessibility id', 'submitButton')
await browser.mobileTap(submitButton)
```
