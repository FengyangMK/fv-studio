/**
 * 成功响应的统一结构。
 * @template T 业务数据类型
 */
export interface ApiSuccessResponse<T> {
    code: 0
    message: string
    data: T
}

/** 失败响应的统一结构。 */
export interface ApiErrorResponse {
    code: number
    message: string
    data: null
}
