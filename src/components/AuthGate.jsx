import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function AuthGate({ children }) {
  const auth = useAuth();

  if (!auth?.email) {
    return <Navigate to="/" replace />;
  }

  return children;
}
