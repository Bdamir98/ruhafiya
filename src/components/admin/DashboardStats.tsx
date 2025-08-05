'use client'

import { ShoppingCart, DollarSign, Clock, CheckCircle, TrendingUp, Users } from 'lucide-react'

interface DashboardStatsProps {
  stats: {
    totalOrders: number
    pendingOrders: number
    completedOrders: number
    totalRevenue: number
  }
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Revenue',
      value: `৳${stats.totalRevenue}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          
          return (
            <div
              key={index}
              className={`${stat.bgColor} rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${stat.textColor} mb-2`}>
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
          <div className="space-y-4">
            <button className="w-full flex items-center gap-3 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors duration-300">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
              <span className="font-medium text-emerald-700">View New Orders</span>
            </button>
            
            <button className="w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors duration-300">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-700">Sales Report</span>
            </button>
            
            <button className="w-full flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors duration-300">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-700">Customer List</span>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-700">Website Status</span>
              </div>
              <span className="text-green-600 font-semibold">Online</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-700">Database</span>
              </div>
              <span className="text-green-600 font-semibold">Connected</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-700">Order System</span>
              </div>
              <span className="text-green-600 font-semibold">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Performance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">
                {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
              </span>
            </div>
            <h4 className="font-semibold text-gray-800">Success Rate</h4>
            <p className="text-gray-600 text-sm">Percentage of completed orders</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">
                {stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0}
              </span>
            </div>
            <h4 className="font-semibold text-gray-800">Average Order Value</h4>
            <p className="text-gray-600 text-sm">Average revenue per order</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">{stats.pendingOrders}</span>
            </div>
            <h4 className="font-semibold text-gray-800">Pending</h4>
            <p className="text-gray-600 text-sm">Awaiting processing</p>
          </div>
        </div>
      </div>
    </div>
  )
}