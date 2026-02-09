import ApiService from './ApiService'
import createUID from '@/components/ui/utils/createUid'

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'

export interface Withdrawal {
    id: string
    app_id: string
    merchant_id: string
    request_id: string
    amount: number
    fee: number
    actual_amount: number
    currency: string
    status: WithdrawalStatus
    note: string
    applicant_id: string
    applied_at: string
    approver_id?: string
    approved_at?: string
    approval_note?: string
    completed_by?: string
    completed_at?: string
    completion_note?: string
    cancelled_by?: string
    cancelled_at?: string
    cancel_reason?: string
    created_at: string
    updated_at: string
}

export interface WithdrawalListResponse {
    list: Withdrawal[]
    total: number
    page: number
    page_size: number
}

export interface ApproveWithdrawalRequest {
    note?: string
}

export interface RejectWithdrawalRequest {
    reason: string
}

export interface CompleteWithdrawalRequest {
    note?: string
}

export async function apiGetPendingWithdrawals(
    page = 1,
    pageSize = 20
): Promise<WithdrawalListResponse> {
    const response = await ApiService.fetchData<{ data: WithdrawalListResponse }>({
        url: '/api/v1/admin/withdrawals',
        method: 'get',
        params: {
            page,
            page_size: pageSize,
        },
    })
    return response.data.data
}

export async function apiGetWithdrawalDetail(id: string): Promise<Withdrawal> {
    const response = await ApiService.fetchData<{ data: Withdrawal }>({
        url: `/api/v1/admin/withdrawals/${id}`,
        method: 'get',
    })
    return response.data.data
}

export async function apiApproveWithdrawal(
    id: string,
    data: ApproveWithdrawalRequest
): Promise<void> {
    await ApiService.fetchData<void, ApproveWithdrawalRequest>({
        url: `/api/v1/admin/withdrawals/${id}/approve`,
        method: 'post',
        data,
    })
}

export async function apiRejectWithdrawal(
    id: string,
    data: RejectWithdrawalRequest
): Promise<void> {
    await ApiService.fetchData<void, RejectWithdrawalRequest>({
        url: `/api/v1/admin/withdrawals/${id}/reject`,
        method: 'post',
        data,
    })
}

export async function apiCompleteWithdrawal(
    id: string,
    data: CompleteWithdrawalRequest
): Promise<void> {
    await ApiService.fetchData<void, CompleteWithdrawalRequest>({
        url: `/api/v1/admin/withdrawals/${id}/complete`,
        method: 'post',
        data,
    })
}

export type SettlementRequestPayload = Record<string, unknown>
export type SettlementResponsePayload = Record<string, unknown>

async function postSettlementAction(
    url: string,
    payload: SettlementRequestPayload
): Promise<SettlementResponsePayload> {
    const response = await ApiService.fetchData<
        SettlementResponsePayload,
        SettlementRequestPayload
    >({
        url,
        method: 'post',
        data: payload,
    })

    return response.data || {}
}

export async function apiCreateSettlement(payload: SettlementRequestPayload) {
    return postSettlementAction('/api/v1/admin/settlement/create', payload)
}

export async function apiExecuteSettlement(payload: SettlementRequestPayload) {
    return postSettlementAction('/api/v1/admin/settlement/execute', payload)
}

export async function apiReconcileBalance(payload: SettlementRequestPayload) {
    return postSettlementAction(
        '/api/v1/admin/settlement/reconciliation/balance',
        payload
    )
}

export async function apiReconcileJournals(payload: SettlementRequestPayload) {
    return postSettlementAction(
        '/api/v1/admin/settlement/reconciliation/journals',
        payload
    )
}

export async function apiStartReconciliation(payload: SettlementRequestPayload) {
    return postSettlementAction(
        '/api/v1/admin/settlement/reconciliation/start',
        payload
    )
}

export async function apiGetReconciliationStatus(
    payload: SettlementRequestPayload
) {
    return postSettlementAction(
        '/api/v1/admin/settlement/reconciliation/status',
        payload
    )
}

export async function apiGetSettlementStatus(payload: SettlementRequestPayload) {
    return postSettlementAction('/api/v1/admin/settlement/status', payload)
}

