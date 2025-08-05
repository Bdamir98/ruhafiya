'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react'

interface InventoryItem {
  id: string
  product_name: string
  current_stock: number
  minimum_stock: number
  maximum_stock: number
  unit_cost: number
  selling_price: number
  supplier_name: string
  supplier_contact: string
  last_restocked_date: string
  last_restocked_quantity: number
  status: 'active' | 'low_stock' | 'out_of_stock' | 'discontinued'
  created_at: string
  updated_at: string
}

interface StockMovement {
  id: string
  product_name: string
  movement_type: 'in' | 'out' | 'adjustment'
  quantity: number
  previous_stock: number
  new_stock: number
  reason: string
  notes: string
  created_at: string
}

export default function InventoryManager() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  useEffect(() => {
    fetchInventory()
    fetchStockMovements()
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/admin/inventory')
      const result = await response.json()
      
      if (result.success) {
        setInventory(result.data)
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStockMovements = async () => {
    try {
      const response = await fetch('/api/admin/inventory/movements')
      const result = await response.json()
      
      if (result.success) {
        setStockMovements(result.data)
      }
    } catch (error) {
      console.error('Error fetching stock movements:', error)
    }
  }

  const updateStock = async (productName: string, quantity: number, reason: string, notes: string = '') => {
    try {
      const response = await fetch('/api/admin/inventory/update-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_name: productName,
          quantity,
          reason,
          notes
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        fetchInventory()
        fetchStockMovements()
        setShowStockModal(false)
        setSelectedItem(null)
      } else {
        alert('Error updating stock: ' + result.error)
      }
    } catch (error) {
      console.error('Error updating stock:', error)
      alert('Error updating stock')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800'
      case 'discontinued':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'low_stock':
      case 'out_of_stock':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const StockUpdateModal = () => {
    const [quantity, setQuantity] = useState('')
    const [reason, setReason] = useState('restock')
    const [notes, setNotes] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (selectedItem && quantity) {
        updateStock(selectedItem.product_name, parseInt(quantity), reason, notes)
      }
    }

    return (
      <AnimatePresence>
        {showStockModal && selectedItem && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold mb-4">Update Stock - {selectedItem.product_name}</h3>
              <p className="text-sm text-gray-600 mb-4">Current Stock: {selectedItem.current_stock}</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity Change
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter positive for add, negative for remove"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="restock">Restock</option>
                    <option value="sale">Sale</option>
                    <option value="adjustment">Adjustment</option>
                    <option value="damage">Damage</option>
                    <option value="return">Return</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowStockModal(false)
                      setSelectedItem(null)
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Update Stock
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600 mt-1">Track and manage your product inventory</p>
        </div>
        
        <div className="flex gap-3 mt-4 sm:mt-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products or suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Supplier</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Last Restocked</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{item.product_name}</div>
                    <div className="text-sm text-gray-500">Min: {item.minimum_stock} | Max: {item.maximum_stock}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{item.current_stock}</div>
                    <div className="text-sm text-gray-500">
                      {item.current_stock <= item.minimum_stock ? (
                        <span className="text-red-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="text-green-600">In Stock</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      {item.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">৳{item.selling_price}</div>
                    <div className="text-sm text-gray-500">Cost: ৳{item.unit_cost}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{item.supplier_name}</div>
                    <div className="text-sm text-gray-500">{item.supplier_contact}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900">
                      {item.last_restocked_date ? new Date(item.last_restocked_date).toLocaleDateString() : 'Never'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Qty: {item.last_restocked_quantity || 0}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedItem(item)
                          setShowStockModal(true)
                        }}
                        className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
                        title="Update Stock"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Update Modal */}
      <StockUpdateModal />
    </div>
  )
}
