// src/app/(dashboard)/layout.tsx
"use client"; // Necesario para usar hooks y funciones de cliente

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth(); // Obtenemos el usuario del contexto
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login'); // Redirige al login después de cerrar sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("No se pudo cerrar la sesión.");
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen">
        <header className="bg-primary text-primary-foreground p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              Gestión Taller
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/pos" className="hover:text-gray-300">Punto de Venta</Link>
              <Link href="/inventario" className="hover:text-gray-300">Inventario</Link>
              <Link href="/clientes" className="hover:text-gray-300">Clientes</Link>
              {/* El botón solo aparece si hay un usuario logueado */}
              {user && (
                <Button variant="secondary" onClick={handleLogout}>
                  Cerrar Sesión
                </Button>
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1 p-6 bg-secondary overflow-y-auto">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}