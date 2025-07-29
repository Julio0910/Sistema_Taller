// src/components/ProtectedRoute.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no está cargando y no hay usuario, redirige al login
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Muestra un mensaje de carga mientras se verifica el usuario
  if (loading) {
    return <p>Cargando...</p>;
  }

  // Si hay usuario, muestra la página solicitada
  if (user) {
    return <>{children}</>;
  }

  // Retorna null por defecto mientras redirige
  return null;
}