import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Landmark, Loader2 } from 'lucide-react';

export function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState('naiker@digitalbank.com');
  const [password, setPassword] = useState('1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simular retraso de red
    setTimeout(() => {
      const result = login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0 border-none shadow-xl min-h-[600px] flex flex-col md:flex-row">
        <CardContent className="grid p-0 md:grid-cols-2 flex-1">
          <form className="p-8 md:p-12 flex flex-col justify-center" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex items-center gap-2">
                  <Landmark className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold tracking-tight">
                    Digital Bank
                  </span>
                </div>
                <p className="text-balance text-sm text-muted-foreground">
                  Ingresa a tu cuenta para continuar
                </p>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                ¿No tienes cuenta?{' '}
                <Link
                  to="/register"
                  className="font-medium underline underline-offset-4 hover:text-primary"
                >
                  Crear cuenta
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          {/* Panel derecho — Diseño Premium */}
          <div className="relative hidden overflow-hidden bg-slate-950 md:block">
            {/* Mesh Gradient Animado (Simulado por CSS) */}
            <div className="absolute inset-0 bg-mesh-pattern opacity-20" />
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
            <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-[100px]" />
            
            <div className="relative z-10 flex h-full flex-col items-center justify-center p-12 text-center">
              <div className="mb-8 rounded-3xl bg-white/5 p-4 backdrop-blur-xl border border-white/10 shadow-2xl">
                <Landmark className="h-12 w-12 text-primary" />
              </div>
              
              <h2 className="text-3xl font-black tracking-tighter text-white">
                Digital Bank
              </h2>
              <p className="mt-4 text-balance text-sm font-medium text-slate-400 leading-relaxed">
                Únete a la nueva era del sistema financiero digital. <br/>
                Seguridad, velocidad y diseño en un solo lugar.
              </p>

              {/* Decoración abstracta de tarjeta */}
              <div className="mt-12 relative w-64 aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-md rotate-12 -mr-20 translate-y-10 opacity-50 overflow-hidden">
                <div className="absolute top-4 left-4 h-6 w-8 rounded bg-white/20" />
                <div className="absolute bottom-4 left-4 right-4 h-2 rounded bg-white/10" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center text-xs">
        Al continuar aceptas nuestros{' '}
        <a href="#" className="underline">
          Términos de Servicio
        </a>{' '}
        y{' '}
        <a href="#" className="underline">
          Política de Privacidad
        </a>
        .
      </FieldDescription>
    </div>
  );
}
