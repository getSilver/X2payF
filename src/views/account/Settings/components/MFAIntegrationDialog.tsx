import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import type { MFAFactor } from '@/@types/mfa'
import {
    apiEnrollTOTP,
    apiListMFAFactors,
    apiVerifyTOTPEnrollment,
} from '@/services/MFAService'

type MFAEnrollmentState = {
    factorId: string
    qrCodeUri: string
    friendlyName: string
}

type MFAIntegrationDialogProps = {
    isOpen: boolean
    onClose: () => void
    onBound?: (factorId: string) => void
    onFactorLoaded?: (factorId: string) => void
    qrCodeUri?: string
}

const MFAIntegrationDialog = ({
    isOpen,
    onClose,
    onBound,
    onFactorLoaded,
    qrCodeUri,
}: MFAIntegrationDialogProps) => {
    const [mfaEnrollment, setMfaEnrollment] =
        useState<MFAEnrollmentState | null>(null)
    const [mfaEnrolling, setMfaEnrolling] = useState(false)
    const [mfaCode, setMfaCode] = useState<string[]>(
        Array.from({ length: 6 }).fill('')
    )
    const [mfaVerifying, setMfaVerifying] = useState(false)

    const startMfaEnrollment = async () => {
        try {
            const response = await apiEnrollTOTP({
                friendly_name: 'Authenticator App',
            })
            const { factor_id, qr_code_uri, friendly_name } = response.data
            setMfaEnrollment({
                factorId: factor_id,
                qrCodeUri: qr_code_uri,
                friendlyName: friendly_name,
            })
        } catch (error) {
            toast.push(
                <Notification title="Failed to load MFA QR code" type="danger" />,
                { placement: 'top-center' }
            )
        }
    }

    useEffect(() => {
        if (!isOpen) {
            return
        }
        const loadFactors = async () => {
            try {
                const response = await apiListMFAFactors()
                const factors = response.data as MFAFactor[]
                const totpFactor = factors.find(
                    (factor) => factor.factor_type === 'totp'
                )
                if (totpFactor?.id) {
                    onFactorLoaded?.(totpFactor.id)
                }
            } catch (error) {
                toast.push(
                    <Notification
                        title="Failed to load MFA factors"
                        type="danger"
                    />,
                    { placement: 'top-center' }
                )
            }
        }
        loadFactors()
        if (!mfaEnrollment && !qrCodeUri) {
            startMfaEnrollment()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    const handleMfaDigitChange = (value: string, index: number) => {
        const cleanValue = value.replace(/[^0-9]/g, '').slice(-1)
        setMfaCode((prev) => {
            const next = [...prev]
            next[index] = cleanValue
            return next
        })
    }

    const resetDialog = () => {
        setMfaEnrollment(null)
        setMfaCode(Array.from({ length: 6 }).fill(''))
        setMfaVerifying(false)
    }

    const handleClose = () => {
        resetDialog()
        onClose()
    }

    const handleMfaVerify = async () => {
        const code = mfaCode.join('')
        const factorId = mfaEnrollment?.factorId
        if (!factorId || code.length !== 6) {
            toast.push(
                <Notification title="Enter the 6-digit code" type="warning" />,
                { placement: 'top-center' }
            )
            return
        }
        setMfaVerifying(true)
        try {
            const response = await apiVerifyTOTPEnrollment({
                factor_id: factorId,
                code,
            })
            const boundFactorId =
                response.data?.id ||
                response.data?.factor_id ||
                mfaEnrollment?.factorId
            if (boundFactorId) {
                onBound?.(boundFactorId)
            }
            toast.push(
                <Notification title="MFA enabled" type="success" />,
                { placement: 'top-center' }
            )
            handleClose()
        } catch (error) {
            toast.push(
                <Notification title="MFA verification failed" type="danger" />,
                { placement: 'top-center' }
            )
        } finally {
            setMfaVerifying(false)
        }
    }

    const handleEnroll = async () => {
        if (mfaEnrollment || mfaEnrolling) {
            return
        }
        setMfaEnrolling(true)
        await startMfaEnrollment()
        setMfaEnrolling(false)
    }

    if (!isOpen) {
        return null
    }

    return (
        <div className="rounded-2xl p-6">
            <div>
                <h4 className="mb-1">Add authenticator app</h4>
                <p className="text-sm text-gray-500">
                    Step 1: Scan this QR code
                </p>
            </div>
            <div className="mt-4 flex flex-col items-center">
                <p className="text-xs text-gray-500 text-center">
                    Scan the following QR code with your authenticator app, such
                    as Google Authenticator, Duo Mobile, Authy, etc.
                </p>
                <div className="mt-4 h-40 w-40 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                    {mfaEnrollment?.qrCodeUri || qrCodeUri ? (
                        <img
                            className="h-full w-full object-contain"
                            src={mfaEnrollment?.qrCodeUri || qrCodeUri}
                            alt="MFA QR"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                            QR code will appear after binding
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    className="mt-3 text-xs text-indigo-600 hover:underline"
                >
                    Can't scan the QR code?
                </button>
            </div>
            <div className="mt-6 border-t border-gray-600 pt-4">
                <p className="text-sm text-gray-500">
                    Step 2: Enter the one-time code
                </p>
                <p className="mt-1 text-xs text-gray-500">
                    Enter the 6-digit verification code generated by the
                    authenticator app.
                </p>
                <div className="mt-4 flex justify-center gap-2">
                    {mfaCode.map((value, index) => (
                        <Input
                            key={`mfa-digit-${index}`}
                            value={value}
                            maxLength={1}
                            onChange={(e) =>
                                handleMfaDigitChange(e.target.value, index)
                            }
                            className="h-12 w-10 text-center text-lg"
                        />
                    ))}
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <Button
                    className="ltr:mr-2 rtl:ml-2"
                    variant="plain"
                    onClick={handleClose}
                >
                    Cancel
                </Button>
                {mfaEnrollment ? (
                    <Button
                        variant="solid"
                        loading={mfaVerifying}
                        onClick={handleMfaVerify}
                    >
                        Verify
                    </Button>
                ) : (
                    <Button
                        variant="solid"
                        loading={mfaEnrolling}
                        onClick={handleEnroll}
                    >
                        Bind
                    </Button>
                )}
            </div>
        </div>
    )
}

export default MFAIntegrationDialog
