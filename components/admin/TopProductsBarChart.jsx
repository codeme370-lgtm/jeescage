'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { AlertCircle } from 'lucide-react';

export default function TopProductsBarChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/analytics');
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const result = await response.json();

        // Transform top 5 revenue products for bar chart
        const chartData = result.topRevenue.slice(0, 5).map(product => ({
          name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
          revenue: product.totalRevenue,
          quantity: product.totalQuantity,
          fullName: product.name
        }));

        setData(chartData);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow p-4">
        <div className="animate-pulse text-gray-500">Loading chart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="text-red-600" size={20} />
        <span className="text-red-700">{error}</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Top 5 Products by Revenue</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value) => value.toLocaleString()}
            labelFormatter={(label) => {
              const product = data.find(p => p.name === label);
              return product?.fullName || label;
            }}
          />
          <Legend />
          <Bar dataKey="revenue" fill="#8884d8" name="Revenue (GHS)" />
          <Bar dataKey="quantity" fill="#82ca9d" name="Units Sold" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
