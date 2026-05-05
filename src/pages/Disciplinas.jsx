import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, RefreshCw, Search } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { DisciplinaCard } from '../components/DisciplinaCard';
import { EmptyState, LoadingSpinner } from '../components/UI';
import { cursoService } from '../services/cursoService';
import { disciplinaService } from '../services/disciplinaService';
import styles from './Disciplinas.module.css';

const ALL = 'TODOS';
const PAGE_SIZE = 200;

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getCourseKey(disciplina) {
  return disciplina.cursoId ? String(disciplina.cursoId) : disciplina.nomeCurso ?? '';
}

function getSemesterLabel(disciplina) {
  if (disciplina.nomeSemestre) return disciplina.nomeSemestre;
  if (disciplina.semestre) return `${disciplina.semestre}o semestre`;
  if (disciplina.semestreId) return `Semestre #${disciplina.semestreId}`;
  return 'Sem semestre';
}

function getCourseOptions(cursos, disciplinas) {
  const options = new Map();

  cursos.forEach((curso) => {
    if (curso.id) options.set(String(curso.id), curso.nome ?? `Curso #${curso.id}`);
  });

  disciplinas.forEach((disciplina) => {
    const key = getCourseKey(disciplina);
    if (key && !options.has(key)) {
      options.set(key, disciplina.nomeCurso ?? `Curso #${disciplina.cursoId}`);
    }
  });

  return [...options.entries()].map(([value, label]) => ({ value, label }));
}

function getSemesterOptions(disciplinas) {
  const labels = new Set(disciplinas.map(getSemesterLabel).filter(Boolean));
  return [...labels].sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));
}

export function Disciplinas() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [cursoFiltro, setCursoFiltro] = useState(ALL);
  const [semestreFiltro, setSemestreFiltro] = useState(ALL);
  const [message, setMessage] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setMessage('');

    try {
      const [disciplinasPage, cursosData] = await Promise.all([
        disciplinaService.listPage(0, PAGE_SIZE, 'nome,asc'),
        cursoService.list({ size: 100 }),
      ]);

      setDisciplinas(disciplinasPage.items ?? []);
      setCursos(cursosData ?? []);
    } catch {
      setMessage('Nao foi possivel carregar disciplinas agora.');
      setDisciplinas([]);
      setCursos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const courseOptions = useMemo(
    () => getCourseOptions(cursos, disciplinas),
    [cursos, disciplinas]
  );

  const semesterOptions = useMemo(
    () => getSemesterOptions(disciplinas),
    [disciplinas]
  );

  const disciplinasFiltradas = useMemo(() => {
    const termo = normalizeText(busca);

    return disciplinas.filter((disciplina) => {
      const courseMatches = cursoFiltro === ALL || getCourseKey(disciplina) === cursoFiltro;
      const semesterMatches = semestreFiltro === ALL || getSemesterLabel(disciplina) === semestreFiltro;
      const textMatches = !termo || normalizeText([
        disciplina.nome,
        disciplina.nomeCurso,
        disciplina.nomeSemestre,
        disciplina.formulaAvaliacao,
        disciplina.criterioBarreira,
      ].filter(Boolean).join(' ')).includes(termo);

      return courseMatches && semesterMatches && textMatches;
    });
  }, [busca, cursoFiltro, disciplinas, semestreFiltro]);

  const totalComDelta = useMemo(
    () => disciplinas.filter((disciplina) => Boolean(disciplina.temDelta)).length,
    [disciplinas]
  );

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Breadcrumb items={[{ label: 'Painel', to: '/' }, { label: 'Disciplinas' }]} />

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Disciplinas</h1>
            <p className={styles.sub}>
              Consulte as disciplinas cadastradas pela rota GET /disciplina.
            </p>
          </div>

          <button type="button" className={styles.secondaryBtn} onClick={loadData}>
            <RefreshCw size={16} />
            Recarregar
          </button>
        </header>

        {message && <p className={styles.message}>{message}</p>}

        <section className={styles.dashboard} aria-label="Resumo de disciplinas">
          <div className={styles.statCard}>
            <span>Total</span>
            <strong>{disciplinas.length}</strong>
          </div>
          <div className={styles.statCard}>
            <span>Cursos</span>
            <strong>{courseOptions.length}</strong>
          </div>
          <div className={styles.statCard}>
            <span>Com delta</span>
            <strong>{totalComDelta}</strong>
          </div>
        </section>

        <section className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search size={16} />
            <input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por nome, curso, semestre ou criterio..."
              aria-label="Buscar disciplinas"
            />
          </label>

          <div className={styles.filters}>
            <label className={styles.selectLabel}>
              <Filter size={14} />
              <select value={cursoFiltro} onChange={(event) => setCursoFiltro(event.target.value)}>
                <option value={ALL}>Todos os cursos</option>
                {courseOptions.map((curso) => (
                  <option key={curso.value} value={curso.value}>{curso.label}</option>
                ))}
              </select>
            </label>

            <label className={styles.selectLabel}>
              <Filter size={14} />
              <select value={semestreFiltro} onChange={(event) => setSemestreFiltro(event.target.value)}>
                <option value={ALL}>Todos os semestres</option>
                {semesterOptions.map((semestre) => (
                  <option key={semestre} value={semestre}>{semestre}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {loading ? (
          <LoadingSpinner message="Carregando disciplinas..." />
        ) : disciplinasFiltradas.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Nenhuma disciplina encontrada"
            subtitle="Tente limpar os filtros ou recarregar a listagem."
          />
        ) : (
          <>
            <div className={styles.resultHeader}>
              <span>{disciplinasFiltradas.length} resultado(s)</span>
              <Link to="/admin/rotas/disciplinas" className={styles.routeLink}>
                Ver rota no admin
              </Link>
            </div>

            <div className={styles.grid}>
              {disciplinasFiltradas.map((disciplina) => (
                <DisciplinaCard key={disciplina.id} disciplina={disciplina} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
