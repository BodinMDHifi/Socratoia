import { getCsrfToken } from 'next-auth/react';
import Link from 'next/link';

const errorMessages: Record<string, string> = {
  CredentialsSignin: 'Identifiants incorrects. Vérifiez votre email et votre mot de passe.',
  default: 'Impossible de vous connecter pour le moment. Réessayez plus tard.',
};

const successMessages: Record<string, string> = {
  registered: 'Votre compte a été créé. Vous pouvez vous connecter dès maintenant.',
  signedOut: 'Vous êtes déconnecté. À très vite !',
};

type LoginPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = Object.fromEntries(
    Object.entries(searchParams ?? {}).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  );

  const csrfToken = await getCsrfToken();
  const callbackUrl = params.callbackUrl?.startsWith('/') ? params.callbackUrl : '/dashboard';
  const errorKey = params.error ?? '';
  const successKey = params.success ?? '';
  const errorMessage = errorKey ? errorMessages[errorKey] ?? errorMessages.default : undefined;
  const successMessage = successKey ? successMessages[successKey] ?? undefined : undefined;

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl">Connexion</h1>
        <p className="text-gray-600">Reprenez vos entraînements en vous connectant à votre espace PhysChim.</p>
      </header>
      {successMessage ? (
        <p className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
          {successMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <form
        method="post"
        action="/api/auth/callback/credentials"
        className="space-y-5 rounded-xl border border-gray-200 bg-white/90 p-6 shadow-sm"
      >
        <input name="csrfToken" type="hidden" value={csrfToken ?? undefined} />
        <input name="callbackUrl" type="hidden" value={callbackUrl} />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700" htmlFor="email">
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
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-school-500 focus:outline-none focus:ring-2 focus:ring-school-200"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-school-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-school-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-school-300"
        >
          Se connecter
        </button>
      </form>
      <p className="text-sm text-gray-600">
        Pas encore de compte ?{' '}
        <Link className="font-medium text-school-600 underline" href="/register">
          Créer un compte gratuitement
        </Link>
        .
      </p>
    </section>
  );
}
