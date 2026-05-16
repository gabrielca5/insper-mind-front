'use client';

import { AuthGuard } from '@/components/guards';
import { Card, Button, Input, Textarea, Select } from '@/components/ui';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const categoriaOptions = [
  { value: 'GERAL', label: 'Geral' },
  { value: 'ADMINISTRATIVO', label: 'Administrativo' },
  { value: 'TECNICO', label: 'Tecnico' },
];

export default function NovoForumPostPage() {
  const router = useRouter();
  
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [categoria, setCategoria] = useState('GERAL');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!titulo.trim() || !conteudo.trim()) {
      setError('Titulo e conteudo sao obrigatorios');
      return;
    }

    setLoading(true);
    try {
      await api.post('/forum', { titulo, conteudo, categoria });
      router.push('/forum');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto">
        <Link href="/forum" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Voltar para Forum
        </Link>
        <h1 className="text-2xl font-bold mb-6">Novo Post</h1>

        <Card className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Titulo do post"
              required
            />
            <Textarea
              label="Conteudo"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Escreva seu post aqui..."
              rows={8}
              required
            />
            <Select
              label="Categoria"
              options={categoriaOptions}
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Publicando...' : 'Publicar Post'}
            </Button>
          </form>
        </Card>
      </div>
    </AuthGuard>
  );
}
