import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, MapPin, Loader2 } from 'lucide-react';

export function ProfileForm({ profileData, form, setForm, onSubmit, updating }) {
  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold">Información Personal</CardTitle>
        <CardDescription className="text-xs">Mantén tus datos actualizados para recibir notificaciones y entregas.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                Nombres
              </Label>
              <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="name"
                        value={profileData?.name || ''}
                        disabled
                        className="pl-10 h-11 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 cursor-not-allowed opacity-70"
                      />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                Apellidos
              </Label>
              <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="lastName"
                        value={profileData?.lastName || ''}
                        disabled
                        className="pl-10 h-11 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 cursor-not-allowed opacity-70"
                      />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
              Correo Electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                value={profileData?.email || ''}
                disabled
                className="pl-10 h-12 rounded-xl bg-muted/50 border-none cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 border-t pt-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">
                Teléfono Móvil
              </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-primary/40" />
                      <Input
                        id="phone"
                        placeholder="+51 987 654 321"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="pl-10 h-11 rounded-lg border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 transition-all shadow-none"
                      />
                    </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">
                Dirección de Residencia
              </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-primary/40" />
                      <Input
                        id="address"
                        placeholder="Av. Las Camelias 123, San Isidro"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className="pl-10 h-11 rounded-lg border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 transition-all shadow-none"
                      />
                    </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={updating}
                    className="rounded-lg px-8 h-12 font-bold uppercase tracking-widest transition-all hover:opacity-90 shadow-none"
                  >
          {updating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
              ) : (
                'Actualizar Información'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
