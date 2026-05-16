'use client';

import { AuthGuard } from '@/components/guards';
import { Card, LoadingSpinner, EmptyState, Pagination, Badge } from '@/components/ui';
import { fetcher } from '@/lib/api';
import useSWR from 'swr';
import type { Page, Eletiva } from '@/lib/types';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';

export default function EletivasPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const { data, error, isLoading } = useSWR<Page<Eletiva>>(`/eletivas?page=${page}&size=12`, fetcher);

  const filtered = data?.content.filter((e) =>
    e.nome.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Eletivas</h1>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar eletiva..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {isLoading && <LoadingSpinner />}
        {error && <p className="text-destructive">Erro ao carregar eletivas</p>}
        {data && filtered.length === 0 && <EmptyState message="Nenhuma eletiva encontrada" />}

        {data && filtered.length > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((eletiva) => (
                <Link key={eletiva.id} href={`/eletivas/${eletiva.id}`}>
                  <Card className="h-full hover:border-primary/50 transition-colors">
                    <h2 className="font-semibold mb-1">{eletiva.nome}</h2>
                    <p className="text-sm text-muted-foreground mb-2">
                      {eletiva.cargaHoraria}h - Semestre min: {eletiva.semestreMinimo}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge>{eletiva.temDelta ? 'Com Delta' : 'Sem Delta'}</Badge>
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
