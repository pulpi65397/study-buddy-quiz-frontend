import { useState } from 'react'
import { supabase } from './supabase'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setInfo('')

    const { error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: undefined, data: {} } })

    if (error) {
      setError(error.message)
    } else if (mode === 'register') {
      setInfo('Konto utworzone. Możesz się teraz zalogować.')
      setMode('login')
    }

    setBusy(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-950/20">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Study Buddy Quiz</p>
        <h1 className="mt-3 text-3xl font-bold">
          {mode === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-50 outline-none focus:border-cyan-400"
              placeholder="twoj@email.com"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Hasło</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-50 outline-none focus:border-cyan-400"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <p className="rounded-2xl border border-rose-700 bg-rose-950/40 p-3 text-sm text-rose-300">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-2xl border border-emerald-700 bg-emerald-950/40 p-3 text-sm text-emerald-300">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-cyan-400 py-3 font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
          >
            {busy ? '...' : mode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          {mode === 'login' ? 'Nie masz konta?' : 'Masz już konto?'}{' '}
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setInfo('') }}
            className="text-cyan-400 hover:underline"
          >
            {mode === 'login' ? 'Zarejestruj się' : 'Zaloguj się'}
          </button>
        </p>
      </div>
    </div>
  )
}
