import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { CreditCard, Landmark, Wallet, MapPin, Plus, X, LocateFixed, ShieldCheck, Bike, ChevronRight, Ticket, CheckCircle2, XCircle } from 'lucide-react'
import { useCart } from '@/context/useCart'
import { createOrder, applyCoupon, type Address } from '@/api/Client'
import { useCreateRazorpayOrder, useVerifyPayment, useAddresses, useCreateAddress, useSetDefaultAddress, useCoupons } from '@/api/Hooks'
import { DELIVERY_FEE } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useToast } from '@/context/ToastContext'

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
  { id: 'upi', label: 'UPI', icon: Landmark, description: 'GPay, PhonePe, Paytm' },
  { id: 'cod', label: 'Cash on Delivery', icon: Wallet, description: 'Pay at your doorstep' },
] as const

interface OrderResponse {
  orderId: string
  estimatedDelivery: string
  total: number
}

interface RazorpayOrderResponse {
  id: string
  amount: number
  currency: string
}

export function Checkout() {
  const { items, subtotal, removeItem } = useCart()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [address, setAddress] = useState('')
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddressLabel, setNewAddressLabel] = useState('Home')
  const [newAddress, setNewAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]['id']>('card')
  const [error, setError] = useState('')
  const restaurantId = items[0]?.restaurantId ?? ''
  const [isProcessing, setIsProcessing] = useState(false)

  // 🔥 Coupon State
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponError, setCouponError] = useState('')

  // Backend Address Hooks
  const { data: addresses, isLoading: addressesLoading } = useAddresses()
  const createAddress = useCreateAddress()
  const setDefaultAddress = useSetDefaultAddress()

  // Coupon Hooks
  const { data: coupons } = useCoupons()

  // Schedule Hooks
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledFor, setScheduledFor] = useState('')

  // Load default address
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0]
      setAddress(defaultAddr.address)
      setSelectedAddressId(defaultAddr._id)
    }
  }, [addresses])

  // Load Razorpay script
  useEffect(() => {
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)
    }
    return () => { }
  }, [])

  // 🔥 GST Calculation (CGST 2.5% + SGST 2.5% = 5%)
  const gstAmount = Math.round(subtotal * 0.05)

  // 🔥 Coupon Discount
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0

  // 🔥 Final Total
  const total = subtotal + DELIVERY_FEE + gstAmount - couponDiscount

  // 🔥 Apply Coupon Handler
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      showToast('error', 'Please enter a coupon code')
      return
    }

    try {
      const result = await applyCoupon(couponCode, subtotal + DELIVERY_FEE) as { discount: number }
      setAppliedCoupon(result)
      setCouponError('')
      showToast('success', `Coupon applied! You saved ₹${result.discount}`)
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon')
      showToast('error', err.message || 'Invalid coupon')
    }
  }

  // 🔥 Remove Coupon Handler
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  const createOrderMutation = useMutation({
    mutationFn: (paymentInfo?: { razorpayOrderId: string; razorpayPaymentId: string }) =>
      createOrder({
        restaurantId,
        items: items.map((line) => ({
          menuItemId: line.id,
          name: line.name,
          price: line.price,
          quantity: line.quantity,
        })),
        address,
        paymentMethod,
        ...(appliedCoupon && { couponCode: appliedCoupon.couponCode }),
        ...(paymentInfo && {
          razorpayOrderId: paymentInfo.razorpayOrderId,
          razorpayPaymentId: paymentInfo.razorpayPaymentId,
        }),
      }),
    onSuccess: (order: OrderResponse) => {
      items.forEach((line) => removeItem(line.id))
      navigate(`/order/${order.orderId}`, {
        replace: true,
        state: { estimatedMinutes: order.estimatedDelivery, total },
      })
    },
    onError: (error: any) => {
      setError(error.message)
    },
  })

  const createRazorpayOrder = useCreateRazorpayOrder()
  const verifyPayment = useVerifyPayment()

  const handlePayment = async () => {
    try {
      setIsProcessing(true)
      setError('')

      // Checkout.tsx mein
      const razorpayOrder = await createRazorpayOrder.mutateAsync(total * 100) as RazorpayOrderResponse

      const options = {
        key: 'rzp_test_TZUrtaf19rIBsF', // 🔥 Apni Razorpay Key ID yahan daalo
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'SanFoody',
        description: 'Food Order',
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          try {
            await verifyPayment.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })

            await createOrderMutation.mutateAsync({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
            })
          } catch (error) {
            console.error('Payment verification or order placement failed:', error)
            setError('Payment verification failed. Please try again.')
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            setError('Payment cancelled. Please try again.')
          }
        },
        prefill: {
          name: 'SanFoody User',
          email: 'user@example.com',
        },
        theme: {
          color: '#E63946',
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error('Razorpay order creation failed:', error)
      setError('Could not initiate payment. Please try again.')
      setIsProcessing(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!address.trim()) {
      setError('Please select or enter a delivery address.')
      return
    }
    if (!restaurantId) {
      setError('Something went wrong — please add items again from the restaurant page.')
      return
    }
    if (paymentMethod === 'cod') {
      createOrderMutation.mutate(undefined)
    } else {
      handlePayment()
    }
  }

  if (items.length === 0 && !createOrderMutation.isPending && !createOrderMutation.isSuccess) {
    return <Navigate to="/" replace />
  }

  const handleAddressSelect = (addr: Address) => {
    setSelectedAddressId(addr._id)
    setAddress(addr.address)
  }

  const handleSaveAddress = () => {
    if (!newAddress.trim()) {
      showToast('error', 'Please enter a valid address')
      return
    }
    createAddress.mutate({
      label: newAddressLabel,
      address: newAddress,
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
    }, {
      onSuccess: (newAddr) => {
        setAddress(newAddr.address)
        setSelectedAddressId(newAddr._id)
        setShowAddAddress(false)
        setNewAddress('')
      }
    })
  }

  const handleSetDefault = (id: string) => {
    setDefaultAddress.mutate(id)
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const locationText = `Current location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          setNewAddress(locationText)
          setNewAddressLabel('Current Location')
        },
        (error) => {
          console.error('Error getting location:', error)
          showToast('error', 'Could not get your location. Please try again.')
        }
      )
    } else {
      showToast('error', 'Geolocation is not supported by this browser.')
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-extrabold text-charcoal sm:text-3xl">Checkout</h1>
        <p className="mt-1 text-sm text-warm-gray">Complete your order in a few simple steps</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8 flex items-center gap-2 text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-tomato">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-tomato text-xs text-cream">1</span>
          Address
        </span>
        <ChevronRight className="h-4 w-4 text-warm-gray" />
        <span className="flex items-center gap-1.5 font-semibold text-charcoal/60">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-charcoal/10 text-xs">2</span>
          Payment
        </span>
        <ChevronRight className="h-4 w-4 text-warm-gray" />
        <span className="flex items-center gap-1.5 font-semibold text-charcoal/60">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-charcoal/10 text-xs">3</span>
          Review
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Address Section */}
          <div className="rounded-2xl border border-charcoal/8 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-charcoal">
                <MapPin className="h-4 w-4 text-tomato" />
                Delivery Address
              </h2>
              <button
                onClick={() => setShowAddAddress(true)}
                className="flex items-center gap-1 rounded-full bg-tomato/10 px-3 py-1 text-xs font-semibold text-tomato hover:bg-tomato/20"
              >
                <Plus className="h-3 w-3" />
                Add New
              </button>
            </div>

            {addresses && addresses.length > 0 && (
              <div className="mb-4 space-y-2">
                {addresses.map((addr) => (
                  <div key={addr._id} className="flex items-start gap-2">
                    <button
                      onClick={() => handleAddressSelect(addr)}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all',
                        selectedAddressId === addr._id
                          ? 'border-tomato bg-tomato/5'
                          : 'border-charcoal/10 hover:border-charcoal/20'
                      )}
                    >
                      <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-charcoal/20">
                        {selectedAddressId === addr._id && (
                          <div className="h-2 w-2 rounded-full bg-tomato" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-charcoal">{addr.label}</p>
                        <p className="mt-0.5 text-xs text-warm-gray">{addr.address}</p>
                      </div>
                    </button>
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr._id)}
                        className="mt-1 text-xs font-semibold text-tomato hover:underline"
                      >
                        Default
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {showAddAddress && (
              <div className="mb-4 rounded-xl border border-charcoal/10 bg-beige/30 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-charcoal">Add New Address</h3>
                  <button onClick={() => setShowAddAddress(false)} className="text-warm-gray hover:text-tomato">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mb-3 flex flex-wrap gap-2">
                  {['Home', 'Work', 'Other'].map((label) => (
                    <button
                      key={label}
                      onClick={() => setNewAddressLabel(label)}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-semibold',
                        newAddressLabel === label
                          ? 'bg-tomato text-cream'
                          : 'bg-white text-charcoal/70'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  rows={2}
                  placeholder="Enter your full address"
                  className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-tomato"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleGetCurrentLocation}
                    className="flex items-center gap-1.5 rounded-full border border-charcoal/15 px-3.5 py-1.5 text-xs font-semibold text-charcoal/70 hover:border-tomato/40 hover:text-tomato"
                  >
                    <LocateFixed className="h-3.5 w-3.5" />
                    Current Location
                  </button>
                  <button
                    onClick={handleSaveAddress}
                    className="flex-1 rounded-full bg-tomato px-4 py-1.5 text-xs font-semibold text-cream hover:bg-tomato/90"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">Enter Address Manually</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                placeholder="House no., street, area, city"
                className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-tomato"
              />
            </div>
          </div>

          {/* Schedule Order Section */}
          <div className="rounded-2xl border border-charcoal/8 bg-white p-5 shadow-sm">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={(e) => {
                  setIsScheduled(e.target.checked)

                  // Uncheck karne par date clear
                  if (!e.target.checked) {
                    setScheduledFor('')
                  }
                }}
                className="h-4 w-4 accent-tomato"
              />

              <span className="text-sm font-semibold text-charcoal">
                Schedule for later
              </span>
            </label>

            {isScheduled && (
              <div className="mt-3">
                <label className="mb-1.5 block text-xs font-medium text-warm-gray">
                  Select date & time
                </label>

                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  min={new Date(
                    Date.now() + 30 * 60 * 1000
                  ).toISOString().slice(0, 16)}
                  className="w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm outline-none focus:border-tomato"
                />
              </div>
            )}
          </div>




          {/* Payment Section */}
          <div className="rounded-2xl border border-charcoal/8 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-charcoal">
              <CreditCard className="h-4 w-4 text-tomato" />
              Payment Method
            </h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4 transition-all',
                    paymentMethod === method.id
                      ? 'border-tomato bg-tomato/5'
                      : 'border-charcoal/10 hover:border-charcoal/20'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'grid h-5 w-5 place-items-center rounded-full border-2',
                      paymentMethod === method.id ? 'border-tomato' : 'border-charcoal/20'
                    )}>
                      {paymentMethod === method.id && (
                        <div className="h-2.5 w-2.5 rounded-full bg-tomato" />
                      )}
                    </div>
                    <method.icon className="h-5 w-5 text-charcoal/70" />
                    <div>
                      <p className="text-sm font-semibold text-charcoal">{method.label}</p>
                      <p className="text-xs text-warm-gray">{method.description}</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="sr-only"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Delivery Instructions */}
          <div className="rounded-2xl border border-charcoal/8 bg-white p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-charcoal">
              <Bike className="h-4 w-4 text-tomato" />
              Delivery Instructions
            </h2>
            <textarea
              rows={2}
              placeholder="Any instructions for the delivery partner? (e.g., Leave at the door)"
              className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-tomato"
            />
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-charcoal/8 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-display text-base font-bold text-charcoal">Order Summary</h2>

            <div className="space-y-3">
              {items.map((line) => (
                <div key={line.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-beige">
                      {line.image ? (
                        <img src={line.image} alt={line.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-charcoal">{line.name}</p>
                      <p className="text-xs text-warm-gray">Qty: {line.quantity}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-charcoal">₹{line.price * line.quantity}</span>
                </div>
              ))}
            </div>

            {/* 🔥 Coupon Section */}
            <div className="mt-4 rounded-xl border border-charcoal/10 p-3">
              {!appliedCoupon ? (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm outline-none focus:border-tomato"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="rounded-lg bg-charcoal px-4 py-2 text-sm font-semibold text-cream hover:bg-charcoal/80"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="mt-2 text-xs font-medium text-red-600">{couponError}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(Array.isArray(coupons) ? coupons.slice(0, 3) : []).map((c: any) => (
                      <button
                        key={c._id}
                        onClick={() => setCouponCode(c.couponCode)}
                        className="rounded-full bg-beige px-3 py-1 text-xs font-semibold text-charcoal/70 hover:bg-tomato/10 hover:text-tomato"
                      >
                        {c.couponCode}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-tomato" />
                    <div>
                      <p className="text-sm font-semibold text-charcoal">{appliedCoupon.couponCode}</p>
                      <p className="text-xs text-green-600">You saved ₹{appliedCoupon.discount}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-warm-gray hover:text-tomato"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-2 border-t border-charcoal/10 pt-4">
              <div className="flex justify-between text-sm text-warm-gray">
                <span>Item Total</span>
                <span className="font-medium text-charcoal">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-warm-gray">
                <span>Delivery Fee</span>
                <span className="font-medium text-charcoal">₹{DELIVERY_FEE}</span>
              </div>
              <div className="flex justify-between text-sm text-warm-gray">
                <span>GST (5%)</span>
                <span className="font-medium text-charcoal">₹{gstAmount}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon Discount</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-charcoal/5 px-4 py-3">
              <span className="font-display text-sm font-bold text-charcoal">To Pay</span>
              <span className="font-display text-lg font-extrabold text-charcoal">₹{total}</span>
            </div>

            {error && <p className="mt-3 text-sm font-medium text-tomato">{error}</p>}
            {createOrderMutation.isError && <p className="mt-3 text-sm font-medium text-tomato">Couldn't place order. Try again.</p>}

            <button
              type="submit"
              disabled={isProcessing || createOrderMutation.isPending}
              onClick={handleSubmit}
              className="mt-5 w-full rounded-xl bg-linear-to-r from-tomato to-orange py-3.5 text-sm font-bold text-cream shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              {isProcessing || createOrderMutation.isPending
                ? 'Processing...'
                : paymentMethod === 'cod'
                  ? `Place Order · ₹${total}`
                  : `Pay ₹${total}`}
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-warm-gray">
              <ShieldCheck className="h-3.5 w-3.5 text-fresh-green" />
              100% Secure Payments
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}