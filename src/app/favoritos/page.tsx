'use client';

import { AuthGuard } from '@/components/guards';
import { Card, LoadingSpinner, EmptyState, Pagination, Badge, Select } from '@/components/ui';
import { fetcher, api } from '@/lib/api';
import useSWR from 'swr';
import type { Page, Favorito, TipoFavorito } from '@/lib/types';
import Link from 'next/link';
import { useState } from 'react';
import { Heart, FileText, Layers, Trash2 } from 'lucide-react';

const tipoOptions = [
  { value: '', label: 'Todos os tipos' },
  { value: 'MATERIAL', label: 'Materiais' },
  { value: 'ELETIVA', label: 'Eletivas' },
];

export default function FavoritosPage() {
  const [page, setPage] = useState(0);
  const [tipo, setTipo] = useState('');
  
  const queryParams = new URLSearchParams();
  queryParams.set('page', String(page));
  queryParams.set('size', '12');
  if (tipo) queryParams.set('tipo', tipo);
  
  const { data, error, isLoading, mutate } = useSWR<Page<Favorito>>(`/favorito?${queryParams.toString()}`, fetcher);

  const handleRemove = async (id: number) => {
    try {
      await api.delete(`/favorito/${id}`);
      mutate();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Favoritos</h1>
          <Select
            options={tipoOptions}
            value={tipo}
            onChange={(e) => { setTipo(e.target.value); setPage(0); }}
            className="sm:w-48"
          />
        </div>

        {isLoading && <LoadingSpinner />}
        {error && <p className="text-destructive">Erro ao carregar favoritos</p>}
        {data && data.content.length === 0 && <EmptyState message="Nenhum favorito encontrado" />}

        {data && data.content.length > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.content.map((fav) => (
                <Card key={fav.id} className="relative">
                  <button
                    onClick={() => handleRemove(fav.id)}
                    className="absolute top-3 right-3 p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {fav.tipo === 'MATERIAL' ? (
                    <Link href={`/materiais/${fav.materialId}`} className="block">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <Badge>Material</Badge>
                      </div>
                      <h3 className="font-semibold">{fav.materialTitulo}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Salvo em {new Date(fav.dataSalvo).toLocaleDateString('pt-BR')}
                      </p>
                    </Link>
                  ) : (
                    <Link href={`/eletivas/${fav.eletivaId}`} className="block">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Layers className="h-5 w-5 text-primary" />
                        </div>
                        <Badge>Eletiva</Badge>
                      </div>
                      <h3 className="font-semibold">{fav.eletivaNome}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Salvo em {new Date(fav.dataSalvo).toLocaleDateString('pt-BR')}
                      </p>
                    </Link>
                  )}
                </Card>
              ))}
            </div>
            <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </AuthGuard>
  );
}
