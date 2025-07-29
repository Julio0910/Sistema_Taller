import type { Metadata } from "next";
import { Inter } from "next/font/google"; // <-- Esta línea faltaba
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

// Esta línea también faltaba
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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}