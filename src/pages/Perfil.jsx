import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { FormModal } from '../components/FormModal';
import { EmptyState, LoadingSpinner } from '../components/UI';
import { useAuth } from '../hooks/useAuth';
import { clearAuth, saveAuth } from '../services/authStorage';
import { usuarioService } from '../services/usuarioService';
import styles from './Perfil.module.css';

function profileFields(usuario = {}) {
  return [
    { name: 'nome', label: 'Nome', required: true, defaultValue: usuario.nome ?? '' },
    { name: 'email', label: 'Email', type: 'email', required: true, defaultValue: usuario.email ?? '' },
    { name: 'senha', label: 'Nova senha', type: 'password', defaultValue: '' },
  ];
}

export function Perfil() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadUsuario = useCallback(async () => {
    if (!auth?.email) {
      setUsuario(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const data = await usuarioService.getByEmail(auth.email);
    setUsuario(data);
    setLoading(false);
  }, [auth?.email]);

  useEffect(() => {
    loadUsuario();
  }, [loadUsuario]);

  const fields = useMemo(() => profileFields(usuario ?? { email: auth?.email }), [auth?.email, usuario]);

  const handleUpdate = async (payload) => {
    const cleanPayload = {
      ...payload,
      senha: payload.senha || undefined,
    };
    const updated = await usuarioService.update(auth.email, cleanPayload);
    saveAuth({
      ...auth,
      email: updated.email ?? payload.email,
      nome: updated.nome ?? payload.nome,
      usuario: updated,
    });
    setUsuario(updated);
    setMessage('Perfil atualizado.');
    return updated;
  };

  const handleDelete = async () => {
    if (!usuario?.id) return;
    if (!window.confirm('Excluir sua conta? Essa ação não pode ser desfeita.')) return;

    await usuarioService.deleteById(usuario.id);
    clearAuth();
    navigate('/');
  };

  if (!auth?.email) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <EmptyState icon="👤" title="Faça login para ver seu perfil" />
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner message="Carregando perfil..." />;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Breadcrumb items={[{ label: 'Catálogo', to: '/' }, { label: 'Perfil' }]} />

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>{usuario?.nome ?? auth.email}</h1>
            <p className={styles.sub}>{usuario?.email ?? auth.email}</p>
          </div>
          <div className={styles.actions}>
            <button className={styles.secondaryBtn} type="button" onClick={loadUsuario}>
              Buscar usuário
            </button>
            <FormModal
              title="Editar perfil"
              triggerLabel="Salvar perfil"
              submitLabel="PATCH /usuario/{email}"
              fields={fields}
              onSubmit={handleUpdate}
            />
            <button className={styles.dangerBtn} type="button" onClick={handleDelete} disabled={!usuario?.id}>
              Excluir usuário
            </button>
          </div>
        </header>

        {message && <p className={styles.message}>{message}</p>}

        <section className={styles.card}>
          <dl className={styles.details}>
            <div>
              <dt>ID</dt>
              <dd>{usuario?.id ?? '-'}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{usuario?.email ?? auth.email}</dd>
            </div>
            <div>
              <dt>Criado em</dt>
              <dd>{usuario?.dataCriacao ? new Date(usuario.dataCriacao).toLocaleString('pt-BR') : '-'}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
