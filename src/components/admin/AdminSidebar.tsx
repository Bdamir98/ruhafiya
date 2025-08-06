'use client'

import { useState } from 'react'
import { LayoutDashboard, ShoppingCart, Settings, LogOut, Leaf, Menu, X, BarChart3, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AdminSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  onLogout: () => void
}

export default function AdminSidebar({ activeTab, setActiveTab, onLogout }: AdminSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'orders',
      label: 'Order Management',
      icon: ShoppingCart,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Package,
    },
    {
      id: 'website',
      label: 'Website Editor',
      icon: Settings,
    },
  ]

  const handleMenuItemClick = (tabId: string) => {
    setActiveTab(tabId)
    setIsMobileMenuOpen(false)
  }

  const sidebarVariants = {
    open: {
      x: 0
    },
    closed: {
      x: "-100%"
    }
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-emerald-700">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Leaf className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold">Ruhafiya</h2>
            <p className="text-emerald-200 text-sm">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.button
                  onClick={() => handleMenuItemClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 text-left ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm lg:text-base">{item.label}</span>
                </motion.button>
              </motion.li>
            )
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-emerald-700">
        <motion.button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-4 text-emerald-100 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300"
          whileHover={{ scale: 1.02, backgroundColor: "#dc2626" }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium text-sm lg:text-base">Logout</span>
        </motion.button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-[60] lg:hidden bg-emerald-600 text-white p-3 rounded-xl shadow-lg hover:bg-emerald-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 lg:bg-gradient-to-b lg:from-emerald-800 lg:to-teal-900 lg:text-white lg:shadow-2xl">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial="closed"
        animate={isMobileMenuOpen ? "open" : "closed"}
        className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-emerald-800 to-teal-900 text-white shadow-2xl z-50 lg:hidden"
      >
        <SidebarContent />
      </motion.div>
    </>
  )
}
