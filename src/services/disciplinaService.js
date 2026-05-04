// disciplinaService.js
// NOTA: O backend possui a entidade Disciplina mas o controller ainda está vazio (stub).
// Mock mínimo e coerente com CC e EC do Insper.

import api from './api';

const MOCK_DISCIPLINAS = [
  // Ciência da Computação (cursoId: 1)
  { id: 1, cursoId: 1, nome: 'Algoritmos e Estruturas de Dados', descricao: 'Fundamentos de algoritmos, complexidade e estruturas como árvores, grafos e tabelas hash.', semestre: 2, docenteEmail: null },
  { id: 2, cursoId: 1, nome: 'Sistemas Operacionais', descricao: 'Processos, memória, sistemas de arquivos e segurança em SOs modernos.', semestre: 4, docenteEmail: null },
  { id: 3, cursoId: 1, nome: 'Inteligência Artificial', descricao: 'Busca, representação do conhecimento, aprendizado de máquina e redes neurais.', semestre: 6, docenteEmail: null },
  { id: 4, cursoId: 1, nome: 'Engenharia de Software', descricao: 'Metodologias ágeis, arquitetura de software, testes e qualidade.', semestre: 5, docenteEmail: null },
  { id: 5, cursoId: 1, nome: 'Banco de Dados', descricao: 'Modelagem relacional, SQL, NoSQL e otimização de consultas.', semestre: 3, docenteEmail: null },
  // Engenharia da Computação (cursoId: 2)
  { id: 6, cursoId: 2, nome: 'Eletrônica Digital', descricao: 'Circuitos combinacionais, sequenciais, FPGAs e lógica programável.', semestre: 2, docenteEmail: null },
  { id: 7, cursoId: 2, nome: 'Sistemas Embarcados', descricao: 'Microcontroladores, RTOS, interfaces de hardware e programação de baixo nível.', semestre: 5, docenteEmail: null },
  { id: 8, cursoId: 2, nome: 'Redes de Computadores', descricao: 'Modelos OSI/TCP-IP, protocolos, segurança e infraestrutura de redes.', semestre: 4, docenteEmail: null },
  { id: 9, cursoId: 2, nome: 'Sinais e Sistemas', descricao: 'Transformadas, análise no domínio da frequência e processamento de sinais.', semestre: 3, docenteEmail: null },
  { id: 10, cursoId: 2, nome: 'Arquitetura de Computadores', descricao: 'Pipeline, hierarquia de memória, paralelismo e organizações modernas de CPUs.', semestre: 3, docenteEmail: null },
];

export const disciplinaService = {
  async list(params = {}) {
    try {
      const response = await api.get('/disciplina', { params });
      const data = response.data;
      return Array.isArray(data) ? data : data.content ?? MOCK_DISCIPLINAS;
    } catch {
      return MOCK_DISCIPLINAS;
    }
  },

  async listByCurso(cursoId) {
    try {
      const response = await api.get(`/disciplina?cursoId=${cursoId}`);
      const data = response.data;
      return Array.isArray(data) ? data : data.content ?? MOCK_DISCIPLINAS.filter((d) => d.cursoId === Number(cursoId));
    } catch {
      return MOCK_DISCIPLINAS.filter((d) => d.cursoId === Number(cursoId));
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/disciplina/${id}`);
      return response.data;
    } catch {
      return MOCK_DISCIPLINAS.find((d) => d.id === Number(id)) ?? null;
    }
  },
};
