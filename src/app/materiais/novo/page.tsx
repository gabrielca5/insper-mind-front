'use client';

import { AuthGuard } from '@/components/guards';
import { Card, Button, Input, Textarea, Select, LoadingSpinner } from '@/components/ui';
import { api, fetcher } from '@/lib/api';
import useSWR from 'swr';
import type { Page, Disciplina } from '@/lib/types';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Upload } from 'lucide-react';
import { useState, useRef, Suspense } from 'react';

const tipoOptions = [
  { value: 'PROVA_ANTIGA', label: 'Prova Antiga' },
  { value: 'RESUMO', label: 'Resumo' },
  { value: 'EXERCICIO_RESOLVIDO', label: 'Exercicio Resolvido' },
  { value: 'LISTA', label: 'Lista' },
  { value: 'PDF', label: 'PDF' },
  { value: 'LIVRO', label: 'Livro' },
  { value: 'OUTRO', label: 'Outro' },
];

function NovoMaterialForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: disciplinas } = useSWR<Page<Disciplina>>(`/disciplina?size=200`, fetcher);
  
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [link, setLink] = useState('');
  const [tipo, setTipo] = useState('RESUMO');
  const [disciplinaId, setDisciplinaId] = useState(searchParams.get('disciplinaId') || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const disciplinaOptions = [
    { value: '', label: 'Selecione uma disciplina' },
    ...(disciplinas?.content.map((d) => ({ value: String(d.id), label: d.nome })) ?? []),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!disciplinaId) {
      setError('Selecione uma disciplina');
      return;
    }

    setLoading(true);
    try {
      if (uploadMode && file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('disciplinaId', disciplinaId);
        if (titulo) formData.append('titulo', titulo);
        if (descricao) formData.append('descricao', descricao);
        await api.upload('/material/upload', formData);
      } else {
        if (!titulo || !link) {
          setError('Titulo e link sao obrigatorios');
          setLoading(false);
          return;
        }
        await api.post('/material', {
          titulo,
          descricao,
          link,
          tipo,
          disciplinaId: Number(disciplinaId),
        });
      }
      router.push('/materiais');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar material');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => setUploadMode(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${!uploadMode ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => setUploadMode(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${uploadMode ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
        >
          Upload de Arquivo
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Disciplina"
          options={disciplinaOptions}
          value={disciplinaId}
          onChange={(e) => setDisciplinaId(e.target.value)}
          required
        />

        {uploadMode ? (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Arquivo</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {file ? file.name : 'Clique para selecionar um arquivo'}
                </p>
              </div>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <Input
              label="Titulo (opcional)"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Nome do material"
            />
            <Textarea
              label="Descricao (opcional)"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Breve descricao do material"
              rows={3}
            />
          </>
        ) : (
          <>
            <Input
              label="Titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Nome do material"
              required
            />
            <Textarea
              label="Descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Breve descricao do material"
              rows={3}
              required
            />
            <Input
              label="Link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              required
            />
            <Select
              label="Tipo"
              options={tipoOptions}
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            />
          </>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading || (uploadMode && !file)}>
          {loading ? 'Salvando...' : 'Criar Material'}
        </Button>
      </form>
    </Card>
  );
}

export default function NovoMaterialPage() {
  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto">
        <Link href="/materiais" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Voltar para Materiais
        </Link>
        <h1 className="text-2xl font-bold mb-6">Novo Material</h1>
        <Suspense fallback={<LoadingSpinner />}>
          <NovoMaterialForm />
        </Suspense>
      </div>
    </AuthGuard>
  );
}
