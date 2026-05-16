'use client';

import { AuthGuard } from '@/components/guards';
import { Card, LoadingSpinner, EmptyState, Pagination, Badge, Button, Modal, Input, Select, Textarea } from '@/components/ui';
import { fetcher, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import useSWR from 'swr';
import type { Page, Disciplina, Semestre, Docente } from '@/lib/types';
import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDisciplinasPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDisciplina, setEditingDisciplina] = useState<Disciplina | null>(null);
  const [nome, setNome] = useState('');
  const [semestreId, setSemestreId] = useState('');
  const [formulaAvaliacao, setFormulaAvaliacao] = useState('');
  const [temDelta, setTemDelta] = useState(false);
  const [criterioBarreira, setCriterioBarreira] = useState('');
  const [saving, setSaving] = useState(false);
  
  const { data, error, isLoading, mutate } = useSWR<Page<Disciplina>>(isAdmin ? `/disciplina?page=${page}&size=20` : null, fetcher);
  const { data: semestres } = useSWR<Page<Semestre>>(isAdmin ? `/semestre?size=100` : null, fetcher);

  if (!isAdmin) {
    router.push('/dashboard');
    return null;
  }

  const semestreOptions = [
    { value: '', label: 'Selecione um semestre' },
    ...(semestres?.content.map((s) => ({ value: String(s.id), label: `${s.cursoNome} - ${s.nome}` })) ?? []),
  ];

  const openCreate = () => {
    setEditingDisciplina(null);
    setNome('');
    setSemestreId('');
    setFormulaAvaliacao('');
    setTemDelta(false);
    setCriterioBarreira('');
    setModalOpen(true);
  };

  const openEdit = (disc: Disciplina) => {
    setEditingDisciplina(disc);
    setNome(disc.nome);
    setSemestreId(disc.semestreId ? String(disc.semestreId) : '');
    setFormulaAvaliacao(disc.formulaAvaliacao);
    setTemDelta(disc.temDelta);
    setCriterioBarreira(disc.criterioBarreira);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!nome.trim() || !semestreId) return;
    setSaving(true);
    try {
      const payload = {
        nome,
        semestreId: Number(semestreId),
        formulaAvaliacao,
        temDelta,
        criterioBarreira,
        docenteIds: editingDisciplina?.docentes.map((d) => d.id) ?? [],
      };
      if (editingDisciplina) {
        await api.put(`/disciplina/${editingDisciplina.id}`, payload);
      } else {
        await api.post('/disciplina', payload);
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
    if (!confirm('Tem certeza que deseja excluir esta disciplina?')) return;
    try {
      await api.delete(`/disciplina/${id}`);
      mutate();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Disciplinas</h1>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Nova Disciplina
          </Button>
        </div>

        {isLoading && <LoadingSpinner />}
        {error && <p className="text-destructive">Erro ao carregar disciplinas</p>}
        {data && data.content.length === 0 && <EmptyState message="Nenhuma disciplina encontrada" />}

        {data && data.content.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nome</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Curso/Semestre</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Delta</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((disc) => (
                    <tr key={disc.id} className="border-b border-border">
                      <td className="py-3 px-4 font-medium">{disc.nome}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {disc.nomeCurso ?? 'Eletiva'} {disc.nomeSemestre ? `- ${disc.nomeSemestre}` : ''}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={disc.temDelta ? 'success' : 'default'}>
                          {disc.temDelta ? 'Sim' : 'Nao'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(disc)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(disc.id)}>
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

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingDisciplina ? 'Editar Disciplina' : 'Nova Disciplina'}>
          <div className="space-y-4">
            <Input
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome da disciplina"
            />
            <Select
              label="Semestre"
              options={semestreOptions}
              value={semestreId}
              onChange={(e) => setSemestreId(e.target.value)}
            />
            <Input
              label="Formula de Avaliacao"
              value={formulaAvaliacao}
              onChange={(e) => setFormulaAvaliacao(e.target.value)}
              placeholder="Ex: 0.4*P1 + 0.4*P2 + 0.2*T"
            />
            <Input
              label="Criterio Barreira"
              value={criterioBarreira}
              onChange={(e) => setCriterioBarreira(e.target.value)}
              placeholder="Ex: Media >= 5"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={temDelta}
                onChange={(e) => setTemDelta(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm">Tem Delta</span>
            </label>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving || !nome.trim() || !semestreId}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AuthGuard>
  );
}
