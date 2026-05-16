'use client';

import { AuthGuard } from '@/components/guards';
import { Card, LoadingSpinner, EmptyState, Badge } from '@/components/ui';
import { fetcher } from '@/lib/api';
import useSWR from 'swr';
import type { Curso, Page, Semestre, Disciplina } from '@/lib/types';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export default function CursoDetailPage() {
  const { id } = useParams();
  const { data: curso, isLoading } = useSWR<Curso>(`/curso/${id}`, fetcher);
  const { data: semestres } = useSWR<Page<Semestre>>(`/semestre?size=100`, fetcher);

  const cursoSemestres = semestres?.content.filter((s) => s.cursoId === Number(id)) ?? [];

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto">
        <Link href="/cursos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Voltar para Cursos
        </Link>

        {isLoading && <LoadingSpinner />}

        {curso && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{curso.nome}</h1>
              <Badge variant={curso.ativo ? 'success' : 'destructive'}>
                {curso.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>

            <h2 className="text-lg font-semibold mb-4">Semestres</h2>
            {cursoSemestres.length === 0 ? (
              <EmptyState message="Nenhum semestre encontrado para este curso" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cursoSemestres.map((sem) => (
                  <Link key={sem.id} href={`/cursos/${id}/semestres/${sem.id}`}>
                    <Card className="h-full hover:border-primary/50 transition-colors">
                      <h3 className="font-semibold">{sem.nome}</h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                        <span>{sem.ativo ? 'Ativo' : 'Inativo'}</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
}
