// src/apps/delivery/components/PayoutMethodModal.tsx
import { useState, useEffect } from 'react'
import { Wallet, CreditCard, Smartphone, CheckCircle2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/../shared/Button'
import { usePayoutMethod, useSavePayoutMethod } from '@/api/payoutHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

export function PayoutMethodModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean
    onClose: () => void
}) {
    const { data: existingMethod } = usePayoutMethod()
    const saveMutation = useSavePayoutMethod()
    const { showToast } = useToast()

    const [methodType, setMethodType] = useState<'upi' | 'bank'>('upi')
    const [upiId, setUpiId] = useState('')
    const [accountHolderName, setAccountHolderName] = useState('')
    const [accountNumber, setAccountNumber] = useState('')
    const [ifscCode, setIfscCode] = useState('')
    const [bankName, setBankName] = useState('')

    // Load existing
    useEffect(() => {
        if (existingMethod) {
            setMethodType(existingMethod.type)
            setUpiId(existingMethod.upiId || '')
            setAccountHolderName(existingMethod.accountHolderName || '')
            setAccountNumber(existingMethod.accountNumber || '')
            setIfscCode(existingMethod.ifscCode || '')
            setBankName(existingMethod.bankName || '')
        }
    }, [existingMethod, isOpen])

    const handleSave = () => {
        const payload: any = { type: methodType }

        if (methodType === 'upi') {
            if (!upiId.trim()) {
                showToast('error', 'Please enter UPI ID')
                return
            }
            payload.upiId = upiId.trim()
        } else {
            if (!accountHolderName.trim() || !accountNumber.trim() || !ifscCode.trim()) {
                showToast('error', 'All bank fields required')
                return
            }
            payload.accountHolderName = accountHolderName.trim()
            payload.accountNumber = accountNumber.trim()
            payload.ifscCode = ifscCode.trim().toUpperCase()
            payload.bankName = bankName.trim()
        }

        saveMutation.mutate(payload, {
            onSuccess: () => {
                showToast('success', 'Payout method saved')
                onClose()
            },
            onError: (err: any) => showToast('error', err.message || 'Failed'),
        })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Payout Method">
            <div className="space-y-5">
                <p className="text-sm text-warm-gray">
                    Add your UPI or bank details to receive withdrawals
                </p>

                {/* Method Type Toggle */}
                <div className="flex gap-2 rounded-2xl bg-charcoal/5 p-1">
                    <button
                        type="button"
                        onClick={() => setMethodType('upi')}
                        className={cn(
                            'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all',
                            methodType === 'upi'
                                ? 'bg-white text-tomato shadow-soft'
                                : 'text-charcoal/60'
                        )}
                    >
                        <Smartphone className="h-4 w-4" />
                        UPI
                    </button>
                    <button
                        type="button"
                        onClick={() => setMethodType('bank')}
                        className={cn(
                            'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all',
                            methodType === 'bank'
                                ? 'bg-white text-tomato shadow-soft'
                                : 'text-charcoal/60'
                        )}
                    >
                        <CreditCard className="h-4 w-4" />
                        Bank
                    </button>
                </div>

                {/* UPI Fields */}
                {methodType === 'upi' && (
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                            UPI ID
                        </label>
                        <Input
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="yourname@paytm"
                        />
                        <p className="mt-1.5 text-xs text-warm-gray">
                            Example: suresh@paytm, 9876543210@ybl
                        </p>
                    </div>
                )}

                {/* Bank Fields */}
                {methodType === 'bank' && (
                    <div className="space-y-3">
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                                Account Holder Name
                            </label>
                            <Input
                                value={accountHolderName}
                                onChange={(e) => setAccountHolderName(e.target.value)}
                                placeholder="Suresh Kumar"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                                Account Number
                            </label>
                            <Input
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                placeholder="1234567890123"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                                    IFSC Code
                                </label>
                                <Input
                                    value={ifscCode}
                                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                                    placeholder="HDFC0001234"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                                    Bank Name
                                </label>
                                <Input
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    placeholder="HDFC Bank"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Info */}
                <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <p className="text-xs text-blue-900">
                        Your details are secure. Payouts are processed within 24 hours of request.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saveMutation.isPending}
                        className="flex-1"
                    >
                        <Wallet className="mr-2 h-4 w-4" />
                        {saveMutation.isPending ? 'Saving...' : 'Save Method'}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}