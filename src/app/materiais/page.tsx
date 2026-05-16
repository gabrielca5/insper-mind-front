'use client';

import { AuthGuard } from '@/components/guards';
import { Card, LoadingSpinner, EmptyState, Pagination, Badge, Button, Select } from '@/components/ui';
import { fetcher } from '@/lib/api';
import useSWR from 'swr';
import type { Page, Material, TipoMaterial } from '@/lib/types';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight, Search, Plus, Heart } from 'lucide-react';

const tipoOptions = [
  { value: '', label: 'Todos os tipos' },
  { value: 'PROVA_ANTIGA', label: 'Prova Antiga' },
  { value: 'RESUMO', label: 'Resumo' },
  { value: 'EXERCICIO_RESOLVIDO', label: 'Exercicio Resolvido' },
  { value: 'LISTA', label: 'Lista' },
  { value: 'PDF', label: 'PDF' },
  { value: 'LIVRO', label: 'Livro' },
  { value: 'OUTRO', label: 'Outro' },
];

export default function MateriaisPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('');
  
  const queryParams = new URLSearchParams();
  queryParams.set('page', String(page));
  queryParams.set('size', '12');
  if (tipo) queryParams.set('tipo', tipo);
  
  const { data, error, isLoading } = useSWR<Page<Material>>(`/material?${queryParams.toString()}`, fetcher);

  const filtered = data?.content.filter((m) =>
    m.titulo.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Materiais</h1>
          <Link href="/materiais/novo">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Novo Material
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar material..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Select
            options={tipoOptions}
            value={tipo}
            onChange={(e) => { setTipo(e.target.value); setPage(0); }}
            className="sm:w-48"
          />
        </div>

        {isLoading && <LoadingSpinner />}
        {error && <p className="text-destructive">Erro ao carregar materiais</p>}
        {data && filtered.length === 0 && <EmptyState message="Nenhum material encontrado" />}

        {data && filtered.length > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((material) => (
                <Link key={material.id} href={`/materiais/${material.id}`}>
                  <Card className="h-full hover:border-primary/50 transition-colors">
                    <h2 className="font-semibold mb-1 line-clamp-1">{material.titulo}</h2>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                      {material.disciplinaNome}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge>{material.tipo.replace('_', ' ')}</Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Heart className={`h-3 w-3 ${material.curtiuUsuarioLogado ? 'fill-primary text-primary' : ''}`} />
                          {material.curtidas}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
