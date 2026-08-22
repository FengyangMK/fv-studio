export class HealthResponseDto {
    status!: 'ok'
    service!: 'server'
    environment!: string
    database!: 'up'
    timestamp!: string
}
