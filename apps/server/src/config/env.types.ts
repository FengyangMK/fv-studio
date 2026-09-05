export type AppEnvironment = 'development' | 'production' | 'test'

export interface AppConfig {
    environment: AppEnvironment
    port: number
    apiPrefix: string
}

export interface DatabaseConfig {
    url: string
}

export interface AuthConfig {
    accessSecret: string
    refreshSecret: string
    accessExpiresIn: string
    refreshExpiresIn: string
    bcryptSaltRounds: number
}
