import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { QRCodeSVG } from 'qrcode.react'
import {
    apiEnrollTOTP,
    apiVerifyTOTPEnrollment,
    apiListMFAFactors,
    apiUnenrollFactor,
} from '@/services/MFAService'
import type { MFAFactor } from '@/@types/mfa'

type MFAEnrollmentState = {
    factorId: string
    secret: string
    qrCodeUri: string
    friendlyName: string
}

type MFAIntegrationDialogProps = {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

const MFAIntegrationDialog = ({
    isOpen,
    onClose,
    onSuccess,
}: MFAIntegrationDialogProps) => {
    const [step, setStep] = useState<'list' | 'enroll' | 'verify' | 'unenroll'>('list')
    const [mfaEnrollment, setMfaEnrollment] =
        useState<MFAEnrollmentState | null>(null)
    const [verificationCode, setVerificationCode] = useState('')
    const [factors, setFactors] = useState<MFAFactor[]>([])
    const [loading, setLoading] = useState(false)
    const [showSecret, setShowSecret] = useState(false)
    // 解绑相关状态
    const [unenrollFactorId, setUnenrollFactorId] = useState<string | null>(null)
    const [unenrollCode, setUnenrollCode] = useState('')

    // 加载 MFA 因子列表
    const loadFactors = async () => {
        try {
            setLoading(true)
            const response = await apiListMFAFactors()
            // 注意：后端返回格式 { code, message, data }
            const responseData = response.data as any
            if (responseData && responseData.data) {
                setFactors(responseData.data)
            }
        } catch (error: any) {
            toast.push(
                <Notification
                    title="加载 MFA 因子失败"
                    type="danger"
                >
                    {error?.response?.data?.message || '请稍后重试'}
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setLoading(false)
        }
    }

    // 开始 TOTP 绑定
    const startTOTPEnrollment = async () => {
        try {
            setLoading(true)
            const response = await apiEnrollTOTP({
                friendly_name: '我的验证器',
            })
            // 注意：后端返回格式 { code, message, data }
            const responseData = response.data as any
            if (responseData && responseData.data) {
                const { factor_id, secret, qr_code_uri, friendly_name } =
                    responseData.data
                setMfaEnrollment({
                    factorId: factor_id,
                    secret: secret,
                    qrCodeUri: qr_code_uri,
                    friendlyName: friendly_name,
                })
                setStep('enroll')
            }
        } catch (error: any) {
            toast.push(
                <Notification
                    title="开始 TOTP 绑定失败"
                    type="danger"
                >
                    {error?.response?.data?.message || '请稍后重试'}
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setLoading(false)
        }
    }

    // 验证 TOTP 绑定
    const verifyTOTPEnrollment = async () => {
        if (!mfaEnrollment || !verificationCode) {
            toast.push(
                <Notification title="请输入验证码" type="warning" />,
                { placement: 'top-center' }
            )
            return
        }

        try {
            setLoading(true)
            await apiVerifyTOTPEnrollment({
                factor_id: mfaEnrollment.factorId,
                code: verificationCode,
            })
            toast.push(
                <Notification title="TOTP 绑定成功" type="success" />,
                { placement: 'top-center' }
            )
            resetDialog()
            onSuccess?.()
            onClose()
        } catch (error: any) {
            toast.push(
                <Notification
                    title="验证失败"
                    type="danger"
                >
                    {error?.response?.data?.message || '验证码错误，请重试'}
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setLoading(false)
        }
    }

    // 解绑 MFA 因子 - 打开确认对话框
    const startUnenrollFactor = (factorId: string) => {
        setUnenrollFactorId(factorId)
        setUnenrollCode('')
        setStep('unenroll')
    }

    // 确认解绑 MFA 因子
    const confirmUnenrollFactor = async () => {
        if (!unenrollFactorId || !unenrollCode) {
            toast.push(
                <Notification title="请输入验证码" type="warning" />,
                { placement: 'top-center' }
            )
            return
        }

        if (unenrollCode.length !== 6) {
            toast.push(
                <Notification title="验证码必须是6位数字" type="warning" />,
                { placement: 'top-center' }
            )
            return
        }

        try {
            setLoading(true)
            await apiUnenrollFactor(unenrollFactorId, unenrollCode)
            toast.push(
                <Notification title="解绑成功" type="success" />,
                { placement: 'top-center' }
            )
            setUnenrollFactorId(null)
            setUnenrollCode('')
            setStep('list')
            await loadFactors()
        } catch (error: any) {
            toast.push(
                <Notification
                    title="解绑失败"
                    type="danger"
                >
                    {error?.response?.data?.message || '验证码错误，请重试'}
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setLoading(false)
        }
    }

    const resetDialog = () => {
        setStep('list')
        setMfaEnrollment(null)
        setVerificationCode('')
        setShowSecret(false)
        setUnenrollFactorId(null)
        setUnenrollCode('')
    }

    // 关闭对话框
    const handleClose = () => {
        resetDialog()
        onClose()
    }

    // 对话框打开时加载因子列表
    useEffect(() => {
        if (isOpen) {
            loadFactors()
        } else {
            resetDialog()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    // 渲染因子列表
    const renderFactorList = () => (
        <div>
            <h4 className="mb-4">多因子认证 (MFA)</h4>
            <p className="text-sm text-gray-500 mb-4">
                通过添加额外的安全层来保护您的账户
            </p>

            {factors.length > 0 && (
                <div className="mb-4">
                    <h5 className="text-sm font-semibold mb-2">已绑定的验证方式</h5>
                    <div className="space-y-2">
                        {factors.map((factor) => (
                            <div
                                key={factor.id}
                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                            >
                                <div>
                                    <p className="font-medium">
                                        {factor.factor_type === 'totp'
                                            ? '验证器应用'
                                            : '邮箱验证'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {factor.friendly_name}
                                    </p>
                                    {factor.last_used_at && (
                                        <p className="text-xs text-gray-400">
                                            最后使用: {new Date(factor.last_used_at).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    size="sm"
                                    variant="plain"
                                    onClick={() => startUnenrollFactor(factor.id)}
                                    disabled={loading}
                                >
                                    解绑
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
                <Button variant="plain" onClick={handleClose}>
                    关闭
                </Button>
                <Button
                    variant="solid"
                    onClick={startTOTPEnrollment}
                    loading={loading}
                >
                    添加验证器应用
                </Button>
            </div>
        </div>
    )

    // 渲染 TOTP 绑定步骤
    const renderEnrollStep = () => (
        <div>
            <h4 className="mb-1">添加验证器应用</h4>
            <p className="text-sm text-gray-500 mb-4">
                步骤 1: 扫描二维码
            </p>

            <div className="flex flex-col items-center">
                <p className="text-xs text-gray-500 text-center mb-4">
                    使用 Google Authenticator、Microsoft Authenticator 或其他验证器应用扫描以下二维码
                </p>

                {mfaEnrollment?.qrCodeUri && (
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <QRCodeSVG
                            value={mfaEnrollment.qrCodeUri}
                            size={200}
                            level="H"
                            includeMargin={true}
                        />
                    </div>
                )}

                <button
                    type="button"
                    className="mt-3 text-xs text-indigo-600 hover:underline"
                    onClick={() => setShowSecret(!showSecret)}
                >
                    无法扫描二维码？
                </button>

                {showSecret && mfaEnrollment?.secret && (
                    <div className="mt-2 p-3 bg-gray-100 rounded text-center">
                        <p className="text-xs text-gray-600 mb-1">手动输入密钥:</p>
                        <code className="text-sm font-mono">{mfaEnrollment.secret}</code>
                    </div>
                )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
                <Button variant="plain" onClick={handleClose}>
                    取消
                </Button>
                <Button
                    variant="solid"
                    onClick={() => setStep('verify')}
                >
                    下一步
                </Button>
            </div>
        </div>
    )

    // 渲染验证步骤
    const renderVerifyStep = () => (
        <div>
            <h4 className="mb-1">验证绑定</h4>
            <p className="text-sm text-gray-500 mb-4">
                步骤 2: 输入验证码
            </p>

            <p className="text-xs text-gray-500 mb-4">
                请输入验证器应用中显示的 6 位验证码
            </p>

            <Input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest"
            />

            <div className="mt-6 flex justify-end gap-2">
                <Button
                    variant="plain"
                    onClick={() => setStep('enroll')}
                >
                    上一步
                </Button>
                <Button
                    variant="solid"
                    onClick={verifyTOTPEnrollment}
                    loading={loading}
                    disabled={verificationCode.length !== 6}
                >
                    验证并绑定
                </Button>
            </div>
        </div>
    )

    // 渲染解绑确认步骤
    const renderUnenrollStep = () => (
        <div>
            <h4 className="mb-1">确认解绑</h4>
            <p className="text-sm text-gray-500 mb-4">
                为了安全起见，请输入验证码确认解绑操作
            </p>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                <p className="text-sm text-yellow-800">
                    ⚠️ 解绑后，您将无法使用此验证器进行登录验证。如果这是您唯一的验证方式，解绑后将不再需要二次验证。
                </p>
            </div>

            <p className="text-xs text-gray-500 mb-2">
                请输入验证器应用中显示的 6 位验证码
            </p>

            <Input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={unenrollCode}
                onChange={(e) => setUnenrollCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest"
            />

            <div className="mt-6 flex justify-end gap-2">
                <Button
                    variant="plain"
                    onClick={() => {
                        setUnenrollFactorId(null)
                        setUnenrollCode('')
                        setStep('list')
                    }}
                >
                    取消
                </Button>
                <Button
                    variant="solid"
                    color="red"
                    onClick={confirmUnenrollFactor}
                    loading={loading}
                    disabled={unenrollCode.length !== 6}
                >
                    确认解绑
                </Button>
            </div>
        </div>
    )

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            width={520}
        >
            <div className="p-6">
                {step === 'list' && renderFactorList()}
                {step === 'enroll' && renderEnrollStep()}
                {step === 'verify' && renderVerifyStep()}
                {step === 'unenroll' && renderUnenrollStep()}
            </div>
        </Dialog>
    )
}

export default MFAIntegrationDialog
