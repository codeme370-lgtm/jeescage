'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Facebook, Instagram, Goal, Eye, EyeOff, User, Mail, Smartphone, Lock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import logo from '@/app/logo.jpg'

export default function AuthPage() {
  const router = useRouter()
  const { user, signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (user) {
    router.push('/')
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
        ? { name: form.name, password: form.password }
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
    <main className="relative min-h-screen overflow-hidden px-4 py-8 md:px-8">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${logo.src})` }} />
      <div className="absolute inset-0 bg-slate-950/80" />
      <div className="relative mx-auto grid max-w-6xl overflow-hidden rounded-[32px] bg-white/10 shadow-2xl backdrop-blur-xl md:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[rgba(255,255,255,0.08)] p-10 text-white md:block">
          <div className="absolute inset-y-0 left-0 w-full bg-[radial-gradient(circle_at_top_left,_rgba(239,167,72,0.22),_transparent_35%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-slate-800">
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white/20">
                  <Image src={logo} alt="Jeescage Logo" fill className="object-cover" />
                </div>
                jeescagemall
              </div>

              <h1 className="mt-10 max-w-sm text-4xl font-semibold tracking-tight text-white">Shop more, save more.</h1>
              <p className="mt-6 max-w-sm text-base leading-7 text-slate-200">Everything you love, all in one place. Discover the best deals on home essentials, fashion, and everyday needs.</p>
            </div>

            <div className="relative mt-8 flex items-center justify-center rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-xl shadow-orange-200/40">
              <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-orange-100 blur-2xl" />
              <div className="absolute -right-8 -bottom-8 h-28 w-28 rounded-full bg-amber-100 blur-2xl" />
              <div className="flex w-full max-w-[260px] flex-col items-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-orange-500 text-white shadow-lg shadow-orange-300/70">
                  <User size={40} />
                </div>
                <div className="text-center">
                  <p className="text-sm uppercase tracking-[0.24em] text-orange-500">Premium shopping</p>
                  <h2 className="mt-3 text-xl font-semibold text-slate-900">Secure shopping experience</h2>
                  <p className="mt-2 text-sm text-slate-600">Fast checkout, trusted support, and stress-free returns.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="p-8 sm:p-10 md:p-12">
          <div className="mx-auto flex w-full max-w-md flex-col justify-center gap-8">
            <div className="text-center">
              <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-[26px] bg-[#fff4e5] text-orange-600 shadow-sm shadow-orange-200/80">
                <User size={28} />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-orange-500">{mode === 'signin' ? 'Welcome Back' : 'Create Account'}</p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                {mode === 'signin'
                  ? 'Sign in to continue shopping'
                  : 'Create your account'}
              </h1>
              <p className="mx-auto mt-3 max-w-[320px] text-sm leading-6 text-slate-600">
                {mode === 'signin'
                  ? 'Access your dashboard, orders, and favorites quickly.'
                  : 'Enter your details below to start shopping and selling.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-3">
                <label htmlFor="name" className="text-sm font-medium text-slate-700">{mode === 'signin' ? 'Username' : 'Full Name'}</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <User size={18} />
                  </span>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full rounded-[28px] border border-slate-200 bg-white px-4 py-4 pl-12 text-sm text-slate-900 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder={mode === 'signin' ? 'Enter your username' : 'Enter your full name'}
                    required
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <>
                  <div className="space-y-3">
                    <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail size={18} />
                      </span>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full rounded-[28px] border border-slate-200 bg-white px-4 py-4 pl-12 text-sm text-slate-900 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone Number</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Smartphone size={18} />
                      </span>
                      <input
                        id="phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full rounded-[28px] border border-slate-200 bg-white px-4 py-4 pl-12 text-sm text-slate-900 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-3">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-[28px] border border-slate-200 bg-white px-4 py-4 pl-12 pr-12 text-sm text-slate-900 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div className="space-y-3">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm Password</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock size={18} />
                    </span>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="w-full rounded-[28px] border border-slate-200 bg-white px-4 py-4 pl-12 pr-12 text-sm text-slate-900 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'signin' && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                    Remember me
                  </label>
                  <a href="#" className="text-sm font-semibold text-orange-600 transition hover:text-orange-700">Forgot Password?</a>
                </div>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-[28px] bg-orange-600 px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700"
              >
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>

              {mode === 'signup' && (
                <p className="text-center text-xs text-slate-500">By creating an account, you agree to our <span className="font-semibold text-orange-600">Terms of Service</span> and <span className="font-semibold text-orange-600">Privacy Policy</span>.</p>
              )}

              {error && <p className="rounded-[28px] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
              {success && <p className="rounded-[28px] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}
            </form>

            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              OR
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                className="flex items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Facebook size={18} className="text-[#1877F2]" />
                Continue with Facebook
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('instagram')}
                className="flex items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Instagram size={18} className="text-[#E1306C]" />
                Continue with Instagram
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="flex items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Goal size={18} className="text-[#4285F4]" />
                Continue with Gmail
              </button>
            </div>

            <div className="text-center text-sm text-slate-600">
              {mode === 'signin' ? 'Don’t have an account?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="font-semibold text-orange-600 hover:text-orange-700"
              >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
