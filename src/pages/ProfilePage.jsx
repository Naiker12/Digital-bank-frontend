import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ProfileStatusCards } from '@/components/profile/ProfileStatusCards';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    address: '',
    phone: ''
  });

  useEffect(() => {
    if (user?.uuid) {
      loadProfile();
    }
  }, [user?.uuid]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const result = await authService.getProfile(user.uuid);
      if (result.success) {
        setProfileData(result.data);
        setForm({
          address: result.data.address || '',
          phone: result.data.phone || ''
        });
        if (result.data.avatarUrl) {
          updateUser({ avatarUrl: result.data.avatarUrl });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('No se pudo cargar la información del perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const result = await userService.updateProfile(user.uuid, form);
      if (result.success) {
        toast.success('Perfil actualizado correctamente');
        setProfileData({ ...profileData, ...form });
      } else {
        toast.error(result.message || 'Error al actualizar perfil');
      }
    } catch (error) {
      toast.error('Error de conexión al servidor');
    } finally {
      setUpdating(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadstart = () => setUploading(true);
    reader.onload = async (event) => {
      const base64Image = event.target.result;
      const result = await userService.uploadAvatar(user.uuid, base64Image, file.type);

      if (result.success) {
        toast.success('Avatar actualizado');
        updateUser({ avatarUrl: result.url });
        setProfileData({ ...profileData, avatarUrl: result.url });
      } else {
        toast.error(result.message || 'Error al subir imagen');
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Cargando tu información...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row gap-8">

        <div className="w-full md:w-1/3 space-y-6">
          <ProfileAvatar
            user={user}
            profileData={profileData}
            uploading={uploading}
            onAvatarChange={handleFileChange}
          />
          <ProfileStatusCards profileData={profileData} />
        </div>

        <div className="flex-1">
          <ProfileForm
            profileData={profileData}
            form={form}
            setForm={setForm}
            onSubmit={handleUpdateProfile}
            updating={updating}
          />
        </div>

      </div>
    </div>
  );
}
