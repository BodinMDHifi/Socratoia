'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { validateRegisterForm, RegisterFormInput } from '@/lib/validation/auth';

type FieldErrors = Partial<Record<keyof RegisterFormInput, string>>;

export default function RegisterPage() {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);
    const values: RegisterFormInput = {
      name: (formData.get('name') as string | null) ?? undefined,
      email: (formData.get('email') as string | null) ?? '',
      password: (formData.get('password') as string | null) ?? '',
      confirmPassword: (formData.get('confirmPassword') as string | null) ?? '',
    };

    const result = validateRegisterForm(values);

    if (!result.success) {
      const flattened = result.error.flatten();
      setFieldErrors({
        name: flattened.fieldErrors.name?.[0],
        email: flattened.fieldErrors.email?.[0],
        password: flattened.fieldErrors.password?.[0],
        confirmPassword: flattened.fieldErrors.confirmPassword?.[0],
      });
      setFormError(flattened.formErrors[0] ?? null);
      return;
    }

    const { confirmPassword: _confirmPassword, ...payload } = result.data;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push('/login?success=registered');
        return;
      }

      if (response.status === 409) {
        setFormError('Un compte est déjà associé à cette adresse email.');
      } else if (response.status === 400) {
        const data = await response.json().catch(() => null);
        const message = typeof data?.error === 'string' ? data.error : null;
        setFormError(message ?? "Certaines informations sont manquantes. Merci de vérifier le formulaire.");
      } else {
        setFormError('Une erreur inattendue est survenue. Merci de réessayer.');
      }
    } catch (error) {
      console.error('register error', error);
      setFormError('Impossible de contacter le serveur. Vérifiez votre connexion internet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl">Créer un compte</h1>
        <p className="text-gray-600">
          Rejoignez PhysChim pour suivre vos progrès, obtenir des badges et accéder aux exercices interactifs.
        </p>
      </header>
      {formError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {formError}
        </p>
      ) : null}
      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-gray-200 bg-white/90 p-6 shadow-sm" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="name">
              Prénom (facultatif)
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="given-name"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-school-500 focus:outline-none focus:ring-2 focus:ring-school-200"
            />
            {fieldErrors.name ? <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p> : null}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="email">
              Adresse email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-school-500 focus:outline-none focus:ring-2 focus:ring-school-200"
            />
            {fieldErrors.email ? <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-school-500 focus:outline-none focus:ring-2 focus:ring-school-200"
            />
            {fieldErrors.password ? <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="confirmPassword">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-school-500 focus:outline-none focus:ring-2 focus:ring-school-200"
            />
            {fieldErrors.confirmPassword ? <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p> : null}
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-80"
        >
          {isSubmitting ? 'Création du compte…' : 'Créer mon compte' }
        </button>
      </form>
      <p className="text-sm text-gray-600">
        Déjà inscrit ?{' '}
        <Link className="font-medium text-school-600 underline" href="/login">
          Se connecter
        </Link>
        .
      </p>
    </section>
  );
}
