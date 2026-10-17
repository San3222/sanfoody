// src/apps/restaurant/pages/MenuManager.tsx
import { useState, useMemo, useRef } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  UtensilsCrossed,
  RefreshCw,
  ImageIcon,
  UploadCloud,
  Link as LinkIcon,
  X,
  IndianRupee,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { FoodCardSkeleton } from '@/components/shared/Skeleton'
import {
  useRestaurantProfile,
  useRestaurantMenuItems,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useToggleMenuItemAvailability,
} from '@/api/restaurantHooks'
import type { FoodItem } from '@/data/foods'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

// ============================================
// Categories
// ============================================

const CATEGORIES = [
  'Starters',
  'Main Course',
  'Sides',
  'Breads',
  'Desserts',
  'Beverages',
  'Pizza',
  'Burger',
  'Sushi',
  'Noodles',
  'Mexican',
]

// ============================================
// Form State Type
// ============================================

interface MenuFormState {
  name: string
  description: string
  image: string
  price: string
  category: string
  isVeg: boolean
  isAvailable: boolean
}

const EMPTY_FORM: MenuFormState = {
  name: '',
  description: '',
  image: '',
  price: '',
  category: 'Main Course',
  isVeg: true,
  isAvailable: true,
}

// ============================================
// Main Component
// ============================================

