'use client';

import { AuthGuard } from '@/components/guards';
import { Card, LoadingSpinner, EmptyState, Pagination, Input, Select, Badge } from '@/components/ui';
import { fetcher } from '@/lib/api';
import useSWR from 'swr';
import type { Page, Disciplina } from '@/lib/types';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';

export default function DisciplinasPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const { data, error, isLoading } = useSWR<Page<Disciplina>>(`/disciplina?page=${page}&size=12`, fetcher);

  const filtered = data?.content.filter((d) =>
    d.nome.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Disciplinas</h1>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar disciplina..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {isLoading && <LoadingSpinner />}
        {error && <p className="text-destructive">Erro ao carregar disciplinas</p>}
        {data && filtered.length === 0 && <EmptyState message="Nenhuma disciplina encontrada" />}

        {data && filtered.length > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((disc) => (
                <Link key={disc.id} href={`/disciplinas/${disc.id}`}>
                  <Card className="h-full hover:border-primary/50 transition-colors">
                    <h2 className="font-semibold mb-1">{disc.nome}</h2>
                    <p className="text-sm text-muted-foreground mb-2">
                      {disc.nomeCurso ?? 'Eletiva'} {disc.nomeSemestre ? `- ${disc.nomeSemestre}` : ''}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge>{disc.temDelta ? 'Com Delta' : 'Sem Delta'}</Badge>
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
