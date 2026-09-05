import type { Request } from 'express'

import type { AccessTokenPayload, RefreshTokenPayload } from './auth-payload.interface'

export interface AccessTokenRequest extends Request {
    user: AccessTokenPayload
}

export interface RefreshTokenRequest extends Request {
    user: RefreshTokenPayload
}
