import { useEffect, useState } from 'react';
import { cursoService } from '../services/cursoService';
import { CursoCard } from '../components/CursoCard';
import { LoadingSpinner, EmptyState } from '../components/UI';
import styles from './Home.module.css';

export function Home() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cursoService.list().then((data) => {
      setCursos(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.heroTag}>Plataforma Acadêmica</span>
          <h1 className={styles.heroTitle}>
            Seu catálogo de<br />
            <em>conhecimento</em> Insper
          </h1>
          <p className={styles.heroSub}>
            Explore cursos, disciplinas, materiais e muito mais em um só lugar.
          </p>
        </div>
        <div className={styles.heroBg} aria-hidden="true">
          <div className={styles.blob1} />
          <div className={styles.blob2} />
        </div>
      </section>

      {/* Cursos */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Cursos disponíveis</h2>
          <p className={styles.sectionSub}>Escolha seu curso e explore as disciplinas</p>
        </div>

        {loading ? (
          <LoadingSpinner message="Carregando cursos..." />
        ) : cursos.length === 0 ? (
          <EmptyState icon="📚" title="Nenhum curso encontrado" subtitle="Aguarde a API estar disponível." />
        ) : (
          <div className={styles.grid}>
            {cursos.map((curso) => (
              <CursoCard key={curso.id} curso={curso} />
            ))}
          </div>
        )}
      </section>

      {/* Feature cards */}
      <section className={styles.section}>
        <div className={styles.featureGrid}>
          {[
            { icon: '📖', title: 'Materiais', desc: 'Acesse PDFs, vídeos, slides e artigos de cada disciplina.' },
            { icon: '👩‍🏫', title: 'Docentes', desc: 'Conheça os professores e suas áreas de atuação.' },
            { icon: '⭐', title: 'Favoritos', desc: 'Salve seus conteúdos preferidos para acesso rápido.' },
          ].map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
