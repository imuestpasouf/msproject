'use client'

import { useActionState } from 'react'
import { loginAction, type LoginState } from './actions'

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    null,
  )

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#0a0a0a' }}
    >
      <div className="w-full max-w-[420px]">

        {/* Card */}
        <div className="bg-white px-12 py-14 max-sm:px-8 max-sm:py-10">

          {/* Logo */}
          <div className="text-center mb-8">
            <p className="font-body font-semibold tracking-[0.38em] uppercase text-black mb-1"
               style={{ fontSize: '1.5rem' }}>
              MS-STORE
            </p>
            <p className="text-[0.52rem] tracking-[0.3em] uppercase font-light text-gm">
              Espace Administration
            </p>
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-gl mb-9" />

          {/* Form */}
          <form action={action} noValidate>
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-[0.63rem] tracking-[0.2em] uppercase text-gd font-normal mb-2"
              >
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                required
                disabled={pending}
                className="w-full border border-gl px-4 py-3 text-[0.85rem] font-light text-black bg-white outline-none transition-colors duration-200 focus:border-rg disabled:opacity-60"
                placeholder="••••••••"
                aria-describedby={state?.error ? 'login-error' : undefined}
              />
            </div>

            {/* Error message */}
            {state?.error && (
              <p
                id="login-error"
                role="alert"
                className="text-[0.7rem] text-[#e05252] mb-5 text-center leading-[1.5]"
              >
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-black text-white text-[0.7rem] tracking-[0.22em] uppercase font-normal py-[15px] border-none cursor-pointer transition-colors duration-200 hover:bg-rg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? 'Connexion…' : 'Accéder au tableau de bord'}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-[0.6rem] tracking-[0.12em] text-gm mt-7">
            Accès réservé aux administrateurs MS-Store
          </p>
        </div>

        {/* Below card */}
        <p className="text-center text-[0.6rem] tracking-[0.12em] uppercase mt-5"
           style={{ color: 'rgba(255,255,255,0.2)' }}>
          MS-STORE — Administration
        </p>
      </div>
    </div>
  )
}
