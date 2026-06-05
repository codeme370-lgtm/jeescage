'use client';

import { useEffect, useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { AlertCircle } from 'lucide-react';

export default function CustomerMetricsColumnChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/customers');
        if (!response.ok) throw new Error('Failed to fetch customer data');
        const result = await response.json();

        // Transform top 8 customers for column chart
        const chartData = result.topBySpending.slice(0, 8).map((customer, idx) => ({
          name: customer.name.length > 12 ? customer.name.substring(0, 12) + '...' : customer.name,
          spent: Math.round(customer.totalSpent),
          orders: customer.totalOrders,
          avgOrder: Math.round(customer.avgOrderValue),
          fullName: customer.name,
          email: customer.email
        }));

        setData(chartData);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching customers:', err);
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
      <h2 className="text-xl font-bold mb-4 text-gray-800">Top 8 Customers by Spending</h2>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip
            formatter={(value) => {
              if (typeof value === 'number') return value.toLocaleString();
              return value;
            }}
            labelFormatter={(label) => {
              const customer = data.find(c => c.name === label);
              return customer?.fullName || label;
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="spent" fill="#3b82f6" name="Total Spent (GHS)" />
          <Line yAxisId="right" type="monotone" dataKey="avgOrder" stroke="#ef4444" name="Avg Order Value" strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
