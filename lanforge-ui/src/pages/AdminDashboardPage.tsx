import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        setStats(response.data.stats);
        setRecentOrders(response.data.recentOrders || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        setError('Failed to load dashboard statistics.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return <div className="text-gray-400 p-8 text-center animate-pulse">Loading dashboard...</div>;
  }

  if (error || !stats) {
    return <div className="text-red-400 p-8 text-center">{error}</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 font-medium">Total Revenue</h3>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</span>
            <div className="flex items-center mt-1 text-sm">
              <span className={Number(stats.revenueGrowth) >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {Number(stats.revenueGrowth) >= 0 ? '+' : ''}{stats.revenueGrowth}%
              </span>
              <span className="text-gray-500 ml-2">from last month</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 font-medium">Total Orders</h3>
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white">{stats.totalOrders}</span>
            <div className="flex items-center mt-1 text-sm">
              <span className={Number(stats.orderGrowth) >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {Number(stats.orderGrowth) >= 0 ? '+' : ''}{stats.orderGrowth}%
              </span>
              <span className="text-gray-500 ml-2">from last month</span>
            </div>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 font-medium">Total Customers</h3>
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white">{stats.totalCustomers}</span>
            <div className="flex items-center mt-1 text-sm">
              <span className="text-emerald-400">+{stats.newCustomers}</span>
              <span className="text-gray-500 ml-2">new this month</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 font-medium">Inventory Alerts</h3>
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white">{stats.lowStockProducts}</span>
            <div className="flex items-center mt-1 text-sm">
              <span className="text-amber-400">Items running low</span>
              <span className="text-gray-500 ml-2">out of {stats.totalProducts}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Orders Table */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Recent Orders</h2>
            <button className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-900/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {order.orderNumber || order._id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {order.customer?.firstName} {order.customer?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No recent orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-bold text-white">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="relative w-full">
              <button
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors border border-gray-600"
                onClick={() => {
                  const dropdown = document.getElementById('quick-actions-dropdown');
                  if (dropdown) dropdown.classList.toggle('hidden');
                }}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-medium text-white">Select Action...</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div id="quick-actions-dropdown" className="hidden absolute top-full left-0 w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-10 overflow-hidden">
                <a href="/admin/products/add" className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="text-gray-200">Add Product</span>
                </a>
                <a href="/admin/parts/add" className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 transition-colors border-t border-gray-700">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-200">Add Part</span>
                </a>
                <a href="/admin/orders/add" className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 transition-colors border-t border-gray-700">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="text-gray-200">Create Order</span>
                </a>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col items-center justify-center p-6 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <svg className="w-8 h-8 text-amber-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-amber-400">Pending Orders ({stats?.pendingOrders || 0})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
