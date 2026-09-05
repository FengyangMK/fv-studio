import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { authConfig } from '../../../config/configuration'
import type { RefreshTokenPayload } from '../interfaces/auth-payload.interface'

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
    constructor(
        @Inject(authConfig.KEY)
        config: ConfigType<typeof authConfig>
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            secretOrKey: config.refreshSecret,
            algorithms: ['HS256'],
        })
    }

    validate(payload: RefreshTokenPayload): RefreshTokenPayload {
        if (payload.type !== 'refresh' || !payload.sub || !payload.sessionId || !payload.familyId) {
            throw new UnauthorizedException('Invalid refresh token payload')
        }
        return payload
    }
}
