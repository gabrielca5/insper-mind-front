'use client';

import { useAuth } from '@/lib/auth';
import { AuthGuard } from '@/components/guards';
import { Sidebar } from '@/components/sidebar';
import { Card, Badge } from '@/components/ui';
import { User, Mail, Shield } from 'lucide-react';

function ProfileContent() {
  const { email, role, isAdmin } = useAuth();

  if (!email) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
          <p className="mt-1 text-muted-foreground">Informacoes da sua conta</p>
        </div>

        <div className="max-w-2xl">
          <Card>
            <div className="flex items-center gap-6 mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{email}</h2>
                <Badge variant={isAdmin ? 'primary' : 'default'}>
                  {isAdmin ? 'Administrador' : 'Usuario'}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Funcao</p>
                  <p className="font-medium text-foreground">
                    {isAdmin ? 'Administrador do Sistema' : 'Estudante'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
