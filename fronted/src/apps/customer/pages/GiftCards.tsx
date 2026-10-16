// src/apps/customer/pages/GiftCards.tsx
import { useState } from 'react'
import {
  Gift,
  Plus,
  Copy,
  CopyCheck,
  Sparkles,
  Send,
  Calendar,
  Wallet,
  Tag,
  CheckCircle2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { SEO } from '@/apps/customer/components/SEO'
import {
  useUserGiftCards,
  usePurchaseGiftCard,
  useRedeemGiftCard,
} from '@/api/giftcardHooks'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/useAuth'
import { cn } from '@/lib/utils'

const QUICK_AMOUNTS = [500, 1000, 2000, 5000]

export function GiftCards() {
  const { isAuthenticated } = useAuth()
  const { data: cards, isLoading } = useUserGiftCards()
  const purchaseMutation = usePurchaseGiftCard()
  const redeemMutation = useRedeemGiftCard()
  const { showToast } = useToast()

  const [showBuyModal, setShowBuyModal] = useState(false)
  const [showRedeemModal, setShowRedeemModal] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Buy form
  const [amount, setAmount] = useState(500)
  const [customAmount, setCustomAmount] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [message, setMessage] = useState('')

  // Redeem form
  const [redeemCode, setRedeemCode] = useState('')

  const finalAmount = customAmount ? parseInt(customAmount) || 0 : amount
  const isValidAmount = finalAmount >= 100 && finalAmount <= 50000

  const handleBuy = () => {
    if (!recipientName.trim()) {
      showToast('error', 'Recipient name is required')
      return
    }
    if (!recipientEmail.trim() || !recipientEmail.includes('@')) {
      showToast('error', 'Valid recipient email is required')
      return
    }
    if (!isValidAmount) {
      showToast('error', 'Amount must be between ₹100 and ₹50,000')
      return
    }

    purchaseMutation.mutate(
      {
        amount: finalAmount,
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim(),
        message: message.trim(),
      },
      {
        onSuccess: (card) => {
          showToast('success', `Gift card ${card.code} created! 🎁`)
          setShowBuyModal(false)
          setRecipientName('')
          setRecipientEmail('')
          setMessage('')
          setCustomAmount('')
          setAmount(500)
        },
        onError: (err: any) => showToast('error', err.message || 'Purchase failed'),
      }
    )
  }

  const handleRedeem = () => {
    if (!redeemCode.trim()) {
      showToast('error', 'Please enter a gift card code')
      return
    }

    redeemMutation.mutate(redeemCode.trim().toUpperCase(), {
      onSuccess: (data) => {
        showToast('success', `🎉 ₹${data.amount} added to your wallet!`)
        setShowRedeemModal(false)
        setRedeemCode('')
      },
      onError: (err: any) => showToast('error', err.message || 'Invalid code'),
    })
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    showToast('success', 'Code copied to clipboard')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const purchased = cards?.filter((c) => c.purchasedBy === (cards as any)?.purchasedBy) || []
  const received = cards?.filter((c) => c.redeemedBy) || []

  return (
    <section className="mx-auto max-w-4xl px-5 pb-16 pt-24 sm:px-8 sm:pt-28">
      <SEO
        title="Gift Cards — SanFoody"
        description="Send the gift of great food. Buy gift cards for friends and family."
      />

      {/* Header */}
      <div className="text-center">
        <Badge variant="warning">
          <span className="flex items-center gap-1">
            <Gift className="h-3 w-3" />
            Gift Cards
          </span>
        </Badge>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-charcoal sm:text-4xl">
          Gift the Joy of Food 🎁
        </h1>
        <p className="mt-2 text-warm-gray">
          Send delicious moments to friends and family
        </p>
      </div>

      {/* Hero Card */}
      <div className="mt-8 overflow-hidden rounded-[2rem] bg-linear-to-br from-tomato via-orange to-gold p-8 text-white shadow-warm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-90">
              Perfect Gift
            </p>
            <p className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
              Starting at ₹500
            </p>
            <p className="mt-2 text-sm opacity-90">
              Valid for 1 year · Redeemable on any order
            </p>
          </div>
          <Gift className="h-16 w-16 opacity-30" />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => setShowBuyModal(true)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-tomato shadow-warm transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Buy Gift Card
          </button>
          <button
            onClick={() => setShowRedeemModal(true)}
            className="inline-flex items-center gap-2 rounded-full bg-white/20 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <Sparkles className="h-4 w-4" />
            Redeem Code
          </button>
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-tomato/10">
            <Gift className="h-5 w-5 text-tomato" />
          </div>
          <p className="mt-3 font-display text-base font-bold text-charcoal">
            Choose Amount
          </p>
          <p className="mt-1 text-sm text-warm-gray">
            Pick from ₹500 to ₹50,000
          </p>
        </Card>

        <Card className="p-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100">
            <Send className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-3 font-display text-base font-bold text-charcoal">
            Send to Loved One
          </p>
          <p className="mt-1 text-sm text-warm-gray">
            Instant delivery via email
          </p>
        </Card>

        <Card className="p-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-100">
            <Wallet className="h-5 w-5 text-green-600" />
          </div>
          <p className="mt-3 font-display text-base font-bold text-charcoal">
            They Redeem
          </p>
          <p className="mt-1 text-sm text-warm-gray">
            Money added to their wallet
          </p>
        </Card>
      </div>

      {/* My Gift Cards */}
      {isAuthenticated && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-bold text-charcoal">
            Your Gift Cards
          </h2>
          <p className="text-sm text-warm-gray">
            {cards?.length ?? 0} gift card{(cards?.length ?? 0) !== 1 ? 's' : ''}
          </p>

          <div className="mt-4 space-y-3">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <Card key={i} className="p-5">
                  <div className="h-16 animate-pulse rounded-xl bg-charcoal/5" />
                </Card>
              ))
            ) : !cards || cards.length === 0 ? (
              <Card className="p-12 text-center">
                <Gift className="mx-auto h-12 w-12 text-charcoal/20" />
                <p className="mt-3 text-sm font-semibold text-warm-gray">
                  No gift cards yet
                </p>
                <p className="mt-1 text-xs text-warm-gray">
                  Buy one to gift or receive
                </p>
                <Button size="sm" className="mt-4" onClick={() => setShowBuyModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Buy Gift Card
                </Button>
              </Card>
            ) : (
              cards.map((card) => (
                <GiftCardRow
                  key={card._id}
                  card={card}
                  copiedCode={copiedCode}
                  onCopy={() => handleCopyCode(card.code)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* 🎁 Buy Gift Card Modal */}
      <Modal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        title="Buy Gift Card"
      >
        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          {/* Amount Selection */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-charcoal">
              Amount
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setAmount(amt)
                    setCustomAmount('')
                  }}
                  className={cn(
                    'rounded-xl border py-3 text-sm font-semibold transition-colors',
                    !customAmount && amount === amt
                      ? 'border-tomato bg-tomato text-cream'
                      : 'border-charcoal/15 text-charcoal hover:border-tomato/40'
                  )}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <div className="mt-2">
              <label className="mb-1.5 block text-xs text-warm-gray">
                Or enter custom amount (₹100 - ₹50,000)
              </label>
              <Input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter custom amount"
                min={100}
                max={50000}
              />
            </div>
          </div>

          {/* Recipient */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-charcoal">
              Recipient Name
            </label>
            <Input
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g., Priya Sharma"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-charcoal">
              Recipient Email
            </label>
            <Input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="priya@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-charcoal">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Happy birthday! Enjoy a meal on me 🎉"
              className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm outline-none focus:border-tomato"
            />
          </div>

          {/* Summary */}
          <div className="rounded-xl bg-beige/50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-warm-gray">Gift Card Value</span>
              <span className="font-bold text-charcoal">₹{finalAmount}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowBuyModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBuy}
              disabled={purchaseMutation.isPending || !isValidAmount}
              className="flex-1"
            >
              <Gift className="mr-2 h-4 w-4" />
              {purchaseMutation.isPending
                ? 'Processing...'
                : `Buy · ₹${finalAmount}`}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 🎉 Redeem Gift Card Modal */}
      <Modal
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        title="Redeem Gift Card"
      >
        <div className="space-y-4">
          <p className="text-sm text-warm-gray">
            Enter your gift card code to add money to your wallet
          </p>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-charcoal">
              Gift Card Code
            </label>
            <Input
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              placeholder="SF-XXXX-XXXX-XXXX"
              className="font-mono tracking-wider"
            />
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <p className="text-xs text-blue-900">
              The amount will be added instantly to your SanFoody wallet and can be
              used for any order.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowRedeemModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRedeem}
              disabled={redeemMutation.isPending || !redeemCode.trim()}
              className="flex-1"
            >
              <Wallet className="mr-2 h-4 w-4" />
              {redeemMutation.isPending ? 'Redeeming...' : 'Redeem'}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  )
}

// ============================================
// Gift Card Row Component
// ============================================

function GiftCardRow({
  card,
  copiedCode,
  onCopy,
}: {
  card: any
  copiedCode: string | null
  onCopy: () => void
}) {
  const isRedeemed = card.status === 'redeemed'
  const isExpired = card.status === 'expired'
  const expiresDate = new Date(card.expiresAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Card
      className={cn(
        'p-5',
        isRedeemed && 'opacity-70',
        isExpired && 'border-red-200 bg-red-50/30'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'grid h-12 w-12 shrink-0 place-items-center rounded-2xl',
              isRedeemed
                ? 'bg-charcoal/10 text-charcoal/60'
                : isExpired
                  ? 'bg-red-100 text-red-600'
                  : 'bg-linear-to-br from-tomato to-orange text-cream'
            )}
          >
            <Gift className="h-6 w-6" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-lg font-bold text-charcoal">
                ₹{card.amount}
              </p>
              <Badge
                variant={
                  isRedeemed ? 'neutral' : isExpired ? 'danger' : 'success'
                }
              >
                {card.status}
              </Badge>
            </div>

            {/* Code */}
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-beige/50 px-3 py-1.5">
              <span className="font-mono text-xs font-bold tracking-wider text-charcoal">
                {card.code}
              </span>
              <button
                onClick={onCopy}
                className="text-tomato transition-colors hover:text-orange"
                aria-label="Copy code"
              >
                {copiedCode === card.code ? (
                  <CopyCheck className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            {/* Meta */}
            <p className="mt-2 text-xs text-warm-gray">
              {card.recipientName ? `To: ${card.recipientName} · ` : ''}
              Expires {expiresDate}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="text-right">
          {isRedeemed && (
            <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Redeemed
            </div>
          )}
          {!isRedeemed && !isExpired && (
            <p className="text-xs text-warm-gray">
              Balance: ₹{card.balance}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}