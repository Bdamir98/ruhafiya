'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  AlertTriangle, 
  Package, 
  ShoppingCart, 
  Settings, 
  X, 
  Check,
  Clock,
  ExternalLink
} from 'lucide-react'

interface Notification {
  id: string
  type: 'low_stock' | 'out_of_stock' | 'new_order' | 'system'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  is_read: boolean
  action_url?: string
  metadata?: any
  created_at: string
  read_at?: string
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all')

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications')
      const result = await response.json()
      
      if (result.success) {
        setNotifications(result.data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/admin/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notification_id: notificationId }),
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true, read_at: new Date().toISOString() }
              : notif
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/admin/notifications/mark-all-read', {
        method: 'POST',
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ 
            ...notif, 
            is_read: true, 
            read_at: new Date().toISOString() 
          }))
        )
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/admin/notifications?id=${notificationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
      case 'out_of_stock':
        return <Package className="w-5 h-5" />
      case 'new_order':
        return <ShoppingCart className="w-5 h-5" />
      case 'system':
        return <Settings className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread':
        return !notif.is_read
      case 'urgent':
        return notif.priority === 'urgent'
      default:
        return true
    }
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Notification Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="bg-emerald-500 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6" />
                  <div>
                    <h2 className="text-lg font-semibold">Notifications</h2>
                    <p className="text-emerald-100 text-sm">
                      {unreadCount} unread notifications
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-emerald-600 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 mt-4">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'unread', label: 'Unread' },
                  { key: 'urgent', label: 'Urgent' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as any)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filter === tab.key
                        ? 'bg-white text-emerald-600'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            {unreadCount > 0 && (
              <div className="p-4 border-b border-gray-200">
                <button
                  onClick={markAllAsRead}
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Mark all as read
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications found</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      className={`p-4 border-l-4 hover:bg-gray-50 cursor-pointer ${
                        notification.is_read ? 'opacity-60' : ''
                      } ${
                        notification.priority === 'urgent' ? 'border-red-500' :
                        notification.priority === 'high' ? 'border-orange-500' :
                        notification.priority === 'medium' ? 'border-yellow-500' :
                        'border-blue-500'
                      }`}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 truncate">
                              {notification.title}
                            </h3>
                            <div className="flex items-center gap-2 ml-2">
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotification(notification.id)
                                }}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {new Date(notification.created_at).toLocaleString()}
                            </div>
                            
                            {notification.action_url && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.location.href = notification.action_url!
                                }}
                                className="text-emerald-600 hover:text-emerald-700 text-xs font-medium flex items-center gap-1"
                              >
                                View
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Notification Bell Component for Header
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchUnreadCount()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/admin/notifications/count')
      const result = await response.json()
      
      if (result.success) {
        setUnreadCount(result.count)
      }
    } catch (error) {
      console.error('Error fetching notification count:', error)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.span
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      <NotificationCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