type ProfitSharingStatus = 'ENABLED' | 'DISABLED' | 'PAUSED' | 'RUNNING'
type ProfitSharingTaskStatus =
    | 'PENDING'
    | 'RUNNING'
    | 'SUCCESS'
    | 'FAILED'
    | 'CANCELLED'

export interface ProfitSharingStatistics {
    total_amount: number
    total_records: number
    success_amount: number
    pending_amount: number
    active_schedules: number
    pending_tasks: number
}

export interface ProfitSharingSchedule {
    id: string
    name: string
    description?: string
    status: ProfitSharingStatus
    currency?: string
    rules?: string
    next_execute_at?: string
    last_execute_at?: string
    created_at?: string
    updated_at?: string
}

export interface ProfitSharingTask {
    id: string
    schedule_id: string
    status: ProfitSharingTaskStatus
    trigger_mode?: string
    started_at?: string
    finished_at?: string
    created_at?: string
    message?: string
}

export interface ProfitSharingRecord {
    id: string
    task_id?: string
    schedule_id?: string
    order_id?: string
    merchant_id?: string
    amount: number
    currency?: string
    status?: string
    created_at?: string
}

export interface ProfitSharingSchedulePayload {
    name: string
    description?: string
    currency?: string
    rules?: string
}

export interface ProfitSharingListQuery {
    page?: number
    page_size?: number
    keyword?: string
    status?: string
}

export interface ProfitSharingRecordQuery extends ProfitSharingListQuery {
    task_id?: string
    schedule_id?: string
}

export interface ProfitSharingTaskQuery extends ProfitSharingListQuery {
    schedule_id?: string
}

export interface PaginatedResult<T> {
    list: T[]
    total: number
    page: number
    page_size: number
}

type UnknownRecord = Record<string, unknown>

const asRecord = (value: unknown): UnknownRecord =>
    (value && typeof value === 'object' ? value : {}) as UnknownRecord

const unwrapPayload = <T>(payload: unknown): T => {
    const root = asRecord(payload)
    const data = root.data
    return (data ?? payload) as T
}

const normalizePaginated = <T>(
    payload: unknown,
    defaultPage = 1,
    defaultPageSize = 10
): PaginatedResult<T> => {
    const source = asRecord(payload)
    const listCandidate = source.list
    const list = Array.isArray(listCandidate)
        ? (listCandidate as T[])
        : Array.isArray(payload)
          ? (payload as T[])
          : []
    return {
        list,
        total: Number(source.total ?? list.length ?? 0),
        page: Number(source.page ?? defaultPage),
        page_size: Number(source.page_size ?? defaultPageSize),
    }
}

const withRequestId = <T extends UnknownRecord>(payload?: T) => ({
    request_id: createUID(16),
    ...(payload ?? {}),
})

export async function apiGetProfitSharingStatistics() {
    const response = await ApiService.fetchData<{ data: unknown }>({
        url: '/api/v1/profit-sharing/statistics',
        method: 'get',
    })
    return unwrapPayload<ProfitSharingStatistics>(response.data)
}

export async function apiGetProfitSharingSchedules(
    params: ProfitSharingListQuery = {}
) {
    const page = params.page ?? 1
    const pageSize = params.page_size ?? 10
    const response = await ApiService.fetchData<{ data: unknown }>({
        url: '/api/v1/profit-sharing/schedules',
        method: 'get',
        params: {
            ...params,
            page,
            page_size: pageSize,
        },
    })
    return normalizePaginated<ProfitSharingSchedule>(
        unwrapPayload<unknown>(response.data),
        page,
        pageSize
    )
}

export async function apiCreateProfitSharingSchedule(
    payload: ProfitSharingSchedulePayload
) {
    const response = await ApiService.fetchData<{ data: unknown }, UnknownRecord>(
        {
            url: '/api/v1/profit-sharing/schedules',
            method: 'post',
            data: withRequestId(payload),
        }
    )
    return unwrapPayload<ProfitSharingSchedule>(response.data)
}

export async function apiDeleteProfitSharingSchedule(id: string) {
    await ApiService.fetchData<void>({
        url: `/api/v1/profit-sharing/schedules/${id}`,
        method: 'delete',
    })
}

