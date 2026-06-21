'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { Star, MapPin, Phone, Mail, ShieldCheck, TrendingUp, Package } from 'lucide-react';
import Loading from '@/components/Loading';
import ProductCard from '@/components/ProductCard';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';

export default function SellerProfile() {
  const { username } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        const { data } = await axios.get(`/api/seller/profile?username=${username}`);
        setSeller(data.seller);
        setProducts(data.products);
        setReviews(data.reviews);
        setLoading(false);
      } catch (error) {
        toast.error(error?.response?.data?.error || 'Failed to load seller profile');
        setLoading(false);
      }
    };

    if (username) {
      fetchSellerProfile();
    }
  }, [username]);

  if (loading) {
    return <Loading />;
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-slate-400">Seller not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Seller Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex gap-6 items-start">
            {/* Logo */}
            <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-slate-200 flex-shrink-0">
              <Image
                src={seller.logo || '/favicon.ico'}
                alt={seller.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-800">{seller.name}</h1>
                {seller.isVerified && (
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                    <ShieldCheck size={16} />
                    <span>Verified</span>
                  </div>
                )}
              </div>
              <p className="text-slate-600 mb-4">@{seller.username}</p>
              <p className="text-slate-600 mb-4 max-w-2xl">{seller.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-slate-500 text-sm">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star size={18} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-lg">{seller.averageRating}</span>
                    <span className="text-slate-600 text-sm">({seller.totalReviews})</span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Products</p>
                  <p className="font-bold text-lg">{seller.totalProducts}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Sold</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={18} className="text-blue-600" />
                    <span className="font-bold text-lg">{seller.productsSold}</span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Response</p>
                  <p className="font-bold text-lg">{seller.avgResponseTime}h</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Followers</p>
                  <p className="font-bold text-lg">{seller.totalFollowers}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-6 text-sm">
                {seller.contact && (
                  <a href={`tel:${seller.contact}`} className="flex items-center gap-2 text-slate-600 hover:text-blue-600">
                    <Phone size={16} />
                    {seller.contact}
                  </a>
                )}
                {seller.email && (
                  <a href={`mailto:${seller.email}`} className="flex items-center gap-2 text-slate-600 hover:text-blue-600">
                    <Mail size={16} />
                    {seller.email}
                  </a>
                )}
                {seller.address && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin size={16} />
                    {seller.address}
                  </div>
                )}
              </div>
              {/* Categories */}
              {seller.categories && seller.categories.length > 0 && (
                <div className="mt-4">
                  <p className="text-slate-500 text-sm mb-2">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {seller.categories.map((c) => (
                      <span key={c} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 border-b border-slate-200 mt-6">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-4 font-medium border-b-2 transition ${
              activeTab === 'products'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            Products ({seller.totalProducts})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 font-medium border-b-2 transition ${
              activeTab === 'reviews'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            Reviews ({seller.totalReviews})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'products' && (
          <div>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-400">No products available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg p-6 border border-slate-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={review.user.image || '/favicon.ico'}
                          alt={review.user.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-slate-800">{review.user.name}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-700 mb-3">{review.review}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Communication</p>
                        <div className="flex gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < review.communicationRating ? 'text-blue-400 fill-blue-400' : 'text-slate-300'}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-500">Shipping</p>
                        <div className="flex gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < review.shippingRating ? 'text-green-400 fill-green-400' : 'text-slate-300'}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-400">No reviews yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
