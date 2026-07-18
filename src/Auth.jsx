import { useState } from 'react'
import { supabase } from './supabase'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

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

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700" /></div>
          <div className="relative flex justify-center"><span className="bg-slate-900 px-3 text-xs text-slate-500">lub</span></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 py-3 text-sm font-semibold text-slate-200 hover:border-slate-500 hover:bg-slate-900"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Kontynuuj z Google
        </button>

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
