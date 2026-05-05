import { useEffect, useState } from 'react';
import { listenAuth, readAuth } from '../services/authStorage';

export function useAuth() {
  const [auth, setAuth] = useState(() => readAuth());

  useEffect(() => listenAuth(setAuth), []);

  return auth;
}
