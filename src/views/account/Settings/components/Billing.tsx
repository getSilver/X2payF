import { useState, useEffect } from 'react'
import classNames from 'classnames'
import Tag from '@/components/ui/Tag'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { FormContainer } from '@/components/ui/Form'
import FormDesription from './FormDesription'
import FormRow from './FormRow'

import BillingHistory from './BillingHistory'
import { Form, Formik } from 'formik'

import isLastChild from '@/utils/isLastChild'
import { apiGetAccountSettingBillingData } from '@/services/AccountServices'


type CreditCard = {
    cardId: string
    channelName: string
    paymentMethod: string
    in: string
    out: string
    singleIn: string
    singleOut: string
    primary: boolean
}

type OtherPayemnt = {
    id: string
    identifier: string
    redirect: string
    type: string
}

type Bill = {
    id: string
    item: string
    status: string
    amount: number
    date: number
}

type BillingData = {
    paymentMethods: CreditCard[]
    otherMethod: OtherPayemnt[]
    billingHistory: Bill[]
}

type BillingFormModel = BillingData

type GetAccountSettingBillingDataResponse = BillingData


const Billing = () => {
    const [data, setData] = useState<BillingData>({
        paymentMethods: [],
        otherMethod: [],
        billingHistory: [],
    })
    
    const fetchData = async () => {
        const response =
            await apiGetAccountSettingBillingData<GetAccountSettingBillingDataResponse>()
        setData(response.data)
    }


    const onFormSubmit = (
        _: BillingFormModel,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        toast.push(
            <Notification
                title={'Billing information updated'}
                type="success"
            />,
            {
                placement: 'top-center',
            }
        )
        setSubmitting(false)
    }

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Formik
            enableReinitialize
            initialValues={data}
            onSubmit={(values, { setSubmitting }) => {
                setSubmitting(true)
                setTimeout(() => {
                    onFormSubmit(values, setSubmitting)
                }, 1000)
            }}
        >
            {({ values, touched, errors, isSubmitting, resetForm }) => {
                const validatorProps = { touched, errors }
                return (
                    <Form>
                        <FormContainer>
                            <FormDesription
                                title="Payment Method"
                                desc="Payment apps displayed by region"
                            />
                            <FormRow
                                name="paymentMethods"
                                alignCenter={false}
                                label="Credit Cards"
                                {...validatorProps}
                            >
                                <div className="rounded-lg border border-gray-200 dark:border-gray-600">
                                    {values?.paymentMethods?.map(
                                        (card, index) => (
                                            <div
                                                key={card.cardId}
                                                className={classNames(
                                                    'flex items-center justify-between p-4',
                                                    !isLastChild(
                                                        values.paymentMethods,
                                                        index
                                                    ) &&
                                                        'border-b border-gray-200 dark:border-gray-600'
                                                )}
                                            >
                                                <div className="flex items-center">
                                                    {card.paymentMethod ===
                                                        'VISA' && (
                                                        <img
                                                            src="/img/others/img-8.png"
                                                            alt="visa"
                                                        />
                                                    )}
                                                    {card.paymentMethod ===
                                                        'MASTER' && (
                                                        <img
                                                            src="/img/others/img-9.png"
                                                            alt="master"
                                                        />
                                                    )}
                                                    <div className="ml-3 rtl:mr-3">
                                                        <div className="flex items-center">
                                                            <div className="text-gray-900 dark:text-gray-100 font-semibold">
                                                                {card.channelName}{' '}@{' '}{card.paymentMethod}
                                                            </div>
                                                            {card.primary && (
                                                                <Tag className="bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-100 rounded-md border-0 mx-2">
                                                                    <span className="capitalize">
                                                                        {' '}
                                                                        Primary{' '}
                                                                    </span>
                                                                </Tag>
                                                            )}
                                                        </div>
                                                        <span>
                                                            PayIn{' '}{card.in }{'%'} / PayOut{' '}{card.out}{'%'}
                                                             
                                                            {' '}{card.singleIn} / {card.singleOut}
                                                             
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                            </div>
                                        )
                                    )}
                                </div>
                                <div className="mt-2">
                                    {/* <Button
                                        type="button"
                                        variant="plain"
                                        size="sm"
                                        icon={<HiPlus className="text-lg" />}
                                        onClick={() =>
                                            onEditCreditCard({}, 'NEW')
                                        }
                                    >
                                        <span className="font-semibold">
                                            Add new card
                                        </span>
                                    </Button> */}
                                </div>
                            </FormRow>
                            <FormRow
                                border={false}
                                name="otherMethod"
                                alignCenter={false}
                                label="ADD.USDT address"
                                {...validatorProps}
                            >
                                <div className="rounded-lg border border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center flex-1 mr-3">
                                            <img
                                                src="/img/thumbs/tether-us.png"
                                                alt="USDT"
                                                className="w-8 h-8 mr-3"
                                            />
                                            <Input
                                                placeholder="Enter USDT address for TRC-20 protocol"
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="flex">
                                            <Button
                                                size="sm"
                                                type="button"
                                                onClick={() => {
                                                    // Handle add USDT logic here
                                                }}
                                            >
                                                addUSDT
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </FormRow>
                            <div className="mt-4 ltr:text-right">
                                <Button
                                    className="ltr:mr-2 rtl:ml-2"
                                    type="button"
                                    onClick={() => resetForm()}
                                >
                                    Reset
                                </Button>
                                <Button
                                    variant="solid"
                                    loading={isSubmitting}
                                    type="submit"
                                >
                                    {isSubmitting ? 'Updating' : 'Update'}
                                </Button>
                            </div>
                            <FormDesription
                                className="mt-6"
                                title="Billing History"
                                desc="View your previos billing"
                            />
                            <BillingHistory
                                className="mt-4 rounded-lg border border-gray-200 dark:border-gray-600"
                                data={data.billingHistory}
                            />
                        </FormContainer>
                    </Form>
                )
            }}
        </Formik>
    )
}

export default Billing
