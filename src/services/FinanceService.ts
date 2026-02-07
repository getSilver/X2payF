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
    page: number = 1,
    pageSize: number = 20
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
