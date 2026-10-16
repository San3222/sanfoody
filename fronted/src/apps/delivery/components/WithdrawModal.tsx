// src/apps/delivery/components/WithdrawModal.tsx
import { useState } from 'react'
import { IndianRupee, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/shared/Button'
import { useWalletBalance, useRequestWithdrawal } from '@/api/payoutHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

const QUICK_AMOUNTS = [100, 500, 1000]

export function WithdrawModal({
    isOpen,
    onClose,
    onNeedPayoutMethod,
}: {
    isOpen: boolean
    onClose: () => void
    onNeedPayoutMethod: () => void
}) {
    const { data: balance } = useWalletBalance()
    const withdrawMutation = useRequestWithdrawal()
    const { showToast } = useToast()

    const [amount, setAmount] = useState('')

    const balanceAmount = balance?.balance ?? 0
    const minWithdrawal = balance?.minWithdrawal ?? 100
    const hasPending = (balance?.pending ?? 0) > 0

    const amountNum = parseFloat(amount) || 0
    const isValid = amountNum >= minWithdrawal && amountNum <= balanceAmount

    const handleWithdraw = () => {
        if (!isValid) {
            showToast('error', `Amount must be between ₹${minWithdrawal} and ₹${balanceAmount}`)
            return
        }

        withdrawMutation.mutate(amountNum, {
            onSuccess: () => {
                showToast('success', `Withdrawal of ₹${amountNum} requested!`)
                setAmount('')
                onClose()
            },
            onError: (err: any) => {
                if (err.message?.toLowerCase().includes('payout method')) {
                    showToast('error', 'Please add a payout method first')
                    onNeedPayoutMethod()
                } else {
                    showToast('error', err.message || 'Failed')
                }
            },
        })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Withdraw Money">
            <div className="space-y-5">
                {/* Balance */}
                <div className="rounded-2xl bg-linear-to-br from-green-50 to-emerald-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                        Available Balance
                    </p>
                    <p className="mt-1 font-display text-3xl font-extrabold text-green-900">
                        ₹{balanceAmount.toLocaleString('en-IN')}
                    </p>
                    {hasPending && (
                        <p className="mt-1 text-xs text-yellow-700">
                            ⏳ ₹{balance?.pending} pending withdrawal
                        </p>
                    )}
                </div>

                {/* Warning if pending */}
                {hasPending && (
                    <div className="flex items-start gap-2 rounded-xl bg-yellow-50 p-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
                        <p className="text-xs text-yellow-900">
                            You have a pending withdrawal. Complete or cancel it before requesting a new one.
                        </p>
                    </div>
                )}

                {/* Amount Input */}
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                        Withdrawal Amount
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-charcoal/15 bg-white px-4 py-3">
                        <IndianRupee className="h-4 w-4 text-warm-gray" />
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder={`Min ₹${minWithdrawal}`}
                            className="w-full bg-transparent text-sm outline-none placeholder:text-warm-gray"
                            min={minWithdrawal}
                            max={balanceAmount}
                        />
                    </div>
                    <p className="mt-1.5 text-xs text-warm-gray">
                        Minimum withdrawal: ₹{minWithdrawal}
                    </p>
                </div>

                {/* Quick amounts */}
                <div className="flex gap-2">
                    {QUICK_AMOUNTS.map((amt) => (
                        <button
                            key={amt}
                            type="button"
                            onClick={() => setAmount(String(amt))}
                            disabled={amt > balanceAmount}
                            className={cn(
                                'flex-1 rounded-xl border py-2 text-sm font-semibold transition-colors',
                                amt > balanceAmount
                                    ? 'cursor-not-allowed border-charcoal/10 text-charcoal/30'
                                    : 'border-charcoal/15 text-charcoal hover:border-tomato hover:text-tomato'
                            )}
                        >
                            ₹{amt}
                        </button>
                    ))}
                </div>

                {/* Info */}
                <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <p className="text-xs text-blue-900">
                        Money will be transferred to your saved UPI/Bank within 24 hours.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleWithdraw}
                        disabled={!isValid || withdrawMutation.isPending || hasPending}
                        className="flex-1"
                    >
                        <Wallet className="mr-2 h-4 w-4" />
                        {withdrawMutation.isPending ? 'Requesting...' : `Withdraw ₹${amountNum || 0}`}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}