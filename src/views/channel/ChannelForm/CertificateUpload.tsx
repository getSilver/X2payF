import { useState } from 'react'
import AdaptableCard from '@/components/shared/AdaptableCard'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import { FormItem } from '@/components/ui/Form'
import Dialog from '@/components/ui/Dialog'
import Upload from '@/components/ui/Upload'
import { HiEye, HiTrash, HiDocumentText } from 'react-icons/hi'
import { Field, FieldProps, FieldInputProps, FormikProps } from 'formik'

type Certificate = {
    id: string
    name: string
    content: string // 证书文本内容
    uploadTime: string
}

type FormModel = {
    certificate: string // 证书内容（PEM格式文本）
    certificateInfo?: Certificate // 证书信息（用于显示）
    [key: string]: unknown
}

type CertificateDisplayProps = {
    cert: Certificate
    onCertificateDelete: () => void
}

type CertificateUploadProps = {
    values: FormModel
    touched?: { certificate?: boolean }
    errors?: { certificate?: string }
    hasCertificate?: boolean
}

const CertificateDisplay = (props: CertificateDisplayProps) => {
    const { cert, onCertificateDelete } = props

    const [viewOpen, setViewOpen] = useState(false)
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)

    const onViewOpen = () => {
        setViewOpen(true)
    }

    const onDialogClose = () => {
        setViewOpen(false)
    }

    const onDeleteConfirmation = () => {
        setDeleteConfirmationOpen(true)
    }

    const onDeleteConfirmationClose = () => {
        setDeleteConfirmationOpen(false)
    }

    const onDelete = () => {
        onCertificateDelete?.()
        setDeleteConfirmationOpen(false)
    }

    return (
        <>
            <div className="group relative rounded border p-4 flex flex-col">
                <div className="flex items-center mb-2">
                    <HiDocumentText className="text-3xl text-blue-500 mr-3" />
                    <div className="flex-1">
                        <p className="font-semibold text-gray-800 dark:text-white">
                            {cert.name}
                        </p>
                        <p className="text-xs text-gray-500">
                            上传时间: {cert.uploadTime}
                        </p>
                    </div>
                </div>
                <div className="absolute inset-2 bg-gray-900/[.7] group-hover:flex hidden text-xl items-center justify-center">
                    <span
                        className="text-gray-100 hover:text-gray-300 cursor-pointer p-1.5"
                        onClick={onViewOpen}
                    >
                        <HiEye />
                    </span>
                    <span
                        className="text-gray-100 hover:text-gray-300 cursor-pointer p-1.5"
                        onClick={onDeleteConfirmation}
                    >
                        <HiTrash />
                    </span>
                </div>
            </div>
            <Dialog
                isOpen={viewOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <h5 className="mb-4">{cert.name}</h5>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
                    <pre className="text-xs overflow-auto max-h-96 whitespace-pre-wrap break-all">
                        {cert.content}
                    </pre>
                </div>
            </Dialog>
            <ConfirmDialog
                isOpen={deleteConfirmationOpen}
                type="danger"
                title="删除证书"
                confirmButtonColor="red-600"
                onClose={onDeleteConfirmationClose}
                onRequestClose={onDeleteConfirmationClose}
                onCancel={onDeleteConfirmationClose}
                onConfirm={onDelete}
            >
                <p>确定要删除此证书吗？删除后需要重新上传。</p>
            </ConfirmDialog>
        </>
    )
}

