'use client';

import { AuthGuard } from '@/components/guards';
import { Card, LoadingSpinner, EmptyState, Pagination, Badge, Button, Select } from '@/components/ui';
import { fetcher } from '@/lib/api';
import useSWR from 'swr';
import type { Page, PostForum, CategoriaForum } from '@/lib/types';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight, Search, Plus, Heart, MessageSquare } from 'lucide-react';

const categoriaOptions = [
  { value: '', label: 'Todas as categorias' },
  { value: 'ADMINISTRATIVO', label: 'Administrativo' },
  { value: 'TECNICO', label: 'Tecnico' },
  { value: 'GERAL', label: 'Geral' },
];

export default function ForumPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  
  const queryParams = new URLSearchParams();
  queryParams.set('page', String(page));
  queryParams.set('size', '12');
  if (categoria) queryParams.set('categoria', categoria);
  
  const { data, error, isLoading } = useSWR<Page<PostForum>>(`/forum?${queryParams.toString()}`, fetcher);

  const filtered = data?.content.filter((p) =>
    p.titulo.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Forum</h1>
          <Link href="/forum/novo">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Novo Post
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar post..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Select
            options={categoriaOptions}
            value={categoria}
            onChange={(e) => { setCategoria(e.target.value); setPage(0); }}
            className="sm:w-48"
          />
        </div>

        {isLoading && <LoadingSpinner />}
        {error && <p className="text-destructive">Erro ao carregar posts</p>}
        {data && filtered.length === 0 && <EmptyState message="Nenhum post encontrado" />}

        {data && filtered.length > 0 && (
          <>
            <div className="space-y-4">
              {filtered.map((post) => (
                <Link key={post.id} href={`/forum/${post.id}`}>
                  <Card className="hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold mb-1">{post.titulo}</h2>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{post.conteudo}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <Badge>{post.categoria}</Badge>
                          <span>{post.usuarioNome}</span>
                          <span>{new Date(post.dataCriacao).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className={`h-4 w-4 ${post.curtiuUsuarioLogado ? 'fill-primary text-primary' : ''}`} />
                          {post.curtidas}
                        </span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </AuthGuard>
  );
}
