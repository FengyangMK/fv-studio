import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import type { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import type { ApiSuccessResponse } from '../types/api-response.types'

/** 将所有有响应体的成功请求统一包装为 code/message/data 结构。 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiSuccessResponse<T> | T> {
    /**
     * 转换控制器返回值。
     * @param context 当前请求执行上下文
     * @param next 后续处理器
     * @returns 统一包装后的响应流
     */
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiSuccessResponse<T> | T> {
        const response = context.switchToHttp().getResponse<{ statusCode: number }>()

        return next.handle().pipe(
            map(data => {
                // 204 响应按 HTTP 约定不返回响应体，避免破坏客户端的无内容语义。
                if (response.statusCode === 204 || data === undefined) {
                    return data
                }

                return {
                    code: 0,
                    message: '操作成功',
                    data,
                }
            })
        )
    }
}
