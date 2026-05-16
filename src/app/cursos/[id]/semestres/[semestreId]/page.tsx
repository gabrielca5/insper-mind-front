'use client';

import { AuthGuard } from '@/components/guards';
import { Card, LoadingSpinner, EmptyState, Badge } from '@/components/ui';
import { fetcher } from '@/lib/api';
import useSWR from 'swr';
import type { Semestre, Page, Disciplina } from '@/lib/types';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export default function SemestreDetailPage() {
  const { id, semestreId } = useParams();
  const { data: semestre, isLoading } = useSWR<Semestre>(`/semestre/${semestreId}`, fetcher);
  const { data: disciplinas } = useSWR<Page<Disciplina>>(`/disciplina?size=100`, fetcher);

  const semestreDisciplinas = disciplinas?.content.filter((d) => d.semestreId === Number(semestreId)) ?? [];

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto">
        <Link href={`/cursos/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Voltar para Curso
        </Link>

        {isLoading && <LoadingSpinner />}

        {semestre && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{semestre.nome}</h1>
              <p className="text-muted-foreground">{semestre.cursoNome}</p>
            </div>

            <h2 className="text-lg font-semibold mb-4">Disciplinas</h2>
            {semestreDisciplinas.length === 0 ? (
              <EmptyState message="Nenhuma disciplina encontrada para este semestre" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {semestreDisciplinas.map((disc) => (
                  <Link key={disc.id} href={`/disciplinas/${disc.id}`}>
                    <Card className="h-full hover:border-primary/50 transition-colors">
                      <h3 className="font-semibold">{disc.nome}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {disc.docentes.map((d) => d.nome).join(', ') || 'Sem docentes'}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge>{disc.temDelta ? 'Com Delta' : 'Sem Delta'}</Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
