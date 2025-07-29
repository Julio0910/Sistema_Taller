// src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Definimos el tipo de datos que tendrá nuestro contexto
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// Creamos el contexto
const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

// Creamos el "Proveedor" que envolverá nuestra aplicación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Esta función de Firebase se ejecuta cada vez que el estado de login cambia
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Limpiamos el listener al salir
    return () => unsubscribe();
  }, []);

  const value = { user, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Creamos un "hook" personalizado para usar el contexto fácilmente
export function useAuth() {
  return useContext(AuthContext);
}