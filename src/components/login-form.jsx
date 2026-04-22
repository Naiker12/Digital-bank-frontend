import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
import { Landmark, Loader2, Info, Eye, EyeOff } from 'lucide-react';

export function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setInfo(location.state.message);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="min-h-[600px] flex flex-col overflow-hidden border-none p-0 shadow-xl md:flex-row">
        <CardContent className="grid flex-1 p-0 md:grid-cols-2">
          <form className="flex flex-col justify-center p-8 md:p-12" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex items-center gap-2">
                  <Landmark className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold tracking-tight">Banco Union</span>
                </div>
                <p className="text-balance text-sm text-muted-foreground">
                  Ingresa a tu cuenta para continuar
                </p>
              </div>

              {info && (
                <div className="flex items-center gap-2 rounded-md bg-primary/10 p-3 text-sm text-primary">
                  <Info className="h-4 w-4" />
                  {info}
                </div>
              )}

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="email">Correo electronico</FieldLabel>
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
                  <FieldLabel htmlFor="password">Contrasena</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Olvidaste tu contrasena?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-11"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
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
                No tienes cuenta?{' '}
                <Link
                  to="/register"
                  className="font-medium underline underline-offset-4 hover:text-primary"
                >
                  Crear cuenta
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="relative hidden overflow-hidden bg-slate-950 md:block">
            <div className="absolute inset-0 bg-mesh-pattern opacity-20" />
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
            <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-[100px]" />

            <div className="relative z-10 flex h-full flex-col items-center justify-center p-12 text-center">
              <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl">
                <Landmark className="h-12 w-12 text-primary" />
              </div>

              <h2 className="text-3xl font-black tracking-tighter text-white">
                Banco Union
              </h2>
              <p className="mt-4 text-balance text-sm font-medium leading-relaxed text-slate-400">
                Unite a la nueva era del sistema financiero digital. <br />
                Seguridad, velocidad y diseno en un solo lugar.
              </p>

              <div className="relative mt-12 aspect-[1.586/1] w-64 rotate-12 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent -mr-20 translate-y-10 opacity-50">
                <div className="absolute left-4 top-4 h-6 w-8 rounded bg-white/20" />
                <div className="absolute bottom-4 left-4 right-4 h-2 rounded bg-white/10" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center text-xs">
        Al continuar aceptas nuestros{' '}
        <a href="#" className="underline">
          Terminos de Servicio
        </a>{' '}
        y{' '}
        <a href="#" className="underline">
          Politica de Privacidad
        </a>
        .
      </FieldDescription>
    </div>
  );
}
