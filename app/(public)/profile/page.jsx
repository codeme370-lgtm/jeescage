'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useSelector } from "react-redux";
import Loading from "@/components/Loading";

const preferredOptions = [
  { value: "PAYSTACK", label: "Paystack" },
  { value: "COD", label: "Cash on Delivery" },
];

const formatCurrency = (value) => {
  if (typeof value !== "number") return "GHS0.00";
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 2,
  }).format(value);
};

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const formatDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut, isLoaded, refreshUser } = useAuth();
  const wishlistCount = useSelector((state) => state.wishlist?.total ?? 0);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("PAYSTACK");
  const [saving, setSaving] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push("/auth");
      return;
    }
    fetchProfile();
  }, [isLoaded, user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/user/profile");
      if (data?.error) {
        toast.error(data.error || "Failed to load profile");
        return;
      }
      setProfile(data);
      setProfileForm({
        name: data.user?.name || "",
        email: data.user?.email || "",
        phone: data.user?.phone || "",
      });
      const preferred = data?.user?.cart?.preferredPaymentMethod || data?.stats?.lastPaymentMethod || "PAYSTACK";
      setSelectedMethod(preferred);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Unable to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePaymentMethod = async () => {
    setSaving(true);
    try {
      const { data } = await axios.post("/api/user/payment-method", {
        preferredPaymentMethod: selectedMethod,
      });
      if (data?.error) {
        toast.error(data.error || "Could not update payment method");
      } else {
        toast.success("Payment preference saved");
        setProfile((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            cart: {
              ...prev.user.cart,
              preferredPaymentMethod: selectedMethod,
            },
          },
        }));
      }
    } catch (error) {
      toast.error(error?.response?.data?.error || "Unable to save payment method");
    } finally {
      setSaving(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const { data } = await axios.patch("/api/user/profile", {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
      });
      if (data?.error) {
        toast.error(data.error || "Could not update profile");
        return;
      }
      toast.success("Profile updated successfully");
      await refreshUser();
      fetchProfile();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Unable to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading || !profile) {
    return <Loading />;
  }

  const activeUser = profile.user || user;
  const defaultAddress = profile.addresses?.[0] || null;
  const stats = profile.stats || {};
  const preferredPaymentMethod = profile.user?.cart?.preferredPaymentMethod || stats.lastPaymentMethod || "PAYSTACK";
  const totalSaved = wishlistCount;
  const joinedDate = formatDate(stats.joinedAt);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row xl:items-start">
          <aside className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:w-[320px]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">My Account</p>
                <h1 className="mt-3 text-2xl font-semibold text-slate-900">Welcome back</h1>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <Link href="/profile" className="block rounded-3xl bg-slate-100 px-4 py-4 text-slate-900 shadow-sm transition hover:bg-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-semibold">
                    {getInitials(user.fullName || user.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">My Profile</p>
                    <p className="text-xs text-slate-500">Personal details</p>
                  </div>
                </div>
              </Link>

              <Link href="/orders" className="block rounded-3xl border border-slate-200 bg-white px-4 py-4 text-slate-700 transition hover:border-orange-400">
                <p className="text-sm font-semibold">Orders</p>
                <p className="text-xs text-slate-500">View purchase history</p>
              </Link>

              <Link href="/wishlist" className="block rounded-3xl border border-slate-200 bg-white px-4 py-4 text-slate-700 transition hover:border-orange-400">
                <p className="text-sm font-semibold">Wishlist</p>
                <p className="text-xs text-slate-500">Saved items</p>
              </Link>

              <button onClick={() => router.push("/profile#payment-methods")} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-left text-slate-700 transition hover:border-orange-400">
                <p className="text-sm font-semibold">Payment Methods</p>
                <p className="text-xs text-slate-500">Preferred checkout option</p>
              </button>

              <button onClick={() => router.push("/auth")} className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-left text-slate-700 transition hover:border-orange-400">
                <p className="text-sm font-semibold">Account Settings</p>
                <p className="text-xs text-slate-500">Security & preferences</p>
              </button>
            </div>

            <div className="mt-10 rounded-3xl bg-gradient-to-b from-orange-100 to-orange-50 p-5 text-slate-900 shadow-sm">
              <p className="text-sm font-semibold text-orange-700">Premium benefits</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>Free shipping on all orders</li>
                <li>Member discounts</li>
                <li>Priority support</li>
              </ul>
              <button onClick={() => toast.success('Premium benefits are available!')} className="mt-5 w-full rounded-2xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700">
                Explore Benefits
              </button>
            </div>

            <button onClick={signOut} className="mt-6 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-red-400 hover:text-red-600">
              Log Out
            </button>
          </aside>

          <main className="flex-1 space-y-6">
            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">My Profile</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900">Manage your personal information</h2>
              </div>
              <Link href="#profile-details" className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                Edit Profile
              </Link>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
              <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100 text-3xl font-bold uppercase text-amber-700">
                        {getInitials(activeUser?.fullName || activeUser?.name)}
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Logged in as</p>
                        <h3 className="text-2xl font-semibold text-slate-900">{activeUser?.fullName || activeUser?.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">{activeUser?.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 w-full">
                      <div className="flex-1 min-w-[90px] rounded-3xl bg-slate-50 p-4 text-center">
                        <p className="text-2xl sm:text-3xl font-semibold text-slate-900">{stats.totalOrders ?? 0}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total Orders</p>
                      </div>
                      <div className="flex-1 min-w-[90px] rounded-3xl bg-slate-50 p-4 text-center">
                        <p className="text-2xl sm:text-3xl font-semibold text-slate-900">{formatCurrency(stats.totalSpent || 0)}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total Spent</p>
                      </div>
                      <div className="flex-1 min-w-[90px] rounded-3xl bg-slate-50 p-4 text-center">
                        <p className="text-2xl sm:text-3xl font-semibold text-slate-900">{totalSaved ?? 0}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Saved Items</p>
                      </div>
                      <div className="flex-1 min-w-[90px] rounded-3xl bg-slate-50 p-4 text-center">
                        <p className="text-2xl sm:text-3xl font-semibold text-slate-900">{stats.reviewsCount ?? 0}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Reviews</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Personal Information</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-900">Profile details</h3>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2" id="profile-details">
                    <div className="rounded-3xl bg-slate-50 p-5">
                      <label className="text-xs uppercase tracking-[0.2em] text-slate-500" htmlFor="name">Full Name</label>
                      <input
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400"
                      />
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-5">
                      <label className="text-xs uppercase tracking-[0.2em] text-slate-500" htmlFor="email">Email Address</label>
                      <input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400"
                      />
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-5">
                      <label className="text-xs uppercase tracking-[0.2em] text-slate-500" htmlFor="phone">Phone Number</label>
                      <input
                        id="phone"
                        value={profileForm.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400"
                      />
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Member Since</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{joinedDate}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {savingProfile ? 'Saving...' : 'Save Profile'}
                    </button>
                    <p className="text-sm text-slate-500">Update your name, email, and phone number instantly.</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" id="payment-methods">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Payment Methods</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-900">Preferred method</h3>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <div className="space-y-3">
                      {preferredOptions.map((option) => (
                        <label key={option.value} className="flex cursor-pointer items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-orange-400">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={option.value}
                            checked={selectedMethod === option.value}
                            onChange={() => setSelectedMethod(option.value)}
                            className="h-4 w-4 accent-orange-600"
                          />
                          <div>
                            <p className="font-semibold text-slate-900">{option.label}</p>
                            <p className="text-sm text-slate-500">{option.value === "COD" ? "Pay when your order arrives." : "Secure Paystack checkout."}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={handleSavePaymentMethod}
                      disabled={saving}
                      className="inline-flex items-center justify-center rounded-2xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {saving ? "Saving..." : "Save Payment Preference"}
                    </button>
                  </div>
                  <div className="mt-6 rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Recently used methods</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {stats.paymentMethodsUsed && stats.paymentMethodsUsed.length > 0 ? (
                        stats.paymentMethodsUsed.map((method) => (
                          <span key={method} className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                            {method}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">No payment history yet</span>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <aside className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Default Address</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-900">Primary delivery location</h3>
                    </div>
                    <Link href="#addresses" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                      Manage Addresses
                    </Link>
                  </div>
                  <div className="mt-6 space-y-3 text-sm text-slate-700">
                    {defaultAddress ? (
                      <>
                        <p className="font-semibold text-slate-900">{defaultAddress.city || defaultAddress.street || defaultAddress.name}</p>
                      </>
                    ) : (
                      <p className="text-slate-500">No saved address yet.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Account Security</p>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">Password</p>
                      <p className="mt-1 text-sm text-slate-500">Last updated recently</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">Two-Factor Authentication</p>
                      <p className="mt-1 text-sm text-slate-500">Enabled for your account</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">Login Activity</p>
                      <p className="mt-1 text-sm text-slate-500">Recent sign-in activity is secure</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-orange-50 via-white to-slate-50 p-6 text-slate-900 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.2em] text-orange-500">Need help?</p>
                  <h3 className="mt-3 text-xl font-semibold">Support & Security</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">Access support, manage your account details, and keep your profile secure with a single place for your profile settings.</p>
                  <Link href="/contact" className="mt-5 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                    Contact Support
                  </Link>
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
