/* eslint-disable import/no-unresolved */
import { describe, expect, test } from 'bun:test'
import { getOrderAmountDisplay } from './orderAmountDisplay'

describe('getOrderAmountDisplay', () => {
    test('keeps the currency symbol prefix positive for successful pay out BRL rows', () => {
        expect(
            getOrderAmountDisplay({
                amount: 12345,
                currency: 'BRL',
                transaction_type: 'PAY_OUT',
            }),
        ).toEqual({
            className: 'text-red-600 font-semibold',
            prefix: 'R$',
            sign: '-',
            value: '123.45',
        })
    })

    test('uses a positive sign for pay in rows', () => {
        expect(
            getOrderAmountDisplay({
                amount: 67890,
                currency: 'USD',
                transaction_type: 'PAY_IN',
            }),
        ).toEqual({
            className: 'text-emerald-600 font-semibold',
            prefix: '$',
            sign: '+',
            value: '678.90',
        })
    })
})
