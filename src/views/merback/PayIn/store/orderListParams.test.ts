/* eslint-disable import/no-unresolved */
import { describe, expect, test } from 'bun:test'
import { buildOrderListParams } from './orderListParams'

describe('buildOrderListParams', () => {
    const now = new Date('2026-04-19T12:00:00.000Z')

    test('keeps keyword search independent when no drawer filters are active', () => {
        expect(
            buildOrderListParams(
                {
                    pageIndex: 1,
                    pageSize: 25,
                    query: 'pay_123',
                },
                {
                    direction: '',
                    statuses: [],
                    notifyFailed: false,
                },
                now,
            ),
        ).toEqual({
            page: 1,
            page_size: 25,
            keyword: 'pay_123',
        })
    })

    test('adds 30 day window and filter params when drawer filters are active', () => {
        expect(
            buildOrderListParams(
                {
                    pageIndex: 2,
                    pageSize: 50,
                    query: '',
                },
                {
                    direction: 'PAY_IN',
                    statuses: ['SUCCESS', 'REFUNDED'],
                    notifyFailed: true,
                },
                now,
            ),
        ).toEqual({
            page: 2,
            page_size: 50,
            transaction_type: 'PAY_IN',
            statuses: 'SUCCESS,REFUNDED',
            notify_failed: true,
            start_time: '2026-03-20T12:00:00.000Z',
            end_time: '2026-04-19T12:00:00.000Z',
        })
    })

    test('keeps keyword search out of the 30 day window when filters are also active', () => {
        expect(
            buildOrderListParams(
                {
                    pageIndex: 1,
                    pageSize: 25,
                    query: 'merchant_tx_001',
                },
                {
                    direction: 'PAY_OUT',
                    statuses: ['FAILED'],
                    notifyFailed: true,
                },
                now,
            ),
        ).toEqual({
            page: 1,
            page_size: 25,
            keyword: 'merchant_tx_001',
            transaction_type: 'PAY_OUT',
            statuses: 'FAILED',
            notify_failed: true,
        })
    })
})
