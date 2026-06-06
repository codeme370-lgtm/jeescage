'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"
import Loading from "@/components/Loading"
import {
  ShieldCheck,
  User,
  Star,
  ShoppingBag,
  Tag,
  Users,
  Sparkles,
} from "lucide-react"

const getInitials = (name) => {
  if (!name) return "AD"
  const parts = name.trim().split(" ").filter(Boolean)
  if (parts.length === 0) return "AD"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

const formatDate = (value) => {
  if (!value) return "Not available"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Not available"
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const formatCurrency = (value) => {
  if (typeof value !== "number") return "GHS 0"
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(value)
}

export default function AdminProfilePage() {
  const router = useRouter()
  const { user, signOut, isLoaded } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      toast.error('Unable to sign out.')
    }
  }

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.push("/auth")
      return
    }

    const fetchStats = async () => {
      setLoading(true)
      try {
        const { data } = await axios.get("/api/admin/profile-stats", { withCredentials: true })
        if (data?.error) {
          toast.error(data.error || "Failed to load admin stats")
          return
        }
        setStats(data.stats)
      } catch (error) {
        toast.error(error?.response?.data?.error || "Unable to load admin stats")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [isLoaded, user, router])

  if (!isLoaded || loading || !user || !stats) {
    return <Loading />
  }

  const lastLogin = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Administrator</p>
              <h1 className="mt-2 text-4xl font-bold text-slate-900">Profile Settings</h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSignOut}
                className="rounded-lg border border-red-200 bg-white px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-600 text-3xl font-bold text-white">
              {getInitials(user.fullName || user.name)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-slate-900">{user.fullName || user.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{user.email}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  Role: Super Admin
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Full Access
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="mb-8">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-600">Activity Overview</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {[
              { title: "Orders", value: stats.totalOrders, icon: ShoppingBag, color: "bg-sky-100 text-sky-600" },
              { title: "Products", value: stats.totalProducts, icon: Tag, color: "bg-fuchsia-100 text-fuchsia-600" },
              { title: "Customers", value: stats.totalCustomers, icon: Users, color: "bg-emerald-100 text-emerald-600" },
              { title: "Coupons", value: stats.totalCoupons, icon: Star, color: "bg-orange-100 text-orange-600" },
              { title: "Stores", value: stats.totalStores, icon: Sparkles, color: "bg-violet-100 text-violet-600" },
              { title: "Reviews", value: stats.totalReviews, icon: ShieldCheck, color: "bg-slate-100 text-slate-600" },
            ].map((stat, idx) => (
              <div key={idx} className="rounded-lg bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">{stat.title}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} flex h-10 w-10 items-center justify-center rounded-lg`}>
                    <stat.icon size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-8 lg:col-span-2">
            {/* Personal Information */}
            <section className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Personal</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900">Profile Information</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Full Name</label>
                  <p className="mt-1 text-slate-900">{user.fullName || user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Email Address</label>
                  <p className="mt-1 text-slate-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Phone Number</label>
                  <p className="mt-1 text-slate-900">{user.phone || 'Not provided'}</p>
                </div>
              </div>
            </section>

            {/* Security Settings */}
            <section className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Security</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900">Account Security</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Password</p>
                    <p className="mt-1 text-slate-500">••••••••</p>
                  </div>
                  <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                    Change
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Authentication Method</p>
                    <p className="mt-1 capitalize text-slate-500">{user.authProvider || 'Email & Password'}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Active</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 border-b border-slate-200 pb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Session Info</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">Details</h3>
            </div>
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase text-slate-400">Role</p>
                <p className="mt-2 font-semibold text-slate-900">Super Administrator</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Access Level</p>
                <p className="mt-2 font-semibold text-slate-900">Full Access</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Last Active</p>
                <p className="mt-2 font-semibold text-slate-900">{lastLogin}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
