import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Avatar from '@/components/ui/Avatar'
import Upload from '@/components/ui/Upload'
import { FormItem } from '@/components/ui/Form'
import {
    HiUserCircle,
    HiEnvelope,
    HiMapPin,
    HiCake,
    HiOutlineUser,
} from 'react-icons/hi2'
import { Field, FieldProps, FormikErrors, FormikTouched } from 'formik'
import type { SingleValue } from 'react-select'

const formatRegisterTime = (value: Date) => {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        return ''
    }
    return value.toISOString().replace('T', ' ').replace('Z', '')
}

type FormFieldsName = {
    upload: string
    name: string
    agent: string
    email: string
    location: string
    birthday: Date
}
export type FormModel = Omit<FormFieldsName, 'tags'> & {
    tags: { label: string; value: string }[] | string[]
}

type PersonalInfoFormProps = {
    touched: FormikTouched<FormFieldsName>
    errors: FormikErrors<FormFieldsName>
    locationOptions?: LocationOption[]
}
export type SetSubmitting = (isSubmitting: boolean) => void

export type LocationOption = {
    value: string
    label: string
}

type CustomerForm = {
    initialData?: FormFieldsName
    type: 'edit' | 'new'
    onDiscard?: () => void
    onFormSubmit: (formData: FormModel, setSubmitting: SetSubmitting) => void
}

const PersonalInfoForm = (props: PersonalInfoFormProps) => {
    const { touched, errors, locationOptions } = props

    return (
        <>
            <FormItem
                invalid={errors.upload && touched.upload}
                errorMessage={errors.upload}
            >
                <Field name="img">
                    {({ field, form }: FieldProps) => {
                        const avatarProps = field.value
                            ? { src: field.value }
                            : {}
                        return (
                            <div className="flex justify-center">
                                <Upload
                                    className="cursor-pointer"
                                    showList={false}
                                    uploadLimit={1}
                                    onChange={(files) =>
                                        form.setFieldValue(
                                            field.name,
                                            URL.createObjectURL(files[0])
                                        )
                                    }
                                    onFileRemove={(files) =>
                                        form.setFieldValue(
                                            field.name,
                                            URL.createObjectURL(files[0])
                                        )
                                    }
                                >
                                    <Avatar
                                        className="border-2 border-white dark:border-gray-800 shadow-lg"
                                        size={100}
                                        shape="circle"
                                        icon={<HiOutlineUser />}
                                        {...avatarProps}
                                    />
                                </Upload>
                            </div>
                        )
                    }}
                </Field>
            </FormItem>
            <FormItem
                label="Name"
                invalid={errors.name && touched.name}
                errorMessage={errors.name}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="name"
                    placeholder="Name"
                    component={Input}
                    prefix={<HiUserCircle className="text-xl" />}
                />
            </FormItem>
            <FormItem
                label="Email"
                invalid={errors.email && touched.email}
                errorMessage={errors.email}
            >
                <Field
                    type="email"
                    autoComplete="off"
                    name="email"
                    placeholder="Email"
                    component={Input}
                    prefix={<HiEnvelope className="text-xl" />}
                />
            </FormItem>
            <FormItem
                label="Currency Association (Auto Timezone)"
                invalid={errors.location && touched.location}
                errorMessage={errors.location}
            >
                {locationOptions ? (
                    <Field name="location">
                        {({ field, form }: FieldProps) => (
                            <Select<LocationOption>
                                options={locationOptions}
                                placeholder="Select Currency Association"
                                value={
                                    locationOptions.find(
                                        (option) => option.value === field.value
                                    ) || null
                                }
                                onChange={(
                                    option: SingleValue<LocationOption>
                                ) => {
                                    form.setFieldValue(
                                        field.name,
                                        option?.value || ''
                                    )
                                }}
                                className="w-full"
                            />
                        )}
                    </Field>
                ) : (
                    <Field
                        type="text"
                        autoComplete="off"
                        name="location"
                        placeholder="Timezone"
                        component={Input}
                        prefix={<HiMapPin className="text-xl" />}
                    />
                )}
            </FormItem>
            <FormItem
                label="Agent代理"
                invalid={errors.agent && touched.agent}
                errorMessage={errors.agent}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="agent"
                    placeholder="Agent"
                    component={Input}
                    prefix={<HiUserCircle className="text-xl" />}
                />
            </FormItem>
            <FormItem
                label="Birthday注册时间"
                invalid={(errors.birthday && touched.birthday) as boolean}
                errorMessage={errors.birthday as string}
            >
                <Field name="birthday">
                    {({ field }: FieldProps) => (
                        <Input
                            value={formatRegisterTime(field.value)}
                            prefix={<HiCake className="text-xl" />}
                            readOnly
                            disabled
                        />
                    )}
                </Field>
            </FormItem>
        </>
    )
}

export default PersonalInfoForm