export function RestaurantMenuManager() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null)
  const [formData, setFormData] = useState<MenuFormState>(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState<FoodItem | null>(null)

  // 🔥 Image Upload State
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch restaurant profile to get restaurantId
  const { data: profile, isLoading: profileLoading } = useRestaurantProfile()
  const restaurantId = profile?._id

  // Fetch menu items
  const { data: menuItems, isLoading: menuLoading, refetch, isRefetching } =
    useRestaurantMenuItems(restaurantId)

  // Mutations
  const createMutation = useCreateMenuItem()
  const updateMutation = useUpdateMenuItem()
  const deleteMutation = useDeleteMenuItem()
  const toggleMutation = useToggleMenuItemAvailability()

  const { showToast } = useToast()

  // Filter
  const filteredItems = useMemo(() => {
    if (!menuItems) return []
    if (!searchQuery.trim()) return menuItems
    const q = searchQuery.toLowerCase()
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
    )
  }, [menuItems, searchQuery])

  // ============================================
  // Handlers
  // ============================================

  const handleAddItem = () => {
    setEditingItem(null)
    setFormData(EMPTY_FORM)
    setImageMode('url')
    setIsModalOpen(true)
  }

  const handleEditItem = (item: FoodItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      image: item.image,
      price: String(item.price),
      category: item.course || 'Main Course',
      isVeg: item.isVeg,
      isAvailable: item.isAvailable ?? true,
    })
    setImageMode(item.image.startsWith('data:image') ? 'upload' : 'url')
    setIsModalOpen(true)
  }

  // 🔥 File Upload Handler (Base64 Conversion) - 10MB Limit
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 🔥 10MB Validation
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'Image size should be less than 10MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData({ ...formData, image: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    if (!formData.name.trim()) return showToast('error', 'Item name is required')
    if (!formData.description.trim()) return showToast('error', 'Description is required')
    if (!formData.image.trim()) return showToast('error', 'Image is required')

    const price = parseInt(formData.price, 10)
    if (!price || price <= 0) return showToast('error', 'Valid price is required')

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      image: formData.image.trim(),
      price,
      category: formData.category,
      isVeg: formData.isVeg,
      isAvailable: formData.isAvailable,
    }

    if (editingItem) {
      updateMutation.mutate(
        { id: editingItem.id || editingItem._id, data: payload },
        {
          onSuccess: () => {
            showToast('success', 'Menu item updated')
            closeModal()
          },
          onError: (err: any) => showToast('error', err.message || 'Update failed'),
        }
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          showToast('success', 'Menu item created')
          closeModal()
        },
        onError: (err: any) => showToast('error', err.message || 'Create failed'),
      })
    }
  }

  const handleDelete = () => {
    if (!deleteConfirm) return
    deleteMutation.mutate(deleteConfirm.id || deleteConfirm._id, {
      onSuccess: () => {
        showToast('success', 'Menu item deleted')
        setDeleteConfirm(null)
      },
      onError: (err: any) => showToast('error', err.message || 'Delete failed'),
    })
  }

  const handleToggle = (item: FoodItem) => {
    toggleMutation.mutate(item.id || item._id, {
      onSuccess: () => showToast('success', 'Availability updated'),
      onError: (err: any) => showToast('error', err.message || 'Toggle failed'),
    })
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData(EMPTY_FORM)
  }

  // ============================================
  // Loading state
  // ============================================

  if (profileLoading || menuLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 w-48 rounded-lg bg-charcoal/5" />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <FoodCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="pb-12">
      {/* ============================================
          🔥 Header Redesigned (Refresh & Add Item)
          ============================================ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Menu Manager</h1>
          <p className="mt-1 text-sm text-warm-gray">
            Manage your dishes and availability ({menuItems?.length ?? 0} items)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 🔥 Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="group flex h-11 items-center justify-center gap-2 rounded-xl border border-charcoal/15 bg-white px-4 text-sm font-semibold text-charcoal transition-all hover:border-charcoal/30 hover:bg-charcoal/5 disabled:opacity-60"
          >
            <RefreshCw className={cn('h-4 w-4 text-warm-gray transition-colors group-hover:text-charcoal', isRefetching && 'animate-spin')} />
            <span className="hidden sm:block">Refresh</span>
          </button>

          {/* 🔥 Add Item Button */}
          <button
            onClick={handleAddItem}
            className="group flex h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-tomato to-orange px-5 text-sm font-bold text-cream shadow-warm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4.5 w-4.5 transition-transform group-hover:rotate-90" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* 🔥 Search Bar */}
      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-charcoal/10 bg-white px-4 py-3 shadow-sm focus-within:border-tomato focus-within:ring-4 focus-within:ring-tomato/10 transition-all">
        <Search className="h-5 w-5 text-warm-gray" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your menu by item name or category..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-warm-gray"
        />
      </div>

      {/* Menu Grid */}
      {filteredItems.length === 0 ? (
        <Card className="mt-8 p-16 text-center border-dashed border-2 border-charcoal/10 shadow-none">
          <UtensilsCrossed className="mx-auto h-16 w-16 text-charcoal/20" />
          <h3 className="mt-4 font-display text-lg font-bold text-charcoal">
            {searchQuery ? 'No items found' : 'Your menu is empty'}
          </h3>
          <p className="mt-1 text-sm text-warm-gray">
            {searchQuery ? 'Try adjusting your search terms' : 'Start by adding your first dish'}
          </p>
          {!searchQuery && (
            <Button onClick={handleAddItem} className="mt-6">
              <Plus className="mr-2 h-4 w-4" />
              Add First Item
            </Button>
          )}
        </Card>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <MenuCard
              key={item.id || item._id}
              item={item}
              onEdit={() => handleEditItem(item)}
              onDelete={() => setDeleteConfirm(item)}
              onToggle={() => handleToggle(item)}
              isToggling={toggleMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* ============================================
          ADD/EDIT MODAL
          ============================================ */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
      >
        <div className="max-h-[75vh] space-y-6 overflow-y-auto pr-2 pb-2 scrollbar-none">

          {/* 🔥 Image Upload / URL Section */}
          <div className="space-y-3 rounded-2xl border border-charcoal/10 bg-beige/30 p-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-charcoal">Item Image *</label>

              <div className="flex rounded-full bg-white p-1 border border-charcoal/10 shadow-sm">
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all',
                    imageMode === 'url' ? 'bg-tomato text-cream shadow-sm' : 'text-warm-gray hover:text-charcoal'
                  )}
                >
                  <LinkIcon className="h-3 w-3" /> URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all',
                    imageMode === 'upload' ? 'bg-tomato text-cream shadow-sm' : 'text-warm-gray hover:text-charcoal'
                  )}
                >
                  <UploadCloud className="h-3 w-3" /> Upload
                </button>
              </div>
            </div>

            {/* Preview or Dropzone */}
            {formData.image ? (
              <div className="relative overflow-hidden rounded-xl bg-charcoal/5">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="h-48 w-full object-cover"
                  onError={(e) => {
                    ; (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image: '' })}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-charcoal/60 text-cream backdrop-blur-sm transition-colors hover:bg-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : imageMode === 'upload' ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-charcoal/15 bg-white transition-colors hover:border-tomato hover:bg-tomato/5"
              >
                <div className="grid h-12 w-12 place-items-center rounded-full bg-beige">
                  <UploadCloud className="h-6 w-6 text-warm-gray" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-charcoal">Click to upload image</p>
                  {/* 🔥 Max 10MB text updated */}
                  <p className="text-xs text-warm-gray mt-1">JPG, PNG or WebP (max 10MB)</p>
                </div>
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl border border-charcoal/10 bg-white">
                <LinkIcon className="h-8 w-8 text-charcoal/20" />
                <p className="text-xs text-warm-gray">Enter an image URL below to see preview</p>
              </div>
            )}

            {/* URL Input */}
            {imageMode === 'url' && (
              <div className="flex items-center gap-2 rounded-xl border border-charcoal/15 bg-white px-3 py-2.5 focus-within:border-tomato focus-within:ring-2 focus-within:ring-tomato/10 transition-all">
                <ImageIcon className="h-4 w-4 shrink-0 text-warm-gray" />
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-warm-gray"
                />
              </div>
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/jpeg, image/png, image/webp"
              className="hidden"
            />
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-charcoal">
                Item Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Butter Chicken, Margherita Pizza"
                className="bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-charcoal">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm outline-none focus:border-tomato focus:ring-2 focus:ring-tomato/10 transition-all"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-charcoal">
                  Price *
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-charcoal/15 bg-white px-3 py-2.5 focus-within:border-tomato focus-within:ring-2 focus-within:ring-tomato/10 transition-all">
                  <IndianRupee className="h-4 w-4 text-warm-gray" />
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="299"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-warm-gray"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-charcoal">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Describe the dish, ingredients, etc..."
                className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm outline-none focus:border-tomato focus:ring-2 focus:ring-tomato/10 transition-all resize-none"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-4 rounded-2xl border border-charcoal/10 bg-beige/30 p-4">
            <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-charcoal/10 bg-white p-3 shadow-sm hover:border-fresh-green/50 transition-colors">
              <input
                type="checkbox"
                checked={formData.isVeg}
                onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                className="h-5 w-5 rounded border-charcoal/20 accent-fresh-green"
              />
              <span className="text-sm font-semibold text-charcoal">Vegetarian</span>
            </label>

            <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-charcoal/10 bg-white p-3 shadow-sm hover:border-tomato/50 transition-colors">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="h-5 w-5 rounded border-charcoal/20 accent-tomato"
              />
              <span className="text-sm font-semibold text-charcoal">Available</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={closeModal} className="flex-1 bg-white">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editingItem
                  ? 'Save Changes'
                  : 'Create Item'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Menu Item"
      >
        <div className="text-center py-4">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-50 mb-4">
            <Trash2 className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-charcoal font-medium">
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?
          </p>
          <p className="text-sm text-warm-gray mt-1">This action cannot be undone.</p>
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1 bg-white">
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex-1 shadow-lg shadow-red-500/20"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

// ============================================
// MenuCard Component
// ============================================

function MenuCard({
  item,
  onEdit,
  onDelete,
  onToggle,
  isToggling,
}: {
  item: FoodItem
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  isToggling: boolean
}) {
  const isAvailable = item.isAvailable ?? true

  return (
    <Card className="group flex flex-col overflow-hidden p-0 transition-all duration-300 hover:shadow-warm hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-beige">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <ImageIcon className="h-8 w-8 text-charcoal/20" />
          </div>
        )}

        {/* Veg indicator */}
        <span
          className={cn(
            'absolute left-3 top-3 grid h-6 w-6 place-items-center rounded border-2 bg-white shadow-sm',
            item.isVeg ? 'border-fresh-green' : 'border-tomato'
          )}
        >
          <span
            className={cn(
              'h-2.5 w-2.5 rounded-full',
              item.isVeg ? 'bg-fresh-green' : 'bg-tomato'
            )}
          />
        </span>

        {/* Unavailable Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-charcoal/60 backdrop-blur-sm">
            <span className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold text-charcoal leading-tight line-clamp-1">
            {item.name}
          </h3>
          <span className="shrink-0 font-display text-lg font-bold text-tomato">
            ₹{item.price}
          </span>
        </div>

        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-warm-gray">
          {item.description}
        </p>

        <div className="mt-3 flex items-center gap-2">
          {item.course && (
            <Badge variant="neutral" className="bg-charcoal/5 text-charcoal/70 border-0">
              {item.course}
            </Badge>
          )}
        </div>

        {/* Actions Footer */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-charcoal/5">
          {/* Toggle */}
          <button
            onClick={onToggle}
            disabled={isToggling}
            className={cn(
              'group/toggle relative flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50',
              isAvailable ? 'bg-fresh-green' : 'bg-charcoal/20'
            )}
            aria-label={isAvailable ? 'Mark unavailable' : 'Mark available'}
          >
            <span
              className={cn(
                'absolute left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300',
                isAvailable ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>

          {/* Edit + Delete */}
          <div className="flex gap-1.5">
            <button
              onClick={onEdit}
              className="grid h-8 w-8 place-items-center rounded-lg bg-charcoal/5 text-charcoal/60 transition-colors hover:bg-tomato/10 hover:text-tomato"
              title="Edit item"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="grid h-8 w-8 place-items-center rounded-lg bg-charcoal/5 text-charcoal/60 transition-colors hover:bg-red-50 hover:text-red-600"
              title="Delete item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}