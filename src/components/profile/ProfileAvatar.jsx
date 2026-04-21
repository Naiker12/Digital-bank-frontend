import { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProfileAvatar({ user, profileData, uploading, onAvatarChange }) {
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-primary/5 to-transparent">
      <CardContent className="pt-10 pb-8 flex flex-col items-center">
        <div className="relative group">
          <Avatar className="h-40 w-40 border-2 border-slate-100 dark:border-slate-800 transition-transform duration-500 group-hover:scale-[1.02]">
            <AvatarImage src={user?.avatarUrl || profileData?.avatarUrl} alt={user?.name} className="object-cover" />
            <AvatarFallback className="text-4xl font-bold bg-primary/5 text-primary">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <button 
            onClick={handleAvatarClick}
            disabled={uploading}
            className={cn(
              "absolute bottom-2 right-2 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-white dark:border-slate-900 transition-all hover:scale-110 active:scale-95",
              uploading && "opacity-50 cursor-not-allowed"
            )}
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={onAvatarChange}
          />
        </div>

        <div className="mt-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight">{profileData?.name} {profileData?.lastName}</h2>
          <div className="flex items-center justify-center gap-2 mt-1 text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            <span className="text-sm">{profileData?.email}</span>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
