/* eslint-disable import/no-unresolved */
import { describe, expect, test } from 'bun:test'
import { isRefundAllowed } from './refundEligibility'

describe('isRefundAllowed', () => {
    test('returns false for successful pay out orders', () => {
        expect(
            isRefundAllowed({
                transaction_type: 'PAY_OUT',
                status: 'SUCCESS',
            }),
        ).toBe(false)
    })

    test('returns true for successful pay in orders', () => {
        expect(
            isRefundAllowed({
                transaction_type: 'PAY_IN',
                status: 'SUCCESS',
            }),
        ).toBe(true)
    })

    test('returns false for non-successful pay in orders', () => {
        expect(
            isRefundAllowed({
                transaction_type: 'PAY_IN',
                status: 'PENDING',
            }),
        ).toBe(false)
    })
})
