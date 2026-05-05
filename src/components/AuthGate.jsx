import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function AuthGate({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth?.email) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          authNotice: 'Você não está logado. Faça login para continuar.',
        }}
      />
    );
  }

  return children;
}
