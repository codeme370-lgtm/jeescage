'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Facebook, Eye, EyeOff, Mail, Smartphone, Lock, User, Instagram } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import loginBg from '@/assets/login-background.png'

export default function AuthPage() {
  const router = useRouter()
  const { user, signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  if (user) {
    return null
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (mode === 'signup' && form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      const payload = mode === 'signin'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, phone: form.phone, password: form.password }

      const action = mode === 'signin' ? signIn : signUp
      const res = await action(payload)

      if (res.error || !res.user) {
        setError(res.error || 'Unable to authenticate. Please check your credentials.')
      } else {
        setSuccess(res.message || 'Success! Redirecting...')
        setTimeout(() => router.push('/'), 900)
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Auth error')
    }
  }

  const handleSocialLogin = (provider) => {
    window.location.href = `/api/auth/oauth?provider=${provider}`
  }

  return (
    <main
      className="relative min-h-screen w-full overflow-hidden bg-slate-950"
      style={{
        backgroundImage: `url(${loginBg.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full rounded-[32px] border border-white/20 bg-white/15 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-md sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
            <div className="hidden flex-col justify-between rounded-3xl bg-slate-950 p-8 text-white shadow-lg shadow-slate-950/30 lg:flex">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-black/10">
                  <span className="h-10 w-10 rounded-full bg-white/20" />
                  Jeescage Shopping Mall
                </div>
                <div className="space-y-5">
                  <h2 className="text-3xl font-semibold">Great quality, better living.</h2>
                  <p className="text-sm leading-6 text-slate-300">Discover products that make life better. Enjoy a premium shopping experience across categories, trusted sellers, and fast checkout.</p>
                </div>
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex gap-3 rounded-3xl bg-white/5 p-4">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-400" />
                    <span>Beautiful product discovery</span>
                  </div>
                  <div className="flex gap-3 rounded-3xl bg-white/5 p-4">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-400" />
                    <span>Secure onboarding with fast access</span>
                  </div>
                  <div className="flex gap-3 rounded-3xl bg-white/5 p-4">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-violet-400" />
                    <span>Designed for desktop and mobile</span>
                  </div>
                </div>
              </div>
              <div className="rounded-[28px] bg-white/10 p-6 text-slate-100 shadow-xl shadow-slate-950/20">
                <p className="text-xs uppercase tracking-[0.3em] text-orange-300">Premium marketplace</p>
                <h3 className="mt-4 text-xl font-semibold">Beautiful buying experience</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">From browse to checkout, every step feels crafted and trustworthy.</p>
              </div>
            </div>

            <div className="rounded-[28px] bg-white/10 p-8 shadow-xl shadow-slate-950/10 backdrop-blur-sm sm:p-10">
              <div className="mb-8 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-orange-400">{mode === 'signin' ? 'Sign in' : 'Sign up'}</p>
                <h1 className="mt-4 text-3xl font-bold text-white drop-shadow-lg">
                  {mode === 'signin' ? 'Welcome back!' : 'Create your account'}
                </h1>
                <p className="mt-3 text-sm leading-6 text-white/85 drop-shadow-md">
                  {mode === 'signin'
                    ? 'Sign in to continue shopping and managing your orders.'
                    : 'Join Jeescage Shopping Mall today and start exploring the best products.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-white/90">Full Name</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                        <User className="h-5 w-5" />
                      </span>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-white/30 bg-white/10 px-4 py-3 pl-12 text-sm text-white placeholder-white/50 outline-none backdrop-blur-sm transition focus:border-white/60 focus:ring-2 focus:ring-white/20"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/90">Email address</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                      <Mail className="h-5 w-5" />
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/30 bg-white/10 px-4 py-3 pl-12 text-sm text-white placeholder-white/50 outline-none backdrop-blur-sm transition focus:border-white/60 focus:ring-2 focus:ring-white/20"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label htmlFor="phone" className="mb-2 block text-sm font-medium text-white/90">Phone number</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                        <Smartphone className="h-5 w-5" />
                      </span>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-white/30 bg-white/10 px-4 py-3 pl-12 text-sm text-white placeholder-white/50 outline-none backdrop-blur-sm transition focus:border-white/60 focus:ring-2 focus:ring-white/20"
                        placeholder="Enter your phone"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label htmlFor="password" className="block text-sm font-medium text-white/90">Password</label>
                    {mode === 'signin' && (
                      <a href="#" className="text-sm font-semibold text-orange-300 hover:text-orange-200">Forgot password?</a>
                    )}
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                      <Lock className="h-5 w-5" />
                    </span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/30 bg-white/10 px-4 py-3 pl-12 pr-12 text-sm text-white placeholder-white/50 outline-none backdrop-blur-sm transition focus:border-white/60 focus:ring-2 focus:ring-white/20"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-white/90">Confirm password</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                        <Lock className="h-5 w-5" />
                      </span>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-white/30 bg-white/10 px-4 py-3 pl-12 pr-12 text-sm text-white placeholder-white/50 outline-none backdrop-blur-sm transition focus:border-white/60 focus:ring-2 focus:ring-white/20"
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {error && <p className="rounded-2xl bg-red-500/30 px-4 py-3 text-sm text-red-200 backdrop-blur-sm border border-red-500/50">{error}</p>}
                {success && <p className="rounded-2xl bg-emerald-500/30 px-4 py-3 text-sm text-emerald-200 backdrop-blur-sm border border-emerald-500/50">{success}</p>}

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/30 border border-white/40 backdrop-blur-sm"
                >
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm text-white/70">
                  <span className="bg-white/10 px-3 backdrop-blur-sm">OR</span>
                </div>
              </div>

              <p className="mt-6 text-center text-sm text-white/80">
                {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="font-semibold text-orange-300 hover:text-orange-200"
                >
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
