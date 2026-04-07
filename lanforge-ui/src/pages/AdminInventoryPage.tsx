import React, { useState, useEffect } from 'react';
import api from '../utils/api';

interface InventoryItem {
  _id: string;
  name: string;
  sku: string;
  serialNumbers?: string[];
  category: string;
  stock: number;
  reserved: number;
  reorderPoint: number;
  reorderQty?: number;
  location?: string;
  cost: number;
  price: number;
}

const AdminInventoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<any>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editJson, setEditJson] = useState('');

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/inventory');
      const items = response.data.products || [];
      setInventory(items);
      setStats(response.data.stats || {});
      
      const uniqueCategories = Array.from(new Set(items.map((i: InventoryItem) => i.category))) as string[];
      setCategories(uniqueCategories.filter(Boolean));
    } catch (error) {
      console.error('Failed to fetch inventory', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter(item => {
    const matchSearch = 
      (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
    
    let matchStock = true;
    const available = item.stock - (item.reserved || 0);
    if (stockFilter === 'out') matchStock = item.stock <= 0;
    if (stockFilter === 'low') matchStock = item.stock > 0 && available <= (item.reorderPoint || 0);
    if (stockFilter === 'ok') matchStock = available > (item.reorderPoint || 0);
    
    return matchSearch && matchCat && matchStock;
  });

  const getStockStatus = (item: InventoryItem) => {
    const available = item.stock - (item.reserved || 0);
    if (item.stock <= 0) return { text: 'Out of Stock', color: 'bg-red-500/10 text-red-400 border-red-500/30' };
    if (available <= (item.reorderPoint || 0)) return { text: 'Low Stock', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    return { text: 'In Stock', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
          <p className="text-gray-400 mt-1">Track and manage product stock levels</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => window.location.href = '/admin/parts/add'}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium"
          >
            + Add Part
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Items</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalItems || 0}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.totalValue || 0)}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Low Stock Items</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.lowStock || 0}</p>
            </div>
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Out of Stock</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.outOfStock || 0}</p>
            </div>
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="card p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex-1 flex items-center bg-gray-900/70 border border-gray-700 rounded-lg focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
              <svg className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search inventory..."
                className="w-full pl-2 pr-4 py-2 bg-transparent text-sm text-gray-100 placeholder-gray-500 focus:outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchInventory()}
              />
            </div>
            <button onClick={fetchInventory} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors" title="Refresh">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select 
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="input px-3 py-2 bg-gray-900/70 border-gray-700 text-sm rounded-lg"
            >
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select 
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value)}
              className="input px-3 py-2 bg-gray-900/70 border-gray-700 text-sm rounded-lg"
            >
              <option value="all">All Stock Status</option>
              <option value="ok">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Product Name</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">SKU / Location</th>
                <th className="text-right py-4 px-6 text-gray-400 font-medium text-sm">In Stock</th>
                <th className="text-right py-4 px-6 text-gray-400 font-medium text-sm">Reserved</th>
                <th className="text-right py-4 px-6 text-gray-400 font-medium text-sm">Available</th>
                <th className="text-center py-4 px-6 text-gray-400 font-medium text-sm">Status</th>
                <th className="text-right py-4 px-6 text-gray-400 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-400">Loading inventory...</td></tr>
              ) : filteredInventory.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-400">No items found.</td></tr>
              ) : filteredInventory.map(item => {
                const available = item.stock - (item.reserved || 0);
                const status = getStockStatus(item);

                return (
                  <tr key={item._id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <p className="text-white font-medium">{item.name}</p>
                      <p className="text-gray-400 text-sm">{item.category}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-gray-300 font-mono text-sm">{item.sku}</p>
                      <p className="text-gray-500 text-xs mt-1">{item.location || 'No location set'}</p>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-white font-medium">{item.stock}</span>
                    </td>
                    <td className="py-4 px-6 text-right text-gray-400">
                      {item.reserved || 0}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className={`font-bold ${available <= (item.reorderPoint || 0) ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {available}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                        onClick={() => {
                          setEditingItem(item);
                          const { _id, __v, createdAt, updatedAt, ...rest } = item as any;
                          setEditJson(JSON.stringify(rest, null, 2));
                        }}
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">Edit Inventory Item</h2>
            <p className="text-sm text-gray-400 mb-6">{editingItem.name}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Raw JSON Editor (Edit any property)</label>
                <textarea
                  rows={15}
                  value={editJson}
                  onChange={(e) => setEditJson(e.target.value)}
                  className="input w-full bg-gray-800 border-gray-700 font-mono text-xs"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const payload = JSON.parse(editJson);
                    // Determine endpoint based on category
                    // Assuming everything returned from /inventory is a Product in the schema for now
                    await api.put(`/products/${editingItem._id}`, payload);
                    setEditingItem(null);
                    fetchInventory();
                  } catch (e: any) {
                    alert('Failed to update item: ' + (e.response?.data?.message || e.message || 'Invalid JSON'));
                  }
                }}
                className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventoryPage;
