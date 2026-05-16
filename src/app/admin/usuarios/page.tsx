'use client';

import { AuthGuard } from '@/components/guards';
import { Card, LoadingSpinner, EmptyState, Pagination, Badge, Button, Modal, Input } from '@/components/ui';
import { fetcher, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import useSWR from 'swr';
import type { Page, Usuario } from '@/lib/types';
import { useState } from 'react';
import { Search, User, Shield, ShieldOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminUsuariosPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const { data, error, isLoading, mutate } = useSWR<Page<Usuario>>(isAdmin ? `/usuario?page=${page}&size=20` : null, fetcher);

  if (!isAdmin) {
    router.push('/dashboard');
    return null;
  }

  const filtered = data?.content.filter((u) =>
    u.nome.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const handleToggleAtivo = async (id: number, ativo: boolean) => {
    try {
      await api.patch(`/usuario/${id}/ativo`, { ativo: !ativo });
      mutate();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Usuarios</h1>
        </div>

        <div className="relative w-full sm:w-64 mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {isLoading && <LoadingSpinner />}
        {error && <p className="text-destructive">Erro ao carregar usuarios</p>}
        {data && filtered.length === 0 && <EmptyState message="Nenhum usuario encontrado" />}

        {data && filtered.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Usuario</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((usuario) => (
                    <tr key={usuario.id} className="border-b border-border">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{usuario.nome}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{usuario.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant={usuario.role === 'ADMIN' ? 'primary' : 'default'}>
                          {usuario.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="success">Ativo</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleAtivo(usuario.id, true)}
                        >
                          <ShieldOff className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </AuthGuard>
  );
}
