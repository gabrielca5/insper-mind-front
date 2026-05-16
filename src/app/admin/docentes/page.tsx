'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { AuthGuard, AdminGuard } from '@/components/guards';
import { Button, Input, Badge, EmptyState, LoadingSpinner, Modal } from '@/components/ui';
import { fetcher, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Docente } from '@/lib/types';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

function AdminDocentesContent() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDocente, setEditingDocente] = useState<Docente | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  
  const { data: docentes, error, isLoading, mutate } = useSWR<Docente[]>(isAdmin ? '/docente' : null, fetcher);

  if (!isAdmin) {
    router.push('/dashboard');
    return null;
  }

  const openCreate = () => {
    setEditingDocente(null);
    setNome('');
    setEmail('');
    setModalOpen(true);
  };

  const openEdit = (docente: Docente) => {
    setEditingDocente(docente);
    setNome(docente.nome);
    setEmail(docente.email || '');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!nome.trim() || !email.trim()) return;
    setSaving(true);
    try {
      const payload = { nome, email };
      if (editingDocente) {
        await api.put(`/docente/${editingDocente.id}`, payload);
      } else {
        await api.post('/docente', payload);
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
    if (!confirm('Tem certeza que deseja excluir este docente?')) return;
    try {
      await api.delete(`/docente/${id}`);
      mutate();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Docentes</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Novo Docente
        </Button>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && <p className="text-destructive">Erro ao carregar docentes</p>}
      {docentes && docentes.length === 0 && <EmptyState message="Nenhum docente encontrado" />}

      {docentes && docentes.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nome</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {docentes.map((docente) => (
                <tr key={docente.id} className="border-b border-border">
                  <td className="py-3 px-4 font-medium">{docente.nome}</td>
                  <td className="py-3 px-4 text-muted-foreground">{docente.email}</td>
                  <td className="py-3 px-4">
                    <Badge variant={docente.ativo ? 'success' : 'default'}>
                      {docente.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(docente)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(docente.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingDocente ? 'Editar Docente' : 'Novo Docente'}>
        <div className="space-y-4">
          <Input
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do docente"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@insper.edu.br"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !nome.trim() || !email.trim()}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminDocentesPage() {
  return (
    <AuthGuard>
      <AdminDocentesContent />
    </AuthGuard>
  );
}
