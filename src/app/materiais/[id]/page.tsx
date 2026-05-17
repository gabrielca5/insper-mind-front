'use client';

import { AuthGuard } from '@/components/guards';
import { Card, LoadingSpinner, EmptyState, Badge, Button, Textarea } from '@/components/ui';
import { fetcher, api } from '@/lib/api';
import useSWR, { mutate } from 'swr';
import type { Material, Page, Comentario, Favorito } from '@/lib/types';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Heart, ExternalLink, User, Send, Trash2, Download } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';

export default function MaterialDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { userId, isAdmin } = useAuth();
  const { data: material, isLoading, mutate: mutateMaterial } = useSWR<Material>(`/material/${id}`, fetcher);
  const { data: comentarios, mutate: mutateComentarios } = useSWR<Page<Comentario>>(`/comentario?idMaterial=${id}&size=50`, fetcher);
  const { data: favoritos, mutate: mutateFav } = useSWR<Page<Favorito>>(`/favorito?tipo=MATERIAL&size=100`, fetcher);
  
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isFavorited = favoritos?.content.some((f) => f.materialId === Number(id));
  const isOwner = material?.usuarioId === userId;

  const handleCurtir = async () => {
    try {
      await api.patch(`/material/${id}/curtir`);
      mutateMaterial();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleFavorito = async () => {
    try {
      if (isFavorited) {
        const fav = favoritos?.content.find((f) => f.materialId === Number(id));
        if (fav) await api.delete(`/favorito/${fav.id}`);
      } else {
        await api.post('/favorito', { materialId: Number(id) });
      }
      mutateFav();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/comentario', { comentario: newComment, idMaterial: Number(id) });
      setNewComment('');
      mutateComentarios();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCurtirComentario = async (comentarioId: number) => {
    try {
      await api.patch(`/comentario/${comentarioId}/curtir`);
      mutateComentarios();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este material?')) return;
    setDeleting(true);
    try {
      await api.delete(`/material/${id}`);
      router.push('/materiais');
    } catch (e) {
      console.error(e);
      setDeleting(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto">
        <Link href="/materiais" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Voltar para Materiais
        </Link>

        {isLoading && <LoadingSpinner />}

        {material && (
          <>
            <Card className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{material.titulo}</h1>
                  <p className="text-muted-foreground mb-3">{material.descricao}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge>{material.tipo.replace('_', ' ')}</Badge>
                    <Link href={`/disciplinas/${material.disciplinaId}`}>
                      <Badge variant="primary">{material.disciplinaNome}</Badge>
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Por {material.usuarioNome} em {new Date(material.dataCriacao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant={material.curtiuUsuarioLogado ? 'primary' : 'secondary'} onClick={handleCurtir}>
                    <Heart className={`h-4 w-4 mr-2 ${material.curtiuUsuarioLogado ? 'fill-current' : ''}`} />
                    {material.curtidas}
                  </Button>
                  <Button variant={isFavorited ? 'primary' : 'secondary'} onClick={handleToggleFavorito}>
                    <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>
                  {material.link && (
                    <a href={material.link} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary">
                        <ExternalLink className="h-4 w-4 mr-2" /> Acessar
                      </Button>
                    </a>
                  )}
                  {material.arquivo && (
                  <a href={`/api/uploads/${material.arquivo}`} target="_blank" rel="noopener noreferrer">                      <Button variant="secondary">
                        <Download className="h-4 w-4 mr-2" /> Download
                      </Button>
                    </a>
                  )}
                  {(isOwner || isAdmin) && (
                    <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="font-semibold mb-4">Comentarios</h2>
              <div className="flex gap-2 mb-4">
                <Textarea
                  placeholder="Escreva um comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                <Button onClick={handleAddComment} disabled={submitting || !newComment.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {!comentarios ? (
                <LoadingSpinner />
              ) : comentarios.content.length === 0 ? (
                <EmptyState message="Nenhum comentario ainda" />
              ) : (
                <div className="space-y-3">
                  {comentarios.content.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{c.usuarioNome}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(c.dataCriacao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{c.comentario}</p>
                      <button
                        onClick={() => handleCurtirComentario(c.id)}
                        className={`flex items-center gap-1 text-xs ${c.curtiuUsuarioLogado ? 'text-primary' : 'text-muted-foreground'} hover:text-primary`}
                      >
                        <Heart className={`h-3 w-3 ${c.curtiuUsuarioLogado ? 'fill-primary' : ''}`} />
                        {c.curtidas}
                      </button>
                    </div>
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
