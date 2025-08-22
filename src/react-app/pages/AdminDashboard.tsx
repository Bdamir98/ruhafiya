"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Package, Users, TrendingUp, LogOut, RefreshCw, Plus, FileText, Bell, Settings as SettingsIcon, Search } from 'lucide-react';

interface Order {
  id: number;
  order_number: string;
  full_name: string;
  mobile_number: string;
  product_name: string;
  quantity: number;
  total_amount: number;
  status: string;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  shipping_charge: number;
  is_active: boolean;
  stock_quantity: number;
}

interface AdminUser {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  last_login_at?: string | null;
  created_at?: string;
}

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message?: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'content' | 'users' | 'notifications' | 'settings'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, shipping_charge: 0, is_active: true, stock_quantity: 0 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState<{ name: string; price: number; shipping_charge: number; is_active: boolean; stock_quantity: number }>({ name: '', price: 0, shipping_charge: 0, is_active: true, stock_quantity: 0 });
  const [contentJson, setContentJson] = useState<string>('{}');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [contentError, setContentError] = useState<string>('');
  const [contentSections, setContentSections] = useState<Array<{ name: string; fields: Array<{ key: string; value: string }> }>>([]);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [savingProductId, setSavingProductId] = useState<number | null>(null);
  const [togglingProductId, setTogglingProductId] = useState<number | null>(null);
  const [contentSaving, setContentSaving] = useState(false);
  const [notice, setNotice] = useState('');
  // pagination + search state
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderQuery, setOrderQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('');

  const [productPage, setProductPage] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [productQuery, setProductQuery] = useState('');
  const [productActiveFilter, setProductActiveFilter] = useState<string>('');

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersQuery, setUsersQuery] = useState('');

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifPage, setNotifPage] = useState(1);
  const [notifTotal, setNotifTotal] = useState(0);
  const [notifQuery, setNotifQuery] = useState('');
  const [creatingNotif, setCreatingNotif] = useState(false);
  const [newNotif, setNewNotif] = useState({ type: '', title: '', message: '' });
  const router = useRouter();

  useEffect(() => {
    const admin = localStorage.getItem('admin');
    if (!admin) {
      router.replace('/admin/login');
      return;
    }
    fetchOrders();
    // Preload products and content for faster tab switch
    fetchProducts();
    fetchWebsiteContent();
  }, [router]);

  const fetchOrders = async (opts?: { page?: number; q?: string; status?: string }) => {
    try {
      const page = opts?.page ?? orderPage;
      const sp = new URLSearchParams();
      sp.set('page', String(page));
      sp.set('pageSize', '10');
      if (opts?.q ?? orderQuery) sp.set('q', (opts?.q ?? orderQuery));
      if (opts?.status ?? orderStatusFilter) sp.set('status', (opts?.status ?? orderStatusFilter));
      const response = await fetch(`/api/admin/orders?${sp.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data.orders);
        setOrderTotal(data.total ?? data.orders?.length ?? 0);
        setOrderPage(data.page ?? page);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sectioned content editor helpers
  const addSection = () => setContentSections(prev => [...prev, { name: 'New Section', fields: [{ key: '', value: '' }] }]);
  const removeSection = (sIndex: number) => setContentSections(prev => prev.filter((_, i) => i !== sIndex));
  const renameSection = (sIndex: number, name: string) => setContentSections(prev => prev.map((s, i) => i === sIndex ? { ...s, name } : s));
  const addField = (sIndex: number) => setContentSections(prev => prev.map((s, i) => i === sIndex ? { ...s, fields: [...s.fields, { key: '', value: '' }] } : s));
  const updateField = (sIndex: number, fIndex: number, field: 'key' | 'value', val: string) =>
    setContentSections(prev => prev.map((s, i) => i === sIndex ? { ...s, fields: s.fields.map((f, j) => j === fIndex ? { ...f, [field]: val } : f) } : s));
  const removeField = (sIndex: number, fIndex: number) => setContentSections(prev => prev.map((s, i) => i === sIndex ? { ...s, fields: s.fields.filter((_, j) => j !== fIndex) } : s));

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditFields({
      name: p.name,
      price: Number(p.price),
      shipping_charge: Number(p.shipping_charge),
      is_active: !!p.is_active,
      stock_quantity: Number((p as any).stock_quantity ?? 0),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: number) => {
    try {
      setSavingProductId(id);
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editFields.name,
          price: Number(editFields.price),
          shipping_charge: Number(editFields.shipping_charge),
          is_active: editFields.is_active,
          stock_quantity: Number(editFields.stock_quantity),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(prev => prev.map(p => (p.id === id ? data.product : p)));
        setEditingId(null);
        setNotice('Product updated');
        setTimeout(() => setNotice(''), 2000);
      }
    } catch (e) {
      console.error('Failed to update product', e);
    } finally {
      setSavingProductId(null);
    }
  };

  const toggleProductActive = async (id: number) => {
    try {
      setTogglingProductId(id);
      const res = await fetch(`/api/admin/products/${id}/toggle`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok) {
        setProducts(prev => prev.map(p => (p.id === id ? data.product : p)));
        setNotice(data.product.is_active ? 'Product activated' : 'Product deactivated');
        setTimeout(() => setNotice(''), 2000);
      }
    } catch (e) {
      console.error('Failed to toggle product', e);
    } finally {
      setTogglingProductId(null);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)));
      }
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const fetchProducts = async (opts?: { page?: number; q?: string; active?: string }) => {
    setIsLoadingProducts(true);
    try {
      const page = opts?.page ?? productPage;
      const sp = new URLSearchParams();
      sp.set('page', String(page));
      sp.set('pageSize', '10');
      if (opts?.q ?? productQuery) sp.set('q', (opts?.q ?? productQuery));
      if (opts?.active ?? productActiveFilter) sp.set('active', (opts?.active ?? productActiveFilter));
      const res = await fetch(`/api/admin/products?${sp.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
        setProductTotal(data.total ?? (data.products?.length ?? 0));
        setProductPage(data.page ?? page);
      }
    } catch (e) {
      console.error('Failed to fetch products', e);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatingProduct(true);
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          price: Number(newProduct.price),
          shipping_charge: Number(newProduct.shipping_charge),
          is_active: newProduct.is_active,
          stock_quantity: Number(newProduct.stock_quantity),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(prev => [...prev, data.product]);
        setNewProduct({ name: '', price: 0, shipping_charge: 0, is_active: true, stock_quantity: 0 });
        setNotice('Product created');
        setTimeout(() => setNotice(''), 2000);
      }
    } catch (e) {
      console.error('Failed to create product', e);
    } finally {
      setCreatingProduct(false);
    }
  };

  // Users API
  const fetchUsers = async (pageArg?: number, qArg?: string) => {
    try {
      const page = pageArg ?? usersPage;
      const sp = new URLSearchParams();
      sp.set('page', String(page));
      sp.set('pageSize', '10');
      const q = qArg ?? usersQuery;
      if (q) sp.set('q', q);
      const res = await fetch(`/api/admin/users?${sp.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
        setUsersTotal(data.total ?? (data.users?.length ?? 0));
        setUsersPage(data.page ?? page);
      }
    } catch (e) {
      console.error('Failed to fetch users', e);
    }
  };

  // Notifications API
  const fetchNotifications = async (pageArg?: number, qArg?: string) => {
    try {
      const page = pageArg ?? notifPage;
      const sp = new URLSearchParams();
      sp.set('page', String(page));
      sp.set('pageSize', '10');
      const q = qArg ?? notifQuery;
      if (q) sp.set('q', q);
      const res = await fetch(`/api/admin/notifications?${sp.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
        setNotifTotal(data.total ?? (data.notifications?.length ?? 0));
        setNotifPage(data.page ?? page);
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  };

  const createNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatingNotif(true);
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotif),
      });
      const data = await res.json();
      if (res.ok) {
        // Prepend new notification and reset form
        setNotifications(prev => [data.notification, ...prev]);
        setNewNotif({ type: '', title: '', message: '' });
        setNotice('Notification created');
        setTimeout(() => setNotice(''), 2000);
      }
    } catch (e) {
      console.error('Failed to create notification', e);
    } finally {
      setCreatingNotif(false);
    }
  };

  const fetchWebsiteContent = async () => {
    setIsLoadingContent(true);
    setContentError('');
    try {
      const res = await fetch('/api/admin/website-content');
      const data = await res.json();
      if (res.ok) {
        const obj = (data.content ?? {}) as Record<string, any>;
        setContentJson(JSON.stringify(obj, null, 2));
        // if object values are nested objects, treat each top-level key as a section
        const sections: Array<{ name: string; fields: Array<{ key: string; value: string }> }> = [];
        const topEntries = Object.entries(obj);
        if (topEntries.length) {
          for (const [sectionName, sectionVal] of topEntries) {
            if (sectionVal && typeof sectionVal === 'object' && !Array.isArray(sectionVal)) {
              const fields = Object.entries(sectionVal as Record<string, any>).map(([k, v]) => ({ key: k, value: typeof v === 'string' ? v : JSON.stringify(v) }));
              sections.push({ name: sectionName, fields: fields.length ? fields : [{ key: '', value: '' }] });
            } else {
              // fall back to General section
              sections.push({ name: 'General', fields: topEntries.map(([k, v]) => ({ key: k, value: typeof v === 'string' ? v : JSON.stringify(v) })) });
              break;
            }
          }
        }
        setContentSections(sections.length ? sections : [{ name: 'General', fields: [{ key: '', value: '' }] }]);
      }
    } catch (e) {
      console.error('Failed to fetch website content', e);
    } finally {
      setIsLoadingContent(false);
    }
  };

  const saveWebsiteContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setContentError('');
    try {
      setContentSaving(true);
      // build object from sections
      const obj: Record<string, any> = {};
      for (const section of contentSections) {
        const secName = (section.name || 'Section').trim();
        const secObj: Record<string, any> = {};
        for (const { key, value } of section.fields) {
          const k = key.trim();
          if (!k) continue;
          try {
            secObj[k] = JSON.parse(value);
          } catch {
            secObj[k] = value;
          }
        }
        if (Object.keys(secObj).length) obj[secName] = secObj;
      }
      const res = await fetch('/api/admin/website-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: obj }),
      });
      if (!res.ok) {
        const d = await res.json();
        setContentError(d.error || 'Failed to save');
      } else {
        setNotice('Content saved');
        setTimeout(() => setNotice(''), 2000);
      }
    } catch (e) {
      setContentError('Failed to save content');
    } finally {
      setContentSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    router.replace('/admin/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {notice && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded shadow">
          {notice}
        </div>
      )}
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-white/90 backdrop-blur border-r">
        <div className="h-16 flex items-center px-6 border-b">
          <span className="text-xl font-semibold tracking-tight">Ruhafiya Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center px-3 py-2 rounded-md text-left border-l-4 ${activeTab==='orders' ? 'border-green-600 bg-green-50 text-green-700' : 'border-transparent hover:bg-gray-50 text-gray-700'}`}>
            <ShoppingCart className="w-5 h-5 mr-2"/> Orders
          </button>
          <button onClick={() => setActiveTab('products')} className={`w-full flex items-center px-3 py-2 rounded-md text-left border-l-4 ${activeTab==='products' ? 'border-green-600 bg-green-50 text-green-700' : 'border-transparent hover:bg-gray-50 text-gray-700'}`}>
            <Package className="w-5 h-5 mr-2"/> Products
          </button>
          <button onClick={() => setActiveTab('content')} className={`w-full flex items-center px-3 py-2 rounded-md text-left border-l-4 ${activeTab==='content' ? 'border-green-600 bg-green-50 text-green-700' : 'border-transparent hover:bg-gray-50 text-gray-700'}`}>
            <FileText className="w-5 h-5 mr-2"/> Website Content
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center px-3 py-2 rounded-md text-left border-l-4 ${activeTab==='users' ? 'border-green-600 bg-green-50 text-green-700' : 'border-transparent hover:bg-gray-50 text-gray-700'}`}>
            <Users className="w-5 h-5 mr-2"/> Users
          </button>
          <button onClick={() => setActiveTab('notifications')} className={`w-full flex items-center px-3 py-2 rounded-md text-left border-l-4 ${activeTab==='notifications' ? 'border-green-600 bg-green-50 text-green-700' : 'border-transparent hover:bg-gray-50 text-gray-700'}`}>
            <Bell className="w-5 h-5 mr-2"/> Notifications
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center px-3 py-2 rounded-md text-left border-l-4 ${activeTab==='settings' ? 'border-green-600 bg-green-50 text-green-700' : 'border-transparent hover:bg-gray-50 text-gray-700'}`}>
            <SettingsIcon className="w-5 h-5 mr-2"/> Settings
          </button>
        </nav>
        <div className="p-4 border-t">
          <button onClick={handleLogout} className="w-full inline-flex items-center justify-center px-3 py-2 border rounded-md hover:bg-gray-50">
            <LogOut className="w-4 h-4 mr-2"/> Logout
          </button>
        </div>
      </aside>

      {/* Topbar for small screens */}
      <header className="lg:hidden bg-white/90 backdrop-blur shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Ruhafiya Admin</h1>
            <button onClick={handleLogout} className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 capitalize">{activeTab}</h2>
          </div>

        {activeTab === 'orders' && (
        <>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">৳{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Customers</p>
                <p className="text-2xl font-semibold text-gray-900">{totalOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
                <input value={orderQuery} onChange={(e)=>setOrderQuery(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') fetchOrders({ page: 1, q: e.currentTarget.value }); }} placeholder="Search orders..." className="pl-8 pr-3 py-2 border rounded-md" />
              </div>
              <select value={orderStatusFilter} onChange={(e)=>{ setOrderStatusFilter(e.target.value); fetchOrders({ page: 1, status: e.target.value }); }} className="border rounded px-2 py-2 text-sm">
                <option value="">All</option>
                {['pending','confirmed','shipped','delivered','cancelled'].map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={()=>fetchOrders()} className="inline-flex items-center px-3 py-2 text-sm border rounded-md hover:bg-gray-50">
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading orders...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.order_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.full_name}</div>
                          <div className="text-sm text-gray-500">{order.mobile_number}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.product_name} (x{order.quantity})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ৳{order.total_amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          className="border rounded px-2 py-1"
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        >
                          {['pending','confirmed','shipped','delivered','cancelled'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {orders.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No orders found
                </div>
              )}
            </div>
          )}
          {/* Pagination */}
          <div className="px-6 py-4 border-t flex items-center justify-between text-sm text-gray-600">
            <span>Page {orderPage} • Total {orderTotal}</span>
            <div className="space-x-2">
              <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={()=>{ const p=Math.max(1, orderPage-1); setOrderPage(p); fetchOrders({ page: p }); }} disabled={orderPage<=1}>Prev</button>
              <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={()=>{ const p=orderPage + 1; setOrderPage(p); fetchOrders({ page: p }); }} disabled={(orderPage*10) >= orderTotal}>Next</button>
            </div>
          </div>
        </div>
        </>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">Products</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
                    <input value={productQuery} onChange={(e)=>setProductQuery(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') fetchProducts({ page: 1, q: e.currentTarget.value }); }} placeholder="Search products..." className="pl-8 pr-3 py-2 border rounded-md" />
                  </div>
                  <select value={productActiveFilter} onChange={(e)=>{ setProductActiveFilter(e.target.value); fetchProducts({ page: 1, active: e.target.value }); }} className="border rounded px-2 py-2 text-sm">
                    <option value="">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                  <button onClick={()=>fetchProducts()} className="inline-flex items-center px-3 py-2 text-sm border rounded-md hover:bg-gray-50" disabled={isLoadingProducts}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                  </button>
                </div>
              </div>
              {isLoadingProducts ? (
                <div className="p-6">Loading...</div>
              ) : (
                <div className="p-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Shipping</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((p: Product) => (
                        <tr key={p.id}>
                          <td className="px-4 py-2">{p.id}</td>
                          <td className="px-4 py-2">
                            {editingId === p.id ? (
                              <input className="border rounded px-2 py-1 w-48" value={editFields.name} onChange={e => setEditFields({ ...editFields, name: e.target.value })} />
                            ) : (
                              p.name
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {editingId === p.id ? (
                              <input type="number" className="border rounded px-2 py-1 w-28" value={editFields.price} onChange={e => setEditFields({ ...editFields, price: Number(e.target.value) })} />
                            ) : (
                              <>৳{p.price}</>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {editingId === p.id ? (
                              <input type="number" className="border rounded px-2 py-1 w-28" value={editFields.shipping_charge} onChange={e => setEditFields({ ...editFields, shipping_charge: Number(e.target.value) })} />
                            ) : (
                              <>৳{p.shipping_charge}</>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {editingId === p.id ? (
                              <input type="number" className="border rounded px-2 py-1 w-24" value={editFields.stock_quantity} onChange={e => setEditFields({ ...editFields, stock_quantity: Number(e.target.value) })} />
                            ) : (
                              <>{(p as any).stock_quantity ?? 0}</>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {editingId === p.id ? (
                              <label className="inline-flex items-center space-x-2">
                                <input type="checkbox" checked={editFields.is_active} onChange={e => setEditFields({ ...editFields, is_active: e.target.checked })} />
                                <span>{editFields.is_active ? 'Yes' : 'No'}</span>
                              </label>
                            ) : (
                              p.is_active ? 'Yes' : 'No'
                            )}
                          </td>
                          <td className="px-4 py-2 space-x-2">
                            {editingId === p.id ? (
                              <>
                                <button className="px-2 py-1 text-sm bg-green-600 text-white rounded disabled:opacity-60" onClick={() => saveEdit(p.id)} disabled={savingProductId === p.id}>
                                  {savingProductId === p.id ? 'Saving...' : 'Save'}
                                </button>
                                <button className="px-2 py-1 text-sm border rounded" onClick={cancelEdit} disabled={savingProductId === p.id}>Cancel</button>
                              </>
                            ) : (
                              <>
                                <button className="px-2 py-1 text-sm border rounded" onClick={() => startEdit(p)} disabled={togglingProductId === p.id}>Edit</button>
                                <button className="px-2 py-1 text-sm border rounded disabled:opacity-60" onClick={() => toggleProductActive(p.id)} disabled={togglingProductId === p.id}>
                                  {togglingProductId === p.id ? 'Updating...' : (p.is_active ? 'Deactivate' : 'Activate')}
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={7}>No products</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Pagination */}
              <div className="px-6 py-4 border-t flex items-center justify-between text-sm text-gray-600">
                <span>Page {productPage} • Total {productTotal}</span>
                <div className="space-x-2">
                  <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={()=>{ const p=Math.max(1, productPage-1); setProductPage(p); fetchProducts({ page: p }); }} disabled={productPage<=1}>Prev</button>
                  <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={()=>{ const p=productPage + 1; setProductPage(p); fetchProducts({ page: p }); }} disabled={(productPage*10) >= productTotal}>Next</button>
                </div>
              </div>
            </div>

            <form onSubmit={createProduct} className="bg-white shadow rounded-lg p-6 space-y-4">
              <h3 className="text-md font-semibold text-gray-900 flex items-center"><Plus className="w-4 h-4 mr-2"/>Create Product</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input className="border rounded px-3 py-2" placeholder="Name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required disabled={creatingProduct} />
                <input type="number" className="border rounded px-3 py-2" placeholder="Price" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })} min={0} required disabled={creatingProduct} />
                <input type="number" className="border rounded px-3 py-2" placeholder="Shipping Charge" value={newProduct.shipping_charge} onChange={e => setNewProduct({ ...newProduct, shipping_charge: Number(e.target.value) })} min={0} disabled={creatingProduct} />
                <input type="number" className="border rounded px-3 py-2" placeholder="Stock Qty" value={newProduct.stock_quantity} onChange={e => setNewProduct({ ...newProduct, stock_quantity: Number(e.target.value) })} min={0} disabled={creatingProduct} />
                <label className="inline-flex items-center space-x-2">
                  <input type="checkbox" checked={newProduct.is_active} onChange={e => setNewProduct({ ...newProduct, is_active: e.target.checked })} disabled={creatingProduct} />
                  <span>Active</span>
                </label>
              </div>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60" disabled={creatingProduct}>
                {creatingProduct ? 'Adding...' : 'Add Product'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Users</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
                  <input value={usersQuery} onChange={(e)=>setUsersQuery(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') fetchUsers(1, e.currentTarget.value); }} placeholder="Search users..." className="pl-8 pr-3 py-2 border rounded-md" />
                </div>
                <button onClick={()=>fetchUsers()} className="inline-flex items-center px-3 py-2 text-sm border rounded-md hover:bg-gray-50"><RefreshCw className="w-4 h-4 mr-2"/>Refresh</button>
              </div>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="px-4 py-2">{u.id}</td>
                      <td className="px-4 py-2">{u.name}</td>
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2">{u.is_active ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{u.last_login_at ? new Date(u.last_login_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                  {users.length===0 && (<tr><td className="px-4 py-6 text-center text-gray-500" colSpan={5}>No users</td></tr>)}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t flex items-center justify-between text-sm text-gray-600">
              <span>Page {usersPage} • Total {usersTotal}</span>
              <div className="space-x-2">
                <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={()=>{ const p=Math.max(1, usersPage-1); setUsersPage(p); fetchUsers(p); }} disabled={usersPage<=1}>Prev</button>
                <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={()=>{ const p=usersPage+1; setUsersPage(p); fetchUsers(p); }} disabled={(usersPage*10) >= usersTotal}>Next</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
                    <input value={notifQuery} onChange={(e)=>setNotifQuery(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') fetchNotifications(1, e.currentTarget.value); }} placeholder="Search notifications..." className="pl-8 pr-3 py-2 border rounded-md" />
                  </div>
                  <button onClick={()=>fetchNotifications()} className="inline-flex items-center px-3 py-2 text-sm border rounded-md hover:bg-gray-50"><RefreshCw className="w-4 h-4 mr-2"/>Refresh</button>
                </div>
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {notifications.map(n => (
                      <tr key={n.id}>
                        <td className="px-4 py-2">{n.type}</td>
                        <td className="px-4 py-2">{n.title}</td>
                        <td className="px-4 py-2">{n.message}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{new Date(n.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {notifications.length===0 && (<tr><td className="px-4 py-6 text-center text-gray-500" colSpan={4}>No notifications</td></tr>)}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t flex items-center justify-between text-sm text-gray-600">
                <span>Page {notifPage} • Total {notifTotal}</span>
                <div className="space-x-2">
                  <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={()=>{ const p=Math.max(1, notifPage-1); setNotifPage(p); fetchNotifications(p); }} disabled={notifPage<=1}>Prev</button>
                  <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={()=>{ const p=notifPage+1; setNotifPage(p); fetchNotifications(p); }} disabled={(notifPage*10) >= notifTotal}>Next</button>
                </div>
              </div>
            </div>

            <form onSubmit={createNotification} className="bg-white shadow rounded-lg p-6 space-y-4">
              <h3 className="text-md font-semibold text-gray-900 flex items-center"><Plus className="w-4 h-4 mr-2"/>Create Notification</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input className="border rounded px-3 py-2" placeholder="Type (e.g. info, alert)" value={newNotif.type} onChange={e=>setNewNotif({...newNotif, type: e.target.value})} required disabled={creatingNotif} />
                <input className="border rounded px-3 py-2" placeholder="Title" value={newNotif.title} onChange={e=>setNewNotif({...newNotif, title: e.target.value})} required disabled={creatingNotif} />
                <input className="border rounded px-3 py-2 md:col-span-1 col-span-1" placeholder="Message" value={newNotif.message} onChange={e=>setNewNotif({...newNotif, message: e.target.value})} disabled={creatingNotif} />
              </div>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60" disabled={creatingNotif}>{creatingNotif ? 'Creating...' : 'Create'}</button>
            </form>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-2">Settings</h2>
            <p className="text-gray-600 text-sm">Basic settings can be added here in future (e.g., store preferences, payment settings).</p>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Website Content</h2>
              <div className="flex items-center gap-2">
                <button type="button" onClick={addSection} className="inline-flex items-center px-3 py-2 text-sm border rounded-md hover:bg-gray-50">
                  <Plus className="w-4 h-4 mr-2"/> Add Section
                </button>
                <button onClick={fetchWebsiteContent} className="inline-flex items-center px-3 py-2 text-sm border rounded-md hover:bg-gray-50" type="button">
                  <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </button>
              </div>
            </div>
            <form onSubmit={saveWebsiteContent} className="p-6 space-y-6">
              {isLoadingContent ? (
                <div className="text-gray-500">Loading...</div>
              ) : (
                <div className="space-y-6">
                  {contentSections.map((section, sIndex) => (
                    <div key={sIndex} className="rounded-lg border border-gray-200 overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            className="text-base font-medium bg-transparent border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={section.name}
                            onChange={(e) => renameSection(sIndex, e.target.value)}
                            placeholder="Section name (e.g., Contact Hero Section)"
                            disabled={contentSaving}
                          />
                        </div>
                        <button type="button" onClick={() => removeSection(sIndex)} className="px-2 py-1 text-sm border rounded hover:bg-white" disabled={contentSaving}>Remove</button>
                      </div>

                      <div className="p-4">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field Label</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                <th className="px-4 py-2"></th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {section.fields.map((field, fIndex) => (
                                <tr key={fIndex}>
                                  <td className="px-4 py-2 w-64">
                                    <input
                                      className="w-full border rounded px-3 py-2"
                                      placeholder="Hero Title"
                                      value={field.key}
                                      onChange={(e) => updateField(sIndex, fIndex, 'key', e.target.value)}
                                      disabled={contentSaving}
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <input
                                      className="w-full border rounded px-3 py-2"
                                      placeholder='e.g., "Get in Touch" or {"cta":"Contact"}'
                                      value={field.value}
                                      onChange={(e) => updateField(sIndex, fIndex, 'value', e.target.value)}
                                      disabled={contentSaving}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Tip: you can write plain text or JSON.</p>
                                  </td>
                                  <td className="px-4 py-2 text-right">
                                    <button type="button" onClick={() => removeField(sIndex, fIndex)} className="px-2 py-1 text-sm border rounded hover:bg-gray-50" disabled={contentSaving}>Remove</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-3">
                          <button type="button" onClick={() => addField(sIndex)} className="inline-flex items-center px-3 py-2 text-sm border rounded-md hover:bg-gray-50" disabled={contentSaving}>
                            <Plus className="w-4 h-4 mr-2"/> Add Field
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {contentError && <div className="text-red-600 text-sm">{contentError}</div>}
              <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60" disabled={contentSaving}>
                  {contentSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
          </div>
        </div>
      </div>
    );
  }
