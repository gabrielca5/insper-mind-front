'use client';

import { AuthGuard } from '@/components/guards';
import { Card, LoadingSpinner, EmptyState, Badge, Button, Textarea } from '@/components/ui';
import { fetcher, api } from '@/lib/api';
import useSWR, { mutate } from 'swr';
import type { PostForum, Page, Comentario } from '@/lib/types';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Heart, User, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';

export default function ForumPostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { userId, isAdmin } = useAuth();
  const { data: post, isLoading, mutate: mutatePost } = useSWR<PostForum>(`/forum/${id}`, fetcher);
  const { data: comentarios, mutate: mutateComentarios } = useSWR<Page<Comentario>>(`/comentario?idForum=${id}&size=50`, fetcher);
  
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = post?.usuarioId === userId;

  const handleCurtir = async () => {
    try {
      await api.patch(`/forum/${id}/curtir`);
      mutatePost();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    setDeleting(true);
    try {
      await api.delete(`/forum/${id}`);
      router.push('/forum');
    } catch (e) {
      console.error(e);
      setDeleting(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto">
        <Link href="/forum" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Voltar para Forum
        </Link>

        {isLoading && <LoadingSpinner />}

        {post && (
          <>
            <Card className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="mb-2">
                    <Badge>{post.categoria}</Badge>
                  </div>
                  <h1 className="text-2xl font-bold">{post.titulo}</h1>
                </div>
                <div className="flex gap-2">
                  <Button variant={post.curtiuUsuarioLogado ? 'primary' : 'secondary'} onClick={handleCurtir}>
                    <Heart className={`h-4 w-4 mr-2 ${post.curtiuUsuarioLogado ? 'fill-current' : ''}`} />
                    {post.curtidas}
                  </Button>
                  {(isOwner || isAdmin) && (
                    <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="prose prose-sm max-w-none mb-4">
                <p className="whitespace-pre-wrap">{post.conteudo}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-border pt-4">
                <User className="h-4 w-4" />
                <span>{post.usuarioNome}</span>
                <span>-</span>
                <span>{new Date(post.dataCriacao).toLocaleDateString('pt-BR')}</span>
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
                <Button onClick={() => {}} disabled={submitting || !newComment.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <EmptyState message="Comentarios em posts do forum em breve" />
            </Card>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
