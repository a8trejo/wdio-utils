# API Testing Helpers

This directory contains reusable API testing utilities for WebdriverIO tests using axios.

## Overview

The API helpers provide an elegant way to make HTTP requests in your tests without relying on Cypress-specific commands. They use axios under the hood with additional features like:

- **Type-safe responses** with TypeScript interfaces
- **Automatic curl command logging** via axios-curlirize
- **Flexible logging levels** for debugging
- **Consistent response format** similar to Cypress API responses

## Structure

### [`api-client.ts`](../src/helpers/api/api-client.ts)

Base API client class that wraps axios with additional functionality:

- Configurable base URL, headers, and timeout
- Optional curl command logging
- Consistent response format with `isOkStatusCode` property
- Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH)

**Example:**

```typescript
import { ApiClient } from './api-client.js'

const client = new ApiClient({
    baseURL: 'https://api.example.com',
    headers: {
        'Authorization': 'Bearer token',
    },
    enableCurlLogging: true, // Logs curl commands for debugging
})

const response = await client.get('/endpoint')
console.log(response.status) // 200
console.log(response.isOkStatusCode) // true
console.log(response.data) // Response body
```

### [`github-api.ts`](../src/helpers/api/github-api.ts)

GitHub-specific API wrapper that provides methods for common GitHub API operations:

- `getWorkflows(repoPath, logLevel)` - Get workflows for a repository
- `getWorkflowsRuns(repoPath, workflowId, logLevel)` - Get workflow runs
- `getIssues(repoPath, parameters, logLevel)` - Get issues with optional filters

**Features:**
- Automatically reads `GITHUB_TOKEN` from environment variables
- Includes proper GitHub API headers
- Optional logging at different levels (NONE, BASIC, DETAILED)
- Type-safe response interfaces

**Example:**

```typescript
import { githubAPI, ApiLogLevel } from './github-api.js'

// Get workflows with detailed logging
const response = await githubAPI.getWorkflows('owner/repo', ApiLogLevel.DETAILED)
expect(response.status).toBe(200)
expect(response.data.workflows.length).toBeGreaterThan(0)

// Get issues with query parameters
const issues = await githubAPI.getIssues('owner/repo', { state: 'open' })
```

## Configuration

### Environment Variables

Add your GitHub token to the `.env` or `.env.local` file:

```bash
GITHUB_TOKEN="your-github-personal-access-token"
```

The token is automatically loaded by the wdio configuration via dotenv.

### Log Levels

Three log levels are available:

- `ApiLogLevel.NONE` (0) - No logging
- `ApiLogLevel.BASIC` (1) - Log endpoint and status
- `ApiLogLevel.DETAILED` (2) - Log endpoint, status, and full response body

### Curl Logging

When `enableCurlLogging: true` is set in the ApiClient config, every request will output an equivalent curl command that you can copy and run in your terminal for debugging.

## Usage in Tests

See [`../src/specs/github-api.spec.ts`](../src/specs/github-api.spec.ts) for a complete example of migrating from Cypress to WebdriverIO API tests.

**Key differences from Cypress:**

| Cypress | WebdriverIO + Axios |
|---------|---------------------|
| `cy.apiGithub()` custom command | `githubAPI.getWorkflows()` method |
| `response.body` | `response.data` |
| `cy.get('@alias')` | Direct `await` with variables |
| `ApiLogLvl.DOM` | `ApiLogLevel.DETAILED` |

## Extending

To add support for other APIs, create a new file similar to `github-api.ts`:

1. Import `ApiClient` and `ApiResponse`
2. Create a class with methods for your API endpoints
3. Configure the client with appropriate base URL and headers
4. Export a singleton instance

```typescript
import { ApiClient, ApiResponse } from './api-client.js'

class MyApi {
    private client: ApiClient

    constructor() {
        this.client = new ApiClient({
            baseURL: 'https://api.myservice.com',
            headers: {
                'Authorization': `Bearer ${process.env.MY_API_TOKEN}`,
            },
        })
    }

    async getData(): Promise<ApiResponse> {
        return this.client.get('/data')
    }
}

export const myAPI = new MyApi()
```
