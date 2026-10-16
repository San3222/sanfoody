// src/apps/customer/components/RatingModal.tsx
import { useState } from 'react'
import { Star, MessageSquare, IndianRupee } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/shared/Button'
import { useRateDelivery } from '@/api/ratingHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

const TIP_OPTIONS = [0, 10, 20, 50, 100]

export function RatingModal({
    isOpen,
    onClose,
    orderId,
    deliveryPartnerName,
}: {
    isOpen: boolean
    onClose: () => void
    orderId: string
    deliveryPartnerName?: string
}) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [tipAmount, setTipAmount] = useState(0)
    const [comment, setComment] = useState('')

    const rateMutation = useRateDelivery()
    const { showToast } = useToast()

    const handleSubmit = () => {
        if (rating === 0) {
            showToast('error', 'Please give a rating')
            return
        }

        rateMutation.mutate(
            { orderId, rating, tipAmount, comment },
            {
                onSuccess: () => {
                    showToast(
                        'success',
                        tipAmount > 0
                            ? `Thanks! ₹${tipAmount} tip sent 🌟`
                            : 'Thanks for your feedback!'
                    )
                    onClose()
                },
                onError: (err: any) => showToast('error', err.message || 'Failed'),
            }
        )
    }

    const displayRating = hoverRating || rating

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Rate Your Delivery">
            <div className="space-y-5">
                <p className="text-sm text-warm-gray">
                    How was your delivery experience with{' '}
                    <strong className="text-charcoal">{deliveryPartnerName || 'the delivery partner'}</strong>?
                </p>

                {/* Star Rating */}
                <div className="flex flex-col items-center gap-3 py-4">
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="transition-transform hover:scale-110"
                                aria-label={`Rate ${star} star`}
                            >
                                <Star
                                    className={cn(
                                        'h-10 w-10 transition-colors',
                                        star <= displayRating
                                            ? 'fill-gold text-gold'
                                            : 'text-charcoal/20'
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <p className="text-sm font-semibold text-charcoal">
                            {rating === 5 && '⭐ Excellent!'}
                            {rating === 4 && '👍 Good'}
                            {rating === 3 && '😐 Okay'}
                            {rating === 2 && '👎 Could be better'}
                            {rating === 1 && '😞 Poor'}
                        </p>
                    )}
                </div>

                {/* Tip */}
                <div>
                    <label className="mb-2 block text-sm font-semibold text-charcoal">
                        Add a tip for the delivery partner
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {TIP_OPTIONS.map((amt) => (
                            <button
                                key={amt}
                                type="button"
                                onClick={() => setTipAmount(amt)}
                                className={cn(
                                    'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                                    tipAmount === amt
                                        ? 'border-tomato bg-tomato text-cream'
                                        : 'border-charcoal/15 text-charcoal hover:border-tomato/40'
                                )}
                            >
                                {amt === 0 ? 'No tip' : `₹${amt}`}
                            </button>
                        ))}
                    </div>
                    {tipAmount > 0 && (
                        <p className="mt-2 flex items-center gap-1 text-xs text-green-700">
                            <IndianRupee className="h-3 w-3" />
                            {tipAmount} goes 100% to the delivery partner
                        </p>
                    )}
                </div>

                {/* Comment */}
                <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-charcoal">
                        <MessageSquare className="h-4 w-4" />
                        Comment (optional)
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        placeholder="Share your experience..."
                        className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm outline-none focus:border-tomato"
                    />
                </div>

                {/* Submit */}
                <Button
                    onClick={handleSubmit}
                    disabled={rating === 0 || rateMutation.isPending}
                    className="w-full"
                    size="lg"
                >
                    {rateMutation.isPending ? 'Submitting...' : 'Submit Rating'}
                </Button>

                <button
                    onClick={onClose}
                    className="w-full text-center text-xs text-warm-gray hover:text-charcoal"
                >
                    Skip for now
                </button>
            </div>
        </Modal>
    )
}