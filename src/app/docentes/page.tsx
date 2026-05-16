'use client';

import { AuthGuard } from '@/components/guards';
import { Card, LoadingSpinner, EmptyState, Pagination } from '@/components/ui';
import { fetcher } from '@/lib/api';
import useSWR from 'swr';
import type { Page, Docente } from '@/lib/types';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight, Search, User } from 'lucide-react';

export default function DocentesPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const { data, error, isLoading } = useSWR<Page<Docente>>(`/docente?page=${page}&size=12`, fetcher);

  const filtered = data?.content.filter((d) =>
    d.nome.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Docentes</h1>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar docente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {isLoading && <LoadingSpinner />}
        {error && <p className="text-destructive">Erro ao carregar docentes</p>}
        {data && filtered.length === 0 && <EmptyState message="Nenhum docente encontrado" />}

        {data && filtered.length > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((docente) => (
                <Link key={docente.id} href={`/docentes/${docente.id}`}>
                  <Card className="h-full hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold truncate">{docente.nome}</h2>
                        <p className="text-sm text-muted-foreground truncate">{docente.email}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
