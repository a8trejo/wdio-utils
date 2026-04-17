/// <reference types="@wdio/globals/types" />

import dotenv from 'dotenv'
dotenv.config({ path: ['.env.local', '.env'] })
import { deepmerge } from 'deepmerge-ts'
import wdioConfig from './wdio.conf.ts'

const MOBILE_PLATFORM = process.env.MOBILE_PLATFORM || 'ios'
const IS_SAUCELABS = process.env.IS_SAUCELABS === 'true'
const ENV_KEY = process.env.ENV_KEY || 'dev'

// Reference https://appium.readthedocs.io/en/stable/en/writing-running-appium/caps/
const iosCapabilities = {
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:deviceName': process.env.IOS_DEVICE_NAME,
    'appium:platformVersion': process.env.IOS_PLATFORM_VERSION,
    'appium:udid': process.env.IOS_UDID,
    'appium:settings[snapshotMaxDepth]': '62',
    'appium:autoAcceptAlerts': true,
    'appium:autoDismissAlerts': true,
    'appium:resetLocationService': true,
}

const androidCapabilities = {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME,
    'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION,
    'appium:udid': process.env.ANDROID_UDID,
    'appium:settings[snapshotMaxDepth]': 80,
    'appium:autoGrantPermissions': true,
}

// Select the base capabilities based on platform
const baseCapabilities = MOBILE_PLATFORM === 'ios' ? iosCapabilities : androidCapabilities

// Sauce Labs configuration
const sauceConfig = {
    port: 443,
    user: process.env.SAUCE_USER,
    key: process.env.SAUCE_KEY,
    region: process.env.SAUCE_REGION || 'us',
    services: [
        [
            'sauce',
            {
                sauceConnect: true,
                sauceConnectOpts: {
                    noSslBumpDomains: 'all',
                },
            },
        ],
    ],
}

// Parse TEST_SPECS environment variable if provided
const getSpecsToRun = (): string[] | undefined => {
    const testSpecs = process.env.TEST_SPECS
    if (!testSpecs || testSpecs.trim() === '') {
        return undefined
    }

    // Split by comma and map to full paths relative to config file location
    return testSpecs
        .split(',')
        .map(spec => spec.trim())
        .filter(spec => spec.length > 0)
        .map(spec => `../specs/${spec}`)
}

const specsToRun = getSpecsToRun()

// Build the local configuration object
const localConfig = {
    // The number of times to retry the entire specfile when it fails as a whole
    specFileRetries: 0,
    //
    // Delay in seconds between the spec file retry attempts
    specFileRetriesDelay: 0,
    //
    // Whether or not retried specfiles should be retried immediately or deferred to the end of the queue
    specFileRetriesDeferred: false,

    // ------------------------------------------------------------------------------------------------------------------------------
    capabilities: [baseCapabilities],
    // ------------------------------------------------------------------------------------------------------------------------------

    // If TEST_SPECS is defined, use it. Otherwise, use base config specs.
    // Base config specs are removed before merge to prevent array concatenation.
    specs: specsToRun || wdioConfig.specs,
    // Clear any excludes when using TEST_SPECS
    ...(specsToRun && { exclude: [] }),

    // Level of logging verbosity: trace | debug | info | warn | error | silent
    logLevels: {
        webdriver: 'error',
        '@wdio/appium-service': 'error',
        '@wdio/mocha-framework': 'info',
        '@wdio/local-runner': 'info',
        '@wdio/cli': 'info',
        '@wdio/sauce-service': 'debug',
        '@wdio/json-reporter': 'info',
    },

    /**
     * Gets executed before test execution begins. At this point you can access to all global
     * variables like `browser`. It is the perfect place to define custom commands.
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs        List of spec file paths that are to be run
     */
    before: async function (capabilities: any, specs: string[]) {
        // Add any setup logic here
        console.log('Starting test execution...')
        console.log('Platform:', MOBILE_PLATFORM)
        console.log('Environment:', ENV_KEY)
    },

    /**
     * Gets executed after all tests are done. You still have access to all global variables from
     * the test.
     * @param {number} result 0 - test pass, 1 - test fail
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    after: async function (result: number, capabilities: any, specs: string[]) {
        // Add any cleanup logic here
        console.log('Test execution completed')
    },
}

// Remove specs from base config to prevent array concatenation during merge
// This allows TEST_SPECS or localConfig specs to be the sole source of truth
const { specs: _baseSpecs, ...wdioConfigWithoutSpecs } = wdioConfig

// Conditionally merge sauceConfig if IS_SAUCELABS is true
export const config = IS_SAUCELABS
    ? deepmerge(wdioConfigWithoutSpecs, sauceConfig, localConfig)
    : deepmerge(wdioConfigWithoutSpecs, localConfig)
