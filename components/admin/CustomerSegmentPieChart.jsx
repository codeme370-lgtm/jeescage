'use client';

import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { AlertCircle } from 'lucide-react';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function CustomerSegmentPieChart() {
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

        // Segment customers by spending
        const segments = {
          'High Spenders (>5000 GHS)': 0,
          'Medium Spenders (1000-5000 GHS)': 0,
          'Regular Customers (500-1000 GHS)': 0,
          'Low Spenders (100-500 GHS)': 0,
          'New Customers (<100 GHS)': 0
        };

        result.allCustomers.forEach(customer => {
          const spent = customer.totalSpent;
          if (spent > 5000) segments['High Spenders (>5000 GHS)']++;
          else if (spent >= 1000) segments['Medium Spenders (1000-5000 GHS)']++;
          else if (spent >= 500) segments['Regular Customers (500-1000 GHS)']++;
          else if (spent >= 100) segments['Low Spenders (100-500 GHS)']++;
          else segments['New Customers (<100 GHS)']++;
        });

        const chartData = Object.entries(segments)
          .map(([name, value]) => ({ name, value }))
          .filter(item => item.value > 0);

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
      <h2 className="text-xl font-bold mb-4 text-gray-800">Customer Segments by Spending</h2>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} customers`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
