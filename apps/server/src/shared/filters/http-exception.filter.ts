import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import type { Request, Response } from 'express'

import type { ApiErrorResponse } from '../types/api-response.types'

interface HttpErrorPayload {
    message?: string | string[]
}

/** 将 HTTP 异常统一转换为前端可稳定消费的 code/message/data 结构。 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name)

    /**
     * 处理控制器及管道抛出的异常。
     * @param exception 原始异常
     * @param host Nest 请求上下文
     */
    catch(exception: unknown, host: ArgumentsHost): void {
        const context = host.switchToHttp()
        const response = context.getResponse<Response>()
        const request = context.getRequest<Request>()
        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
        const message = this.getMessage(exception, status)

        if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(`${request.method} ${request.url}: ${message}`, exception)
        }

        const payload: ApiErrorResponse = {
            code: status,
            message,
            data: null,
        }
        response.status(status).json(payload)
    }

    private getMessage(exception: unknown, status: number): string {
        if (!(exception instanceof HttpException)) {
            return '服务器内部错误'
        }

        const exceptionResponse = exception.getResponse()
        if (typeof exceptionResponse === 'string') {
            return exceptionResponse
        }

        if (this.isHttpErrorPayload(exceptionResponse)) {
            const message = exceptionResponse.message
            if (Array.isArray(message)) {
                return message.join('；')
            }
            if (message) {
                return message
            }
        }

        return exception.message || `请求失败（${status}）`
    }

    private isHttpErrorPayload(payload: unknown): payload is HttpErrorPayload {
        return typeof payload === 'object' && payload !== null && 'message' in payload
    }
}
