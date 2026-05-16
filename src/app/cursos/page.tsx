'use client';

import { AuthGuard } from '@/components/guards';
import { Card, LoadingSpinner, EmptyState, Pagination } from '@/components/ui';
import { fetcher } from '@/lib/api';
import useSWR from 'swr';
import type { Page, Curso } from '@/lib/types';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export default function CursosPage() {
  const [page, setPage] = useState(0);
  const { data, error, isLoading } = useSWR<Page<Curso>>(`/curso?page=${page}&size=12`, fetcher);

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Cursos</h1>

        {isLoading && <LoadingSpinner />}
        {error && <p className="text-destructive">Erro ao carregar cursos</p>}
        {data && data.content.length === 0 && <EmptyState message="Nenhum curso encontrado" />}

        {data && data.content.length > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.content.map((curso) => (
                <Link key={curso.id} href={`/cursos/${curso.id}`}>
                  <Card className="h-full hover:border-primary/50 transition-colors">
                    <h2 className="font-semibold text-lg mb-2">{curso.nome}</h2>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{curso.ativo ? 'Ativo' : 'Inativo'}</span>
                      <ChevronRight className="h-4 w-4" />
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
