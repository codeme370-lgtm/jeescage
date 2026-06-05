'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import TopProductsBarChart from '@/components/admin/TopProductsBarChart';
import CustomerMetricsColumnChart from '@/components/admin/CustomerMetricsColumnChart';
import CategoryPieChart from '@/components/admin/CategoryPieChart';
import CustomerSegmentPieChart from '@/components/admin/CustomerSegmentPieChart';
import TopRatedProductsChart from '@/components/admin/TopRatedProductsChart';

export default function AnalyticsCharts() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalRevenue: 0,
    totalProductsSold: 0,
    averageOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [analyticsRes, customersRes] = await Promise.all([
          fetch('/api/admin/analytics'),
          fetch('/api/admin/customers')
        ]);

        if (!analyticsRes.ok || !customersRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const analyticsData = await analyticsRes.json();
        const customersData = await customersRes.json();

        // Calculate total revenue from all products
        const totalRevenue = [
          ...analyticsData.topRevenue,
          ...analyticsData.bottomRevenue
        ].reduce((sum, product) => sum + (product.totalRevenue || 0), 0);

        // Calculate total products sold
        const totalProductsSold = [
          ...analyticsData.topQuantity,
          ...analyticsData.bottomQuantity
        ].reduce((sum, product) => sum + (product.totalQuantity || 0), 0);

        // Calculate average order value
        const averageOrderValue = customersData.allCustomers.length > 0
          ? customersData.allCustomers.reduce((sum, customer) => sum + (customer.avgOrderValue || 0), 0) / customersData.allCustomers.length
          : 0;

        setStats({
          totalCustomers: customersData.totalCustomers,
          totalRevenue: Math.round(totalRevenue),
          totalProductsSold,
          averageOrderValue: Math.round(averageOrderValue)
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const handleRefresh = () => {
    setLastRefresh(new Date());
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
        </div>
        <p className="text-gray-600">Last updated: {lastRefresh.toLocaleTimeString()}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Customers Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Customers</h3>
          <p className="text-3xl font-bold text-gray-900">
            {loading ? '...' : stats.totalCustomers.toLocaleString()}
          </p>
          <p className="text-gray-500 text-xs mt-2">Active customers</p>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">
            {loading ? '...' : `GHS ${stats.totalRevenue.toLocaleString()}`}
          </p>
          <p className="text-gray-500 text-xs mt-2">All time</p>
        </div>

        {/* Total Products Sold Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Products Sold</h3>
          <p className="text-3xl font-bold text-blue-600">
            {loading ? '...' : stats.totalProductsSold.toLocaleString()}
          </p>
          <p className="text-gray-500 text-xs mt-2">Total units</p>
        </div>

        {/* Average Order Value Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Avg Order Value</h3>
          <p className="text-3xl font-bold text-purple-600">
            {loading ? '...' : `GHS ${stats.averageOrderValue.toLocaleString()}`}
          </p>
          <p className="text-gray-500 text-xs mt-2">Per order</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="space-y-6">
        {/* Row 1: Bar and Column Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopProductsBarChart />
          <CustomerMetricsColumnChart />
        </div>

        {/* Row 2: Rated Products */}
        <div>
          <TopRatedProductsChart />
        </div>

        {/* Row 3: Pie Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryPieChart />
          <CustomerSegmentPieChart />
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="font-semibold text-blue-900 mb-1">Auto-Refresh Enabled</h3>
          <p className="text-blue-800 text-sm">
            Charts automatically refresh every 30 seconds to show the latest data. Use the Refresh button above for an immediate update.
          </p>
        </div>
      </div>
    </div>
  );
}
