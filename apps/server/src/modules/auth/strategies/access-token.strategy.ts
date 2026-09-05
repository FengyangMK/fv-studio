import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { authConfig } from '../../../config/configuration'
import type { AccessTokenPayload } from '../interfaces/auth-payload.interface'

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'access-jwt') {
    constructor(
        @Inject(authConfig.KEY)
        config: ConfigType<typeof authConfig>
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.accessSecret,
            algorithms: ['HS256'],
        })
    }

    validate(payload: AccessTokenPayload): AccessTokenPayload {
        if (payload.type !== 'access' || !payload.sub || !payload.email) {
            throw new UnauthorizedException('Invalid access token payload')
        }
        return payload
    }
}
