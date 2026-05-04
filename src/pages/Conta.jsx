import { useState } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { usuarioService } from '../services/usuarioService';
import styles from './Conta.module.css';

const initialCadastro = {
  nome: '',
  email: '',
  senha: '',
};

const initialLogin = {
  email: '',
  senha: '',
};

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.response?.data || error?.message || 'Erro na chamada.';
}

export function Conta() {
  const [cadastro, setCadastro] = useState(initialCadastro);
  const [login, setLogin] = useState(initialLogin);
  const [loadingCadastro, setLoadingCadastro] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [cadastroMsg, setCadastroMsg] = useState('');
  const [loginMsg, setLoginMsg] = useState('');
  const [error, setError] = useState('');

  const updateCadastro = (field, value) => {
    setCadastro((current) => ({ ...current, [field]: value }));
  };

  const updateLogin = (field, value) => {
    setLogin((current) => ({ ...current, [field]: value }));
  };

  const handleCadastro = async (event) => {
    event.preventDefault();
    setError('');
    setCadastroMsg('');
    setLoadingCadastro(true);

    try {
      const usuario = await usuarioService.save(cadastro);
      setCadastroMsg(`Conta criada para ${usuario.nome ?? cadastro.nome}.`);
      setLogin({ email: cadastro.email, senha: cadastro.senha });
      setCadastro(initialCadastro);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingCadastro(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoginMsg('');
    setLoadingLogin(true);

    try {
      const response = await usuarioService.login(login);
      localStorage.setItem('insperMindLogin', String(response));
      localStorage.setItem('insperMindEmail', login.email);
      setLoginMsg('Login realizado com sucesso.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Breadcrumb items={[{ label: 'Catálogo', to: '/' }, { label: 'Conta' }]} />

        <header className={styles.header}>
          <h1 className={styles.title}>Conta</h1>
          <p className={styles.sub}>Cadastro e login usando as rotas do Swagger.</p>
        </header>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.grid}>
          <form className={styles.panel} onSubmit={handleCadastro}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Criar conta</h2>
              <code>POST /usuario</code>
            </div>

            <label className={styles.label}>
              <span>Nome</span>
              <input
                className={styles.input}
                value={cadastro.nome}
                onChange={(event) => updateCadastro('nome', event.target.value)}
                required
              />
            </label>

            <label className={styles.label}>
              <span>Email</span>
              <input
                className={styles.input}
                type="email"
                value={cadastro.email}
                onChange={(event) => updateCadastro('email', event.target.value)}
                required
              />
            </label>

            <label className={styles.label}>
              <span>Senha</span>
              <input
                className={styles.input}
                type="password"
                value={cadastro.senha}
                onChange={(event) => updateCadastro('senha', event.target.value)}
                required
              />
            </label>

            <button className={styles.button} type="submit" disabled={loadingCadastro}>
              {loadingCadastro ? 'Criando...' : 'Criar conta'}
            </button>

            {cadastroMsg && <p className={styles.success}>{cadastroMsg}</p>}
          </form>

          <form className={styles.panel} onSubmit={handleLogin}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Entrar</h2>
              <code>POST /usuario/login</code>
            </div>

            <label className={styles.label}>
              <span>Email</span>
              <input
                className={styles.input}
                type="email"
                value={login.email}
                onChange={(event) => updateLogin('email', event.target.value)}
                required
              />
            </label>

            <label className={styles.label}>
              <span>Senha</span>
              <input
                className={styles.input}
                type="password"
                value={login.senha}
                onChange={(event) => updateLogin('senha', event.target.value)}
                required
              />
            </label>

            <button className={styles.button} type="submit" disabled={loadingLogin}>
              {loadingLogin ? 'Entrando...' : 'Entrar'}
            </button>

            {loginMsg && <p className={styles.success}>{loginMsg}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
