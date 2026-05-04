import { HashRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { CursoDetalhe } from './pages/CursoDetalhe';
import { DisciplinaDetalhe } from './pages/DisciplinaDetalhe';
import { Materiais } from './pages/Materiais';
import { Docentes } from './pages/Docentes';
import { DocenteDetalhe } from './pages/DocenteDetalhe';
import { Usuarios } from './pages/Usuarios';
import { UsuarioDetalhe } from './pages/UsuarioDetalhe';
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
          <Route path="/docentes"                element={<Docentes />} />
          <Route path="/docentes/:email"         element={<DocenteDetalhe />} />
          <Route path="/usuarios"                element={<Usuarios />} />
          <Route path="/usuarios/:email"         element={<UsuarioDetalhe />} />
          <Route path="*"                        element={<NotFound />} />
        </Routes>
      </main>
    </HashRouter>
  );
}
