'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Settings, 
  LogOut, 
  Users, 
  TrendingUp,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import OrdersTable from '@/components/admin/OrdersTable'
import WebsiteEditor from '@/components/admin/WebsiteEditor'
import DashboardStats from '@/components/admin/DashboardStats'
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard'
import InventoryManager from '@/components/admin/InventoryManager'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  })
  const router = useRouter()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardStats stats={stats} />
      case 'orders':
        return <OrdersTable />
      case 'analytics':
        return <AnalyticsDashboard />
      case 'inventory':
        return <InventoryManager />
      case 'website':
        return <WebsiteEditor />
      default:
        return <DashboardStats stats={stats} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Mobile Header Spacer */}
        <div className="h-16 lg:h-0"></div>

        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 lg:px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'orders' && 'Order Management'}
                  {activeTab === 'analytics' && 'Analytics & Reports'}
                  {activeTab === 'inventory' && 'Inventory Management'}
                  {activeTab === 'website' && 'Website Customization'}
                </h1>
                <p className="text-sm lg:text-base text-gray-600 mt-1">
                  {activeTab === 'dashboard' && 'Ruhafiya Admin Panel'}
                  {activeTab === 'orders' && 'View and manage all orders'}
                  {activeTab === 'analytics' && 'Sales and customer analytics'}
                  {activeTab === 'inventory' && 'Track stock and manage inventory'}
                  {activeTab === 'website' && 'Edit website content'}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                <div className="bg-emerald-50 rounded-xl px-3 lg:px-4 py-2">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 lg:w-5 h-4 lg:h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <div className="text-xs lg:text-sm text-emerald-600 font-medium">Total Orders</div>
                      <div className="text-base lg:text-lg font-bold text-emerald-700">{stats.totalOrders}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl px-3 lg:px-4 py-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 lg:w-5 h-4 lg:h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <div className="text-xs lg:text-sm text-blue-600 font-medium">Total Revenue</div>
                      <div className="text-base lg:text-lg font-bold text-blue-700">৳{stats.totalRevenue}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}