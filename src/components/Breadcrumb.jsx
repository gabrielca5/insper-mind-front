import { Link } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

export function Breadcrumb({ items }) {
  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      {items.map((item, idx) => (
        <span key={idx} className={styles.item}>
          {idx > 0 && <span className={styles.sep}>/</span>}
          {item.to ? (
            <Link to={item.to} className={styles.link}>{item.label}</Link>
          ) : (
            <span className={styles.current}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
