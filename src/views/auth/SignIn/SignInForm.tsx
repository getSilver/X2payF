import { useEffect, useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Alert from '@/components/ui/Alert'
import PasswordInput from '@/components/shared/PasswordInput'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import useAuth from '@/utils/hooks/useAuth'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import type { CommonProps } from '@/@types/common'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    forgotPasswordUrl?: string
}

// 登录表单数据
type SignInFormSchema = {
    username: string
    password: string
    rememberMe: boolean
}

// MFA 验证表单数据
type MFAFormSchema = {
    code: string
}

const loginValidationSchema = Yup.object().shape({
    username: Yup.string().required('Please enter your user name'),
    password: Yup.string().required('Please enter your password'),
    rememberMe: Yup.bool(),
})

const mfaValidationSchema = Yup.object().shape({
    code: Yup.string()
        .required('Please enter the code')
        .length(6, 'The code is a 6-digit'),
})

const SignInForm = (props: SignInFormProps) => {
    const {
        disableSubmit = false,
        className,
        forgotPasswordUrl = '/forgot-password',
    } = props

    const [message, setMessage] = useTimeOutMessage()
    const [successMessage, setSuccessMessage] = useState('')
    const [selectedFactorType, setSelectedFactorType] = useState<
        'totp' | 'email'
    >('totp')
    const [sendingCode, setSendingCode] = useState(false)
    const [emailCodeSent, setEmailCodeSent] = useState(false)

    const {
        signIn,
        requiresMFA,
        mfaPending,
        requestMFAChallenge,
        verifyMFA,
        cancelMFA,
    } = useAuth()

    const availableFactors = mfaPending?.availableFactors || []
    const emailFactor = availableFactors.find(
        (factor) => factor.factor_type === 'email'
    )
    const hasEmailFactor = Boolean(emailFactor)
    const hasTOTPFactor = availableFactors.some(
        (factor) => factor.factor_type === 'totp'
    )

    useEffect(() => {
        if (!requiresMFA) {
            setSelectedFactorType('totp')
            setSendingCode(false)
            setEmailCodeSent(false)
            return
        }

        if (mfaPending?.factorType) {
            setSelectedFactorType(mfaPending.factorType)
            setEmailCodeSent(mfaPending.factorType === 'email' && !!mfaPending.challengeId)
            return
        }

        if (hasEmailFactor && !hasTOTPFactor) {
            setSelectedFactorType('email')
        } else {
            setSelectedFactorType('totp')
        }
        setEmailCodeSent(!!mfaPending?.challengeId)
    }, [
        requiresMFA,
        mfaPending?.challengeId,
        mfaPending?.factorType,
        hasEmailFactor,
        hasTOTPFactor,
    ])

    // 处理登录
    const onSignIn = async (
        values: SignInFormSchema,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        const { username, password } = values
        setSubmitting(true)
        setSuccessMessage('')

        const result = await signIn({ username, password })

        if (result.status === 'failed') {
            setMessage(result.message)
        } else if (result.status === 'mfa_required') {
            setSuccessMessage(
                selectedFactorType === 'email'
                    ? 'Choose a verification method to continue'
                    : 'Please enter the MFA code'
            )
        }

        setSubmitting(false)
    }

    // 处理 MFA 验证
    const onVerifyMFA = async (
        values: MFAFormSchema,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        setSubmitting(true)
        setSuccessMessage('')

        const result = await verifyMFA(values.code, selectedFactorType)

        if (result.status === 'failed') {
            setMessage(result.message)
        }

        setSubmitting(false)
    }

    // 取消 MFA，返回登录
    const handleCancelMFA = () => {
        cancelMFA()
        setMessage('')
        setSuccessMessage('')
        setSelectedFactorType('totp')
        setSendingCode(false)
        setEmailCodeSent(false)
    }

    const handleFactorTypeChange = (factorType: 'totp' | 'email') => {
        setSelectedFactorType(factorType)
        setMessage('')
        if (factorType === 'totp') {
            setSuccessMessage('Please enter the MFA code')
        } else {
            setSuccessMessage('Send a verification code to your email and enter it below')
        }
    }

    const handleSendEmailCode = async () => {
        if (!emailFactor) {
            setMessage('No email verification factor is available')
            return
        }

        setSendingCode(true)
        setMessage('')
        const result = await requestMFAChallenge(emailFactor.id)

        if (result.status === 'failed') {
            setMessage(result.message)
        } else {
            setEmailCodeSent(true)
            setSuccessMessage('A verification code has been sent to your email')
        }

        setSendingCode(false)
    }

    // MFA 验证表单
    if (requiresMFA) {
        return (
            <div className={className}>
                {message && (
                    <Alert showIcon className="mb-4" type="danger">
                        <>{message}</>
                    </Alert>
                )}
                {successMessage && (
                    <Alert showIcon className="mb-4" type="info">
                        <>{successMessage}</>
                    </Alert>
                )}
                <div className="mb-4">
                    <h4 className="mb-2">MFA Validation</h4>
                    <p className="text-gray-500">
                        {selectedFactorType === 'email'
                            ? 'Send a 6-digit verification code to your bound email address, then enter it below.'
                            : 'Please enter the 6-digit verification code from your authenticator app.'}
                    </p>
                </div>
                {(hasTOTPFactor || hasEmailFactor) && (
                    <div className="mb-4 flex gap-2">
                        {hasTOTPFactor && (
                            <Button
                                size="sm"
                                variant={
                                    selectedFactorType === 'totp'
                                        ? 'solid'
                                        : 'plain'
                                }
                                type="button"
                                onClick={() => handleFactorTypeChange('totp')}
                            >
                                Authenticator App
                            </Button>
                        )}
                        {hasEmailFactor && (
                            <Button
                                size="sm"
                                variant={
                                    selectedFactorType === 'email'
                                        ? 'solid'
                                        : 'plain'
                                }
                                type="button"
                                onClick={() => handleFactorTypeChange('email')}
                            >
                                Email Code
                            </Button>
                        )}
                    </div>
                )}
                <Formik
                    initialValues={{ code: '' }}
                    validationSchema={mfaValidationSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        onVerifyMFA(values, setSubmitting)
                    }}
                >
                    {({ touched, errors, isSubmitting }) => (
                        <Form>
                            <FormContainer>
                                <FormItem
                                    label="Verification code"
                                    invalid={
                                        (errors.code && touched.code) as boolean
                                    }
                                    errorMessage={errors.code}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="one-time-code"
                                        name="code"
                                        placeholder="000000"
                                        maxLength={6}
                                        component={Input}
                                    />
                                </FormItem>
                                {selectedFactorType === 'email' && (
                                    <Button
                                        block
                                        className="mb-3"
                                        loading={sendingCode}
                                        variant="plain"
                                        type="button"
                                        onClick={handleSendEmailCode}
                                    >
                                        {sendingCode
                                            ? 'Sending code...'
                                            : emailCodeSent
                                              ? 'Resend Code'
                                              : 'Send Code'}
                                    </Button>
                                )}
                                <Button
                                    block
                                    loading={isSubmitting}
                                    variant="solid"
                                    type="submit"
                                    disabled={
                                        selectedFactorType === 'email' &&
                                        !emailCodeSent
                                    }
                                >
                                    {isSubmitting ? 'Verifying...' : 'Verification'}
                                </Button>
                                <Button
                                    block
                                    className="mt-2"
                                    variant="plain"
                                    type="button"
                                    onClick={handleCancelMFA}
                                >
                                    Return to Login
                                </Button>
                            </FormContainer>
                        </Form>
                    )}
                </Formik>
            </div>
        )
    }

    // 登录表单
    return (
        <div className={className}>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <>{message}</>
                </Alert>
            )}
            <Formik
                initialValues={{
                    username: '',
                    password: '',
                    rememberMe: true,
                }}
                validationSchema={loginValidationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    if (!disableSubmit) {
                        onSignIn(values, setSubmitting)
                    } else {
                        setSubmitting(false)
                    }
                }}
            >
                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <FormItem
                                label="User Name"
                                invalid={
                                    (errors.username &&
                                        touched.username) as boolean
                                }
                                errorMessage={errors.username}
                            >
                                <Field
                                    type="text"
                                    autoComplete="username"
                                    name="username"
                                    placeholder="User Name"
                                    component={Input}
                                />
                            </FormItem>
                            <FormItem
                                label="Password"
                                invalid={
                                    (errors.password &&
                                        touched.password) as boolean
                                }
                                errorMessage={errors.password}
                            >
                                <Field
                                    autoComplete="current-password"
                                    name="password"
                                    placeholder="Password"
                                    component={PasswordInput}
                                />
                            </FormItem>
                            <div className="flex justify-between mb-6">
                                <Field
                                    className="mb-0"
                                    name="rememberMe"
                                    component={Checkbox}
                                >
                                    Remember Me
                                </Field>
                                <ActionLink to={forgotPasswordUrl}>
                                   Forgot Password?
                                </ActionLink>
                            </div>
                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                            >
                                {isSubmitting ? 'Logging in...' : 'Sign in'}
                            </Button>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default SignInForm
