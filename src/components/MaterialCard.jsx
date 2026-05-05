import { Link } from 'react-router-dom';
import {
  Bookmark,
  Eye,
  ExternalLink,
  Edit,
  Trash2,
} from 'lucide-react';
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

export function MaterialCard({
  material,
  isFavorite = false,
  canFavorite = false,
  canManage = false,
  onFavorite,
  onEdit,
  onDelete,
}) {
  const icon = materialService.getTipoIcon(material.tipo);
  const label = TIPO_LABELS[material.tipo] ?? material.tipo ?? 'Material';

  return (
    <article className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.iconWrap}>
          <span className={styles.icon}>{icon}</span>
        </div>

        <div className={styles.badges}>
          <span className={styles.badge}>{label}</span>
          {isFavorite && <span className={styles.savedBadge}>Salvo</span>}
        </div>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{material.titulo ?? material.nome}</h3>

        {material.nomeCurso && <p className={styles.meta}>{material.nomeCurso}</p>}

        {material.descricao && <p className={styles.desc}>{material.descricao}</p>}

        <div className={styles.stats}>
          <span className={styles.stat}>
            <Bookmark size={16} />
            <strong>{isFavorite ? 'Salvo' : 'Salvar'}</strong>
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        {material.id && (
          <Link to={`/materiais/${material.id}`} className={styles.actionBtn}>
            <Eye size={16} />
            Ver
          </Link>
        )}

        {material.link && material.link !== '#' && (
          <a
            href={material.link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionBtn}
          >
            <ExternalLink size={16} />
            Acessar
          </a>
        )}

        {canFavorite && (
          <button
            type="button"
            className={`${styles.iconBtn} ${isFavorite ? styles.iconBtnActive : ''}`}
            onClick={() => onFavorite?.(material)}
            aria-label={isFavorite ? 'Remover dos salvos' : 'Salvar material'}
            title={isFavorite ? 'Remover dos salvos' : 'Salvar material'}
          >
            <Bookmark size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        )}

        {canManage && (
          <>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => onEdit?.(material)}
              aria-label="Editar material"
              title="Editar material"
            >
              <Edit size={18} />
            </button>

            <button
              type="button"
              className={`${styles.iconBtn} ${styles.danger}`}
              onClick={() => onDelete?.(material)}
              aria-label="Excluir material"
              title="Excluir material"
            >
              <Trash2 size={18} />
            </button>
          </>
        )}
      </div>
    </article>
  );
}
