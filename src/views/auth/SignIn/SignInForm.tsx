import { useState } from 'react'
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

    const { signIn, requiresMFA, verifyMFA, cancelMFA } = useAuth()

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
            setSuccessMessage('Please enter the MFA code')
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

        const result = await verifyMFA(values.code, 'totp')

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
                        Please enter the 6-digit verification code from your authenticator app.
                    </p>
                </div>
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
                                <Button
                                    block
                                    loading={isSubmitting}
                                    variant="solid"
                                    type="submit"
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
