import { ApiClient, ApiResponse } from './api-client.js'

export enum ApiLogLevel {
    NONE = 0,
    BASIC = 1,
    DETAILED = 2,
}

interface WorkflowsResponse {
    total_count: number
    workflows: Array<{
        id: number
        name: string
        path: string
        state: string
        [key: string]: any
    }>
}

interface WorkflowRunsResponse {
    total_count: number
    workflow_runs: Array<{
        id: number
        name: string
        status: string
        conclusion: string | null
        [key: string]: any
    }>
}

interface IssuesResponse extends Array<{
    id: number
    number: number
    title: string
    state: string
    [key: string]: any
}> {}

class GithubApi {
    private client: ApiClient
    private readonly GITHUB_API_BASE_URL = 'https://api.github.com'

    constructor() {
        const githubToken = process.env.GITHUB_TOKEN

        if (!githubToken) {
            throw new Error('GITHUB_TOKEN environment variable is not set')
        }

        this.client = new ApiClient({
            baseURL: this.GITHUB_API_BASE_URL,
            headers: {
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                'Authorization': `Bearer ${githubToken}`,
            },
            enableCurlLogging: true, // Enable curl command logging
        })
    }

    private logResponse(response: ApiResponse, logLevel: ApiLogLevel, endpoint: string): void {
        if (logLevel === ApiLogLevel.NONE) return

        console.log(`\n📡 GitHub API Request: ${endpoint}`)
        console.log(`   Status: ${response.status} ${response.statusText}`)
        
        if (logLevel === ApiLogLevel.DETAILED) {
            console.log(`   Response:`, JSON.stringify(response.data, null, 2))
        }
    }

    async getWorkflows(
        repoPath: string,
        logLevel: ApiLogLevel = ApiLogLevel.NONE
    ): Promise<ApiResponse<WorkflowsResponse>> {
        const endpoint = `/repos/${repoPath}/actions/workflows`
        const response = await this.client.get<WorkflowsResponse>(endpoint)
        
        this.logResponse(response, logLevel, endpoint)
        
        return response
    }

    async getWorkflowsRuns(
        repoPath: string,
        workflowId: number,
        logLevel: ApiLogLevel = ApiLogLevel.NONE
    ): Promise<ApiResponse<WorkflowRunsResponse>> {
        const endpoint = `/repos/${repoPath}/actions/workflows/${workflowId}/runs?per_page=100`
        const response = await this.client.get<WorkflowRunsResponse>(endpoint)
        
        this.logResponse(response, logLevel, endpoint)
        
        return response
    }

    async getIssues(
        repoPath: string,
        parameters?: Record<string, any>,
        logLevel: ApiLogLevel = ApiLogLevel.NONE
    ): Promise<ApiResponse<IssuesResponse>> {
        const endpoint = `/repos/${repoPath}/issues`
        const response = await this.client.get<IssuesResponse>(endpoint, {
            params: parameters,
        })
        
        this.logResponse(response, logLevel, endpoint)
        
        return response
    }
}

export const githubAPI = new GithubApi()
