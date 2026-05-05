import { HashRouter, Navigate, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AuthGate } from './components/AuthGate';
import { AdminGate } from './components/AdminGate';
import { Home } from './pages/Home';
import { CursoDetalhe } from './pages/CursoDetalhe';
import { Disciplinas } from './pages/Disciplinas';
import { DisciplinaDetalhe } from './pages/DisciplinaDetalhe';
import { Materiais } from './pages/Materiais';
import { MaterialDetalhe } from './pages/MaterialDetalhe';
import { Docentes } from './pages/Docentes';
import { DocenteDetalhe } from './pages/DocenteDetalhe';
import { Usuarios } from './pages/Usuarios';
import { UsuarioDetalhe } from './pages/UsuarioDetalhe';
import { Favoritos } from './pages/Favoritos';
import { Perfil } from './pages/Perfil';
import { Admin } from './pages/Admin';
import { ApiRoutes } from './pages/ApiRoutes';
import { Conta } from './pages/Conta';
import { NotFound } from './pages/NotFound';

export default function App() {
  const protectedPage = (page) => <AuthGate>{page}</AuthGate>;
  const protectedAdminPage = (page) => (
    <AuthGate>
      <AdminGate>{page}</AdminGate>
    </AuthGate>
  );

  return (
    <HashRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"                        element={<Home />} />
          <Route path="/cursos/:id"              element={protectedPage(<CursoDetalhe />)} />
          <Route path="/disciplinas"             element={protectedPage(<Disciplinas />)} />
          <Route path="/disciplinas/:id"         element={protectedPage(<DisciplinaDetalhe />)} />
          <Route path="/materiais"               element={protectedPage(<Materiais />)} />
          <Route path="/materiais/:id"           element={protectedPage(<MaterialDetalhe />)} />
          <Route path="/docentes"                element={protectedPage(<Docentes />)} />
          <Route path="/docentes/:email"         element={protectedPage(<DocenteDetalhe />)} />
          <Route path="/usuarios"                element={protectedPage(<Usuarios />)} />
          <Route path="/usuarios/:email"         element={protectedPage(<UsuarioDetalhe />)} />
          <Route path="/comentarios"             element={<Navigate to="/materiais" replace />} />
          <Route path="/favoritos"               element={protectedPage(<Favoritos />)} />
          <Route path="/perfil"                  element={protectedPage(<Perfil />)} />
          <Route path="/admin"                   element={protectedAdminPage(<Admin />)} />
          <Route path="/login"                   element={<Conta />} />
          <Route path="/cadastro"                element={<Conta />} />
          <Route path="/admin/rotas"             element={protectedAdminPage(<ApiRoutes />)} />
          <Route path="/admin/rotas/:resourceKey" element={protectedAdminPage(<ApiRoutes />)} />
          <Route path="/rotas"                   element={<Navigate to="/admin/rotas" replace />} />
          <Route path="/rotas/:resourceKey"      element={<Navigate to="/admin/rotas" replace />} />
          <Route path="*"                        element={protectedPage(<NotFound />)} />
        </Routes>
      </main>
    </HashRouter>
  );
}
