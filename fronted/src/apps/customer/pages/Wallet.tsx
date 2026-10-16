import { useState } from 'react'
import { motion } from 'motion/react'
import { Wallet as WalletIcon, Plus, ArrowDown, ArrowUp, Clock } from 'lucide-react'
import { useWallet, useAddMoney } from '@/api/Hooks'
import { cn } from '@/lib/utils'

export function Wallet() {
  const { data, isLoading, isError } = useWallet()
  const addMoneyMutation = useAddMoney()

  const [showAddMoney, setShowAddMoney] = useState(false)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  const balance = data?.balance ?? 0
  const transactions = data?.transactions ?? []

  const handleAddMoney = () => {
    const addAmount = parseFloat(amount)
    if (isNaN(addAmount) || addAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    addMoneyMutation.mutate(addAmount, {
      onSuccess: () => {
        setAmount('')
        setShowAddMoney(false)
        setError('')
      },
      onError: (err: any) => {
        setError(err.message || 'Could not add money. Try again.')
      },
    })
  }

  const quickAddAmounts = [100, 200, 500, 1000]

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl px-5 py-28 sm:px-8 sm:py-32">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 rounded bg-charcoal/8"></div>
          <div className="h-40 rounded-3xl bg-charcoal/8"></div>
          <div className="h-60 rounded-3xl bg-charcoal/8"></div>
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-4xl px-5 py-28 sm:px-8 sm:py-32">
        <div className="rounded-3xl border border-charcoal/10 bg-white p-12 text-center shadow-soft">
          <p className="text-warm-gray">Couldn't load your wallet. Please try again.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-4xl px-5 py-28 sm:px-8 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="rounded-xl bg-tomato/10 p-3">
            <WalletIcon className="h-7 w-7 text-tomato" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-extrabold text-charcoal sm:text-4xl">SanFoody Wallet</h1>
            <p className="text-sm text-warm-gray">Manage your balance and transactions</p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-tomato to-orange p-8 shadow-warm">
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
          <div className="relative">
            <p className="text-sm font-medium text-cream/80">Available Balance</p>
            <p className="mt-1 font-display text-5xl font-extrabold text-cream">₹{balance.toFixed(2)}</p>
            <button
              onClick={() => setShowAddMoney(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-cream px-6 py-2.5 text-sm font-bold text-tomato shadow-soft transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Add Money
            </button>
          </div>
        </div>

        {/* Add Money Modal */}
        {showAddMoney && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 px-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md overflow-hidden rounded-3xl bg-cream shadow-warm"
            >
              <div className="border-b border-charcoal/10 px-6 py-4">
                <h3 className="font-display text-xl font-bold text-charcoal">Add Money to Wallet</h3>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-semibold text-charcoal">Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-lg text-charcoal outline-none focus:border-tomato"
                  />
                </div>
                <div className="mb-4 grid grid-cols-4 gap-2">
                  {quickAddAmounts.map((val) => (
                    <button
                      key={val}
                      onClick={() => setAmount(val.toString())}
                      className={cn(
                        'rounded-xl border py-2 text-sm font-semibold transition-colors',
                        parseFloat(amount) === val
                          ? 'border-tomato bg-tomato/10 text-tomato'
                          : 'border-charcoal/15 text-charcoal/70 hover:border-tomato/40 hover:text-tomato'
                      )}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
                {error && <p className="mb-3 text-sm font-medium text-tomato">{error}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAddMoney(false)
                      setError('')
                    }}
                    className="flex-1 rounded-xl border border-charcoal/15 py-3 text-sm font-semibold text-charcoal/70 transition-colors hover:bg-charcoal/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMoney}
                    disabled={addMoneyMutation.isPending}
                    className="flex-1 rounded-xl bg-gradient-to-r from-tomato to-orange py-3 text-sm font-bold text-cream shadow-warm transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                  >
                    {addMoneyMutation.isPending ? 'Adding...' : 'Add Money'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Transaction History */}
        <div className="overflow-hidden rounded-3xl border border-charcoal/5 bg-white shadow-soft">
          <div className="border-b border-charcoal/10 px-6 py-4">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
              <Clock className="h-5 w-5 text-tomato" />
              Transaction History
            </h2>
          </div>

          <div className="p-6">
            {transactions.length === 0 ? (
              <p className="py-6 text-center text-warm-gray">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-charcoal/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'rounded-full p-2',
                        tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                      )}>
                        {tx.type === 'credit' ? (
                          <ArrowDown className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowUp className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-charcoal">{tx.description}</p>
                        <p className="text-sm text-warm-gray">
                          {new Date(tx.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        'font-semibold',
                        tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      )}>
                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-warm-gray">Balance: ₹{tx.balanceAfter.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  )
}