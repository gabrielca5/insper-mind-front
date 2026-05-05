import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearAuth, listenAuth, readAuth } from '../services/authStorage';
import { listenTheme, readTheme, THEMES, toggleTheme } from '../services/themeStorage';
import iminLogo from '../img/IminLogo.png';
import styles from './Navbar.module.css';

export function Navbar() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(() => readAuth());
  const [theme, setTheme] = useState(() => readTheme());

  useEffect(() => listenAuth(setAuth), []);
  useEffect(() => listenTheme(setTheme), []);

  const handleLogout = () => {
    clearAuth();
    navigate('/', { replace: true });
  };

  const handleThemeToggle = () => {
    setTheme(toggleTheme(theme));
  };

  const nextThemeLabel = theme === THEMES.dark ? 'tema claro' : 'tema escuro';

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.logo}>
          <span className={styles.logoMark}>
            <img className={styles.logoImage} src={iminLogo} alt="" />
          </span>
          <span className={styles.logoText}>Insper<em>Mind</em></span>
        </NavLink>
        <ul className={styles.links}>
          <li><NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>Painel</NavLink></li>
          {auth && (
            <>
              <li><NavLink to="/materiais" className={({ isActive }) => isActive ? styles.active : ''}>Materiais</NavLink></li>
              <li><NavLink to="/disciplinas" className={({ isActive }) => isActive ? styles.active : ''}>Disciplinas</NavLink></li>
              <li><NavLink to="/favoritos" className={({ isActive }) => isActive ? styles.active : ''}>Favoritos</NavLink></li>
              <li><NavLink to="/docentes" className={({ isActive }) => isActive ? styles.active : ''}>Docentes</NavLink></li>
              <li><NavLink to="/usuarios" className={({ isActive }) => isActive ? styles.active : ''}>Usuários</NavLink></li>
              <li><NavLink to="/admin" className={({ isActive }) => isActive ? styles.active : ''}>Admin</NavLink></li>
            </>
          )}
        </ul>

        <div className={styles.actions}>
          <button
            className={styles.themeToggle}
            type="button"
            onClick={handleThemeToggle}
            aria-label={`Alternar para ${nextThemeLabel}`}
            title={`Alternar para ${nextThemeLabel}`}
          >
            <span className={styles.themeKnob} aria-hidden="true" />
            <span>{theme === THEMES.dark ? 'Claro' : 'Escuro'}</span>
          </button>
          {auth ? (
            <div className={styles.session}>
              <NavLink to="/perfil" className={styles.profileLink}>
                {auth.email}
              </NavLink>
              <button className={styles.logout} type="button" onClick={handleLogout}>
                Sair
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? `${styles.accountLink} ${styles.active}` : styles.accountLink
              }
            >
              Conta
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
