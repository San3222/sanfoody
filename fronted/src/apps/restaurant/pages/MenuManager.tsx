// src/apps/restaurant/pages/MenuManager.tsx
import { useState, useMemo } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  UtensilsCrossed,
  RefreshCw,
  ImageIcon,
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
      isAvailable: true,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = () => {
    // Validation
    if (!formData.name.trim()) {
      showToast('error', 'Item name is required')
      return
    }
    if (!formData.description.trim()) {
      showToast('error', 'Description is required')
      return
    }
    if (!formData.image.trim()) {
      showToast('error', 'Image URL is required')
      return
    }
    const price = parseInt(formData.price, 10)
    if (!price || price <= 0) {
      showToast('error', 'Valid price is required')
      return
    }

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
      // Update
      updateMutation.mutate(
        { id: editingItem.id || editingItem._id, data: payload },
        {
          onSuccess: () => {
            showToast('success', 'Menu item updated')
            setIsModalOpen(false)
            setEditingItem(null)
            setFormData(EMPTY_FORM)
          },
          onError: (err: any) => showToast('error', err.message || 'Update failed'),
        }
      )
    } else {
      // Create
      createMutation.mutate(payload, {
        onSuccess: () => {
          showToast('success', 'Menu item created')
          setIsModalOpen(false)
          setFormData(EMPTY_FORM)
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

  // ============================================
  // Loading state
  // ============================================

  if (profileLoading || menuLoading) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-charcoal">Menu Manager</h1>
            <p className="mt-1 text-sm text-warm-gray">Loading...</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <FoodCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Menu Manager</h1>
          <p className="mt-1 text-sm text-warm-gray">
            {menuItems?.length ?? 0} item{(menuItems?.length ?? 0) !== 1 ? 's' : ''} on
            your menu
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={cn('mr-2 h-4 w-4', isRefetching && 'animate-spin')} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleAddItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6 flex items-center gap-2 rounded-full border border-charcoal/10 bg-white px-4 py-2.5">
        <Search className="h-4 w-4 text-warm-gray" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search menu items..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-warm-gray"
        />
      </div>

      {/* Menu Grid */}
      {filteredItems.length === 0 ? (
        <Card className="mt-6 p-12 text-center">
          <UtensilsCrossed className="mx-auto h-12 w-12 text-charcoal/20" />
          <p className="mt-3 text-sm text-warm-gray">
            {searchQuery ? 'No items match your search' : 'No menu items yet'}
          </p>
          {!searchQuery && (
            <Button size="sm" onClick={handleAddItem} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add First Item
            </Button>
          )}
        </Card>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingItem(null)
          setFormData(EMPTY_FORM)
        }}
        title={editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
      >
        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          {/* Image Preview */}
          {formData.image && (
            <div className="overflow-hidden rounded-2xl">
              <img
                src={formData.image}
                alt="Preview"
                className="aspect-video w-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-charcoal">
              Item Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Margherita Pizza"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-charcoal">
              Image URL *
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-charcoal/15 bg-white px-4 py-3">
              <ImageIcon className="h-4 w-4 shrink-0 text-warm-gray" />
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-warm-gray"
              />
            </div>
          </div>

          {/* Category + Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm outline-none focus:border-tomato"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                Price (₹) *
              </label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="299"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-charcoal">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Brief description of the dish..."
              className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm outline-none focus:border-tomato"
            />
          </div>

          {/* Toggles */}
          <div className="flex gap-4">
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-charcoal/10 p-3">
              <input
                type="checkbox"
                checked={formData.isVeg}
                onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                className="h-4 w-4 rounded accent-fresh-green"
              />
              <span className="text-sm font-medium text-charcoal">Vegetarian</span>
            </label>

            <label className="flex flex-1 items-center gap-2 rounded-xl border border-charcoal/10 p-3">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) =>
                  setFormData({ ...formData, isAvailable: e.target.checked })
                }
                className="h-4 w-4 rounded accent-tomato"
              />
              <span className="text-sm font-medium text-charcoal">Available</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false)
                setEditingItem(null)
                setFormData(EMPTY_FORM)
              }}
              className="flex-1"
            >
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
                  : 'Add Item'}
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
        <p className="text-sm text-warm-gray">
          Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This
          action cannot be undone.
        </p>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex-1"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
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
    <Card className="group overflow-hidden p-0">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-beige">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <ImageIcon className="h-8 w-8 text-charcoal/20" />
          </div>
        )}

        {/* Veg indicator */}
        <span
          className={cn(
            'absolute left-3 top-3 grid h-5 w-5 place-items-center rounded border-2 bg-white',
            item.isVeg ? 'border-fresh-green' : 'border-tomato'
          )}
        >
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              item.isVeg ? 'bg-fresh-green' : 'bg-tomato'
            )}
          />
        </span>

        {/* Availability badge */}
        {!isAvailable && (
          <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
            Unavailable
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-bold text-charcoal line-clamp-1">
            {item.name}
          </h3>
          <span className="shrink-0 font-display text-base font-bold text-tomato">
            ₹{item.price}
          </span>
        </div>

        <p className="mt-1 line-clamp-2 text-xs text-warm-gray">{item.description}</p>

        <div className="mt-2 flex items-center gap-2">
          {item.course && <Badge variant="neutral">{item.course}</Badge>}
          <Badge variant={item.isVeg ? 'success' : 'danger'}>
            {item.isVeg ? 'Veg' : 'Non-Veg'}
          </Badge>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-charcoal/10 pt-3">
          {/* Availability toggle */}
          <button
            onClick={onToggle}
            disabled={isToggling}
            className={cn(
              'relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50',
              isAvailable ? 'bg-fresh-green' : 'bg-charcoal/20'
            )}
            aria-label={isAvailable ? 'Disable item' : 'Enable item'}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                isAvailable ? 'translate-x-5' : ''
              )}
            />
          </button>

          {/* Edit + Delete */}
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="grid h-8 w-8 place-items-center rounded-full text-charcoal/60 transition-colors hover:bg-beige hover:text-tomato"
              aria-label="Edit item"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="grid h-8 w-8 place-items-center rounded-full text-charcoal/60 transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label="Delete item"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}