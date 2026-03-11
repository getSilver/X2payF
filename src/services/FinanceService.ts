import ApiService from './ApiService'

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
    extra?: string | { withdrawal_address?: string }
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

export interface ReconciliationTaskListItem {
    task_id: string
    task_no: string
    app_id: string
    type: string
    status: string
    progress: number
    message: string
    requested_by: string
    source: 'AUTO' | 'MANUAL'
    discrepancy_count: number
    created_at: string
    updated_at: string
    completed_at?: string
}

export interface ReconciliationTaskListQuery {
    app_id?: string
    type?: string
    status?: string
    source?: 'AUTO' | 'MANUAL'
    start_time?: string
    end_time?: string
    page?: number
    page_size?: number
}

export async function apiListReconciliationTasks(
    params: ReconciliationTaskListQuery = {}
) {
    const page = params.page ?? 1
    const pageSize = params.page_size ?? 10
    const response = await ApiService.fetchData<{ data: unknown }>({
        url: '/api/v1/admin/settlement/reconciliation/tasks',
        method: 'get',
        params: {
            ...params,
            page,
            page_size: pageSize,
        },
    })

    const payload = unwrapPayload<unknown>(response.data)
    return normalizePaginated<ReconciliationTaskListItem>(payload, page, pageSize)
}

type ProfitSharingRecordStatus =
    | 'PENDING'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELLED'

export interface SettlementProfitSharingStatistics {
    total_records: number
    total_amount: number
    completed_amount: number
    pending_amount: number
    failed_amount: number
}

export interface SettlementProfitSharingRecord {
    id: string
    profit_sharing_id: string
    app_id: string
    transaction_id: string
    recipient_id: string
    recipient_type: string
    amount: number
    percentage: number
    status: ProfitSharingRecordStatus
    created_at: string
    completed_at?: string
}

export interface SettlementProfitSharingQuery {
    app_id?: string
    recipient_id?: string
    status?: ProfitSharingRecordStatus
    start_time?: string
    end_time?: string
    page?: number
    page_size?: number
}

export interface PaginatedResult<T> {
    list: T[]
    total: number
    page: number
    page_size: number
    total_records?: number
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

export async function apiGetSettlementProfitSharingStatistics(
    params: SettlementProfitSharingQuery = {}
) {
    const response = await ApiService.fetchData<{ data: unknown }>({
        url: '/api/v1/admin/settlement/profit-sharing/statistics',
        method: 'get',
        params,
    })
    return unwrapPayload<SettlementProfitSharingStatistics>(response.data)
}

export async function apiGetSettlementProfitSharingRecords(
    params: SettlementProfitSharingQuery = {}
) {
    const page = params.page ?? 1
    const pageSize = params.page_size ?? 10
    const response = await ApiService.fetchData<{ data: unknown }>({
        url: '/api/v1/admin/settlement/profit-sharing/records',
        method: 'get',
        params: {
            ...params,
            page,
            page_size: pageSize,
        },
    })
    const payload = unwrapPayload<unknown>(response.data)
    const paged = normalizePaginated<SettlementProfitSharingRecord>(
        payload,
        page,
        pageSize
    )
    return {
        ...paged,
        total_records: paged.total,
    }
}