export async function apiGetProfitSharingScheduleDetail(id: string) {
    const response = await ApiService.fetchData<{ data: unknown }>({
        url: `/api/v1/profit-sharing/schedules/${id}`,
        method: 'get',
    })
    return unwrapPayload<ProfitSharingSchedule>(response.data)
}

export async function apiUpdateProfitSharingSchedule(
    id: string,
    payload: ProfitSharingSchedulePayload
) {
    const response = await ApiService.fetchData<{ data: unknown }, UnknownRecord>(
        {
            url: `/api/v1/profit-sharing/schedules/${id}`,
            method: 'put',
            data: payload,
        }
    )
    return unwrapPayload<ProfitSharingSchedule>(response.data)
}

export async function apiUpdateProfitSharingRules(id: string, rules: string) {
    const response = await ApiService.fetchData<{ data: unknown }, UnknownRecord>(
        {
            url: `/api/v1/profit-sharing/schedules/${id}/rules`,
            method: 'put',
            data: withRequestId({ rules }),
        }
    )
    return unwrapPayload<ProfitSharingSchedule>(response.data)
}

async function postScheduleAction(id: string, action: string) {
    await ApiService.fetchData<void, UnknownRecord>({
        url: `/api/v1/profit-sharing/schedules/${id}/${action}`,
        method: 'post',
        data: withRequestId(),
    })
}

export async function apiDisableProfitSharingSchedule(id: string) {
    await postScheduleAction(id, 'disable')
}

export async function apiEnableProfitSharingSchedule(id: string) {
    await postScheduleAction(id, 'enable')
}

export async function apiPauseProfitSharingSchedule(id: string) {
    await postScheduleAction(id, 'pause')
}

export async function apiResumeProfitSharingSchedule(id: string) {
    await postScheduleAction(id, 'resume')
}

export async function apiTriggerProfitSharingSchedule(id: string) {
    await postScheduleAction(id, 'trigger')
}

export async function apiGetProfitSharingTasks(
    params: ProfitSharingTaskQuery = {}
) {
    const page = params.page ?? 1
    const pageSize = params.page_size ?? 10
    const response = await ApiService.fetchData<{ data: unknown }>({
        url: '/api/v1/profit-sharing/tasks',
        method: 'get',
        params: {
            ...params,
            page,
            page_size: pageSize,
        },
    })
    return normalizePaginated<ProfitSharingTask>(
        unwrapPayload<unknown>(response.data),
        page,
        pageSize
    )
}

export async function apiGetProfitSharingTaskDetail(id: string) {
    const response = await ApiService.fetchData<{ data: unknown }>({
        url: `/api/v1/profit-sharing/tasks/${id}`,
        method: 'get',
    })
    return unwrapPayload<ProfitSharingTask>(response.data)
}

export async function apiGetProfitSharingTaskRecords(
    id: string,
    params: ProfitSharingListQuery = {}
) {
    const page = params.page ?? 1
    const pageSize = params.page_size ?? 10
    const response = await ApiService.fetchData<{ data: unknown }>({
        url: `/api/v1/profit-sharing/tasks/${id}/records`,
        method: 'get',
        params: {
            ...params,
            page,
            page_size: pageSize,
        },
    })
    return normalizePaginated<ProfitSharingRecord>(
        unwrapPayload<unknown>(response.data),
        page,
        pageSize
    )
}

export async function apiGetProfitSharingRecords(
    params: ProfitSharingRecordQuery = {}
) {
    const page = params.page ?? 1
    const pageSize = params.page_size ?? 10
    const response = await ApiService.fetchData<{ data: unknown }>({
        url: '/api/v1/profit-sharing/records',
        method: 'get',
        params: {
            ...params,
            page,
            page_size: pageSize,
        },
    })
    return normalizePaginated<ProfitSharingRecord>(
        unwrapPayload<unknown>(response.data),
        page,
        pageSize
    )
}

export async function apiExportProfitSharingReport(
    params: ProfitSharingRecordQuery = {}
) {
    const response = await ApiService.fetchData<Blob>({
        url: '/api/v1/profit-sharing/reports/export',
        method: 'get',
        params,
        responseType: 'blob',
    })
    return response.data
}
