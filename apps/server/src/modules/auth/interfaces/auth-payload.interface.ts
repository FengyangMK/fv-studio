export interface AccessTokenPayload {
    sub: string
    email: string
    type: 'access'
}

export interface RefreshTokenPayload {
    sub: string
    sessionId: string
    familyId: string
    type: 'refresh'
}

export type AuthenticatedPayload = AccessTokenPayload | RefreshTokenPayload
