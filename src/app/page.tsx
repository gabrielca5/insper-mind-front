'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { BookOpen, FileText, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';

export default function Home() {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && token) {
      router.push('/dashboard');
    }
  }, [token, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Insper Mind</h1>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button>Cadastrar</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
          Portal Academico Insper
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
          Acesse cursos, materiais de estudo e conecte-se com docentes e colegas.
        </p>
        <Link href="/register">
          <Button size="lg">
            Comecar agora <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Estrutura de Cursos</h3>
            <p className="text-sm text-muted-foreground">
              Navegue por cursos, semestres e disciplinas organizadas.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Acervo de Materiais</h3>
            <p className="text-sm text-muted-foreground">
              Provas antigas, resumos, exercicios e muito mais.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Portal de Contatos</h3>
            <p className="text-sm text-muted-foreground">
              Encontre informacoes de docentes e participe do forum.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
