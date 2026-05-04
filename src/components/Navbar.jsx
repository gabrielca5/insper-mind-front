import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';

export function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.logo}>
          <span className={styles.logoMark}>IM</span>
          <span className={styles.logoText}>Insper<em>Mind</em></span>
        </NavLink>
        <ul className={styles.links}>
          <li><NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>Catálogo</NavLink></li>
          <li><NavLink to="/materiais" className={({ isActive }) => isActive ? styles.active : ''}>Materiais</NavLink></li>
          <li><NavLink to="/docentes" className={({ isActive }) => isActive ? styles.active : ''}>Docentes</NavLink></li>
          <li><NavLink to="/usuarios" className={({ isActive }) => isActive ? styles.active : ''}>Usuários</NavLink></li>
        </ul>
      </div>
    </nav>
  );
}
