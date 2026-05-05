import { HashRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { CursoDetalhe } from './pages/CursoDetalhe';
import { DisciplinaDetalhe } from './pages/DisciplinaDetalhe';
import { Materiais } from './pages/Materiais';
import { MaterialDetalhe } from './pages/MaterialDetalhe';
import { Docentes } from './pages/Docentes';
import { DocenteDetalhe } from './pages/DocenteDetalhe';
import { Usuarios } from './pages/Usuarios';
import { UsuarioDetalhe } from './pages/UsuarioDetalhe';
import { Comentarios } from './pages/Comentarios';
import { Favoritos } from './pages/Favoritos';
import { Perfil } from './pages/Perfil';
import { Admin } from './pages/Admin';
import { ApiRoutes } from './pages/ApiRoutes';
import { Conta } from './pages/Conta';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <HashRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"                        element={<Home />} />
          <Route path="/cursos/:id"              element={<CursoDetalhe />} />
          <Route path="/disciplinas/:id"         element={<DisciplinaDetalhe />} />
          <Route path="/materiais"               element={<Materiais />} />
          <Route path="/materiais/:id"           element={<MaterialDetalhe />} />
          <Route path="/docentes"                element={<Docentes />} />
          <Route path="/docentes/:email"         element={<DocenteDetalhe />} />
          <Route path="/usuarios"                element={<Usuarios />} />
          <Route path="/usuarios/:email"         element={<UsuarioDetalhe />} />
          <Route path="/comentarios"             element={<Comentarios />} />
          <Route path="/favoritos"               element={<Favoritos />} />
          <Route path="/perfil"                  element={<Perfil />} />
          <Route path="/admin"                   element={<Admin />} />
          <Route path="/login"                   element={<Conta />} />
          <Route path="/cadastro"                element={<Conta />} />
          <Route path="/rotas"                   element={<ApiRoutes />} />
          <Route path="/rotas/:resourceKey"      element={<ApiRoutes />} />
          <Route path="*"                        element={<NotFound />} />
        </Routes>
      </main>
    </HashRouter>
  );
}
