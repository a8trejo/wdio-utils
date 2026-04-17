// Import chai types
import * as ChaiNamespace from 'chai'

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
}

export {}
