'use client';

import { AuthGuard } from '@/components/guards';
import { Card, LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { fetcher } from '@/lib/api';
import useSWR from 'swr';
import type { Page, Curso, Material, PostForum } from '@/lib/types';
import Link from 'next/link';
import { BookOpen, FileText, MessageSquare, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { email } = useAuth();
  const { data: cursos } = useSWR<Page<Curso>>('/curso?size=5', fetcher);
  const { data: materiais } = useSWR<Page<Material>>('/material?size=5', fetcher);
  const { data: posts } = useSWR<Page<PostForum>>('/forum?size=5', fetcher);

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Bem-vindo!</h1>
          <p className="text-muted-foreground">{email}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{cursos?.totalElements ?? '-'}</p>
              <p className="text-sm text-muted-foreground">Cursos</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{materiais?.totalElements ?? '-'}</p>
              <p className="text-sm text-muted-foreground">Materiais</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{posts?.totalElements ?? '-'}</p>
              <p className="text-sm text-muted-foreground">Posts Forum</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">Ativo</p>
              <p className="text-sm text-muted-foreground">Status</p>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Materiais Recentes</h2>
              <Link href="/materiais" className="text-sm text-primary hover:underline">Ver todos</Link>
            </div>
            {!materiais ? (
              <LoadingSpinner />
            ) : materiais.content.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum material encontrado</p>
            ) : (
              <div className="space-y-3">
                {materiais.content.map((m) => (
                  <Link key={m.id} href={`/materiais/${m.id}`} className="block p-3 rounded-lg hover:bg-secondary transition-colors">
                    <p className="font-medium text-sm">{m.titulo}</p>
                    <p className="text-xs text-muted-foreground">{m.disciplinaNome} - {m.tipo}</p>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Forum Recente</h2>
              <Link href="/forum" className="text-sm text-primary hover:underline">Ver todos</Link>
            </div>
            {!posts ? (
              <LoadingSpinner />
            ) : posts.content.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum post encontrado</p>
            ) : (
              <div className="space-y-3">
                {posts.content.map((p) => (
                  <Link key={p.id} href={`/forum/${p.id}`} className="block p-3 rounded-lg hover:bg-secondary transition-colors">
                    <p className="font-medium text-sm">{p.titulo}</p>
                    <p className="text-xs text-muted-foreground">{p.categoria} - {p.usuarioNome}</p>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
