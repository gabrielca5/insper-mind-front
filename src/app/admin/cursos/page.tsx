'use client';

import { AuthGuard } from '@/components/guards';
import { Card, LoadingSpinner, EmptyState, Pagination, Badge, Button, Modal, Input } from '@/components/ui';
import { fetcher, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import useSWR from 'swr';
import type { Page, Curso } from '@/lib/types';
import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminCursosPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const [nome, setNome] = useState('');
  const [saving, setSaving] = useState(false);
  const { data, error, isLoading, mutate } = useSWR<Page<Curso>>(isAdmin ? `/curso?page=${page}&size=20` : null, fetcher);

  if (!isAdmin) {
    router.push('/dashboard');
    return null;
  }

  const openCreate = () => {
    setEditingCurso(null);
    setNome('');
    setModalOpen(true);
  };

  const openEdit = (curso: Curso) => {
    setEditingCurso(curso);
    setNome(curso.nome);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!nome.trim()) return;
    setSaving(true);
    try {
      if (editingCurso) {
        await api.put(`/curso/${editingCurso.id}`, { nome });
      } else {
        await api.post('/curso', { nome });
      }
      mutate();
      setModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este curso?')) return;
    try {
      await api.delete(`/curso/${id}`);
      mutate();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Cursos</h1>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Novo Curso
          </Button>
        </div>

        {isLoading && <LoadingSpinner />}
        {error && <p className="text-destructive">Erro ao carregar cursos</p>}
        {data && data.content.length === 0 && <EmptyState message="Nenhum curso encontrado" />}

        {data && data.content.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nome</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((curso) => (
                    <tr key={curso.id} className="border-b border-border">
                      <td className="py-3 px-4 font-medium">{curso.nome}</td>
                      <td className="py-3 px-4">
                        <Badge variant={curso.ativo ? 'success' : 'destructive'}>
                          {curso.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(curso)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(curso.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
          </>
        )}

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingCurso ? 'Editar Curso' : 'Novo Curso'}>
          <div className="space-y-4">
            <Input
              label="Nome do Curso"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Engenharia de Computacao"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving || !nome.trim()}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AuthGuard>
  );
}
