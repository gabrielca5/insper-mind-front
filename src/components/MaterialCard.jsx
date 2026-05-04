import { materialService } from '../services/materialService';
import styles from './MaterialCard.module.css';

const TIPO_LABELS = {
  PDF: 'PDF',
  VIDEO: 'Vídeo',
  SLIDE: 'Slide',
  ARTIGO: 'Artigo',
  LINK: 'Link',
  EXERCICIO: 'Exercício',
  OUTRO: 'Outro',
};

export function MaterialCard({ material }) {
  const icon = materialService.getTipoIcon(material.tipo);
  const label = TIPO_LABELS[material.tipo] ?? material.tipo ?? 'Material';

  return (
    <article className={styles.card}>
      <div className={styles.iconWrap}>
        <span className={styles.icon}>{icon}</span>
      </div>
      <div className={styles.body}>
        <span className={styles.badge}>{label}</span>
        <h3 className={styles.title}>{material.titulo ?? material.nome}</h3>
        {material.descricao && (
          <p className={styles.desc}>{material.descricao}</p>
        )}
      </div>
      {material.link && material.link !== '#' && (
        <a
          href={material.link}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          Acessar →
        </a>
      )}
    </article>
  );
}
