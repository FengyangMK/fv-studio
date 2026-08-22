export type AppEnvironment = 'development' | 'production' | 'test'

export interface AppConfig {
    environment: AppEnvironment
    port: number
    apiPrefix: string
}

export interface DatabaseConfig {
    url: string
}
