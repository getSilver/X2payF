// @ts-nocheck
import { describe, expect, test } from 'bun:test'
import { ValidationError } from 'yup'
import { getChannelValidationSchema } from './channelValidationSchema'

const createValidValues = () => ({
    code: 'CH001',
    name: 'Test Channel',
    display_name: 'Test Channel Display',
    supported_currencies: ['CNY'],
    supported_payment_methods: ['BANK_TRANSFER'],
    supported_transaction_types: ['PAY_IN'],
    fee_mode: 'BY_TXN_TYPE',
    unified_percentage_fee: '',
    unified_fixed_fee: '',
    pay_in_percentage_fee: '0.01',
    pay_in_fixed_fee: '1',
    pay_out_percentage_fee: '0.01',
    pay_out_fixed_fee: '1',
    tiered_rules: [],
    min_amount: '1',
    max_amount: '1000',
    daily_limit: '10000',
    production_endpoint: 'https://example.com/prod',
    test_endpoint: 'https://example.com/test',
    merchant_id: 'merchant-1',
    app_id: '',
    secret_key: 'secret',
    certificate: '',
    adapter_key: '',
    protocol_version: '',
    adapter_binding_status: '',
    has_existing_adapter_binding: false,
    timeout: '30',
    retry_count: '3',
    retry_interval: '1000',
})

describe('getChannelValidationSchema', () => {
    test('builds schema without cyclic dependency errors', () => {
        expect(() => getChannelValidationSchema('new')).not.toThrow()
    })

    test('allows submitting without adapter binding values', async () => {
        const schema = getChannelValidationSchema('new')

        await expect(schema.validate(createValidValues())).resolves.toBeTruthy()
    })

    test('requires the full adapter binding tuple once any field is provided', async () => {
        const schema = getChannelValidationSchema('new')

        try {
            await schema.validate(
                {
                    ...createValidValues(),
                    adapter_key: 'mock-adapter',
                },
                { abortEarly: false },
            )
            throw new Error('expected validation to fail')
        } catch (error) {
            expect(error).toBeInstanceOf(ValidationError)
            const validationError = error as ValidationError
            expect(validationError.inner.map((item) => item.path)).toEqual(
                expect.arrayContaining(['protocol_version', 'adapter_binding_status']),
            )
        }
    })

    test('accepts adapter binding values when all required fields are present', async () => {
        const schema = getChannelValidationSchema('new')

        await expect(
            schema.validate({
                ...createValidValues(),
                adapter_key: 'mock-adapter',
                protocol_version: 'v1',
                adapter_binding_status: 'enabled',
            }),
        ).resolves.toBeTruthy()
    })
})
