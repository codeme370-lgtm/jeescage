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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export default function CategoryPieChart() {
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

        // Aggregate all products from all categories
        const allProducts = [
          ...result.topQuantity,
          ...result.bottomQuantity,
          ...result.topRevenue,
          ...result.bottomRevenue
        ];

        // Remove duplicates by ID and count by category
        const categoryMap = new Map();
        allProducts.forEach(product => {
          if (!categoryMap.has(product.id)) {
            const existing = categoryMap.get(product.category);
            categoryMap.set(product.category, (existing || 0) + 1);
          }
        });

        // Transform to chart data - get unique categories
        const uniqueCategories = new Map();
        allProducts.forEach(product => {
          const count = uniqueCategories.get(product.category) || 0;
          uniqueCategories.set(product.category, count + 1);
        });

        const chartData = Array.from(uniqueCategories, ([name, value]) => ({
          name,
          value
        })).sort((a, b) => b.value - a.value);

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
      <h2 className="text-xl font-bold mb-4 text-gray-800">Product Categories Distribution</h2>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name} (${value})`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} products`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
