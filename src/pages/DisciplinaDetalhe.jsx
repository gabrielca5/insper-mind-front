import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { disciplinaService } from '../services/disciplinaService';
import { materialService, SUPPORTED_MATERIAL_TYPES } from '../services/materialService';
import { docenteService } from '../services/docenteService';
import { useAuth } from '../hooks/useAuth';
import { FormModal } from '../components/FormModal';
import { MaterialCard } from '../components/MaterialCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { LoadingSpinner, EmptyState } from '../components/UI';
import styles from './DisciplinaDetalhe.module.css';

function getSemestreLabel(disciplina) {
  if (disciplina?.nomeSemestre) return disciplina.nomeSemestre;
  if (disciplina?.semestre) return `${disciplina.semestre}º Semestre`;
  if (disciplina?.semestreId) return `Semestre #${disciplina.semestreId}`;
  return null;
}

export function DisciplinaDetalhe() {
  const { id } = useParams();
  const auth = useAuth();
  const [disciplina, setDisciplina] = useState(null);
  const [materiais, setMateriais] = useState([]);
  const [docente, setDocente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadData = () => {
    setLoading(true);
    disciplinaService.getById(id).then(async (d) => {
      setDisciplina(d);
      const mats = await materialService.listByDisciplina(id);
      setMateriais(mats);
      if (d?.docenteEmail) {
        const doc = await docenteService.getByEmail(d.docenteEmail);
        setDocente(doc);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const createFields = [
    { name: 'titulo', label: 'Título', required: true },
    { name: 'descricao', label: 'Descrição', type: 'textarea' },
    { name: 'link', label: 'Link', type: 'url', required: true },
    {
      name: 'tipo',
      label: 'Tipo',
      type: 'select',
      required: true,
      defaultValue: SUPPORTED_MATERIAL_TYPES[0],
      options: SUPPORTED_MATERIAL_TYPES.map((tipo) => ({
        value: tipo,
        label: tipo,
      })),
    },
    { name: 'disciplinaId', type: 'hidden', valueType: 'number', defaultValue: Number(id) },
    {
      name: 'emailUsuario',
      label: 'Email do usuário',
      type: 'email',
      required: true,
      disabled: Boolean(auth?.email),
      defaultValue: auth?.email ?? '',
    },
  ];

  const handleCreateMaterial = async (payload) => {
    const material = await materialService.save(payload);
    setMessage('Material enviado.');
    loadData();
    return material;
  };

  if (loading) return <LoadingSpinner message="Carregando disciplina..." />;
  if (!disciplina) return (
    <div className={styles.page}>
      <EmptyState icon="📋" title="Disciplina não encontrada" />
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Breadcrumb items={[
          { label: 'Painel', to: '/' },
          { label: 'Disciplinas', to: '/disciplinas' },
          ...(disciplina.cursoId ? [{ label: disciplina.nomeCurso ?? 'Curso', to: `/cursos/${disciplina.cursoId}` }] : []),
          { label: disciplina.nome },
        ]} />

        <header className={styles.header}>
          {getSemestreLabel(disciplina) && (
            <span className={styles.semBadge}>{getSemestreLabel(disciplina)}</span>
          )}
          <h1 className={styles.title}>{disciplina.nome}</h1>
          {disciplina.descricao && (
            <p className={styles.desc}>{disciplina.descricao}</p>
          )}
        </header>

        <section className={styles.infoGrid} aria-label="Dados da disciplina">
          <div className={styles.infoItem}>
            <span>Curso</span>
            <strong>{disciplina.nomeCurso ?? (disciplina.cursoId ? `Curso #${disciplina.cursoId}` : 'Nao informado')}</strong>
          </div>
          <div className={styles.infoItem}>
            <span>Formula</span>
            <strong>{disciplina.formulaAvaliacao ?? 'Nao informada'}</strong>
          </div>
          <div className={styles.infoItem}>
            <span>Delta</span>
            <strong>{disciplina.temDelta ? 'Sim' : 'Nao'}</strong>
          </div>
          <div className={styles.infoItem}>
            <span>Criterio de barreira</span>
            <strong>{disciplina.criterioBarreira ?? 'Nao informado'}</strong>
          </div>
        </section>

        {docente && (
          <div className={styles.docenteBox}>
            <span className={styles.docenteLabel}>Docente responsável</span>
            <p className={styles.docenteName}>{docente.nome}</p>
            <p className={styles.docenteEmail}>{docente.email}</p>
          </div>
        )}

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              Materiais <span className={styles.count}>{materiais.length}</span>
            </h2>
            <FormModal
              title="Enviar material"
              triggerLabel="Enviar material"
              submitLabel="POST /material"
              fields={createFields}
              disabled={!auth?.email}
              disabledTitle="Faça login para enviar material"
              onSubmit={handleCreateMaterial}
            />
          </div>
          {message && <p className={styles.message}>{message}</p>}
          {materiais.length === 0 ? (
            <EmptyState
              icon="📦"
              title="Nenhum material cadastrado"
              subtitle="Os materiais desta disciplina ainda não foram registrados na API."
            />
          ) : (
            <div className={styles.list}>
              {materiais.map((m) => (
                <MaterialCard key={m.id} material={m} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
