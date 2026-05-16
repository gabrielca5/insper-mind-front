'use client';

import { AuthGuard } from '@/components/guards';
import { Card, LoadingSpinner, EmptyState, Badge } from '@/components/ui';
import { fetcher } from '@/lib/api';
import useSWR from 'swr';
import type { Docente, Page, Disciplina } from '@/lib/types';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Mail, User, BookOpen } from 'lucide-react';

export default function DocenteDetailPage() {
  const { id } = useParams();
  const { data: docente, isLoading } = useSWR<Docente>(`/docente/${id}`, fetcher);
  const { data: disciplinas } = useSWR<Page<Disciplina>>(`/disciplina?size=100`, fetcher);

  const docenteDisciplinas = disciplinas?.content.filter((d) => 
    d.docentes.some((doc) => doc.id === Number(id))
  ) ?? [];

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto">
        <Link href="/docentes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Voltar para Docentes
        </Link>

        {isLoading && <LoadingSpinner />}

        {docente && (
          <>
            <Card className="mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{docente.nome}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${docente.email}`} className="text-sm hover:text-primary">
                      {docente.email}
                    </a>
                  </div>
                  <Badge variant={docente.ativo ? 'success' : 'destructive'}>
                    {docente.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <BookOpen className="h-4 w-4" /> Disciplinas
              </h2>
              {docenteDisciplinas.length === 0 ? (
                <EmptyState message="Nenhuma disciplina vinculada a este docente" />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {docenteDisciplinas.map((d) => (
                    <Link key={d.id} href={`/disciplinas/${d.id}`} className="p-3 rounded-lg hover:bg-secondary transition-colors">
                      <p className="font-medium text-sm">{d.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.nomeCurso ?? 'Eletiva'} {d.nomeSemestre ? `- ${d.nomeSemestre}` : ''}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
