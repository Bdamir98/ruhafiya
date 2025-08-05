'use client'

import { useState, useEffect } from 'react'
import { supabase, Order } from '@/lib/supabase'
import { Search, Filter, Eye, Edit, Trash2, Phone, MapPin, Package } from 'lucide-react'

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'completed'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_phone.includes(searchTerm) ||
        order.id.includes(searchTerm)
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'paid' | 'completed') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ))
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Error updating order status')
    }
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)

      if (error) throw error

      setOrders(orders.filter(order => order.id !== orderId))
    } catch (error) {
      console.error('Error deleting order:', error)
      alert('Error deleting order')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Paid', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
          <p className="text-gray-600">Total {orders.length} orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Order ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Customer Info</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-gray-600">
                      #{order.id.slice(-8)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-800">{order.customer_name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {order.customer_phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm text-gray-700">{order.product_quantity} pcs</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-800">৳{order.total_amount}</span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {formatDate(order.created_at)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowOrderModal(true)
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="completed">Completed</option>
                      </select>
                      
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No orders found</h3>
            <p className="text-gray-500">No orders match your current filters.</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">
                  Order Details #{selectedOrder.id.slice(-8)}
                </h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Customer Information</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div><strong>Name:</strong> {selectedOrder.customer_name}</div>
                  <div><strong>Phone:</strong> {selectedOrder.customer_phone}</div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                    <div>
                      <strong>Address:</strong>
                      <p className="text-gray-600 mt-1">{selectedOrder.customer_address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Order Information</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div><strong>Product Quantity:</strong> {selectedOrder.product_quantity} pcs</div>
                  <div><strong>Total Amount:</strong> ৳{selectedOrder.total_amount}</div>
                  <div><strong>Status:</strong> {getStatusBadge(selectedOrder.status)}</div>
                  <div><strong>Order Date:</strong> {formatDate(selectedOrder.created_at)}</div>
                  <div><strong>Last Updated:</strong> {formatDate(selectedOrder.updated_at)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}