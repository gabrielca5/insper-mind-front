'use client';

import { AuthGuard } from '@/components/guards';
import { Card, LoadingSpinner, Badge, Button } from '@/components/ui';
import { fetcher, api } from '@/lib/api';
import useSWR, { mutate } from 'swr';
import type { Eletiva, Page, Favorito } from '@/lib/types';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Heart, Clock, Calendar, User } from 'lucide-react';
import { useState } from 'react';

export default function EletivaDetailPage() {
  const { id } = useParams();
  const { data: eletiva, isLoading } = useSWR<Eletiva>(`/eletivas/${id}`, fetcher);
  const { data: favoritos, mutate: mutateFav } = useSWR<Page<Favorito>>(`/favorito?tipo=ELETIVA&size=100`, fetcher);
  
  const [saving, setSaving] = useState(false);
  const isFavorited = favoritos?.content.some((f) => f.eletivaId === Number(id));

  const handleToggleFavorito = async () => {
    setSaving(true);
    try {
      if (isFavorited) {
        const fav = favoritos?.content.find((f) => f.eletivaId === Number(id));
        if (fav) await api.delete(`/favorito/${fav.id}`);
      } else {
        await api.post('/favorito', { eletivaId: Number(id) });
      }
      mutateFav();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto">
        <Link href="/eletivas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Voltar para Eletivas
        </Link>

        {isLoading && <LoadingSpinner />}

        {eletiva && (
          <>
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{eletiva.nome}</h1>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={eletiva.temDelta ? 'success' : 'default'}>
                      {eletiva.temDelta ? 'Com Delta' : 'Sem Delta'}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant={isFavorited ? 'primary' : 'secondary'}
                  onClick={handleToggleFavorito}
                  disabled={saving}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                  {isFavorited ? 'Favoritado' : 'Favoritar'}
                </Button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <h2 className="font-semibold mb-4">Informacoes</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Carga Horaria</p>
                      <p className="text-sm text-muted-foreground">{eletiva.cargaHoraria} horas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Semestre Minimo</p>
                      <p className="text-sm text-muted-foreground">{eletiva.semestreMinimo}o semestre</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="font-semibold mb-4">Avaliacao</h2>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Formula:</span> {eletiva.formulaAvaliacao}</p>
                  <p><span className="text-muted-foreground">Criterio Barreira:</span> {eletiva.criterioBarreira}</p>
                </div>
              </Card>

              <Card className="md:col-span-2">
                <h2 className="font-semibold mb-4">Docentes</h2>
                {eletiva.docentes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum docente vinculado</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {eletiva.docentes.map((d) => (
                      <Link key={d.id} href={`/docentes/${d.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{d.nome}</p>
                          <p className="text-xs text-muted-foreground">{d.email}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
