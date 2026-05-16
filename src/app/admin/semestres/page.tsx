'use client';

import { AuthGuard } from '@/components/guards';
import { Card, LoadingSpinner, EmptyState, Pagination, Badge, Button, Modal, Input, Select } from '@/components/ui';
import { fetcher, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import useSWR from 'swr';
import type { Page, Semestre, Curso } from '@/lib/types';
import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminSemestresPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSemestre, setEditingSemestre] = useState<Semestre | null>(null);
  const [nome, setNome] = useState('');
  const [cursoId, setCursoId] = useState('');
  const [saving, setSaving] = useState(false);
  const { data, error, isLoading, mutate } = useSWR<Page<Semestre>>(isAdmin ? `/semestre?page=${page}&size=20` : null, fetcher);
  const { data: cursos } = useSWR<Page<Curso>>(isAdmin ? `/curso?size=100` : null, fetcher);

  if (!isAdmin) {
    router.push('/dashboard');
    return null;
  }

  const cursoOptions = [
    { value: '', label: 'Selecione um curso' },
    ...(cursos?.content.map((c) => ({ value: String(c.id), label: c.nome })) ?? []),
  ];

  const openCreate = () => {
    setEditingSemestre(null);
    setNome('');
    setCursoId('');
    setModalOpen(true);
  };

  const openEdit = (sem: Semestre) => {
    setEditingSemestre(sem);
    setNome(sem.nome);
    setCursoId(String(sem.cursoId));
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!nome.trim() || !cursoId) return;
    setSaving(true);
    try {
      if (editingSemestre) {
        await api.put(`/semestre/${editingSemestre.id}`, { nome, cursoId: Number(cursoId) });
      } else {
        await api.post('/semestre', { nome, cursoId: Number(cursoId) });
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
    if (!confirm('Tem certeza que deseja excluir este semestre?')) return;
    try {
      await api.delete(`/semestre/${id}`);
      mutate();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Semestres</h1>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Novo Semestre
          </Button>
        </div>

        {isLoading && <LoadingSpinner />}
        {error && <p className="text-destructive">Erro ao carregar semestres</p>}
        {data && data.content.length === 0 && <EmptyState message="Nenhum semestre encontrado" />}

        {data && data.content.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nome</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Curso</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((sem) => (
                    <tr key={sem.id} className="border-b border-border">
                      <td className="py-3 px-4 font-medium">{sem.nome}</td>
                      <td className="py-3 px-4 text-muted-foreground">{sem.cursoNome}</td>
                      <td className="py-3 px-4">
                        <Badge variant={sem.ativo ? 'success' : 'destructive'}>
                          {sem.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(sem)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(sem.id)}>
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

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingSemestre ? 'Editar Semestre' : 'Novo Semestre'}>
          <div className="space-y-4">
            <Select
              label="Curso"
              options={cursoOptions}
              value={cursoId}
              onChange={(e) => setCursoId(e.target.value)}
            />
            <Input
              label="Nome do Semestre"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: 1o Semestre"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving || !nome.trim() || !cursoId}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AuthGuard>
  );
}
