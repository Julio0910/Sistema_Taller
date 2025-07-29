"use client";

import { Separator } from "@/components/ui/separator";
import { useState, useEffect, useMemo } from "react";
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShoppingCart, Package, BarChart3, Users, AlertTriangle, DollarSign } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, Timestamp } from "firebase/firestore";

// --- Interfaces para los datos ---
interface Product { stock: number; minStock: number; }
interface Customer { id: string; }
interface Invoice { total: number; createdAt: Timestamp; }

export default function HomePage() {
  const [stats, setStats] = useState({
    lowStockCount: 0,
    customersCount: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- Listener para Productos (bajo stock) ---
    const productsQuery = query(collection(db, "products"));
    const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
      let count = 0;
      snapshot.forEach((doc) => {
        const product = doc.data() as Product;
        if (product.stock <= (product.minStock || 0)) {
          count++;
        }
      });
      setStats(prevStats => ({ ...prevStats, lowStockCount: count }));
    });

    // --- Listener para Clientes (conteo total) ---
    const customersQuery = query(collection(db, "customers"));
    const unsubCustomers = onSnapshot(customersQuery, (snapshot) => {
      setStats(prevStats => ({ ...prevStats, customersCount: snapshot.size }));
    });

    // --- Listener para Facturas (ventas de hoy) ---
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const invoicesQuery = query(collection(db, "invoices"), where("createdAt", ">=", startOfToday));
    const unsubInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      let revenue = 0;
      snapshot.forEach((doc) => {
        const invoice = doc.data() as Invoice;
        revenue += invoice.total;
      });
      setStats(prevStats => ({ ...prevStats, todayRevenue: revenue }));
      setLoading(false);
    });

    return () => {
      unsubProducts();
      unsubCustomers();
      unsubInvoices();
    };
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Un resumen del estado actual de tu negocio.
      </p>

      {/* --- SECCIÓN DE ESTADÍSTICAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas de Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">L. {stats.todayRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Registrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customersCount}</div>
          </CardContent>
        </Card>
         {stats.lowStockCount > 0 && (
            <Card className="bg-destructive/10 border-destructive">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-destructive">Bajo Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{stats.lowStockCount} Producto(s)</div>
              </CardContent>
            </Card>
        )}
      </div>

      <Separator />

      {/* --- SECCIÓN DE NAVEGACIÓN --- */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/pos">
            <Card className="hover:border-primary hover:shadow-lg transition-all">
              <CardHeader>
                <ShoppingCart className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Punto de Venta</CardTitle>
                <CardDescription>Iniciar una nueva venta.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/inventario">
            <Card className="hover:border-primary hover:shadow-lg transition-all">
              <CardHeader>
                <Package className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Inventario</CardTitle>
                <CardDescription>Gestionar productos.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/clientes">
            <Card className="hover:border-primary hover:shadow-lg transition-all">
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Clientes</CardTitle>
                <CardDescription>Administrar clientes.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/reportes">
            <Card className="hover:border-primary hover:shadow-lg transition-all">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Reportes</CardTitle>
                <CardDescription>Ver historial de ventas.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}