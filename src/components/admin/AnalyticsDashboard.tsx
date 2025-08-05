'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface SalesData {
  date: string
  total_revenue: number
  total_orders: number
  total_customers: number
  new_customers: number
  returning_customers: number
  average_order_value: number
}

interface CustomerData {
  customer_phone: string
  customer_name: string
  total_orders: number
  total_spent: number
  customer_type: 'new' | 'returning'
  last_order_date: string
}

interface AnalyticsStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  averageOrderValue: number
  revenueGrowth: number
  ordersGrowth: number
  customersGrowth: number
}

export default function AnalyticsDashboard() {
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [customerData, setCustomerData] = useState<CustomerData[]>([])
  const [stats, setStats] = useState<AnalyticsStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0
  })
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      // Fetch sales analytics
      const salesResponse = await fetch(`/api/admin/analytics/sales?range=${timeRange}`)
      const salesResult = await salesResponse.json()
      
      // Fetch customer analytics
      const customerResponse = await fetch(`/api/admin/analytics/customers?range=${timeRange}`)
      const customerResult = await customerResponse.json()

      if (salesResult.success) {
        setSalesData(salesResult.data)
        calculateStats(salesResult.data)
      }

      if (customerResult.success) {
        setCustomerData(customerResult.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: SalesData[]) => {
    if (data.length === 0) return

    const totalRevenue = data.reduce((sum, day) => sum + day.total_revenue, 0)
    const totalOrders = data.reduce((sum, day) => sum + day.total_orders, 0)
    const totalCustomers = data.reduce((sum, day) => sum + day.total_customers, 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calculate growth (compare first half vs second half of period)
    const midPoint = Math.floor(data.length / 2)
    const firstHalf = data.slice(0, midPoint)
    const secondHalf = data.slice(midPoint)

    const firstHalfRevenue = firstHalf.reduce((sum, day) => sum + day.total_revenue, 0)
    const secondHalfRevenue = secondHalf.reduce((sum, day) => sum + day.total_revenue, 0)
    const revenueGrowth = firstHalfRevenue > 0 ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 : 0

    const firstHalfOrders = firstHalf.reduce((sum, day) => sum + day.total_orders, 0)
    const secondHalfOrders = secondHalf.reduce((sum, day) => sum + day.total_orders, 0)
    const ordersGrowth = firstHalfOrders > 0 ? ((secondHalfOrders - firstHalfOrders) / firstHalfOrders) * 100 : 0

    const firstHalfCustomers = firstHalf.reduce((sum, day) => sum + day.total_customers, 0)
    const secondHalfCustomers = secondHalf.reduce((sum, day) => sum + day.total_customers, 0)
    const customersGrowth = firstHalfCustomers > 0 ? ((secondHalfCustomers - firstHalfCustomers) / firstHalfCustomers) * 100 : 0

    setStats({
      totalRevenue,
      totalOrders,
      totalCustomers,
      averageOrderValue,
      revenueGrowth,
      ordersGrowth,
      customersGrowth
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const StatCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    color 
  }: { 
    title: string
    value: string | number
    growth: number
    icon: any
    color: string 
  }) => (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      whileHover={{ y: -2, shadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center mt-2">
            {growth >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(growth).toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs previous period</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  )

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
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Track your business performance and growth</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1 mt-4 sm:mt-0">
          {[
            { key: '7d', label: '7 Days' },
            { key: '30d', label: '30 Days' },
            { key: '90d', label: '90 Days' }
          ].map((range) => (
            <button
              key={range.key}
              onClick={() => setTimeRange(range.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range.key
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          growth={stats.revenueGrowth}
          icon={DollarSign}
          color="bg-emerald-500"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          growth={stats.ordersGrowth}
          icon={ShoppingCart}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          growth={stats.customersGrowth}
          icon={Users}
          color="bg-purple-500"
        />
        <StatCard
          title="Avg Order Value"
          value={formatCurrency(stats.averageOrderValue)}
          growth={0}
          icon={TrendingUp}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-end justify-between space-x-2">
            {salesData.slice(-7).map((day, index) => {
              const maxRevenue = Math.max(...salesData.map(d => d.total_revenue))
              const height = maxRevenue > 0 ? (day.total_revenue / maxRevenue) * 100 : 0
              
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-emerald-500 rounded-t-md w-full transition-all duration-300 hover:bg-emerald-600"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                    title={`${formatCurrency(day.total_revenue)} on ${day.date}`}
                  />
                  <span className="text-xs text-gray-500 mt-2">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Customer Types */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Customer Types</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {[
              { 
                label: 'New Customers', 
                count: customerData.filter(c => c.customer_type === 'new').length,
                color: 'bg-blue-500'
              },
              { 
                label: 'Returning Customers', 
                count: customerData.filter(c => c.customer_type === 'returning').length,
                color: 'bg-emerald-500'
              }
            ].map((item, index) => {
              const total = customerData.length
              const percentage = total > 0 ? (item.count / total) * 100 : 0
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${item.color} mr-3`} />
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-gray-900 mr-2">{item.count}</span>
                    <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Top Customers */}
      <motion.div
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Orders</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Total Spent</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {customerData
                .sort((a, b) => b.total_spent - a.total_spent)
                .slice(0, 5)
                .map((customer, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{customer.customer_name}</div>
                        <div className="text-sm text-gray-500">{customer.customer_phone}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{customer.total_orders}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {formatCurrency(customer.total_spent)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        customer.customer_type === 'new' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {customer.customer_type === 'new' ? 'New' : 'Returning'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(customer.last_order_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
