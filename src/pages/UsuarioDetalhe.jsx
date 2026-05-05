import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usuarioService } from '../services/usuarioService';
import { Breadcrumb } from '../components/Breadcrumb';
import { LoadingSpinner, EmptyState } from '../components/UI';
import styles from './UsuarioDetalhe.module.css';

function getInitials(nome) {
  return (nome ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

export function UsuarioDetalhe() {
  const { email } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usuarioService.getByEmail(decodeURIComponent(email)).then((u) => {
      setUsuario(u);
      setLoading(false);
    });
  }, [email]);

  if (loading) return <LoadingSpinner message="Carregando usuário..." />;
  if (!usuario) return (
    <div className={styles.page}>
      <EmptyState icon="👤" title="Usuário não encontrado" />
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Breadcrumb items={[
          { label: 'Catálogo', to: '/' },
          { label: 'Usuários', to: '/usuarios' },
          { label: usuario.nome },
        ]} />

        <div className={styles.profile}>
          <div className={styles.avatar}>{getInitials(usuario.nome)}</div>
          <div className={styles.info}>
            <h1 className={styles.name}>{usuario.nome}</h1>
            <p className={styles.email}>{usuario.email}</p>
            {usuario.dataCriacao && (
              <p className={styles.since}>
                Membro desde {new Date(usuario.dataCriacao).toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>

        <div className={styles.futureSections}>
          {[
            { icon: '⭐', label: 'Favoritos', to: '/favoritos' },
            { icon: '💬', label: 'Comentários', to: '/comentarios' },
          ].map((s) => (
            <Link key={s.label} to={s.to} className={styles.futureCard}>
              <span className={styles.futureIcon}>{s.icon}</span>
              <div>
                <p className={styles.futureTitle}>{s.label}</p>
                <p className={styles.futureSub}>Abrir tela de {s.label.toLowerCase()}.</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
