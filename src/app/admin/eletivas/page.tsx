'use client';

import { AuthGuard } from '@/components/guards';
import { Card, LoadingSpinner, EmptyState, Pagination, Badge, Button, Modal, Input } from '@/components/ui';
import { fetcher, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import useSWR from 'swr';
import type { Page, Eletiva } from '@/lib/types';
import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminEletivasPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEletiva, setEditingEletiva] = useState<Eletiva | null>(null);
  const [nome, setNome] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState('');
  const [semestreMinimo, setSemestreMinimo] = useState('');
  const [formulaAvaliacao, setFormulaAvaliacao] = useState('');
  const [temDelta, setTemDelta] = useState(false);
  const [criterioBarreira, setCriterioBarreira] = useState('');
  const [saving, setSaving] = useState(false);
  
  const { data, error, isLoading, mutate } = useSWR<Page<Eletiva>>(isAdmin ? `/eletivas?page=${page}&size=20` : null, fetcher);

  if (!isAdmin) {
    router.push('/dashboard');
    return null;
  }

  const openCreate = () => {
    setEditingEletiva(null);
    setNome('');
    setCargaHoraria('');
    setSemestreMinimo('');
    setFormulaAvaliacao('');
    setTemDelta(false);
    setCriterioBarreira('');
    setModalOpen(true);
  };

  const openEdit = (eletiva: Eletiva) => {
    setEditingEletiva(eletiva);
    setNome(eletiva.nome);
    setCargaHoraria(String(eletiva.cargaHoraria));
    setSemestreMinimo(String(eletiva.semestreMinimo));
    setFormulaAvaliacao(eletiva.formulaAvaliacao);
    setTemDelta(eletiva.temDelta);
    setCriterioBarreira(eletiva.criterioBarreira);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!nome.trim() || !cargaHoraria || !semestreMinimo) return;
    setSaving(true);
    try {
      const payload = {
        nome,
        cargaHoraria: Number(cargaHoraria),
        semestreMinimo: Number(semestreMinimo),
        formulaAvaliacao,
        temDelta,
        criterioBarreira,
        docenteIds: editingEletiva?.docentes.map((d) => d.id) ?? [],
      };
      if (editingEletiva) {
        await api.put(`/eletivas/${editingEletiva.id}`, payload);
      } else {
        await api.post('/eletivas', payload);
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
    if (!confirm('Tem certeza que deseja excluir esta eletiva?')) return;
    try {
      await api.delete(`/eletivas/${id}`);
      mutate();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Eletivas</h1>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Nova Eletiva
          </Button>
        </div>

        {isLoading && <LoadingSpinner />}
        {error && <p className="text-destructive">Erro ao carregar eletivas</p>}
        {data && data.content.length === 0 && <EmptyState message="Nenhuma eletiva encontrada" />}

        {data && data.content.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nome</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Carga Horaria</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sem. Min.</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Delta</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((eletiva) => (
                    <tr key={eletiva.id} className="border-b border-border">
                      <td className="py-3 px-4 font-medium">{eletiva.nome}</td>
                      <td className="py-3 px-4 text-muted-foreground">{eletiva.cargaHoraria}h</td>
                      <td className="py-3 px-4 text-muted-foreground">{eletiva.semestreMinimo}o</td>
                      <td className="py-3 px-4">
                        <Badge variant={eletiva.temDelta ? 'success' : 'default'}>
                          {eletiva.temDelta ? 'Sim' : 'Nao'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(eletiva)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(eletiva.id)}>
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

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingEletiva ? 'Editar Eletiva' : 'Nova Eletiva'}>
          <div className="space-y-4">
            <Input
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome da eletiva"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Carga Horaria (h)"
                type="number"
                value={cargaHoraria}
                onChange={(e) => setCargaHoraria(e.target.value)}
                placeholder="60"
              />
              <Input
                label="Semestre Minimo"
                type="number"
                value={semestreMinimo}
                onChange={(e) => setSemestreMinimo(e.target.value)}
                placeholder="3"
              />
            </div>
            <Input
              label="Formula de Avaliacao"
              value={formulaAvaliacao}
              onChange={(e) => setFormulaAvaliacao(e.target.value)}
              placeholder="Ex: 0.5*P + 0.5*T"
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
              <Button onClick={handleSave} disabled={saving || !nome.trim() || !cargaHoraria || !semestreMinimo}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AuthGuard>
  );
}