const CertificateUpload = (props: CertificateUploadProps) => {
    const { values, touched, errors, hasCertificate } = props

    const beforeUpload = (file: FileList | null) => {
        let valid: boolean | string = true

        const allowedExtensions = ['.pem', '.crt', '.cer', '.cert']
        const maxFileSize = 100000 // 100KB，证书文件通常很小

        if (file) {
            for (const f of file) {
                // 检查文件扩展名
                const fileName = f.name.toLowerCase()
                const hasValidExtension = allowedExtensions.some(ext => 
                    fileName.endsWith(ext)
                )

                if (!hasValidExtension) {
                    valid = '请上传 .pem, .crt 或 .cer 格式的证书文件！'
                    break
                }

                if (f.size >= maxFileSize) {
                    valid = '证书文件不能超过 100KB！'
                    break
                }

                if (f.size === 0) {
                    valid = '证书文件不能为空！'
                    break
                }
            }
        }

        return valid
    }

    const onUpload = (
        form: FormikProps<FormModel>,
        field: FieldInputProps<FormModel>,
        files: File[]
    ) => {
        const latestUpload = files.length - 1
        const file = files[latestUpload]

        // 读取证书文件内容（作为文本）
        const reader = new FileReader()
        reader.onload = (e) => {
            const content = e.target?.result as string

            // 验证是否是有效的 PEM 格式
            if (!content.includes('-----BEGIN') || !content.includes('-----END')) {
                form.setFieldError(field.name, '无效的证书格式，请上传 PEM 格式的证书文件')
                return
            }

            // 设置证书内容到表单
            form.setFieldValue('certificate', content)

            // 设置证书信息用于显示
            const certInfo: Certificate = {
                id: `cert-${Date.now()}`,
                name: file.name,
                content: content,
                uploadTime: new Date().toLocaleString('zh-CN'),
            }
            form.setFieldValue('certificateInfo', certInfo)
        }

        reader.onerror = () => {
            form.setFieldError(field.name, '读取证书文件失败，请重试')
        }

        reader.readAsText(file)
    }

    const handleCertificateDelete = (
        form: FormikProps<FormModel>
    ) => {
        form.setFieldValue('certificate', '')
        form.setFieldValue('certificateInfo', undefined)
    }

    return (
        <AdaptableCard className="mb-4">
            <h5>证书文件</h5>
            <p className="mb-6">上传渠道 API 所需的证书文件（可选）</p>
            <FormItem
                invalid={Boolean(errors?.certificate && touched?.certificate)}
                errorMessage={errors?.certificate}
            >
                <Field name="certificate">
                    {({ field, form }: FieldProps) => {
                        if (values.certificateInfo) {
                            return (
                                <div className="grid grid-cols-1 gap-4">
                                    <CertificateDisplay
                                        cert={values.certificateInfo}
                                        onCertificateDelete={() => handleCertificateDelete(form)}
                                    />
                                    <Upload
                                        draggable
                                        className="min-h-fit"
                                        beforeUpload={beforeUpload}
                                        showList={false}
                                        onChange={(files) =>
                                            onUpload(form, field, files)
                                        }
                                    >
                                        <div className="max-w-full flex flex-col px-4 py-2 justify-center items-center">
                                            <DoubleSidedImage
                                                src="/img/others/upload.png"
                                                darkModeSrc="/img/others/upload-dark.png"
                                            />
                                            <p className="font-semibold text-center text-gray-800 dark:text-white">
                                                重新上传
                                            </p>
                                        </div>
                                    </Upload>
                                </div>
                            )
                        }

                        return (
                            <div className="space-y-3">
                                <Upload
                                    draggable
                                    beforeUpload={beforeUpload}
                                    showList={false}
                                    onChange={(files) =>
                                        onUpload(form, field, files)
                                    }
                                >
                                    <div className="my-16 text-center">
                                        <DoubleSidedImage
                                            className="mx-auto"
                                            src="/img/others/upload.png"
                                            darkModeSrc="/img/others/upload-dark.png"
                                        />
                                        <p className="font-semibold">
                                            <span className="text-gray-800 dark:text-white">
                                                拖拽证书文件到此处，或{' '}
                                            </span>
                                            <span className="text-blue-500">
                                                点击浏览
                                            </span>
                                        </p>
                                        <p className="mt-1 opacity-60 dark:text-white">
                                            支持格式: .pem, .crt, .cer
                                        </p>
                                    </div>
                                </Upload>
                                {hasCertificate ? (
                                    <p className="text-xs text-emerald-600">
                                        当前已配置证书，重新上传将覆盖现有证书。
                                    </p>
                                ) : null}
                            </div>
                        )
                    }}
                </Field>
            </FormItem>
        </AdaptableCard>
    )
}

export default CertificateUpload
