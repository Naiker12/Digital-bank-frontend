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

export function RegisterForm({ className, ...props }) {
  const [form, setForm] = useState({
    name: '',
    lastName: '',
    email: '',
    document: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    const { confirmPassword, ...userData } = form;
    const result = await register(userData);
    if (result.success) {
      // Como el registro no inicia sesión automáticamente, vamos al login
      navigate('/login', { state: { message: 'Cuenta creada con éxito. Ingresa tus credenciales.' } });
    } else {
      setError(result.message);
    }
    setLoading(false);
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
                    Banco Unión
                  </span>
                </div>
                <p className="text-balance text-sm text-muted-foreground">
                  Crea tu cuenta y empieza a operar
                </p>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="name">Nombre</FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Naiker"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">Apellido</FieldLabel>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Gómez"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="document">Documento</FieldLabel>
                <Input
                  id="document"
                  name="document"
                  placeholder="1098765432"
                  value={form.document}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="reg-email">Correo electrónico</FieldLabel>
                <Input
                  id="reg-email"
                  name="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+57 301 234 5678"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="reg-password">Contraseña</FieldLabel>
                  <Input
                    id="reg-password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirmar</FieldLabel>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </Field>
              </div>

              <Field>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                ¿Ya tienes cuenta?{' '}
                <Link
                  to="/login"
                  className="font-medium underline underline-offset-4 hover:text-primary"
                >
                  Iniciar sesión
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          {/* Panel derecho — Diseño Premium */}
          <div className="relative hidden overflow-hidden bg-slate-950 md:block">
            {/* Mesh Gradient Animado */}
            <div className="absolute inset-0 bg-mesh-pattern opacity-20" />
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />
            <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
            
            <div className="relative z-10 flex h-full flex-col items-center justify-center p-12 text-center">
              <div className="mb-8 rounded-3xl bg-white/5 p-4 backdrop-blur-xl border border-white/10 shadow-2xl">
                <Landmark className="h-12 w-12 text-primary" />
              </div>
              
              <h2 className="text-3xl font-black tracking-tighter text-white">
                Bienvenido
              </h2>
              <p className="mt-4 text-balance text-sm font-medium text-slate-400 leading-relaxed">
                Empieza hoy tu camino hacia una mejor gestión financiera. <br/>
                Abre tu cuenta en minutos y disfruta de beneficios exclusivos.
              </p>

              {/* Decoración abstracta */}
              <div className="mt-12 relative w-64 h-32 rounded-3xl bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent border border-white/5 backdrop-blur-sm -rotate-6 translate-y-10 opacity-40" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
