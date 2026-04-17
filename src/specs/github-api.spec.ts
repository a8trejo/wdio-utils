import { githubAPI, ApiLogLevel } from '../helpers/api/github-api.js'

describe('As a github API user', () => {
    it('should be able to list my workflows and runs', async () => {
        const repoPath = 'a8trejo/cypress-utils'

        // Get workflows
        const workflowsResponse = await githubAPI.getWorkflows(repoPath, ApiLogLevel.DETAILED)
        expect(workflowsResponse.status).toBe(200)
        expect(workflowsResponse.data.workflows).toBeDefined()
        expect(workflowsResponse.data.workflows.length).toBeGreaterThan(0)

        // Get workflow runs for the first workflow
        const firstWorkflowId = workflowsResponse.data.workflows[0].id
        const workflowRunsResponse = await githubAPI.getWorkflowsRuns(repoPath, firstWorkflowId, ApiLogLevel.DETAILED)

        expect(workflowRunsResponse.isOkStatusCode).toBe(true)
        expect(workflowRunsResponse.status).toBe(200)
    })
})
