import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

const quickLinks = [
  { to: '/', label: 'Catálogo', detail: 'Cursos e disciplinas' },
  { to: '/materiais', label: 'Materiais', detail: 'PDFs, vídeos e slides' },
  { to: '/docentes', label: 'Docentes', detail: 'Professores cadastrados' },
];

export function NotFound() {
  return (
    <div className={styles.page}>
      <section className={styles.panel} aria-labelledby="not-found-title">
        <div className={styles.copy}>
          <span className={styles.eyebrow}>Erro 404</span>
          <h1 id="not-found-title" className={styles.title}>
            Essa página saiu da trilha.
          </h1>
          <p className={styles.sub}>
            O endereço não corresponde a nenhuma rota disponível no Insper Mind.
          </p>

          <div className={styles.actions}>
            <Link to="/" className={styles.primaryBtn}>
              Voltar ao catálogo
            </Link>
            <Link to="/materiais" className={styles.secondaryBtn}>
              Ver materiais
            </Link>
          </div>
        </div>

        <div className={styles.visual} aria-hidden="true">
          <span className={styles.code}>404</span>
          <div className={styles.routeBox}>
            <span className={styles.routeLine}>/#/cursos</span>
            <span className={styles.routeLine}>/#/materiais</span>
            <span className={styles.routeLine}>/#/docentes</span>
          </div>
        </div>
      </section>

      <nav className={styles.quickNav} aria-label="Atalhos úteis">
        {quickLinks.map((item) => (
          <Link key={item.to} to={item.to} className={styles.quickLink}>
            <span className={styles.quickTitle}>{item.label}</span>
            <span className={styles.quickDetail}>{item.detail}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
