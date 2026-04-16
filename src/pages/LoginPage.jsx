import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted bg-mesh-pattern p-6 md:p-10">
      <div className="w-full max-w-md md:max-w-5xl">
        <LoginForm />
      </div>
    </div>
  );
}
