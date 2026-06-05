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
import { AlertCircle, Star } from 'lucide-react';

export default function TopRatedProductsChart() {
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

        // Transform top 6 rated products
        const chartData = result.topRating
          .filter(p => p.avgRating > 0)
          .slice(0, 6)
          .map(product => ({
            name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
            rating: parseFloat(product.avgRating.toFixed(2)),
            reviews: product.totalRatings,
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
      <div className="flex items-center gap-2 mb-4">
        <Star className="text-yellow-500" size={24} />
        <h2 className="text-xl font-bold text-gray-800">Top Rated Products</h2>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 5]} />
          <YAxis dataKey="name" type="category" width={100} />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'rating') return value.toFixed(2);
              return value;
            }}
            labelFormatter={(label) => {
              const product = data.find(p => p.name === label);
              return product?.fullName || label;
            }}
          />
          <Legend />
          <Bar dataKey="rating" fill="#F59E0B" name="Average Rating" />
          <Bar dataKey="reviews" fill="#6366F1" name="Number of Reviews" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
