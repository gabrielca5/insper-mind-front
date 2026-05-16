'use client';

import { AuthGuard } from '@/components/guards';
import { Card, LoadingSpinner, EmptyState, Badge, Button, Textarea, Pagination } from '@/components/ui';
import { fetcher, api } from '@/lib/api';
import useSWR, { mutate } from 'swr';
import type { Disciplina, Page, Material, Comentario } from '@/lib/types';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, FileText, MessageSquare, Heart, Send, User } from 'lucide-react';
import { useState } from 'react';

export default function DisciplinaDetailPage() {
  const { id } = useParams();
  const { data: disciplina, isLoading } = useSWR<Disciplina>(`/disciplina/${id}`, fetcher);
  const { data: materiais } = useSWR<Page<Material>>(`/material?disciplinaId=${id}&size=10`, fetcher);
  const { data: comentarios } = useSWR<Page<Comentario>>(`/comentario?idDisciplina=${id}&size=20`, fetcher);
  
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [materiaisPage, setMateriaisPage] = useState(0);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/comentario', { comentario: newComment, idDisciplina: Number(id) });
      setNewComment('');
      mutate(`/comentario?idDisciplina=${id}&size=20`);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCurtirComentario = async (comentarioId: number) => {
    try {
      await api.patch(`/comentario/${comentarioId}/curtir`);
      mutate(`/comentario?idDisciplina=${id}&size=20`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto">
        <Link href="/disciplinas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Voltar para Disciplinas
        </Link>

        {isLoading && <LoadingSpinner />}

        {disciplina && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">{disciplina.nome}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {disciplina.nomeCurso && <Badge>{disciplina.nomeCurso}</Badge>}
                {disciplina.nomeSemestre && <Badge variant="primary">{disciplina.nomeSemestre}</Badge>}
                <Badge variant={disciplina.temDelta ? 'success' : 'default'}>
                  {disciplina.temDelta ? 'Com Delta' : 'Sem Delta'}
                </Badge>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <h2 className="font-semibold mb-3">Informacoes</h2>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Formula de Avaliacao:</span> {disciplina.formulaAvaliacao}</p>
                    <p><span className="text-muted-foreground">Criterio Barreira:</span> {disciplina.criterioBarreira}</p>
                    <p>
                      <span className="text-muted-foreground">Docentes:</span>{' '}
                      {disciplina.docentes.length > 0 
                        ? disciplina.docentes.map((d) => d.nome).join(', ')
                        : 'Nenhum docente vinculado'}
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Materiais
                    </h2>
                    <Link href={`/materiais/novo?disciplinaId=${id}`} className="text-sm text-primary hover:underline">
                      Adicionar material
                    </Link>
                  </div>
                  {!materiais ? (
                    <LoadingSpinner />
                  ) : materiais.content.length === 0 ? (
                    <EmptyState message="Nenhum material para esta disciplina" />
                  ) : (
                    <div className="space-y-2">
                      {materiais.content.map((m) => (
                        <Link key={m.id} href={`/materiais/${m.id}`} className="block p-3 rounded-lg hover:bg-secondary transition-colors">
                          <p className="font-medium text-sm">{m.titulo}</p>
                          <p className="text-xs text-muted-foreground">{m.tipo} - {m.curtidas} curtidas</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </Card>

                <Card>
                  <h2 className="font-semibold flex items-center gap-2 mb-4">
                    <MessageSquare className="h-4 w-4" /> Relatos e Comentarios
                  </h2>
                  <div className="flex gap-2 mb-4">
                    <Textarea
                      placeholder="Escreva um relato sobre esta disciplina..."
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
              </div>

              <div>
                <Card>
                  <h2 className="font-semibold mb-3">Docentes</h2>
                  {disciplina.docentes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum docente</p>
                  ) : (
                    <div className="space-y-2">
                      {disciplina.docentes.map((d) => (
                        <Link key={d.id} href={`/docentes/${d.id}`} className="block p-2 rounded-lg hover:bg-secondary transition-colors">
                          <p className="font-medium text-sm">{d.nome}</p>
                          <p className="text-xs text-muted-foreground">{d.email}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
