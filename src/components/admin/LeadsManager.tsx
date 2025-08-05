'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  Smartphone,
  Monitor,
  Globe
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Lead {
  id: number
  name: string
  phone: string
  email: string
  country: string
  city: string
  device: string
  browser: string
  source: string
  status: string
  captured_at: string
  ip_address: string
  referer: string
}

export default function LeadsManager() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    status: 'all',
    device: 'all',
    country: 'all',
    dateRange: '7'
  })
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    withPhone: 0,
    withEmail: 0,
    converted: 0
  })

  useEffect(() => {
    fetchLeads()
  }, [])

  useEffect(() => {
    applyFilters()
    calculateStats()
  }, [leads, filter])

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('captured_at', { ascending: false })

      if (error) throw error
      setLeads(data || [])
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...leads]

    // Status filter
    if (filter.status !== 'all') {
      filtered = filtered.filter(lead => lead.status === filter.status)
    }

    // Device filter
    if (filter.device !== 'all') {
      filtered = filtered.filter(lead => lead.device === filter.device)
    }

    // Country filter
    if (filter.country !== 'all') {
      filtered = filtered.filter(lead => lead.country === filter.country)
    }

    // Date range filter
    const days = parseInt(filter.dateRange)
    if (days > 0) {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      filtered = filtered.filter(lead => 
        new Date(lead.captured_at) >= cutoffDate
      )
    }

    setFilteredLeads(filtered)
  }

  const calculateStats = () => {
    const today = new Date().toDateString()
    
    setStats({
      total: leads.length,
      today: leads.filter(lead => 
        new Date(lead.captured_at).toDateString() === today
      ).length,
      withPhone: leads.filter(lead => lead.phone && lead.phone.trim() !== '').length,
      withEmail: leads.filter(lead => lead.email && lead.email.trim() !== '').length,
      converted: leads.filter(lead => lead.status === 'converted').length
    })
  }

  const updateLeadStatus = async (leadId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId)

      if (error) throw error

      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ))
    } catch (error) {
      console.error('Error updating lead status:', error)
    }
  }

  const exportLeads = () => {
    const csvContent = [
      ['Name', 'Phone', 'Email', 'Country', 'City', 'Device', 'Source', 'Status', 'Date'],
      ...filteredLeads.map(lead => [
        lead.name,
        lead.phone,
        lead.email,
        lead.country,
        lead.city,
        lead.device,
        lead.source,
        lead.status,
        new Date(lead.captured_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getUniqueValues = (field: keyof Lead) => {
    return [...new Set(leads.map(lead => lead[field]).filter(Boolean))]
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Lead Management</h2>
        <button
          onClick={exportLeads}
          className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Leads', value: stats.total, icon: Users, color: 'blue' },
          { label: 'Today', value: stats.today, icon: Calendar, color: 'green' },
          { label: 'With Phone', value: stats.withPhone, icon: Phone, color: 'purple' },
          { label: 'With Email', value: stats.withEmail, icon: Mail, color: 'orange' },
          { label: 'Converted', value: stats.converted, icon: CheckCircle, color: 'emerald' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className={`bg-white p-6 rounded-xl shadow-lg border-l-4 border-${stat.color}-500`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 text-${stat.color}-500`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
          </select>

          <select
            value={filter.device}
            onChange={(e) => setFilter({ ...filter, device: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Devices</option>
            {getUniqueValues('device').map(device => (
              <option key={device} value={device}>{device}</option>
            ))}
          </select>

          <select
            value={filter.country}
            onChange={(e) => setFilter({ ...filter, country: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Countries</option>
            {getUniqueValues('country').map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>

          <select
            value={filter.dateRange}
            onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="0">All Time</option>
            <option value="1">Last 24 Hours</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </span>
                        )}
                      </div>
                      {lead.email && (
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {lead.city}, {lead.country}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      {lead.device === 'Mobile' ? (
                        <Smartphone className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Monitor className="w-4 h-4 text-green-500" />
                      )}
                      {lead.device}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lead.captured_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-emerald-600 hover:text-emerald-900 flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No leads found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}