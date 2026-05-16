export type Role = 'USER' | 'ADMIN';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: Role;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface Curso {
  id: number;
  nome: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface Semestre {
  id: number;
  nome: string;
  cursoId: number;
  cursoNome: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface DocenteResumo {
  id: number;
  nome: string;
  email: string;
}

export interface Disciplina {
  id: number;
  nome: string;
  dataAtualizacao: string;
  formulaAvaliacao: string;
  temDelta: boolean;
  criterioBarreira: string;
  semestreId: number | null;
  nomeSemestre: string | null;
  cursoId: number | null;
  nomeCurso: string | null;
  docentes: DocenteResumo[];
}

export interface Docente {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface Eletiva {
  id: number;
  nome: string;
  cargaHoraria: number;
  semestreMinimo: number;
  formulaAvaliacao: string;
  temDelta: boolean;
  criterioBarreira: string;
  docentes: DocenteResumo[];
  dataAtualizacao: string;
  dataCriacao: string;
}

export type TipoMaterial = 'PROVA_ANTIGA' | 'RESUMO' | 'EXERCICIO_RESOLVIDO' | 'LISTA' | 'PDF' | 'LIVRO' | 'OUTRO';

export interface Material {
  id: number;
  titulo: string;
  descricao: string;
  link: string;
  tipo: TipoMaterial;
  usuarioId: number;
  usuarioNome: string;
  disciplinaId: number;
  disciplinaNome: string;
  curtidas: number;
  curtiuUsuarioLogado: boolean;
  dataCriacao: string;
  arquivo: string | null;
}

export interface Comentario {
  id: number;
  comentario: string;
  curtidas: number;
  curtiuUsuarioLogado: boolean;
  usuarioId: number;
  usuarioNome: string;
  disciplinaId: number | null;
  disciplinaNome: string | null;
  materialId: number | null;
  materialTitulo: string | null;
  comentarioPaiId: number | null;
  dataCriacao: string;
  respostasCount: number;
}

export type TipoFavorito = 'MATERIAL' | 'ELETIVA';

export interface Favorito {
  id: number;
  tipo: TipoFavorito;
  materialId: number | null;
  materialTitulo: string | null;
  eletivaId: number | null;
  eletivaNome: string | null;
  dataSalvo: string;
}

export type CategoriaForum = 'ADMINISTRATIVO' | 'TECNICO' | 'GERAL';

export interface PostForum {
  id: number;
  titulo: string;
  conteudo: string;
  usuarioId: number;
  usuarioNome: string;
  categoria: CategoriaForum;
  curtidas: number;
  curtiuUsuarioLogado: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
