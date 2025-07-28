import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css"; // <-- ESTA LÍNEA ES CRÍTICA

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema Taller",
  description: "Sistema de gestión para taller y venta de repuestos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="flex flex-col h-screen">
          <header className="bg-primary text-primary-foreground p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-xl font-bold">
                Gestión Taller
              </Link>
              <nav className="space-x-4">
                <Link href="/pos" className="hover:text-gray-300">Punto de Venta</Link>
                <Link href="/inventario" className="hover:text-gray-300">Inventario</Link>
                <Link href="/clientes" className="hover:text-gray-300">Clientes</Link>
              </nav>
            </div>
          </header>
          <main className="flex-1 p-6 bg-secondary overflow-y-auto">
            <div className="container mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}