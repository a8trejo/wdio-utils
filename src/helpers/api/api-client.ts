import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import curlirize from 'axios-curlirize'

export interface ApiClientConfig {
    baseURL: string
    headers?: Record<string, string>
    timeout?: number
    enableCurlLogging?: boolean
}

export interface ApiResponse<T = any> {
    status: number
    statusText: string
    data: T
    headers: any
    isOkStatusCode: boolean
}

export class ApiClient {
    private client: AxiosInstance
    private enableCurlLogging: boolean

    constructor(config: ApiClientConfig) {
        this.enableCurlLogging = config.enableCurlLogging ?? false
        
        this.client = axios.create({
            baseURL: config.baseURL,
            headers: config.headers || {},
            timeout: config.timeout || 30000,
            validateStatus: () => true, // Don't throw on any status code (similar to failOnStatusCode: false)
        })

        // Enable curlirize if requested
        if (this.enableCurlLogging) {
            // @ts-ignore - axios-curlirize has type compatibility issues with newer axios versions
            curlirize(this.client, (result: any, err: any) => {
                const { command } = result
                if (command) {
                    console.log('\n🔧 cURL Command:')
                    console.log(command)
                }
                if (err) {
                    console.error('Curlirize error:', err)
                }
            })
        }
    }

    async request<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response: AxiosResponse<T> = await this.client.request(config)
        
        return {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            headers: response.headers,
            isOkStatusCode: response.status >= 200 && response.status < 300,
        }
    }

    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>({ ...config, method: 'GET', url })
    }

    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>({ ...config, method: 'POST', url, data })
    }

    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>({ ...config, method: 'PUT', url, data })
    }

    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>({ ...config, method: 'DELETE', url })
    }

    async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>({ ...config, method: 'PATCH', url, data })
    }
}
