import { useEffect, useState } from 'react';
import { materialService } from '../services/materialService';
import { MaterialCard } from '../components/MaterialCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { LoadingSpinner, EmptyState } from '../components/UI';
import styles from './Materiais.module.css';

const TIPOS = ['TODOS', 'PDF', 'VIDEO', 'SLIDE', 'ARTIGO', 'LINK', 'EXERCICIO'];

export function Materiais() {
  const [materiais, setMateriais] = useState([]);
  const [filtro, setFiltro] = useState('TODOS');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    materialService.list().then((data) => {
      setMateriais(data);
      setLoading(false);
    });
  }, []);

  const filtrados = filtro === 'TODOS'
    ? materiais
    : materiais.filter((m) => m.tipo === filtro);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Breadcrumb items={[{ label: 'Catálogo', to: '/' }, { label: 'Materiais' }]} />

        <header className={styles.header}>
          <h1 className={styles.title}>Materiais Acadêmicos</h1>
          <p className={styles.sub}>PDFs, vídeos, slides e outros recursos de estudo</p>
        </header>

        <div className={styles.filters}>
          {TIPOS.map((t) => (
            <button
              key={t}
              className={`${styles.filterBtn} ${filtro === t ? styles.active : ''}`}
              onClick={() => setFiltro(t)}
            >
              {t === 'TODOS' ? 'Todos' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner message="Carregando materiais..." />
        ) : filtrados.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Nenhum material encontrado"
            subtitle={filtro !== 'TODOS' ? `Sem materiais do tipo "${filtro}"` : undefined}
          />
        ) : (
          <div className={styles.list}>
            {filtrados.map((m) => (
              <MaterialCard key={m.id} material={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
