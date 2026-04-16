import { RegisterForm } from '@/components/register-form';

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted bg-mesh-pattern p-6 md:p-10">
      <div className="w-full max-w-md md:max-w-5xl">
        <RegisterForm />
      </div>
    </div>
  );
}
